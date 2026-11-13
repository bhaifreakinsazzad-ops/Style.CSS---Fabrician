import React, { useMemo, useState, useEffect, Suspense } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  Check,
  Eye,
  Heart,
  Layers,
  PhoneCall,
  Ruler,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { CartItem, Language, Product } from '../../types';
import { LiveProduct, LiveThreePieceItem } from '../../types/store';
import { ThreePieceItem } from '../../data/threePieceCatalog';
import { FASHION_LOOKS } from '../../data/mockData';
import { useStoreData } from '../../context/StoreDataContext';

const ThreePiece3DViewer = React.lazy(() =>
  import('../three-piece/ThreePiece3DViewer').then((m) => ({ default: m.ThreePiece3DViewer }))
);

interface FarizasTerritoryBrandPageProps {
  language: Language;
  onBackHome: () => void;
  onSwitchBrand: (brand: 'starkit') => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onQuickView: (product: Product) => void;
  onOpenSizeGuide: () => void;
}

const toProductFromThreePiece = (item: ThreePieceItem): Product => ({
  id: item.id,
  slug: item.code.toLowerCase(),
  brand: item.brand || "Fariza's Territory",
  nameEn: `${item.code} — ${item.nameEn}`,
  nameBn: `${item.code} — ${item.nameBn}`,
  category: 'Women',
  collection: `Fariza's Territory · ${item.subCollection}`,
  priceBDT: item.priceBDT,
  image: item.flatLayImage,
  colors: item.colors,
  sizes: ['Unstitched Set', 'S', 'M', 'L', 'XL'],
  fabricEn: item.fabric,
  fabricBn: item.fabric,
  fitEn: 'Tailorable 3-Piece Ensemble',
  fitBn: 'কাস্টম টেইলরেবল থ্রি-পিস',
  styleTag: 'heritage',
});

