import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  FileText,
  Layers,
  MessageCircle,
  Ruler,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LiveThreePieceItem } from '../../types/store';
import { CartItem, Language } from '../../types';
import {
  buildFarizaWhatsAppHref,
  FARIZA_BRAND_ASSETS,
  FARIZA_BRAND_BOOK,
  FARIZA_BRAND_BOOK_PDF,
  FARIZA_CATALOG_PDF,
} from '../../data/farizaBrandData';
import * as farizaData from '../../data/farizaBrandData';
import { useStoreData } from '../../context/StoreDataContext';
import { FarizaLogo } from './FarizaLogo';
import {
  trackFarizaContact,
  trackFarizaCustomizeProduct,
} from '../../services/metaPixel';
import type { FarizaChestSize } from '../../data/farizaBrandData';

const TAILORING_SURCHARGE_BDT = 450;

interface FarizaInteractiveToolsProps {
  items: LiveThreePieceItem[];
  language: Language;
  onApplyRecommendedChestSize?: (chest: FarizaChestSize) => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
}

export const FarizaInteractiveTools: React.FC<FarizaInteractiveToolsProps> = ({
  items,
  language,
  onApplyRecommendedChestSize,
  onAddToCart,
  onBuyNow,
}) => {
  const { storeSettings } = useStoreData();
  const useSupabaseCommerce = import.meta.env.VITE_COMMERCE_BACKEND === 'supabase';

  // 1. Tailoring & Fit Calculator state
  const [bustInches, setBustInches] = useState<number>(38);
  const [fitPreference, setFitPreference] = useState<'tailored' | 'relaxed'>('tailored');
  const [heightTier, setHeightTier] = useState<'petite' | 'standard' | 'tall'>('standard');
  const [appliedFitFeedback, setAppliedFitFeedback] = useState(false);

  const recommendedFit = useMemo(() => {
    const adjustedBust = bustInches + (fitPreference === 'relaxed' ? 1.5 : 0);
    const chart = farizaData.FARIZA_SIZE_CHART;
    const match =
      chart.find((row) => parseInt(row.chest, 10) >= Math.round(adjustedBust)) ||
      chart[chart.length - 1];
    const extraLengthNote =
      heightTier === 'petite'
        ? '42"–43" Hem'
        : heightTier === 'tall'
        ? '46"–48" Long Hem'
        : match.kameezLengthIn;
    return { ...match, recommendedLength: extraLengthNote };
  }, [bustInches, fitPreference, heightTier]);

  // 2. Smart 3-Set Bundle Builder state
  const availableItems = useMemo(
    () => items.filter((item) => item.status !== 'out_of_stock' && item.stockCount > 0),
    [items]
  );
  const pool = availableItems.length > 0 ? availableItems : items;

  const [slotIds, setSlotIds] = useState<[string, string, string]>(() => [
    pool[0]?.id || 'CAT-001',
    pool[1]?.id || pool[0]?.id || 'CAT-002',
    pool[2]?.id || pool[0]?.id || 'CAT-003',
  ]);
  const [bundleTailoring, setBundleTailoring] = useState<'unstitched' | 'stitched'>('unstitched');
  const [bundleChest, setBundleChest] = useState<FarizaChestSize>('38"');
  const [bundleAdded, setBundleAdded] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const effectiveBundleTailoring = useSupabaseCommerce ? 'unstitched' : bundleTailoring;

  const selectedEntries = useMemo(() => {
    return ([0, 1, 2] as const)
      .map((idx) => {
        const wantedId = slotIds[idx];
        return pool.find((p) => p.id === wantedId) || pool[idx] || pool[0] || null;
      })
      .filter((entry): entry is LiveThreePieceItem => entry !== null);
  }, [pool, slotIds]);

  const canCheckoutBundle = availableItems.length > 0 && selectedEntries.length > 0;
  const surchargePerSet =
    effectiveBundleTailoring === 'stitched' ? TAILORING_SURCHARGE_BDT : 0;
  const rawBundleTotal = selectedEntries.reduce(
    (sum, item) => sum + item.priceBDT + surchargePerSet,
    0
  );
  const netBundleTotal = Math.max(0, rawBundleTotal - storeSettings.bundle3DiscountBDT);

  const handleAddBundle = (instantBuy: boolean) => {
    if (!canCheckoutBundle) return;
    trackFarizaCustomizeProduct(
      `3-Set Bundle (${selectedEntries.map((s) => s.code).join('+')}) ${
        effectiveBundleTailoring === 'stitched' ? `Stitched ${bundleChest}` : 'Unstitched'
      }`
    );
    selectedEntries.forEach((item) => {
      const payload: Omit<CartItem, 'id'> = {
        productId: item.id,
        nameEn: `${item.code} — ${item.nameEn}`,
        nameBn: `${item.code} — ${item.nameBn}`,
        priceBDT: item.priceBDT + surchargePerSet,
        image: item.flatLayImage,
        color: item.colors[0]?.name || 'Signature Shade',
        size:
          effectiveBundleTailoring === 'stitched'
            ? `Custom Stitched (${bundleChest})`
            : 'Unstitched Set',
        quantity: 1,
      };
      if (instantBuy && onBuyNow) {
        onBuyNow(payload);
      } else {
        onAddToCart(payload);
      }
    });
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  };

  // 3. WhatsApp Concierge state
  const [waTopic, setWaTopic] = useState('Custom Stitching & Fit Consultation');
  const [waCode, setWaCode] = useState(items[0]?.code || 'CAT-001');
  const [waNote, setWaNote] = useState('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const whatsappHref = buildFarizaWhatsAppHref(
    `Assalamu Alaikum Fariza's Territory Desk!\nTopic: ${waTopic}\nDesign Code: ${waCode}\nNote: ${
      waNote.trim() || 'Please confirm availability and Mirpur dispatch timeline.'
    }`
  );

  const paletteSwatches = [
    farizaData.FARIZA_BRAND_BOOK.colors.chalkWhite,
    farizaData.FARIZA_BRAND_BOOK.colors.pureWhite,
    farizaData.FARIZA_BRAND_BOOK.colors.azureBlue,
    farizaData.FARIZA_BRAND_BOOK.colors.jetBlack,
    farizaData.FARIZA_BRAND_BOOK.colors.seaGreen,
  ];

  return (
    <div className="space-y-14 font-fariza">
      {/* 1. Tailoring & Fit Calculator + Fabric Yardage Breakdown */}
      <section
        id="fariza-fit-guide"
        className="rounded-3xl bg-white border border-[#050505]/12 p-6 sm:p-8 lg:p-10 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#050505]/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#0866FF] font-semibold mb-2">
              <Ruler className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? "Fariza's Territory · Tailoring & Fit Utility"
                  : 'ফারিজাস টেরিটরি · টেইলারিং ও ফিট ক্যালকুলেটর'}
              </span>
            </div>
            <h2 className="font-fariza-display text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight text-balance">
              {language === 'en'
                ? 'Bust Fit Calculator & 3-Piece Yardage Guide'
                : 'বডি সাইজ ক্যালকুলেটর এবং ৩-পিস কাপড়ের মাপ'}
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F0F2F5] border border-[#31A24C]/40 text-xs font-mono text-[#196B2C] font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#31A24C] shrink-0" />
            <span>
              {language === 'en'
                ? '2.75yd Kameez · 2.50yd Salwar · 5-Haat Dupatta'
                : '২.৭৫ গজ কামিজ · ২.৫০ গজ সালোয়ার · ৫ হাত ওড়না'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Controls */}
          <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-[#F0F2F5] border border-[#050505]/10">
            <div>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#050505] mb-2">
                <span className="font-semibold">
                  {language === 'en' ? 'Bust / Chest Measurement' : 'বডি / চেস্ট মাপ'}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0866FF] text-white font-bold tabular-nums">
                  {bustInches}&quot;
                </span>
              </div>
              <input
                type="range"
                min={34}
                max={44}
                step={1}
                value={bustInches}
                onChange={(e) => setBustInches(Number(e.target.value))}
                className="w-full accent-[#0866FF] cursor-pointer"
                aria-label="Bust measurement in inches"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#4B5563] mt-1 tabular-nums">
                <span>34&quot; (XS)</span>
                <span>38&quot; (M)</span>
                <span>42&quot; (XL)</span>
                <span>44&quot; (XXL)</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#050505] font-semibold mb-2">
                {language === 'en' ? 'Kameez Silhouette' : 'কামিজ ফিটিং ধরন'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: 'tailored' as const,
                    en: 'Tailored Classic',
                    bn: 'নিখুঁত রেগুলার ফিট',
                  },
                  {
                    id: 'relaxed' as const,
                    en: 'Relaxed Ease (+1.5")',
                    bn: 'আরামদায়ক লুজ ফিট',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFitPreference(opt.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      fitPreference === opt.id
                        ? 'bg-[#0866FF] border-[#0866FF] text-white shadow-sm'
                        : 'bg-white border-[#050505]/15 text-[#050505] hover:border-[#0866FF]/50'
                    }`}
                  >
                    {language === 'en' ? opt.en : opt.bn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#050505] font-semibold mb-2">
                {language === 'en' ? 'Height Profile' : 'উচ্চতা অনুযায়ী ঝুল'}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'petite' as const, label: `< 5'2"` },
                  { id: 'standard' as const, label: `5'2" – 5'5"` },
                  { id: 'tall' as const, label: `5'6"+` },
                ].map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setHeightTier(h.id)}
                    className={`py-2 rounded-xl border font-mono text-xs transition-all cursor-pointer tabular-nums ${
                      heightTier === h.id
                        ? 'bg-[#050505] border-[#050505] text-white font-bold'
                        : 'bg-white border-[#050505]/15 text-[#050505] hover:border-[#050505]'
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation Output */}
            <div className="p-4 rounded-xl bg-white border border-[#0866FF]/35 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#0866FF] font-semibold">
                  {language === 'en' ? 'Recommended Tailored Size' : 'প্রস্তাবিত বডি সাইজ'}
                </div>
                <div className="flex items-baseline gap-2.5 mt-0.5">
                  <span className="text-2xl font-bold text-[#050505] tabular-nums">
                    {recommendedFit.chest} ({recommendedFit.labelEn})
                  </span>
                  <span className="text-xs font-mono text-[#4B5563] tabular-nums">
                    {recommendedFit.recommendedLength}
                  </span>
                </div>
              </div>

              {onApplyRecommendedChestSize && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyRecommendedChestSize(recommendedFit.chest);
                    trackFarizaCustomizeProduct(
                      `Fit Calculator: ${recommendedFit.chest} (${fitPreference})`
                    );
                    setAppliedFitFeedback(true);
                    setTimeout(() => setAppliedFitFeedback(false), 2000);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                    appliedFitFeedback
                      ? 'bg-[#31A24C] text-white'
                      : 'bg-[#0866FF] hover:bg-[#0552D1] text-white'
                  }`}
                >
                  {appliedFitFeedback
                    ? language === 'en'
                      ? '✓ Applied to Cards'
                      : '✓ কার্ডে যুক্ত হয়েছে'
                    : language === 'en'
                    ? 'Apply to Catalog'
                    : 'সব কার্ডে প্রয়োগ করুন'}
                </button>
              )}
            </div>
          </div>

          {/* Right Table: Tailored Chart + Unstitched Yardage */}
          <div className="lg:col-span-7 space-y-5">
            <div className="overflow-x-auto rounded-2xl border border-[#050505]/12 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#050505] text-white font-mono uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">{language === 'en' ? 'Size' : 'সাইজ'}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'Bust' : 'বডি'}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'Kameez Len.' : 'কামিজ ঝুল'}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'Hip' : 'হিপ'}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'Salwar' : 'সালোয়ার'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050505]/10 font-mono tabular-nums">
                  {farizaData.FARIZA_SIZE_CHART.map((row) => {
                    const isHighlighted = row.chest === recommendedFit.chest;
                    return (
                      <tr
                        key={row.chest}
                        className={
                          isHighlighted
                            ? 'bg-[#0866FF]/8 text-[#050505] font-bold'
                            : 'text-[#374151] hover:bg-[#F0F2F5]/60'
                        }
                      >
                        <td className="py-2.5 px-4 flex items-center gap-2">
                          <span>{row.chest}</span>
                          {isHighlighted && (
                            <span className="px-1.5 py-0.5 rounded bg-[#0866FF] text-white text-[9px] uppercase">
                              {language === 'en' ? 'Best Fit' : 'সেরা ফিট'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4">{row.bustRangeIn}</td>
                        <td className="py-2.5 px-4">{row.kameezLengthIn}</td>
                        <td className="py-2.5 px-4">{row.hipIn}</td>
                        <td className="py-2.5 px-4">{row.salwarLengthIn}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {farizaData.FARIZA_FABRIC_YARDAGE.map((y) => (
                <div
                  key={y.pieceEn}
                  className="p-4 rounded-xl bg-[#F0F2F5] border border-[#050505]/10"
                >
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#0866FF] font-semibold mb-1">
                    {language === 'en' ? y.pieceEn : y.pieceBn}
                  </div>
                  <p className="text-xs text-[#1F2937] leading-relaxed">
                    {language === 'en' ? y.specEn : y.specBn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Smart 3-Set Bundle Builder */}
      <section
        id="fariza-bundle-builder"
        className="rounded-3xl bg-white border border-[#050505]/12 p-6 sm:p-8 lg:p-10 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 mb-8 border-b border-[#050505]/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#0866FF] font-semibold mb-2">
              <Layers className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Three-Piece Value Configurator'
                  : 'থ্রি-পিস বান্ডেল বিল্ডার'}
              </span>
            </div>
            <h2 className="font-fariza-display text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight text-balance">
              {language === 'en'
                ? `Build a 3-Set Curated Box & Save ৳${storeSettings.bundle3DiscountBDT}`
                : `৩টি সেটের কাস্টম বক্স তৈরি করুন এবং ৳${storeSettings.bundle3DiscountBDT} সাশ্রয় করুন`}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!useSupabaseCommerce && (
              <div className="inline-flex p-1 rounded-xl bg-[#F0F2F5] border border-[#050505]/12 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setBundleTailoring('unstitched')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    effectiveBundleTailoring === 'unstitched'
                      ? 'bg-[#050505] text-white'
                      : 'text-[#374151] hover:text-[#050505]'
                  }`}
                >
                  {language === 'en' ? 'Unstitched' : 'আনস্টিচড'}
                </button>
                <button
                  type="button"
                  onClick={() => setBundleTailoring('stitched')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    effectiveBundleTailoring === 'stitched'
                      ? 'bg-[#0866FF] text-white'
                      : 'text-[#374151] hover:text-[#050505]'
                  }`}
                >
                  {language === 'en' ? 'Custom Stitched (+৳450)' : 'স্টিচড (+৳৪৫০)'}
                </button>
              </div>
            )}

            {effectiveBundleTailoring === 'stitched' && (
              <select
                value={bundleChest}
                onChange={(e) => setBundleChest(e.target.value as FarizaChestSize)}
                aria-label="Bundle Chest Size"
                className="px-3 py-2 rounded-xl bg-[#F0F2F5] border border-[#050505]/15 text-xs font-mono text-[#050505] font-semibold cursor-pointer"
              >
                {farizaData.FARIZA_SIZE_CHART.map((s) => (
                  <option key={s.chest} value={s.chest}>
                    Chest {s.chest}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {([0, 1, 2] as const).map((slotIdx) => {
            const activeItem = selectedEntries[slotIdx];
            if (!activeItem) return null;
            const slotKey = `${slotIdx}-${activeItem.id}`;

            return (
              <div
                key={slotIdx}
                className="p-4 rounded-2xl bg-[#F0F2F5] border border-[#050505]/10 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#050505]">
                  <span className="font-bold text-[#0866FF]">
                    {language === 'en' ? `Set 0${slotIdx + 1}` : `সেট ০${slotIdx + 1}`}
                  </span>
                  <span className="tabular-nums font-semibold">
                    ৳ {(activeItem.priceBDT + surchargePerSet).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {brokenImages[slotKey] ? (
                    <div className="w-16 h-20 rounded-xl bg-white border border-[#050505]/15 flex items-center justify-center text-[10px] font-mono text-[#050505] shrink-0">
                      {activeItem.code}
                    </div>
                  ) : (
                    <img
                      src={activeItem.flatLayImage}
                      alt={activeItem.nameEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [slotKey]: true }))
                      }
                      className="w-16 h-20 object-cover object-top rounded-xl bg-white border border-[#050505]/10 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#050505] truncate">
                      {activeItem.code} · {language === 'en' ? activeItem.nameEn : activeItem.nameBn}
                    </div>
                    <div className="text-[11px] text-[#4B5563] truncate">
                      {activeItem.subCollection}
                    </div>
                  </div>
                </div>

                <select
                  value={activeItem.id}
                  onChange={(e) => {
                    const next: [string, string, string] = [...slotIds] as [
                      string,
                      string,
                      string
                    ];
                    next[slotIdx] = e.target.value;
                    setSlotIds(next);
                  }}
                  aria-label={`Choose Three-Piece Set ${slotIdx + 1}`}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#050505]/15 text-xs text-[#050505] focus:outline-none focus:border-[#0866FF] cursor-pointer"
                >
                  {pool.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.code} — {option.nameEn} (৳{option.priceBDT.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl bg-[#050505] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-2xl font-bold tabular-nums">
                ৳ {netBundleTotal.toLocaleString()}
              </span>
              <span className="font-mono text-sm text-white/50 line-through tabular-nums">
                ৳ {rawBundleTotal.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-[#31A24C] font-semibold">
                {language === 'en'
                  ? `Saves ৳${storeSettings.bundle3DiscountBDT} + Free Pathao Delivery`
                  : `৳${storeSettings.bundle3DiscountBDT} ছাড় + ফ্রি পাঠাও ডেলিভারি`}
              </span>
            </div>
            <p className="text-xs text-white/75 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#0866FF]" />
              <span>
                {language === 'en'
                  ? `Stack code FARIZA10 at checkout for 10% extra off · Mode: ${
                      effectiveBundleTailoring === 'stitched'
                        ? `Custom Stitched (${bundleChest})`
                        : 'Unstitched Fabric'
                    }`
                  : `চেকআউটে FARIZA10 কোডে আরও ১০% ছাড়`}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={!canCheckoutBundle || bundleAdded}
              onClick={() => handleAddBundle(false)}
              className={`px-4 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                !canCheckoutBundle
                  ? 'bg-white/15 text-white/40 cursor-not-allowed'
                  : bundleAdded
                  ? 'bg-[#31A24C] text-white'
                  : 'bg-white text-[#050505] hover:bg-[#F0F2F5] cursor-pointer'
              }`}
            >
              {bundleAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{language === 'en' ? '3 Sets Added' : '৩টি সেট যুক্ত'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{language === 'en' ? 'Add 3-Set Bundle' : '৩-সেট ব্যাগে নিন'}</span>
                </>
              )}
            </button>

            {canCheckoutBundle && onBuyNow && (
              <button
                type="button"
                onClick={() => handleAddBundle(true)}
                className="px-5 py-3 rounded-xl bg-[#0866FF] hover:bg-[#0552D1] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{language === 'en' ? 'Instant COD Order' : 'এখনই অর্ডার করুন'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Official Farizas Territory Brand Book Specimen (Pages 1–7) */}
      <section
        id="fariza-brand-book"
        className="rounded-3xl bg-white border border-[#050505]/12 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#050505]/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#0866FF] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? 'Official Brand Identity Book · Pages 01–07'
                  : 'অফিসিয়াল ব্র্যান্ড আইডেন্টিটি · পৃষ্ঠা ০১–০৭'}
              </span>
            </div>

            <blockquote className="font-fariza-display text-2xl sm:text-3xl font-bold text-[#050505] leading-snug text-balance">
              {FARIZA_BRAND_BOOK.quoteEn}
            </blockquote>

            <p className="text-sm text-[#374151] leading-relaxed">
              {language === 'en' ? FARIZA_BRAND_BOOK.overviewEn : FARIZA_BRAND_BOOK.overviewBn}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={FARIZA_BRAND_BOOK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#0552D1] text-white text-xs font-mono font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Brand Book PDF' : 'ব্র্যান্ড বুক PDF'}</span>
              </a>
              <a
                href={FARIZA_CATALOG_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E5E7EB] border border-[#050505]/15 text-[#050505] text-xs font-mono font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#31A24C]" />
                <span>{language === 'en' ? 'Master Catalog (18 Sets)' : 'মাস্টার ক্যাটালগ PDF'}</span>
              </a>
            </div>
          </div>

          <div className="shrink-0">
            <FarizaLogo size="specimen" surface="white" showClearSpaceFrame />
          </div>
        </div>

        {/* Typography & 5-Color System (Pages 4 & 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F0F2F5] border border-[#050505]/10 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#0866FF] font-semibold mb-2">
                03 · Primary Typeface
              </div>
              <div className="font-fariza text-4xl font-bold text-[#050505] tracking-tight mb-2">
                {FARIZA_BRAND_BOOK.primaryTypeface}
              </div>
              <p className="text-xs font-mono text-[#374151] leading-relaxed mb-4">
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz ·
                0123456789
              </p>
            </div>
            <div className="pt-3 border-t border-[#050505]/10 flex items-center justify-between text-[11px] font-mono text-[#4B5563]">
              <span>Brand Values: {FARIZA_BRAND_BOOK.valuesSummary}</span>
              <span className="text-[#196B2C] font-semibold">Verified</span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#F0F2F5] border border-[#050505]/10">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#0866FF] font-semibold mb-3">
              04 · Official Color Palette (60 / 30 / 10 Budget)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {paletteSwatches.map((swatch) => (
                <div
                  key={swatch.hex}
                  className="p-2.5 rounded-xl bg-white border border-[#050505]/10 flex flex-col justify-between"
                >
                  <div
                    className="h-14 w-full rounded-lg border border-[#050505]/10 mb-2.5"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <div>
                    <div className="text-xs font-bold text-[#050505] leading-tight">
                      {swatch.name}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-[#0866FF] mt-0.5 tabular-nums">
                      {swatch.hex}
                    </div>
                    <div className="text-[10px] font-mono text-[#4B5563] tabular-nums">
                      RGB {swatch.rgb}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 6 Editorial Campaign Imagery & Page 7 Brand Voice */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                key: 'ensemble',
                src: FARIZA_BRAND_ASSETS.campaignEnsemble,
                caption: 'Showcase Ensemble Study',
              },
              {
                key: 'pendant',
                src: FARIZA_BRAND_ASSETS.craftPendant,
                caption: 'Handmade Floral Craft Card',
              },
              {
                key: 'navy',
                src: FARIZA_BRAND_ASSETS.campaignNavy,
                caption: 'Botanical Block Silhouette',
              },
            ].map((photo) => (
              <div
                key={photo.key}
                className="relative aspect-[4/3] sm:aspect-[3/4] rounded-2xl overflow-hidden bg-[#F0F2F5] border border-[#050505]/10"
              >
                {brokenImages[photo.key] ? (
                  <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs font-mono text-[#4B5563]">
                    {photo.caption}
                  </div>
                ) : (
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [photo.key]: true }))
                    }
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F0F2F5] border border-[#050505]/10 flex flex-col justify-between space-y-5">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#0866FF] font-semibold mb-2">
                06 · Brand Voice & Aesthetic Pillars
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#050505]/10">
                  <div className="font-mono text-[10px] uppercase text-[#0866FF] font-bold mb-1">
                    Aesthetic Language
                  </div>
                  <p className="text-[#050505] leading-relaxed">
                    {FARIZA_BRAND_BOOK.aestheticTraits
                      .map((a) => (language === 'en' ? a.en : a.bn))
                      .join(' · ')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#050505]/10">
                  <div className="font-mono text-[10px] uppercase text-[#196B2C] font-bold mb-1">
                    Tone of Voice
                  </div>
                  <p className="text-[#050505] leading-relaxed">
                    {FARIZA_BRAND_BOOK.toneOfVoice
                      .map((t) => (language === 'en' ? t.en : t.bn))
                      .join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#050505]/10">
              {FARIZA_BRAND_BOOK.pillars.map((pillar) => (
                <div key={pillar.code} className="text-left">
                  <div className="font-mono text-[10px] text-[#0866FF] font-bold">
                    {pillar.code}
                  </div>
                  <div className="text-xs font-bold text-[#050505]">
                    {language === 'en' ? pillar.titleEn : pillar.titleBn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Direct WhatsApp Concierge & Bilingual FAQ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-3xl bg-[#050505] text-white p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#31A24C] font-semibold mb-2">
              <MessageCircle className="w-4 h-4" />
              <span>
                {language === 'en' ? 'Mirpur Studio Concierge' : 'মিরপুর স্টুডিও কনসিয়ার্জ'}
              </span>
            </div>
            <h3 className="font-fariza-display text-2xl font-bold text-white mb-2">
              {language === 'en'
                ? "Direct WhatsApp Boutique Desk"
                : 'সরাসরি হোয়াটসঅ্যাপ বুটিক ডেস্ক'}
            </h3>
            <p className="text-xs text-white/75 leading-relaxed">
              {language === 'en'
                ? 'Verify live un-edited video reel swatches, urgent tailoring deadlines, or multi-set gift orders directly with our Mirpur team.'
                : 'লাইভ কাপড়ের রঙ, জরুরি সেলাই অথবা গিফট অর্ডারের জন্য সরাসরি মিরপুর টিমের সাথে যোগাযোগ করুন।'}
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <select
              value={waTopic}
              onChange={(e) => setWaTopic(e.target.value)}
              aria-label="WhatsApp inquiry topic"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs focus:outline-none focus:border-[#0866FF]"
            >
              <option value="Custom Stitching & Fit Consultation" className="text-black">
                Custom Stitching &amp; Fit Consultation
              </option>
              <option value="Live Fabric Video Check" className="text-black">
                Live Fabric Video Check
              </option>
              <option value="Wholesale / Eid Gift Pack" className="text-black">
                Wholesale / Festive Gift Pack
              </option>
            </select>

            <select
              value={waCode}
              onChange={(e) => setWaCode(e.target.value)}
              aria-label="Design SKU for WhatsApp inquiry"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-[#0866FF]"
            >
              {items.map((item) => (
                <option key={item.id} value={item.code} className="text-black">
                  {item.code} — {item.nameEn}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={waNote}
              onChange={(e) => setWaNote(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Optional custom chest/length note...'
                  : 'ঐচ্ছিক মাপ বা প্রশ্ন লিখুন...'
              }
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/45 text-xs focus:outline-none focus:border-[#0866FF]"
            />

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackFarizaContact('WhatsApp', `${waTopic} · ${waCode}`)}
              className="w-full py-3 px-4 rounded-xl bg-[#31A24C] hover:bg-[#27893E] text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? `Message Boutique (${farizaData.FARIZA_WHATSAPP_DISPLAY})`
                  : `মেসেজ পাঠান (${farizaData.FARIZA_WHATSAPP_DISPLAY})`}
              </span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#050505]/12 p-6 sm:p-8 space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#0866FF] font-semibold">
            {language === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা'}
          </div>
          <div className="divide-y divide-[#050505]/10">
            {farizaData.FARIZA_FAQS.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={faq.qEn} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left text-sm font-semibold text-[#050505] hover:text-[#0866FF] transition-colors cursor-pointer"
                  >
                    <span>{language === 'en' ? faq.qEn : faq.qBn}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180 text-[#0866FF]' : 'text-[#4B5563]'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2 text-xs text-[#374151] leading-relaxed pr-6">
                      {language === 'en' ? faq.aEn : faq.aBn}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
