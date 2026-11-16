import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileWarning,
  Lock,
  Phone,
  Search,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import {
  EXCLUDED_HTML_DISCREPANCY,
  STARKIT_44_DESIGNS_META,
  STARKIT_44_VARIANTS,
  STARKIT_ARCHIVE_SUMMARY,
  STARKIT_MEDIA_MANIFEST,
  WORKING_COLOR_PALETTE,
  WorkingColorName,
} from '../../data/starkit44Catalog';
import {
  STARKIT_BRAND_BOOK,
  STARKIT_FABRIC_SPEC,
  STARKIT_PRIMARY_HOTLINE_DISPLAY,
  STARKIT_SIZE_CHART_META,
  STARKIT_WHATSAPP_DISPLAY,
} from '../../data/starkitBrandData';
import { useStoreData } from '../../context/StoreDataContext';
import { upsertCatalogOverride } from '../../services/storeService';

interface StarKiT44ReadinessMatrixProps {
  mode: 'firebase-admin' | 'supabase-audit';
  onNotify?: (msg: string) => void;
  onExit?: () => void;
}

function csvEscape(val: unknown): string {
  const str = String(val ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

export const StarKiT44ReadinessMatrix: React.FC<StarKiT44ReadinessMatrixProps> = ({
  mode,
  onNotify,
  onExit,
}) => {
  const { liveGraphicArchiveProducts, catalogOverrides, storeSettings } = useStoreData();
  const [designFilter, setDesignFilter] = useState<string>('ALL');
  const [colorFilter, setColorFilter] = useState<WorkingColorName | 'ALL'>('ALL');
  const [readinessFilter, setReadinessFilter] = useState<
    'ALL' | 'DOCUMENTED' | 'PROVISIONAL' | 'DUPLICATE_IMAGE' | 'APPROVED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyDesignId, setBusyDesignId] = useState<string | null>(null);

  const liveByDesignId = useMemo(() => {
    const map = new Map<string, (typeof liveGraphicArchiveProducts)[number]>();
    for (const p of liveGraphicArchiveProducts) {
      map.set(p.stkCode, p);
    }
    return map;
  }, [liveGraphicArchiveProducts]);

  const mediaStatsBySku = useMemo(() => {
    const counts = new Map<string, { planned: number; localExists: number }>();
    for (const entry of STARKIT_MEDIA_MANIFEST) {
      const curr = counts.get(entry.sku) || { planned: 0, localExists: 0 };
      curr.planned += 1;
      if (entry.existsLocally) curr.localExists += 1;
      counts.set(entry.sku, curr);
    }
    return counts;
  }, []);

  const filteredSlots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return STARKIT_44_VARIANTS.filter((slot) => {
      if (designFilter !== 'ALL' && slot.designId !== designFilter) return false;
      if (colorFilter !== 'ALL' && slot.color !== colorFilter) return false;
      if (readinessFilter === 'DOCUMENTED' && !slot.isDocumented) return false;
      if (readinessFilter === 'PROVISIONAL' && !slot.isProvisional) return false;
      if (
        readinessFilter === 'DUPLICATE_IMAGE' &&
        slot.imageIntegrity !== 'DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO'
      ) {
        return false;
      }
      const liveProd = liveByDesignId.get(slot.designId);
      const isLiveApproved =
        !slot.isProvisional &&
        liveProd?.status === 'APPROVED' &&
        (liveProd?.stockCount ?? 0) > 0;
      if (readinessFilter === 'APPROVED' && !isLiveApproved) return false;
      if (q) {
        const hay = `${slot.sku} ${slot.legacySku} ${slot.designName} ${slot.sourceDesignName} ${slot.color} ${slot.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [designFilter, colorFilter, readinessFilter, searchQuery, liveByDesignId]);

  const releasedDesignCount = liveGraphicArchiveProducts.filter(
    (p) => p.status === 'APPROVED' && p.stockCount > 0
  ).length;

  const hotlineMatchesBrand =
    storeSettings.hotlineDisplay.replace(/\D/g, '') ===
    STARKIT_PRIMARY_HOTLINE_DISPLAY.replace(/\D/g, '');

  const handleExport44Csv = () => {
    const headers = [
      'Slot ID',
      'Design ID',
      'Legacy ID',
      'SKU',
      'Legacy SKU',
      'Design Name',
      'Color',
      'Color Hex',
      'SKU Status',
      'Image Integrity',
      'Planned Media Files',
      'Local Previews Ready',
      'Proposed Price BDT',
      'Live Publication Status',
      'Next Required Action',
    ];
    const rows = STARKIT_44_VARIANTS.map((s) => {
      const m = mediaStatsBySku.get(s.sku) || { planned: 0, localExists: 0 };
      const live = liveByDesignId.get(s.designId);
      const pubStatus =
        !s.isProvisional && live?.status === 'APPROVED'
          ? 'APPROVED (LIVE)'
          : 'HOLD / NOT FOR PUBLIC SALES';
      return [
        s.slotId,
        s.designId,
        s.legacyProductId,
        s.sku,
        s.legacySku,
        s.designName,
        s.color,
        s.colorHex,
        s.skuStatus,
        s.imageIntegrity,
        m.planned,
        m.localExists,
        s.priceBdtProposed,
        pubStatus,
        s.nextAction,
      ];
    });
    const csv = [
      headers.map(csvEscape).join(','),
      ...rows.map((r) => r.map(csvEscape).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `starkit-44-variant-readiness-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify?.('Exported canonical 44-variant CSV readiness matrix.');
  };

  const handleToggleDesignRelease = async (designId: string, release: boolean) => {
    if (mode !== 'firebase-admin') return;
    const meta = STARKIT_44_DESIGNS_META.find((d) => d.designId === designId);
    const live = liveByDesignId.get(designId);
    if (!meta || !live) return;
    setBusyDesignId(designId);
    try {
      const existingOv = catalogOverrides[meta.legacyId] || catalogOverrides[meta.designId];
      await upsertCatalogOverride({
        id: meta.legacyId,
        sourceCatalog: 'graphic-archive',
        brand: 'StarKiT',
        nameEn: `${meta.designName} Hoodie`,
        nameBn: meta.nameBn,
        category: 'Streetwear',
        collection: STARKIT_BRAND_BOOK.collectionName,
        priceBDT: existingOv?.priceBDT || meta.priceBdtProposed,
        stockCount: release ? Math.max(12, existingOv?.stockCount || 0) : 0,
        status: release ? 'active' : 'out_of_stock',
        image: existingOv?.image || live.variants[0]?.previewImage,
        fabricEn: STARKIT_FABRIC_SPEC.fabricEn,
        fabricBn: STARKIT_FABRIC_SPEC.fabricBn,
        fitEn: 'Drop-shoulder boxy silhouette',
        fitBn: 'ড্রপ-শোল্ডার বক্সি ফিট',
        isNew: true,
        isBestseller: false,
      });
      onNotify?.(
        release
          ? `${meta.designId} (${meta.designName}) promoted to State B: APPROVED.`
          : `${meta.designId} (${meta.designName}) returned to State A: HOLD.`
      );
    } catch (err) {
      onNotify?.(err instanceof Error ? err.message : 'Unable to update release gate.');
    } finally {
      setBusyDesignId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#11141C] border border-white/10 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#D5BA80] mb-1">
            <span>STARKIT · DROP 01 / THE GRAPHIC ARCHIVE</span>
            <span className="text-white/20">·</span>
            <span>SCHEMA 3.0 PRE-LAUNCH 44-SLOT</span>
          </div>
          <h2 className="text-lg font-semibold text-[#F5F2EB]">
            44-Variant Readiness &amp; Two-State Release Gate Matrix
          </h2>
          <p className="text-xs text-[#9A9892] mt-1 max-w-3xl">
            Authoritative 11-design × 4-colorway grid. State A holds all unverified SKUs from
            public checkout until physical garment samples, size specs, media photography, and
            artwork permissions pass audit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleExport44Csv}
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#F5F2EB] flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#B69A60]" />
            <span>Export 44-Slot CSV</span>
          </button>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-3.5 py-2 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] text-xs font-semibold cursor-pointer"
            >
              Return to Store
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-[#9A9892]">Authoritative Designs</div>
          <div className="text-2xl font-mono font-semibold text-[#F5F2EB] mt-1 tabular-nums">
            {STARKIT_ARCHIVE_SUMMARY.totalDesigns}
          </div>
          <div className="text-[11px] text-[#9A9892] mt-0.5">
            {releasedDesignCount} Released (State B) · {STARKIT_ARCHIVE_SUMMARY.totalDesigns - releasedDesignCount} Held
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-[#9A9892]">Total Variant Slots</div>
          <div className="text-2xl font-mono font-semibold text-[#F5F2EB] mt-1 tabular-nums">
            {STARKIT_ARCHIVE_SUMMARY.totalVariantSlots}
          </div>
          <div className="text-[11px] text-[#9A9892] mt-0.5">
            {STARKIT_ARCHIVE_SUMMARY.documentedVariantCount} Documented · {STARKIT_ARCHIVE_SUMMARY.provisionalVariantCount} Provisional
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-[#9A9892]">67-Asset Media Pack</div>
          <div className="text-2xl font-mono font-semibold text-[#D5BA80] mt-1 tabular-nums">
            {STARKIT_ARCHIVE_SUMMARY.localConvertedWebpPreviews} / {STARKIT_ARCHIVE_SUMMARY.plannedMediaAssetsCount}
          </div>
          <div className="text-[11px] text-[#9A9892] mt-0.5">
            15 Composites + 13 Unique Previews Local
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11141C] border border-amber-500/30">
          <div className="text-[10px] font-mono uppercase text-amber-300">Integrity Flags</div>
          <div className="text-2xl font-mono font-semibold text-amber-300 mt-1 tabular-nums">
            {STARKIT_ARCHIVE_SUMMARY.duplicatePlaceholderFlags}
          </div>
          <div className="text-[11px] text-amber-200/80 mt-0.5">
            STK-H008-MRN &amp; BRN Black Duplicate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
          <div className="text-[10px] font-mono uppercase text-[#9A9892]">Excluded Discrepancy</div>
          <div className="text-2xl font-mono font-semibold text-red-400 mt-1 tabular-nums">
            {EXCLUDED_HTML_DISCREPANCY.htmlExtraDesignId}
          </div>
          <div className="text-[11px] text-[#9A9892] mt-0.5 truncate" title={EXCLUDED_HTML_DISCREPANCY.reason}>
            {EXCLUDED_HTML_DISCREPANCY.htmlExtraDesignName} · Excluded
          </div>
        </div>
      </div>

      {/* Verification & Contact Reconciliation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#11141C] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-[#D5BA80] font-mono uppercase text-[10px]">
            <Phone className="w-3.5 h-3.5 text-[#B69A60]" />
            <span>Contact Reconciliation</span>
          </div>
          <div className="flex items-center justify-between text-[#D8D3C9]">
            <span>Primary Hotline:</span>
            <span className="font-mono text-[#F5F2EB]">{STARKIT_PRIMARY_HOTLINE_DISPLAY}</span>
          </div>
          <div className="flex items-center justify-between text-[#D8D3C9]">
            <span>WhatsApp Order Desk:</span>
            <span className="font-mono text-[#F5F2EB]">{STARKIT_WHATSAPP_DISPLAY}</span>
          </div>
          <div className="pt-1 text-[11px] flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>
              {hotlineMatchesBrand
                ? 'Store settings match verified hotline.'
                : `Store setting hotline: ${storeSettings.hotlineDisplay}`}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#11141C] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-[#D5BA80] font-mono uppercase text-[10px]">
            <FileWarning className="w-3.5 h-3.5 text-[#B69A60]" />
            <span>Fabric &amp; Sizing Audit State</span>
          </div>
          <p className="text-[#D8D3C9] leading-relaxed">{STARKIT_FABRIC_SPEC.fabricEn}</p>
          <p className="text-[11px] text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{STARKIT_SIZE_CHART_META.badgeEn}</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#11141C] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-[#D5BA80] font-mono uppercase text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B69A60]" />
            <span>
              {mode === 'supabase-audit' ? 'Supabase Migration CLI' : 'Design Exclusion Guard'}
            </span>
          </div>
          {mode === 'supabase-audit' ? (
            <div className="space-y-1.5 font-mono text-[10px] text-[#D8D3C9]">
              <p className="text-[#9A9892] font-sans text-xs">
                Run schema upgrade then idempotent 44-variant import before flipping products to{' '}
                <code className="text-[#D5BA80]">active</code>:
              </p>
              <div className="p-2 rounded bg-black/50 border border-white/10 text-[#F5F2EB] overflow-x-auto">
                STARKIT_IMPORT_CONFIRM=YES SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun scripts/import-starkit-44.ts
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-[#9A9892] leading-relaxed">
              <strong className="text-red-400">{EXCLUDED_HTML_DISCREPANCY.htmlExtraDesignId}</strong>{' '}
              ({EXCLUDED_HTML_DISCREPANCY.htmlExtraSourceName}) is strictly excluded from public
              catalog JSON, sitemap, and checkout until separately contracted.
            </p>
          )}
        </div>
      </div>

      {/* Design-Level Release Controls (11 Designs) */}
      <div className="bg-[#11141C] border border-white/10 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-semibold text-[#F5F2EB]">
            11 Canonical Designs · Release Gate Overview
          </h3>
          <span className="text-[11px] font-mono text-[#9A9892]">
            Clicking Release unlocks only documented slots with non-duplicate previews
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {STARKIT_44_DESIGNS_META.map((d) => {
            const live = liveByDesignId.get(d.designId);
            const isApproved = live?.status === 'APPROVED' && (live?.stockCount ?? 0) > 0;
            const busy = busyDesignId === d.designId;
            return (
              <div
                key={d.designId}
                className="p-3.5 rounded-lg bg-[#0B0D12] border border-white/10 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono text-[#B69A60]">
                      {d.designId} · {d.legacyId}
                    </div>
                    <div className="text-sm font-medium text-[#F5F2EB]">{d.designName}</div>
                    <div className="text-[11px] text-[#9A9892]">
                      {d.category} · ৳{d.priceBdtProposed.toLocaleString()} ·{' '}
                      {d.documentedColors.length}/4 colorways ready
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border shrink-0 ${
                      isApproved
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {isApproved ? 'STATE B' : 'STATE A · HOLD'}
                  </span>
                </div>

                {d.isLicensingRequired && (
                  <div className="text-[10px] font-mono text-amber-300/90 bg-amber-500/5 border border-amber-500/20 rounded px-2 py-1">
                    Licensing Gate: {d.artworkRightsNote}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                  <a
                    href={`/starkit/product/${d.designId}`}
                    className="text-[11px] font-mono text-[#D5BA80] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Inspect PDP</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {mode === 'firebase-admin' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleToggleDesignRelease(d.designId, !isApproved)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                        isApproved
                          ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>{busy ? 'Saving...' : 'Return to Hold'}</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          <span>{busy ? 'Releasing...' : 'Approve State B'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 44-Slot Filter Controls */}
      <div className="bg-[#11141C] border border-white/10 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#9A9892] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter SKU (e.g. STK-H001-BLK, Chocolate Brown, Folk)..."
            className="w-full bg-[#0B0D12] border border-white/15 rounded-lg pl-8 pr-3 py-2 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
          />
        </div>

        <select
          value={designFilter}
          onChange={(e) => setDesignFilter(e.target.value)}
          className="bg-[#0B0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#F5F2EB]"
          aria-label="Filter by Design"
        >
          <option value="ALL">All 11 Designs</option>
          {STARKIT_44_DESIGNS_META.map((d) => (
            <option key={d.designId} value={d.designId}>
              {d.designId} — {d.designName}
            </option>
          ))}
        </select>

        <select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value as WorkingColorName | 'ALL')}
          className="bg-[#0B0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#F5F2EB]"
          aria-label="Filter by Colorway"
        >
          <option value="ALL">All 4 Colorways</option>
          {WORKING_COLOR_PALETTE.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>

        <select
          value={readinessFilter}
          onChange={(e) =>
            setReadinessFilter(
              e.target.value as 'ALL' | 'DOCUMENTED' | 'PROVISIONAL' | 'DUPLICATE_IMAGE' | 'APPROVED'
            )
          }
          className="bg-[#0B0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-[#F5F2EB]"
          aria-label="Filter by Readiness"
        >
          <option value="ALL">All 44 Slots</option>
          <option value="DOCUMENTED">Documented (15)</option>
          <option value="PROVISIONAL">Provisional (29)</option>
          <option value="DUPLICATE_IMAGE">Duplicate Image Flags (2)</option>
          <option value="APPROVED">Released to State B ({releasedDesignCount})</option>
        </select>
      </div>

      {/* 44-Slot Matrix Table */}
      <div className="bg-[#11141C] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between text-xs font-mono text-[#9A9892]">
          <span>Showing {filteredSlots.length} of 44 Canonical Slots</span>
          <span>Sizes: M / L / XL / XXL</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#0B0D12] text-[10px] font-mono uppercase text-[#9A9892]">
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Design</th>
                <th className="py-3 px-3">Colorway</th>
                <th className="py-3 px-3">Slot Status</th>
                <th className="py-3 px-3">Media Audit</th>
                <th className="py-3 px-3">Integrity</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Gate State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSlots.map((slot) => {
                const m = mediaStatsBySku.get(slot.sku) || { planned: 0, localExists: 0 };
                const live = liveByDesignId.get(slot.designId);
                const isLiveApproved =
                  !slot.isProvisional &&
                  slot.imageIntegrity === 'VERIFIED_LOCAL_PREVIEW' &&
                  live?.status === 'APPROVED' &&
                  (live?.stockCount ?? 0) > 0;

                return (
                  <tr key={slot.sku} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono text-[#F5F2EB] whitespace-nowrap">
                      <div>{slot.sku}</div>
                      <div className="text-[10px] text-[#77777D]">{slot.legacySku}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-[#F5F2EB]">{slot.designName}</div>
                      <div className="text-[10px] text-[#9A9892]">{slot.category}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-sm border border-white/25 shrink-0"
                          style={{ backgroundColor: slot.colorHex }}
                        />
                        <span className="text-[#D8D3C9]">{slot.color}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          slot.isDocumented
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            : 'bg-white/5 text-[#9A9892] border border-white/10'
                        }`}
                      >
                        {slot.isDocumented ? 'DOCUMENTED' : 'PROVISIONAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#D8D3C9] whitespace-nowrap">
                      {slot.isDocumented
                        ? `${m.localExists}/${m.planned} local · ${slot.studioPreviewWebp ? 'WebP preview ok' : 'Composite only'}`
                        : '0 assets (Pending shoot)'}
                    </td>
                    <td className="py-2.5 px-3">
                      {slot.imageIntegrity === 'VERIFIED_LOCAL_PREVIEW' ? (
                        <span className="text-[10px] font-mono text-emerald-400">Preview OK</span>
                      ) : slot.imageIntegrity === 'DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO' ? (
                        <span className="text-[10px] font-mono text-amber-300">
                          Duplicate Black Placeholder
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#77777D]">
                          Awaiting Color Shoot
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-[#D5BA80]">
                      ৳{slot.priceBdtProposed.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          isLiveApproved
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                        }`}
                      >
                        {isLiveApproved ? 'APPROVED' : 'HOLD'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