export const FarizasTerritoryBrandPage: React.FC<FarizasTerritoryBrandPageProps> = ({
  language,
  onBackHome,
  onSwitchBrand,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  onOpenSizeGuide,
}) => {
  const { unifiedCatalog, liveThreePieceItems, storeSettings } = useStoreData();
  const [activeSubEdit, setActiveSubEdit] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'flatlay' | 'model'>('flatlay');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [active3DItem, setActive3DItem] = useState<ThreePieceItem | null>(null);

  useEffect(() => {
    if (!active3DItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive3DItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active3DItem]);

  const couturePieces = useMemo<LiveProduct[]>(
    () =>
      unifiedCatalog.filter(
        (p) =>
          p.brand === "Fariza's Territory" &&
          p.sourceCatalog !== 'three-piece' &&
          p.status !== 'hidden'
      ),
    [unifiedCatalog]
  );

  const farizaThreePieceSets = useMemo<LiveThreePieceItem[]>(
    () => liveThreePieceItems.filter((tp) => tp.brand === "Fariza's Territory"),
    [liveThreePieceItems]
  );

  const farizaLooks = useMemo(
    () => FASHION_LOOKS.filter((l) => l.brand === "Fariza's Territory"),
    []
  );

  const edits = [
    'All',
    'Magenta & Plum',
    'Alfi Boutique',
    'Mome Boutique',
    'Zam Zam Swiss Lawn',
    'Embroidery & Mirror',
  ];

  const filteredSets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return farizaThreePieceSets.filter((item) => {
      const matchEdit = activeSubEdit === 'All' || item.subCollection === activeSubEdit;
      const matchQuery =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        item.nameBn.includes(searchQuery) ||
        item.subCollection.toLowerCase().includes(q) ||
        item.kameezEn.toLowerCase().includes(q);
      return matchEdit && matchQuery;
    });
  }, [farizaThreePieceSets, activeSubEdit, searchQuery]);

  const handleAddThreePiece = (item: LiveThreePieceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === 'out_of_stock' || item.stockCount <= 0) return;
    onAddToCart({
      productId: item.id,
      nameEn: `${item.code} — ${item.nameEn}`,
      nameBn: `${item.code} — ${item.nameBn}`,
      priceBDT: item.priceBDT,
      image: item.flatLayImage,
      color: item.colors[0]?.name || 'Standard Color',
      size: 'Unstitched Fabric Set',
      quantity: 1,
    });
    setAddedKey(item.id);
    setTimeout(() => setAddedKey(null), 1800);
  };

  const handleAddCouture = (product: LiveProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.status === 'out_of_stock' || product.stockCount <= 0) return;
    onAddToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: product.colors[0]?.name || 'Standard',
      size: product.sizes[0] || 'Free Size',
      quantity: 1,
    });
    setAddedKey(product.id);
    setTimeout(() => setAddedKey(null), 1800);
  };

  const totalWomenCount = couturePieces.length + farizaThreePieceSets.length;

  return (
    <div className="pt-20 bg-[#09090B] text-[#F5F2EB]">
      {/* Partner Navigation Sub-Bar */}
      <div className="border-b border-white/10 bg-[#111114]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-[#D8D3C9] hover:text-[#D5BA80] transition-colors cursor-pointer font-mono uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>{language === 'en' ? 'FABRICIAN House' : 'মূল স্টোর'}</span>
            </button>
            <span className="text-white/20">/</span>
            <span className="font-mono uppercase tracking-[0.2em] text-[#D5BA80]">
              Fariza&apos;s Territory × FABRICIAN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 text-[#D8D3C9] hover:text-white font-mono text-[11px] cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>{language === 'en' ? 'Women Fit Guide' : 'সাইজ গাইড'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchBrand('starkit')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-white/15 hover:border-[#B69A60]/50 text-[#D8D3C9] hover:text-[#D5BA80] font-mono text-[11px] transition-colors cursor-pointer"
            >
              <span>{language === 'en' ? 'Visit StarKiT Menswear' : 'স্টারকিট মেনস দেখুন'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Campaign Hero */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0A0A0D]">
        <div className="absolute inset-0 bg-jamdani-pattern opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-mono uppercase tracking-[0.28em] text-[#B69A60]">
              {language === 'en'
                ? 'Official Women’s Heritage & Couture Partner · 2026'
                : 'অফিশিয়াল উইমেন্স কুট্যুর ও থ্রি-পিস পার্টনার · ২০২৬'}
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-light text-[#F5F2EB] tracking-wide leading-[1.08] text-balance">
              Fariza&apos;s Territory <span className="italic text-[#D5BA80]">Women&apos;s Edit</span>
            </h1>

            <p className="text-sm sm:text-base text-[#D8D3C9] font-light leading-relaxed max-w-xl">
              {language === 'en'
                ? 'Explore all 18 verified three-piece ensembles across Swiss lawn, wax-resist Alfi & Mome batik, Magenta & Plum prints, and festive mirror-work embroidery.'
                : 'সুইস লন, আলফি ও মমি বাটিক, ম্যাজেন্টা ও প্লাম এবং উৎসবের মিরর এমব্রয়ডারির ১৮টি আসল থ্রি-পিস সংকলন।'}
            </p>

            {/* Key Campaign Numbers */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-lg">
              <div>
                <div className="font-mono text-2xl text-[#F5F2EB] font-semibold tabular-nums">
                  {String(totalWomenCount).padStart(2, '0')}
                </div>
                <div className="text-[11px] font-mono uppercase text-[#77777D]">
                  {language === 'en' ? 'Women Designs' : 'মোট ডিজাইন'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#D5BA80] font-semibold tabular-nums">
                  05
                </div>
                <div className="text-[11px] font-mono uppercase text-[#77777D]">
                  {language === 'en' ? 'Textile Edits' : 'টেক্সটাইল এডিট'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#F5F2EB] font-semibold tabular-nums">
                  ৳1,650+
                </div>
                <div className="text-[11px] font-mono uppercase text-[#77777D]">
                  {language === 'en' ? 'Direct Sets' : 'থ্রি-পিস মূল্য'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('fariza-threepiece')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-6 py-3 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors cursor-pointer"
              >
                {language === 'en'
                  ? `Browse All ${farizaThreePieceSets.length} Sets`
                  : `${farizaThreePieceSets.length}টি থ্রি-পিস দেখুন`}
              </button>
              <a
                href={storeSettings.hotlineTel}
                className="px-5 py-3 rounded-lg border border-white/15 hover:border-[#B69A60] text-xs font-mono text-[#D8D3C9] hover:text-white inline-flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>{storeSettings.hotlineDisplay}</span>
              </a>
            </div>
          </div>

          {/* Dual Campaign Photography Pair */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#171719]">
              <img
                src="/assets/fariza/CAT-001_model.jpg"
                alt="Fariza's Territory CAT-001 Model Preview"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B69A60]">
                  Three-Piece Edit
                </div>
                <div className="font-serif-luxury text-lg text-[#F5F2EB]">
                  CAT-001 Magenta &amp; Plum
                </div>
              </div>
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#171719] translate-y-4">
              <img
                src="/assets/fariza/FS-D01_model.jpg"
                alt="Fariza's Territory FS-D01 Golden Mustard Mirror Elegance"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B69A60]">
                  Embroidery &amp; Mirror
                </div>
                <div className="font-serif-luxury text-lg text-[#F5F2EB]">
                  FS-D01 Golden Mustard Mirror
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle & Courier Value Strip */}
      <section className="border-b border-white/10 bg-[#121216]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#B69A60] shrink-0" />
            <span className="text-[#D8D3C9]">
              {language === 'en'
                ? `Save ৳${storeSettings.bundle2DiscountBDT} on 2 sets · Save ৳${storeSettings.bundle3DiscountBDT} on 3+`
                : `২টি সেটে ৳${storeSettings.bundle2DiscountBDT} · ৩টিতে ৳${storeSettings.bundle3DiscountBDT} ছাড়`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[#D8D3C9]">
              {language === 'en'
                ? `Free nationwide Pathao delivery over ৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}`
                : `৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+ অর্ডারে পাঠাও ফ্রি ডেলিভারি`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#B69A60] shrink-0" />
            <span className="text-[#D8D3C9]">
              {language === 'en'
                ? '100% original fabric set photography · Color verified on request'
                : '১০০% আসল ফ্যাব্রিক সেটের ছবি · অর্ডার কনফার্মের আগে কালার ভেরিফাইড'}
            </span>
          </div>
        </div>
      </section>

      {/* Part 1: Women's Couture Highlights */}
      {couturePieces.length > 0 && (
        <section className="py-16 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#B69A60]">
                  Fariza&apos;s Territory × Atelier Drops
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-light text-[#F5F2EB]">
                  {language === 'en' ? 'Custom Women’s Editions' : 'কাস্টম উইমেন্স এডিশন'}
                </h2>
              </div>
              <span className="text-xs font-mono text-[#77777D] tabular-nums">
                {couturePieces.length} {language === 'en' ? 'editions' : 'টি এডিশন'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {couturePieces.map((product) => {
                const isOutOfStock = product.status === 'out_of_stock' || product.stockCount <= 0;
                const isAdded = addedKey === product.id;
                const wish = isWishlisted(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => onQuickView(product)}
                    className="group bg-[#171719] border border-white/10 hover:border-[#B69A60]/40 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all"
                  >
                    <div className="relative aspect-[3/4] bg-black/40 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.nameEn}
                        loading="lazy"
                        className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ${
                          isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-transparent to-transparent opacity-80" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                          wish
                            ? 'bg-[#B69A60] text-[#09090B]'
                            : 'bg-black/60 text-[#D8D3C9] hover:text-white'
                        }`}
                        aria-label="Wishlist toggle"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#B69A60] mb-1">
                          Fariza&apos;s Territory · {product.collection}
                        </div>
                        <h3 className="font-serif-luxury text-xl text-[#F5F2EB] font-light mb-1">
                          {language === 'en' ? product.nameEn : product.nameBn}
                        </h3>
                        <p className="text-xs text-[#77777D] mb-4">
                          {language === 'en' ? product.fabricEn : product.fabricBn}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                        <span className="font-mono text-base font-semibold text-[#F5F2EB] tabular-nums">
                          ৳ {product.priceBDT.toLocaleString()}
                        </span>

                        <button
                          type="button"
                          disabled={isOutOfStock || isAdded}
                          onClick={(e) => handleAddCouture(product, e)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                            isOutOfStock
                              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                              : isAdded
                              ? 'bg-[#B69A60] text-[#09090B]'
                              : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] cursor-pointer'
                          }`}
                        >
                          {isOutOfStock ? (
                            <span>{language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}</span>
                          ) : isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Added' : 'যুক্ত'}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Add to Bag' : 'ব্যাগে নিন'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Part 2: Complete 18 Three-Piece Catalog (100% Accurate Fariza Catalog Images) */}
      <section id="fariza-threepiece" className="scroll-mt-24 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#B69A60]">
                Fariza&apos;s Territory · Complete Three-Piece Catalog
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-light text-[#F5F2EB] mt-1">
                {language === 'en'
                  ? `${farizaThreePieceSets.length} Signature Three-Piece Ensembles`
                  : `${farizaThreePieceSets.length}টি সিগনেচার থ্রি-পিস এডিট`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-1 bg-[#171719] border border-white/10 rounded-lg flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('flatlay')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    viewMode === 'flatlay'
                      ? 'bg-[#F5F2EB] text-[#09090B] shadow'
                      : 'text-[#D8D3C9] hover:text-white'
                  }`}
                >
                  {language === 'en' ? 'Original Fabric' : 'আসল ফ্যাব্রিক'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('model')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    viewMode === 'model'
                      ? 'bg-[#F5F2EB] text-[#09090B] shadow'
                      : 'text-[#D8D3C9] hover:text-white'
                  }`}
                >
                  {language === 'en' ? 'Model / Detail' : 'মডেল / ডিটেইল'}
                </button>
              </div>
            </div>
          </div>

          {/* Filters & SKU Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2.5 bg-[#171719] border border-white/10 rounded-xl mb-10">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {edits.map((edit) => (
                <button
                  key={edit}
                  type="button"
                  onClick={() => setActiveSubEdit(edit)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    activeSubEdit === edit
                      ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                      : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {edit === 'All' && language === 'bn' ? 'সকল' : edit}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-[#77777D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search SKU (CAT-001, ZSL-01)...' : 'কোড খুঁজুন...'}
                className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
              />
            </div>
          </div>

          {/* Grid */}
          {filteredSets.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-white/10 bg-[#171719]/40">
              <p className="font-serif-luxury text-xl text-[#F5F2EB] mb-2">
                {language === 'en' ? 'No matching sets found' : 'কোনো সেট পাওয়া যায়নি'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveSubEdit('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-white/10 text-xs font-mono text-[#D5BA80] cursor-pointer"
              >
                {language === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSets.map((item) => {
                const isWish = isWishlisted(item.id);
                const isJustAdded = addedKey === item.id;
                const isOutOfStock = item.status === 'out_of_stock' || item.stockCount <= 0;
                const displayImage = viewMode === 'flatlay' ? item.flatLayImage : item.modelImage;
                const mappedProduct = toProductFromThreePiece(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => onQuickView(mappedProduct)}
                    className="group bg-[#171719] border border-white/10 hover:border-[#B69A60]/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] sm:aspect-[3/4] overflow-hidden bg-black/60">
                      <img
                        src={displayImage}
                        alt={`${item.code} ${item.nameEn}`}
                        loading="lazy"
                        className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ${
                          isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                        }`}
                      />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#09090B] bg-[#D5BA80] px-2.5 py-0.5 rounded shadow">
                            {item.code}
                          </span>
                          {isOutOfStock && (
                            <span className="font-mono text-[10px] font-semibold text-red-300 bg-black/85 border border-red-500/40 px-2 py-0.5 rounded">
                              {language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView(mappedProduct);
                            }}
                            className="p-1.5 bg-black/70 hover:bg-black text-[#D8D3C9] hover:text-white rounded-full backdrop-blur-md border border-white/10 cursor-pointer"
                            title={language === 'en' ? 'Quick View' : 'দ্রুত দেখুন'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActive3DItem(item);
                            }}
                            className="p-1.5 bg-black/70 hover:bg-black text-[#D5BA80] hover:text-white rounded-full backdrop-blur-md border border-white/10 cursor-pointer"
                            title={language === 'en' ? 'Inspect in 3D Studio' : '৩ডি স্টুডিও'}
                          >
                            <Box className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(mappedProduct);
                            }}
                            className={`p-1.5 rounded-full backdrop-blur-md cursor-pointer ${
                              isWish
                                ? 'bg-[#B69A60] text-[#09090B]'
                                : 'bg-black/60 text-[#D8D3C9] hover:text-white'
                            }`}
                            aria-label="Wishlist toggle"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] font-mono text-[#D8D3C9] bg-black/75 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                          {viewMode === 'flatlay'
                            ? language === 'en'
                              ? 'Original Fabric'
                              : 'আসল ফ্যাব্রিক'
                            : item.hasModelConcept
                            ? language === 'en'
                              ? 'Model Concept'
                              : 'মডেল প্রিভিউ'
                            : language === 'en'
                            ? 'Fabric Close-up'
                            : 'ফ্যাব্রিক ক্লোজ-আপ'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#B69A60] mb-1">
                          Fariza&apos;s Territory · {item.subCollection}
                        </div>
                        <h3 className="font-serif-luxury text-xl text-[#F5F2EB] font-light group-hover:text-[#D5BA80] transition-colors mb-1">
                          {language === 'en' ? item.nameEn : item.nameBn}
                        </h3>
                        <p className="text-xs text-[#77777D] line-clamp-2 font-light mb-4">
                          {language === 'en' ? item.descriptionEn : item.descriptionBn}
                        </p>

                        <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 text-[11px] mb-4">
                          <div className="flex gap-2">
                            <span className="font-mono text-[#B69A60] shrink-0">KAMEEZ:</span>
                            <span className="text-[#D8D3C9] truncate">
                              {language === 'en' ? item.kameezEn : item.kameezBn}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-mono text-[#B69A60] shrink-0">SALWAR:</span>
                            <span className="text-[#D8D3C9] truncate">
                              {language === 'en' ? item.salwarEn : item.salwarBn}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <span className="font-mono text-[#B69A60] shrink-0">DUPATTA:</span>
                            <span className="text-[#D8D3C9] truncate">
                              {language === 'en' ? item.dupattaEn : item.dupattaBn}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-mono text-lg text-[#F5F2EB] font-bold tabular-nums">
                            ৳ {item.priceBDT.toLocaleString()}
                          </div>
                          {item.priceNote && (
                            <div className="text-[9px] text-[#B69A60]">{item.priceNote}</div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleAddThreePiece(item, e)}
                          disabled={isJustAdded || isOutOfStock}
                          className={`py-2 px-3.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                            isOutOfStock
                              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                              : isJustAdded
                              ? 'bg-[#B69A60] text-[#09090B]'
                              : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] cursor-pointer'
                          }`}
                        >
                          {isOutOfStock ? (
                            <span>{language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}</span>
                          ) : isJustAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Added' : 'যুক্ত'}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Order Set' : 'অর্ডার করুন'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fariza Lookbook Ensembles */}
          {farizaLooks.length > 0 && (
            <div className="mt-20 pt-14 border-t border-white/10">
              <div className="mb-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#B69A60]">
                  {language === 'en' ? "Fariza's Territory Runway" : 'ফারিজাস টেরিটরি রানওয়ে'}
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-light text-[#F5F2EB]">
                  {language === 'en' ? "Women's Signature Ensembles" : 'নারীদের সিগনেচার লুকবুক'}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {farizaLooks.map((look) => (
                  <div
                    key={look.id}
                    className="p-4 rounded-2xl bg-[#141418] border border-white/10 flex flex-col justify-between gap-4"
                  >
                    <div className="flex gap-4">
                      <img
                        src={look.modelImage}
                        alt={look.titleEn}
                        loading="lazy"
                        className="w-24 aspect-[3/4] object-cover object-top rounded-xl shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#B69A60]">
                          {look.collectionEn}
                        </div>
                        <h3 className="font-serif-luxury text-lg text-[#F5F2EB] leading-snug mb-1">
                          {language === 'en' ? look.titleEn : look.titleBn}
                        </h3>
                        <p className="text-xs text-[#9A9892] font-light line-clamp-3">
                          {language === 'en' ? look.storyEn : look.storyBn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                      <span className="font-mono text-sm font-semibold text-[#D5BA80] tabular-nums">
                        ৳ {look.totalPriceBDT.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          look.garments.forEach((g) =>
                            onAddToCart({
                              productId: g.id,
                              nameEn: g.nameEn,
                              nameBn: g.nameBn,
                              priceBDT: g.priceBDT,
                              image: g.image || look.modelImage,
                              color: look.colorway,
                              size: g.sizes[0] || 'Free Size',
                              quantity: 1,
                            })
                          );
                        }}
                        className="px-3.5 py-2 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        {language === 'en' ? 'Add Ensemble' : 'সম্পূর্ণ লুক'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive 3D Fabric Studio Modal */}
      {active3DItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setActive3DItem(null)} className="fixed inset-0 bg-black/90" />
          <div className="relative w-full max-w-4xl bg-[#09090B] border border-white/15 rounded-3xl overflow-hidden z-10 shadow-2xl">
            <div className="p-4 bg-[#171719] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#B69A60]" />
                <span className="font-serif-luxury text-lg text-[#F5F2EB]">
                  {language === 'en' ? "Fariza's Territory · 3D Fabric Studio" : '৩ডি ফ্যাব্রিক ড্র্যাপ স্টুডিও'}
                </span>
                <span className="text-xs font-mono text-[#D5BA80] px-2 py-0.5 rounded bg-black/60 border border-white/10">
                  {active3DItem.code} · {active3DItem.nameEn}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActive3DItem(null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs uppercase tracking-wider text-[#F5F2EB] cursor-pointer"
              >
                {language === 'en' ? 'Close 3D' : 'বন্ধ করুন'}
              </button>
            </div>
            <Suspense
              fallback={
                <div className="h-[520px] flex items-center justify-center bg-[#09090B] text-xs font-mono text-[#D5BA80]">
                  Loading 3D Textile Studio...
                </div>
              }
            >
              <ThreePiece3DViewer
                selectedItem={active3DItem}
                onClose={() => setActive3DItem(null)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};
