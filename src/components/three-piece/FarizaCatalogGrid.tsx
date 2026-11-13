import React, { useState, useMemo, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import {
  Box,
  Check,
  Copy,
  Eye,
  Heart,
  Layers,
  RefreshCw,
  Scissors,
  Search,
  ShoppingBag,
  Tag,
  Truck,
  Zap,
} from 'lucide-react';
import { ThreePieceItem } from '../../data/threePieceCatalog';
import { LiveThreePieceItem } from '../../types/store';
import { CartItem, Language, Product } from '../../types';
import { useStoreData } from '../../context/StoreDataContext';
import type { FarizaChestSize } from '../../data/farizaBrandData';
import {
  trackFarizaCustomizeProduct,
  trackFarizaSearch,
  trackFarizaViewContent,
} from '../../services/metaPixel';

const TAILORING_SURCHARGE_BDT = 450;
const CHEST_SIZES: readonly FarizaChestSize[] = ['34"', '36"', '38"', '40"', '42"', '44"'];

export const toThreePieceProduct = (item: ThreePieceItem): Product => ({
  id: item.id,
  slug: item.code.toLowerCase(),
  brand: item.brand || "Fariza's Territory",
  nameEn: `${item.code} — ${item.nameEn}`,
  nameBn: `${item.code} — ${item.nameBn}`,
  category: 'Women',
  collection: item.subCollection,
  priceBDT: item.priceBDT,
  image: item.flatLayImage,
  colors: item.colors,
  sizes: ['Unstitched Set', 'S (36")', 'M (38")', 'L (40")', 'XL (42")'],
  fabricEn: item.fabric,
  fabricBn: item.fabric,
  fitEn: 'Unstitched or Custom Stitched (+৳450)',
  fitBn: 'আনস্টিচড অথবা কাস্টম স্টিচড (+৳৪৫০)',
  styleTag: 'heritage',
});

interface EditMeta {
  id: 'All' | ThreePieceItem['subCollection'];
  labelEn: string;
  labelBn: string;
  accentHex: string;
  fabricTag: string;
}

const EDIT_METADATA: EditMeta[] = [
  {
    id: 'All',
    labelEn: 'All 18 Styles',
    labelBn: 'সকল ১৮ ডিজাইন',
    accentHex: '#0866FF',
    fabricTag: 'Complete Capsule',
  },
  {
    id: 'Magenta & Plum',
    labelEn: 'Magenta & Plum',
    labelBn: 'ম্যাজেন্টা ও প্লাম',
    accentHex: '#050505',
    fabricTag: 'Printed Cotton Lawn',
  },
  {
    id: 'Alfi Boutique',
    labelEn: 'Alfi Boutique',
    labelBn: 'আলফি বুটিক',
    accentHex: '#31A24C',
    fabricTag: 'Wax-Resist Batik',
  },
  {
    id: 'Mome Boutique',
    labelEn: 'Mome Boutique',
    labelBn: 'মোমে বুটিক',
    accentHex: '#0866FF',
    fabricTag: 'Tie-Dye & Sprig',
  },
  {
    id: 'Zam Zam Swiss Lawn',
    labelEn: 'Zam Zam Swiss Lawn',
    labelBn: 'জমজম সুইস লন',
    accentHex: '#050505',
    fabricTag: 'Swiss Lawn',
  },
  {
    id: 'Embroidery & Mirror',
    labelEn: 'Embroidery & Mirror',
    labelBn: 'মিরর এমব্রয়ডারি',
    accentHex: '#31A24C',
    fabricTag: 'Shisha & Resham',
  },
];

export const FarizaPromoBar: React.FC<{ language: Language }> = ({ language }) => {
  const { storeSettings } = useStoreData();
  const [copiedPromo, setCopiedPromo] = useState(false);

  const handleCopyCode = () => {
    try {
      navigator.clipboard?.writeText('FARIZA10');
    } catch {
      // fallback silently if clipboard unavailable
    }
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2200);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#050505]/15 shadow-sm mb-8 px-4 py-3.5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 font-fariza">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#050505]">
        <div className="flex items-center gap-2 font-semibold">
          <Tag className="w-4 h-4 text-[#0866FF] shrink-0" />
          <span>
            {language === 'en'
              ? 'Unlock 10% Extra Off with Code'
              : 'কোড ব্যবহারে পাচ্ছেন অতিরিক্ত ১০% ছাড়'}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0866FF] hover:bg-[#0552D1] text-white font-mono text-[11px] font-bold transition-colors cursor-pointer"
            title={language === 'en' ? 'Copy promo code FARIZA10' : 'কপি করুন FARIZA10'}
          >
            <span>FARIZA10</span>
            {copiedPromo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          {copiedPromo && (
            <span className="text-[11px] font-mono text-[#196B2C] font-semibold">
              {language === 'en' ? 'Copied!' : 'কপি হয়েছে!'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[#374151]">
          <Layers className="w-3.5 h-3.5 text-[#0866FF] shrink-0" />
          <span className="tabular-nums">
            {language === 'en'
              ? `Stacks with ৳${storeSettings.bundle2DiscountBDT} (2 sets) · ৳${storeSettings.bundle3DiscountBDT} (3+ sets) Bundle Privilege`
              : `২টি সেটে ৳${storeSettings.bundle2DiscountBDT} ও ৩টিতে ৳${storeSettings.bundle3DiscountBDT} বান্ডেল ছাড়`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-[#196B2C] font-semibold shrink-0">
        <Truck className="w-4 h-4 text-[#31A24C] shrink-0" />
        <span className="tabular-nums">
          {language === 'en'
            ? `Free Pathao Delivery on ৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+`
            : `৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+ অর্ডারে ফ্রি পাঠাও ডেলিভারি`}
        </span>
      </div>
    </div>
  );
};

interface FarizaCatalogGridProps {
  items: LiveThreePieceItem[];
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  onQuickView?: (product: Product) => void;
  onLaunch3D: (item: ThreePieceItem) => void;
  recommendedChestSize?: FarizaChestSize | null;
  animateOnMount?: boolean;
}

export const FarizaCatalogGrid: React.FC<FarizaCatalogGridProps> = ({
  items,
  language,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  onLaunch3D,
  recommendedChestSize = null,
  animateOnMount = false,
}) => {
  const useSupabaseCommerce = import.meta.env.VITE_COMMERCE_BACKEND === 'supabase';
  const [activeSubEdit, setActiveSubEdit] = useState<'All' | ThreePieceItem['subCollection']>('All');
  const [globalViewMode, setGlobalViewMode] = useState<'flatlay' | 'model'>('flatlay');
  const [cardViewOverrides, setCardViewOverrides] = useState<Record<string, 'flatlay' | 'model'>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priceTier, setPriceTier] = useState<'all' | 'under-1850' | 'mid' | 'signature'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [tailoringMode, setTailoringMode] = useState<Record<string, 'unstitched' | 'stitched'>>({});
  const [selectedChestSize, setSelectedChestSize] = useState<Record<string, string>>({});
  const [selectedShade, setSelectedShade] = useState<Record<string, string>>({});
  const [addedItemCode, setAddedItemCode] = useState<string | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const gridRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!recommendedChestSize || useSupabaseCommerce) return;
    setSelectedChestSize(() => {
      const next: Record<string, string> = {};
      items.forEach((item) => {
        next[item.id] = recommendedChestSize;
      });
      return next;
    });
  }, [recommendedChestSize, items, useSupabaseCommerce]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    const timer = window.setTimeout(() => {
      trackFarizaSearch(q);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const countByEdit = useMemo(() => {
    const map: Record<string, number> = { All: items.length };
    items.forEach((item) => {
      map[item.subCollection] = (map[item.subCollection] || 0) + 1;
    });
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items
      .filter((item) => {
        const matchEdit = activeSubEdit === 'All' || item.subCollection === activeSubEdit;
        const matchPrice =
          priceTier === 'all'
            ? true
            : priceTier === 'under-1850'
            ? item.priceBDT <= 1850
            : priceTier === 'mid'
            ? item.priceBDT > 1850 && item.priceBDT <= 2150
            : item.priceBDT > 2150;
        const matchQuery =
          !q ||
          item.code.toLowerCase().includes(q) ||
          item.nameEn.toLowerCase().includes(q) ||
          item.nameBn.includes(searchQuery) ||
          item.subCollection.toLowerCase().includes(q) ||
          item.kameezEn.toLowerCase().includes(q) ||
          item.colors.some((c) => c.name.toLowerCase().includes(q));
        return matchEdit && matchPrice && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceBDT - b.priceBDT;
        if (sortBy === 'price-desc') return b.priceBDT - a.priceBDT;
        return 0;
      });
  }, [items, activeSubEdit, priceTier, searchQuery, sortBy]);

  useEffect(() => {
    if (!animateOnMount || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.fariza-product-card');
    if (cards.length === 0) return;

    animate(cards, {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(30, { start: 25 }),
      duration: 420,
      ease: 'outCubic',
    });
  }, [animateOnMount, activeSubEdit, priceTier, sortBy, searchQuery]);

  useEffect(() => {
    if (!counterRef.current) return;
    const obj = { val: 0 };
    animate(obj, {
      val: filteredItems.length,
      duration: 400,
      ease: 'outExpo',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(obj.val)).padStart(2, '0');
        }
      },
    });
  }, [filteredItems.length]);

  const buildOrderPayload = (item: LiveThreePieceItem): Omit<CartItem, 'id'> => {
    const isStitched = !useSupabaseCommerce && tailoringMode[item.id] === 'stitched';
    const chest = selectedChestSize[item.id] || recommendedChestSize || '38"';
    const activeColor = selectedShade[item.id] || item.colors[0]?.name || 'Signature Shade';
    const unitPrice = item.priceBDT + (isStitched ? TAILORING_SURCHARGE_BDT : 0);

    return {
      productId: item.id,
      nameEn: `${item.code} — ${item.nameEn}`,
      nameBn: `${item.code} — ${item.nameBn}`,
      priceBDT: unitPrice,
      image: item.flatLayImage,
      color: activeColor,
      size: isStitched ? `Custom Stitched (${chest})` : 'Unstitched Set',
      quantity: 1,
    };
  };

  const handleOpenQuickView = (item: LiveThreePieceItem) => {
    trackFarizaViewContent({
      id: item.id,
      name: `${item.code} — ${item.nameEn}`,
      category: item.subCollection,
      valueBDT: item.priceBDT,
    });
    onQuickView?.(toThreePieceProduct(item));
  };

  const handleAddItem = (item: LiveThreePieceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === 'out_of_stock' || item.stockCount <= 0) return;
    onAddToCart(buildOrderPayload(item));
    setAddedItemCode(item.code);
    setTimeout(() => setAddedItemCode(null), 1800);
  };

  const handleBuyNowItem = (item: LiveThreePieceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === 'out_of_stock' || item.stockCount <= 0) return;
    const payload = buildOrderPayload(item);
    if (onBuyNow) {
      onBuyNow(payload);
    } else {
      onAddToCart(payload);
    }
  };

  const minPrice = items.length ? Math.min(...items.map((i) => i.priceBDT)) : 1650;
  const maxPrice = items.length ? Math.max(...items.map((i) => i.priceBDT)) : 2450;

  return (
    <div className="font-fariza">
      {/* 5 Signature Edit Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        {EDIT_METADATA.map((edit) => {
          const isActive = activeSubEdit === edit.id;
          const count = countByEdit[edit.id] || 0;
          return (
            <button
              key={edit.id}
              type="button"
              onClick={() => setActiveSubEdit(edit.id)}
              className={`group text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-[#0866FF] border-[#0866FF] text-white shadow-md'
                  : 'bg-white border-[#050505]/12 hover:border-[#0866FF] text-[#050505]'
              }`}
            >
              <span
                className="block w-8 h-1 rounded-full mb-2 transition-all group-hover:w-12"
                style={{ backgroundColor: isActive ? '#FFFFFF' : edit.accentHex }}
              />
              <div className="flex items-baseline justify-between gap-1">
                <span className="text-xs font-semibold leading-tight truncate">
                  {language === 'en' ? edit.labelEn : edit.labelBn}
                </span>
                <span
                  className={`font-mono text-[11px] font-bold tabular-nums shrink-0 ${
                    isActive ? 'text-white' : 'text-[#4B5563]'
                  }`}
                >
                  {String(count).padStart(2, '0')}
                </span>
              </div>
              <div
                className={`text-[10px] font-mono mt-0.5 truncate ${
                  isActive ? 'text-white/85' : 'text-[#4B5563]'
                }`}
              >
                {edit.fabricTag}
              </div>
            </button>
          );
        })}
      </div>

      {/* Discovery, View Mode, Budget & Search Controls */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-[#050505]/12 shadow-sm mb-8 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Global Image View Segmented Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-1 bg-[#F0F2F5] border border-[#050505]/12 rounded-xl inline-flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setGlobalViewMode('flatlay');
                  setCardViewOverrides({});
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  globalViewMode === 'flatlay'
                    ? 'bg-[#050505] text-white shadow-sm'
                    : 'text-[#374151] hover:text-[#050505]'
                }`}
              >
                {language === 'en' ? 'Original Fabric' : 'আসল ফ্যাব্রিক'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setGlobalViewMode('model');
                  setCardViewOverrides({});
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  globalViewMode === 'model'
                    ? 'bg-[#0866FF] text-white shadow-sm'
                    : 'text-[#374151] hover:text-[#050505]'
                }`}
              >
                {language === 'en' ? 'Model / Detail' : 'মডেল / ডিটেইল'}
              </button>
            </div>

            {/* Price Tier Quick Filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              {[
                { id: 'all', en: 'All Prices', bn: 'সব মূল্য' },
                { id: 'under-1850', en: '≤ ৳1,850', bn: '≤ ৳১,৮৫০' },
                { id: 'mid', en: '৳1,851–2,150', bn: '৳১,৮৫১–২,১৫০' },
                { id: 'signature', en: '৳2,150+', bn: '৳২,১৫০+' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setPriceTier(tier.id as typeof priceTier)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer tabular-nums ${
                    priceTier === tier.id
                      ? 'bg-[#31A24C] border-[#31A24C] text-white font-bold'
                      : 'bg-[#F0F2F5] border-[#050505]/12 text-[#374151] hover:border-[#0866FF]/60'
                  }`}
                >
                  {language === 'en' ? tier.en : tier.bn}
                </button>
              ))}
            </div>
          </div>

          {/* SKU Search + Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search code, color (ZSL-01, Plum)...'
                    : 'কোড বা রঙ খুঁজুন (ZSL-01)...'
                }
                className="w-full bg-[#F0F2F5] border border-[#050505]/15 rounded-lg pl-8 pr-3 py-2 text-xs text-[#050505] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0866FF]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label={language === 'en' ? 'Sort designs' : 'ডিজাইন সাজান'}
              className="bg-[#F0F2F5] border border-[#050505]/15 rounded-lg px-3 py-2 text-xs font-mono text-[#050505] focus:outline-none focus:border-[#0866FF] cursor-pointer"
            >
              <option value="featured">
                {language === 'en' ? 'Sort: Curated Order' : 'নির্বাচিত ক্রম'}
              </option>
              <option value="price-asc">
                {language === 'en' ? 'Price: Low to High' : 'মূল্য: কম থেকে বেশি'}
              </option>
              <option value="price-desc">
                {language === 'en' ? 'Price: High to Low' : 'মূল্য: বেশি থেকে কম'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Counter & Range Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#374151] uppercase tracking-wider mb-7 pb-3 border-b border-[#050505]/12">
        <div className="flex items-center gap-2">
          <span>{language === 'en' ? 'Showing' : 'দেখানো হচ্ছে'}</span>
          <span ref={counterRef} className="text-[#0866FF] font-bold tabular-nums text-sm">
            {String(filteredItems.length).padStart(2, '0')}
          </span>
          <span>
            {language === 'en'
              ? `of ${items.length} Verified Sets`
              : `টি (মোট ${items.length} আসল ডিজাইন)`}
          </span>
        </div>
        <span className="tabular-nums text-[#196B2C] font-semibold">
          {language === 'en'
            ? `Direct Factory Price: ৳${minPrice.toLocaleString()} — ৳${maxPrice.toLocaleString()}`
            : `সরাসরি বুটিক মূল্য: ৳${minPrice.toLocaleString()} — ৳${maxPrice.toLocaleString()}`}
        </span>
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-[#050505]/12 bg-white">
          <p className="font-fariza-display text-2xl font-bold text-[#050505] mb-2">
            {language === 'en'
              ? 'No matching three-piece sets found'
              : 'কোনো থ্রি-পিস ডিজাইন পাওয়া যায়নি'}
          </p>
          <p className="text-xs text-[#4B5563] mb-4">
            {language === 'en'
              ? 'Try resetting filters or searching another SKU code.'
              : 'অন্য কোড দিয়ে খুঁজুন অথবা ফিল্টার রিসেট করুন।'}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveSubEdit('All');
              setPriceTier('all');
              setSearchQuery('');
              setSortBy('featured');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#0552D1] text-white text-xs font-mono font-semibold uppercase tracking-wider cursor-pointer transition-colors"
          >
            {language === 'en' ? 'Reset All Filters' : 'সব ফিল্টার রিসেট করুন'}
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredItems.map((item) => {
            const isWish = isWishlisted(item.id);
            const isJustAdded = addedItemCode === item.code;
            const isOutOfStock = item.status === 'out_of_stock' || item.stockCount <= 0;
            const cardMode = cardViewOverrides[item.id] || globalViewMode;
            const displayImage = cardMode === 'flatlay' ? item.flatLayImage : item.modelImage;
            const mappedProduct = toThreePieceProduct(item);
            const isStitched = !useSupabaseCommerce && tailoringMode[item.id] === 'stitched';
            const chestSize = selectedChestSize[item.id] || recommendedChestSize || '38"';
            const activeShade = selectedShade[item.id] || item.colors[0]?.name || 'Standard';
            const finalUnitPrice = item.priceBDT + (isStitched ? TAILORING_SURCHARGE_BDT : 0);
            const isBroken = brokenImages[item.id];

            return (
              <div
                key={item.id}
                onClick={() => handleOpenQuickView(item)}
                className="fariza-product-card group relative bg-white border border-[#050505]/12 hover:border-[#0866FF] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl cursor-pointer"
              >
                {/* Uniform 4:5 Media Stage */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F0F2F5]">
                  {isBroken ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#F0F2F5] text-[#050505]">
                      <span className="font-mono text-sm font-bold text-[#0866FF] mb-1">
                        {item.code}
                      </span>
                      <span className="text-xs font-semibold">{item.nameEn}</span>
                    </div>
                  ) : (
                    <img
                      src={displayImage}
                      alt={`${item.code} ${item.nameEn}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== item.flatLayImage && !img.src.endsWith(item.flatLayImage)) {
                          img.src = item.flatLayImage;
                        } else {
                          setBrokenImages((prev) => ({ ...prev, [item.id]: true }));
                        }
                      }}
                      className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out ${
                        isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''
                      }`}
                    />
                  )}

                  {/* Top SKU & Action Buttons */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-white bg-[#050505]/90 px-2.5 py-1 rounded-md shadow">
                        {item.styleNo ? `${item.styleNo} · ` : ''}
                        {item.code}
                      </span>
                      {isOutOfStock && (
                        <span className="font-mono text-[10px] font-bold text-white bg-red-600 px-2 py-1 rounded-md">
                          {language === 'en' ? 'Sold Out' : 'স্টক শেষ'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onQuickView && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenQuickView(item);
                          }}
                          className="p-2 bg-white/95 hover:bg-[#050505] text-[#050505] hover:text-white rounded-full shadow-md transition-colors cursor-pointer"
                          title={language === 'en' ? 'Quick View & Reviews' : 'বিস্তারিত দেখুন'}
                          aria-label={`Quick view ${item.code}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          trackFarizaViewContent({
                            id: item.id,
                            name: `${item.code} — ${item.nameEn}`,
                            category: `${item.subCollection} (3D Studio)`,
                            valueBDT: item.priceBDT,
                          });
                          onLaunch3D(item);
                        }}
                        className="p-2 bg-white/95 hover:bg-[#0866FF] text-[#0866FF] hover:text-white rounded-full shadow-md transition-colors cursor-pointer"
                        title={language === 'en' ? '3D Fabric Studio' : '৩ডি ফ্যাব্রিক স্টুডিও'}
                        aria-label={`Inspect ${item.code} in 3D`}
                      >
                        <Box className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(mappedProduct);
                        }}
                        className={`p-2 rounded-full shadow-md transition-colors cursor-pointer ${
                          isWish
                            ? 'bg-[#0866FF] text-white'
                            : 'bg-white/95 text-[#374151] hover:text-[#0866FF]'
                        }`}
                        aria-label="Toggle wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Per-Card Photo Angle Flipper */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardViewOverrides((prev) => ({
                          ...prev,
                          [item.id]: cardMode === 'flatlay' ? 'model' : 'flatlay',
                        }));
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#050505]/85 hover:bg-[#0866FF] text-white text-[10px] font-mono backdrop-blur-sm transition-colors cursor-pointer shadow"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>
                        {cardMode === 'flatlay'
                          ? language === 'en'
                            ? item.hasModelConcept
                              ? 'Model Look'
                              : 'Close-Up'
                            : 'মডেল লুক'
                          : language === 'en'
                          ? 'Flat-Lay'
                          : 'আসল ফ্যাব্রিক'}
                      </span>
                    </button>

                    {(item.hasMirror || item.hasTassels) && (
                      <span className="px-2 py-1 rounded-md bg-white/95 text-[#050505] text-[10px] font-mono font-semibold shadow-sm">
                        {item.hasMirror
                          ? language === 'en'
                            ? 'Shisha Mirror'
                            : 'মিরর ওয়ার্ক'
                          : language === 'en'
                          ? 'Tassel Dupatta'
                          : 'ট্যাসেল ওড়না'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col justify-between flex-1 text-[#050505]">
                  <div>
                    {/* Single-Line Clean Metadata (Zero Pill Cluster) */}
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider mb-1">
                      <span className="text-[#0866FF] font-bold truncate">
                        {item.subCollection}
                      </span>
                      <span className="text-[#196B2C] font-semibold shrink-0 tabular-nums">
                        {isOutOfStock
                          ? language === 'en'
                            ? 'Restocking'
                            : 'স্টক শেষ'
                          : language === 'en'
                          ? `${item.stockCount} Ready`
                          : `${item.stockCount}টি রেডি`}
                      </span>
                    </div>

                    <h3 className="font-fariza-display text-xl sm:text-2xl text-[#050505] font-bold leading-snug group-hover:text-[#0866FF] transition-colors mb-1">
                      {language === 'en' ? item.nameEn : item.nameBn}
                    </h3>

                    {item.taglineBn && (
                      <p className="font-bengali text-xs text-[#4B5563] mb-2">
                        {item.taglineBn}
                      </p>
                    )}

                    {/* Interactive Color Swatches */}
                    <div className="flex items-center justify-between gap-2 my-3">
                      <div className="flex items-center gap-1.5">
                        {item.colors.map((c) => {
                          const isSelected = activeShade === c.name;
                          return (
                            <button
                              key={c.name}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedShade((prev) => ({ ...prev, [item.id]: c.name }));
                              }}
                              title={c.name}
                              aria-label={`Select colorway ${c.name}`}
                              className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                                isSelected
                                  ? 'scale-115 ring-2 ring-[#0866FF] ring-offset-1 border-white'
                                  : 'border-black/20 hover:scale-105'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          );
                        })}
                      </div>
                      <span className="text-[11px] font-mono text-[#374151] truncate">
                        {activeShade}
                      </span>
                    </div>

                    {/* 3-Piece Compact Specifications List */}
                    <div className="py-2.5 px-3 rounded-xl bg-[#F0F2F5] space-y-1 text-[11px] mb-3.5">
                      <div className="flex gap-2">
                        <span className="font-mono font-bold text-[#050505] shrink-0">KAMEEZ:</span>
                        <span className="text-[#374151] truncate">
                          {language === 'en' ? item.kameezEn : item.kameezBn}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-mono font-bold text-[#050505] shrink-0">SALWAR:</span>
                        <span className="text-[#374151] truncate">
                          {language === 'en' ? item.salwarEn : item.salwarBn}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-mono font-bold text-[#050505] shrink-0">DUPATTA:</span>
                        <span className="text-[#374151] truncate">
                          {language === 'en' ? item.dupattaEn : item.dupattaBn}
                        </span>
                      </div>
                    </div>

                    {/* Direct Fit Mode Selector */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mb-4 p-2.5 rounded-xl bg-[#F0F2F5] space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#374151]">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#050505]">
                          <Scissors className="w-3 h-3 text-[#0866FF]" />
                          {language === 'en' ? 'Tailoring' : 'সেলাই অপশন'}
                        </span>
                        <span className="text-[#196B2C] font-semibold">
                          {isStitched ? '+৳450 Stitched' : 'Unstitched Fabric'}
                        </span>
                      </div>
                      {useSupabaseCommerce ? (
                        <div className="text-[11px] font-mono text-[#050505] bg-white rounded-lg px-2.5 py-1.5 border border-[#050505]/12 font-semibold text-center">
                          {language === 'en'
                            ? 'Unstitched Set · Ready to Dispatch'
                            : 'আনস্টিচড সেট · রেডি স্টক'}
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                            <button
                              type="button"
                              onClick={() =>
                                setTailoringMode((prev) => ({
                                  ...prev,
                                  [item.id]: 'unstitched',
                                }))
                              }
                              className={`py-1.5 px-2 rounded-lg border font-semibold transition-colors cursor-pointer ${
                                !isStitched
                                  ? 'bg-[#050505] border-[#050505] text-white'
                                  : 'bg-white border-[#050505]/15 text-[#374151] hover:border-[#050505]'
                              }`}
                            >
                              {language === 'en' ? 'Unstitched' : 'আনস্টিচড'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTailoringMode((prev) => ({
                                  ...prev,
                                  [item.id]: 'stitched',
                                }));
                                trackFarizaCustomizeProduct(
                                  `Tailoring Enabled: ${chestSize}`,
                                  item.id
                                );
                              }}
                              className={`py-1.5 px-2 rounded-lg border font-semibold transition-colors cursor-pointer ${
                                isStitched
                                  ? 'bg-[#0866FF] border-[#0866FF] text-white'
                                  : 'bg-white border-[#050505]/15 text-[#374151] hover:border-[#0866FF]'
                              }`}
                            >
                              {language === 'en' ? 'Stitched +৳450' : 'স্টিচড +৳৪৫০'}
                            </button>
                          </div>

                          {isStitched && (
                            <div className="flex items-center justify-between gap-1 pt-1">
                              <span className="text-[10px] font-mono text-[#4B5563] shrink-0">
                                {language === 'en' ? 'Chest:' : 'বডি:'}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {CHEST_SIZES.map((sz) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => {
                                      setSelectedChestSize((prev) => ({
                                        ...prev,
                                        [item.id]: sz,
                                      }));
                                      trackFarizaCustomizeProduct(
                                        `Chest Size ${sz}`,
                                        item.id
                                      );
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-colors ${
                                      chestSize === sz
                                        ? 'bg-[#0866FF] text-white font-bold'
                                        : 'bg-white border border-[#050505]/15 text-[#374151] hover:border-[#0866FF]'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price & High-Conversion CTA Footer */}
                  <div className="pt-3 border-t border-[#050505]/10">
                    <div className="flex items-baseline justify-between gap-2 mb-3">
                      <div>
                        <div className="font-mono text-xl text-[#050505] font-bold tabular-nums">
                          ৳ {finalUnitPrice.toLocaleString()}
                        </div>
                        {(item.priceVerify || item.priceNote) && (
                          <div className="text-[10px] font-mono text-[#4B5563]">
                            {item.priceNote || 'Shade verified on confirm'}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#4B5563] truncate max-w-[140px]">
                        {item.fabric}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleAddItem(item, e)}
                        disabled={isJustAdded || isOutOfStock}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          isOutOfStock
                            ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                            : isJustAdded
                            ? 'bg-[#31A24C] text-white cursor-pointer'
                            : 'bg-[#050505] hover:bg-[#1F2937] text-white cursor-pointer'
                        }`}
                      >
                        {isOutOfStock ? (
                          <span>{language === 'en' ? 'Sold Out' : 'স্টক শেষ'}</span>
                        ) : isJustAdded ? (
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

                      <button
                        type="button"
                        onClick={(e) => handleBuyNowItem(item, e)}
                        disabled={isOutOfStock}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isOutOfStock
                            ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                            : 'bg-[#0866FF] hover:bg-[#0552D1] text-white cursor-pointer'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
