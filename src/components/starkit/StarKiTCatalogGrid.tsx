import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Check,
  Copy,
  Eye,
  FileText,
  Heart,
  Layers,
  MessageCircle,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import {
  GraphicArchiveProduct,
  GraphicArchiveVariant,
} from '../../data/graphicArchiveCatalog';
import { LiveGraphicArchiveProduct } from '../../types/store';
import { CartItem, Language, Product } from '../../types';
import { useStoreData } from '../../context/StoreDataContext';
import {
  buildStarKiTWhatsAppHref,
  STARKIT_BRAND_BOOK_PDF,
  STARKIT_LOOKBOOK_PDF,
  STARKIT_PROMO_CODE,
  STARKIT_SIZE_CHART,
  STARKIT_WHATSAPP_DISPLAY,
} from '../../data/starkitBrandData';
import {
  trackStarKiTContact,
  trackStarKiTSearch,
  trackStarKiTViewContent,
} from '../../services/metaPixel';

export const STARKIT_SIZES = ['M', 'L', 'XL', 'XXL'] as const;
export type StarKiTSize = (typeof STARKIT_SIZES)[number];

export function toStarKiTQuickViewProduct(
  product: GraphicArchiveProduct,
  variant: GraphicArchiveVariant
): Product {
  return {
    id: product.id,
    slug: product.id.toLowerCase(),
    brand: 'StarKiT',
    nameEn: `${product.name} Hoodie (${product.stkCode || product.id})`,
    nameBn: `${product.name} হুডি (${product.stkCode || product.id})`,
    category: 'Streetwear',
    collection: `StarKiT · ${product.category}`,
    priceBDT: variant.priceBdt,
    image: variant.previewImage,
    colors: product.variants.map((v) => ({ name: v.color, hex: v.colorHex })),
    sizes: [...STARKIT_SIZES],
    fabricEn: variant.fabric,
    fabricBn: `${variant.gsm} ওয়ান-সাইড ব্রাশড ফ্লিস`,
    fitEn: variant.fit,
    fitBn: 'সমসাময়িক রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
    styleTag: 'urban',
  };
}

export const StarKiTPromoBanner: React.FC<{ language: Language }> = ({ language }) => {
  const { storeSettings } = useStoreData();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(STARKIT_PROMO_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mb-10 rounded-2xl border-2 border-[#170000] bg-[#FFFFFF] text-[#170000] p-4 sm:p-5 shadow-[6px_6px_0px_#170000]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Promo Code Box */}
        <div className="lg:col-span-5 flex items-center justify-between gap-3 pb-3 lg:pb-0 lg:pr-4 border-b lg:border-b-0 lg:border-r border-[#170000]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#170000] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-starkit-tech uppercase tracking-widest text-[#524B4B] font-bold">
                {language === 'en' ? 'Extra 10% Drop Privilege' : 'অতিরিক্ত ১০% ড্রপ ছাড়'}
              </div>
              <div className="font-starkit text-sm sm:text-base font-bold text-[#170000]">
                {language === 'en'
                  ? 'Apply code at Express Checkout'
                  : 'চেকআউটে কোড ব্যবহার করুন'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-[#170000] hover:bg-[#331A1A] text-white font-mono text-xs font-bold tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>{STARKIT_PROMO_CODE}</span>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bundle Savings */}
        <div className="lg:col-span-3 flex items-center gap-3 pb-3 lg:pb-0 lg:pr-4 border-b lg:border-b-0 lg:border-r border-[#170000]/15">
          <div className="w-10 h-10 rounded-xl bg-[#ECEAEA] border border-[#170000]/15 text-[#170000] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-starkit-tech uppercase tracking-widest text-[#524B4B] font-semibold">
              {language === 'en' ? 'Multi-Piece Bundle Rules' : 'মাল্টি-পিস বান্ডেল ছাড়'}
            </div>
            <div className="text-xs font-bold text-[#170000] tabular-nums">
              {language === 'en'
                ? `2 Pcs: -৳${storeSettings.bundle2DiscountBDT} · 3+: -৳${storeSettings.bundle3DiscountBDT}`
                : `২টিতে -৳${storeSettings.bundle2DiscountBDT} · ৩টিতে -৳${storeSettings.bundle3DiscountBDT}`}
            </div>
          </div>
        </div>

        {/* Direct WhatsApp + Lookbook PDF + Brand Book PDF */}
        <div className="lg:col-span-4 flex flex-wrap items-center justify-start lg:justify-end gap-2">
          <a
            href={buildStarKiTWhatsAppHref(
              'Assalamu Alaikum StarkiT Desk! I have a query about Drop 01 hoodies.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackStarKiTContact('WhatsApp', 'StarKiT Promo Banner Desk')}
            className="px-3 py-2 rounded-lg bg-[#170000] hover:bg-neutral-800 text-white text-[11px] font-mono font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{STARKIT_WHATSAPP_DISPLAY}</span>
          </a>
          <a
            href={STARKIT_LOOKBOOK_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg border border-[#170000]/30 hover:border-[#170000] hover:bg-[#ECEAEA] text-[#170000] text-[11px] font-mono font-bold inline-flex items-center gap-1.5 transition-colors"
            title="Download 2026 Lookbook Catalog PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Catalog PDF</span>
          </a>
          <a
            href={STARKIT_BRAND_BOOK_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg bg-[#C7C1BF] hover:bg-[#170000] text-[#170000] hover:text-white text-[11px] font-mono font-bold inline-flex items-center gap-1.5 transition-colors"
            title="Open StarkiT Brand Book PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Brand Book</span>
          </a>
        </div>
      </div>
    </div>
  );
};

interface StarKiTCatalogGridProps {
  products: LiveGraphicArchiveProduct[];
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: (productId: string) => boolean;
  onOpenQuickView?: (product: Product) => void;
  onLaunch3D?: (product: GraphicArchiveProduct) => void;
  recommendedSize?: StarKiTSize | null;
  surfaceTheme?: 'light' | 'dark';
}

export const StarKiTCatalogGrid: React.FC<StarKiTCatalogGridProps> = ({
  products,
  language,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onOpenQuickView,
  onLaunch3D,
  recommendedSize,
  surfaceTheme = 'light',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const [selectedVariantSkus, setSelectedVariantSkus] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    products.forEach((p) => {
      initial[p.id] = p.variants[0]?.sku || '';
    });
    return initial;
  });

  const [selectedSizes, setSelectedSizes] = useState<Record<string, StarKiTSize>>(() => {
    const initial: Record<string, StarKiTSize> = {};
    products.forEach((p) => {
      initial[p.id] = 'L';
    });
    return initial;
  });

  const [sheetPreviewIds, setSheetPreviewIds] = useState<Record<string, boolean>>({});
  const [addedSku, setAddedSku] = useState<string | null>(null);
  const [activeSheetModal, setActiveSheetModal] = useState<{
    product: GraphicArchiveProduct;
    variant: GraphicArchiveVariant;
  } | null>(null);

  useEffect(() => {
    if (!recommendedSize) return;
    setSelectedSizes((prev) => {
      const next = { ...prev };
      products.forEach((p) => {
        next[p.id] = recommendedSize;
      });
      return next;
    });
  }, [recommendedSize, products]);

  useEffect(() => {
    if (!activeSheetModal) return;
    trackStarKiTViewContent({
      id: activeSheetModal.product.id,
      name: `StarkiT ${activeSheetModal.product.name} Hoodie (${activeSheetModal.variant.color})`,
      category: `StarKiT · ${activeSheetModal.product.category}`,
      valueBDT: activeSheetModal.variant.priceBdt,
    });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveSheetModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeSheetModal]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) return;
    const timer = window.setTimeout(() => {
      trackStarKiTSearch(q);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const categories = [
    { id: 'all', en: `All Drops (${products.length})`, bn: `সকল ড্রপ (${products.length})` },
    { id: 'Bangla Heritage', en: 'Bangla Heritage', bn: 'বাংলা হেরিটেজ' },
    { id: 'Anime Archive', en: 'Anime Archive', bn: 'অ্যানিমে আর্কাইভ' },
    { id: 'Moto Culture', en: 'Moto Culture', bn: 'মটো কালচার' },
    { id: 'Playful Street', en: 'Playful Street', bn: 'প্লেফুল স্ট্রিট' },
    { id: 'City Stories', en: 'City Stories', bn: 'সিটি স্টোরিজ' },
    { id: 'Statement Graphics', en: 'Statement Graphics', bn: 'স্টেটমেন্ট' },
  ];

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (!q) return true;
        return (
          p.id.toLowerCase().includes(q) ||
          (p.stkCode && p.stkCode.toLowerCase().includes(q)) ||
          p.name.toLowerCase().includes(q) ||
          p.editorial.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
        return a.priority - b.priority;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const buildPayload = (
    product: GraphicArchiveProduct,
    variant: GraphicArchiveVariant,
    size: StarKiTSize
  ): Omit<CartItem, 'id'> => ({
    productId: product.id,
    nameEn: `StarkiT ${product.name} Hoodie (${product.stkCode || variant.sku})`,
    nameBn: `স্টারকিট ${product.name} হুডি (${product.stkCode || variant.sku})`,
    priceBDT: variant.priceBdt,
    image: variant.previewImage,
    color: variant.color,
    size,
    quantity: 1,
  });

  const handleAdd = (product: GraphicArchiveProduct, variant: GraphicArchiveVariant) => {
    const sz = selectedSizes[product.id] || 'L';
    onAddToCart(buildPayload(product, variant, sz));
    setAddedSku(variant.sku);
    setTimeout(() => setAddedSku(null), 1800);
  };

  const handleInstantBuy = (product: GraphicArchiveProduct, variant: GraphicArchiveVariant) => {
    const sz = selectedSizes[product.id] || 'L';
    if (onBuyNow) {
      onBuyNow(buildPayload(product, variant, sz));
    } else {
      handleAdd(product, variant);
    }
  };

  const isLight = surfaceTheme === 'light';

  return (
    <div>
      {/* Filter Toolbar */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3.5 rounded-2xl border-2 mb-8 ${
          isLight
            ? 'bg-white border-[#170000]/15 shadow-sm'
            : 'bg-[#170000] border-white/20'
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-starkit-tech uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? isLight
                      ? 'bg-[#170000] text-white font-bold border border-[#170000]'
                      : 'bg-white text-[#170000] font-bold border border-white'
                    : isLight
                    ? 'bg-[#ECEAEA] text-[#170000] hover:bg-[#C7C1BF]/60 border border-transparent'
                    : 'bg-white/5 text-white/80 hover:bg-white/15 border border-white/15'
                }`}
              >
                {language === 'en' ? cat.en : cat.bn}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Live Search */}
          <div className="relative flex-1 sm:w-56">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight ? 'text-[#524B4B]' : 'text-white/50'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'en' ? 'Search STK-H003, Dhaka...' : 'খুঁজুন (STK-H003, ঢাকা)...'
              }
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none ${
                isLight
                  ? 'bg-[#ECEAEA]/60 border-[#170000]/20 text-[#170000] placeholder:text-[#777] focus:border-[#170000]'
                  : 'bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-white'
              }`}
            />
          </div>

          {/* Sort */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${
              isLight
                ? 'bg-[#ECEAEA]/60 border-[#170000]/20 text-[#170000]'
                : 'bg-black/50 border-white/20 text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort StarkiT Drop 01"
              className="bg-transparent text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#170000] text-white">
                {language === 'en' ? 'Featured Drop Order' : 'নির্বাচিত ক্রম'}
              </option>
              <option value="price-asc" className="bg-[#170000] text-white">
                {language === 'en' ? 'Price: ৳1,290 → ৳1,690' : 'মূল্য: কম → বেশি'}
              </option>
              <option value="price-desc" className="bg-[#170000] text-white">
                {language === 'en' ? 'Price: ৳1,690 → ৳1,290' : 'মূল্য: বেশি → কম'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div
          className={`py-14 rounded-2xl border text-center text-sm font-mono ${
            isLight
              ? 'bg-white border-[#170000]/15 text-[#524B4B]'
              : 'bg-[#170000] border-white/15 text-white/70'
          }`}
        >
          {language === 'en'
            ? 'No StarkiT Drop 01 hoodie matches this filter.'
            : 'কোনো স্টারকিট হুডি খুঁজে পাওয়া যায়নি।'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((product) => {
            const activeSku = selectedVariantSkus[product.id];
            const currentVariant =
              product.variants.find((v) => v.sku === activeSku) || product.variants[0];
            const currentSize = selectedSizes[product.id] || 'L';
            const sizeSpec =
              STARKIT_SIZE_CHART.find((s) => s.size === currentSize) || STARKIT_SIZE_CHART[1];
            const showSheet = Boolean(sheetPreviewIds[product.id]);
            const isAdded = addedSku === currentVariant.sku;
            const isOutOfStock =
              product.catalogStatus === 'out_of_stock' || product.stockCount <= 0;
            const isLowStock = !isOutOfStock && product.stockCount <= 6;
            const mappedProduct = toStarKiTQuickViewProduct(product, currentVariant);
            const wish = isWishlisted?.(product.id) ?? false;

            const waMessage = `Assalamu Alaikum StarkiT! I want to order/ask about ${
              product.stkCode || product.id
            } (${product.name}) — Color: ${currentVariant.color}, Size: ${currentSize}, Price: ৳${currentVariant.priceBdt}`;

            return (
              <article
                key={product.id}
                className={`group rounded-2xl overflow-hidden flex flex-col border-2 transition-all duration-300 ${
                  isLight
                    ? 'bg-white border-[#170000]/20 hover:border-[#170000] hover:shadow-[8px_8px_0px_#170000]'
                    : 'bg-[#170000] border-white/20 hover:border-white hover:shadow-[8px_8px_0px_#C7C1BF]'
                }`}
              >
                {/* Visual Aspect 4:5 */}
                <div className="relative aspect-[4/5] bg-[#170000] overflow-hidden">
                  <img
                    src={showSheet ? currentVariant.catalogPageImage : currentVariant.previewImage}
                    alt={`${product.name} (${currentVariant.color})`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className={`w-full h-full ${
                      showSheet ? 'object-contain bg-[#170000] p-2' : 'object-cover object-center'
                    } transition-transform duration-700 group-hover:scale-105 ${
                      isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''
                    }`}
                  />

                  {/* Top Badges & Action Icons */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded bg-[#170000] border border-white/25 text-[10px] font-mono font-bold tracking-wider text-white uppercase">
                        {product.stkCode || product.id}
                      </span>
                      {isOutOfStock ? (
                        <span className="px-2 py-1 rounded bg-white text-[#170000] text-[10px] font-mono font-bold uppercase border border-[#170000]">
                          {language === 'en' ? 'Sold Out' : 'স্টক শেষ'}
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-1 rounded bg-white text-[#170000] text-[10px] font-mono font-bold uppercase tabular-nums border border-[#170000]">
                          {language === 'en'
                            ? `${product.stockCount} Left`
                            : `মাত্র ${product.stockCount}টি`}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onLaunch3D && (
                        <button
                          type="button"
                          onClick={() => onLaunch3D(product)}
                          className="p-2 rounded-full bg-[#170000]/90 hover:bg-white hover:text-[#170000] text-white border border-white/30 transition-colors cursor-pointer"
                          title={language === 'en' ? 'Inspect in 3D Studio' : '৩ডি স্টুডিওতে দেখুন'}
                          aria-label={`Inspect ${product.name} in 3D`}
                        >
                          <Box className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onOpenQuickView && (
                        <button
                          type="button"
                          onClick={() => onOpenQuickView(mappedProduct)}
                          className="p-2 rounded-full bg-[#170000]/90 hover:bg-white hover:text-[#170000] text-white border border-white/30 transition-colors cursor-pointer"
                          title={language === 'en' ? 'Quick View & Reviews' : 'বিস্তারিত'}
                          aria-label={`Quick view ${product.name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onToggleWishlist && (
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(mappedProduct)}
                          className={`p-2 rounded-full border transition-colors cursor-pointer ${
                            wish
                              ? 'bg-white border-white text-[#170000]'
                              : 'bg-[#170000]/90 border-white/30 text-white hover:bg-white hover:text-[#170000]'
                          }`}
                          aria-label={`Toggle wishlist for ${product.name}`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Photo ↔ Spec Sheet Toggle Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#170000]/90 border border-white/20 text-[10px] font-mono text-white/90 truncate">
                      {product.feature}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSheetPreviewIds((prev) => ({
                            ...prev,
                            [product.id]: !prev[product.id],
                          }))
                        }
                        className="px-2.5 py-1 rounded bg-white hover:bg-[#C7C1BF] text-[#170000] text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow"
                      >
                        {showSheet
                          ? language === 'en'
                            ? 'Garment'
                            : 'ছবি'
                          : language === 'en'
                          ? 'Spec Sheet'
                          : 'শিট'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSheetModal({ product, variant: currentVariant })}
                        className="p-1.5 rounded bg-[#170000]/90 hover:bg-white text-white hover:text-[#170000] border border-white/30 transition-colors cursor-pointer"
                        title="Expand Full Lookbook Sheet"
                        aria-label="Expand Full Lookbook Sheet"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[10px] font-starkit-tech font-bold uppercase tracking-[0.2em] ${
                          isLight ? 'text-[#524B4B]' : 'text-[#C7C1BF]'
                        }`}
                      >
                        {product.category} · {product.editorial}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h3
                        className={`font-starkit text-2xl font-bold tracking-tight ${
                          isLight ? 'text-[#170000]' : 'text-white'
                        }`}
                      >
                        {product.name}
                      </h3>
                      <span
                        className={`font-mono text-lg font-extrabold shrink-0 tabular-nums ${
                          isLight ? 'text-[#170000]' : 'text-white'
                        }`}
                      >
                        ৳{currentVariant.priceBdt.toLocaleString()}
                      </span>
                    </div>

                    <p
                      className={`text-xs leading-relaxed line-clamp-2 mb-4 ${
                        isLight ? 'text-[#474040]' : 'text-white/75'
                      }`}
                    >
                      {language === 'en' ? product.descriptionEn : product.descriptionBn}
                    </p>

                    {/* Colorway + Size Selector */}
                    <div className="flex items-end justify-between gap-3 mb-3">
                      <div>
                        <p
                          className={`text-[10px] font-mono uppercase mb-1.5 ${
                            isLight ? 'text-[#524B4B]' : 'text-white/60'
                          }`}
                        >
                          {language === 'en' ? 'Shade:' : 'রঙ:'}{' '}
                          <span className="font-bold">{currentVariant.color}</span>
                        </p>
                        <div className="flex items-center gap-1.5">
                          {product.variants.map((v) => {
                            const selected = v.sku === currentVariant.sku;
                            return (
                              <button
                                key={v.sku}
                                type="button"
                                onClick={() =>
                                  setSelectedVariantSkus((prev) => ({
                                    ...prev,
                                    [product.id]: v.sku,
                                  }))
                                }
                                aria-label={`Color ${v.color}`}
                                title={`${v.color} · ${v.stkSku || v.sku}`}
                                className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer relative ${
                                  selected
                                    ? isLight
                                      ? 'border-[#170000] ring-2 ring-[#170000]/30 scale-110'
                                      : 'border-white ring-2 ring-white/30 scale-110'
                                    : isLight
                                    ? 'border-[#170000]/30 hover:border-[#170000]'
                                    : 'border-white/30 hover:border-white'
                                }`}
                                style={{ backgroundColor: v.colorHex }}
                              >
                                {selected && (
                                  <span
                                    className={`absolute inset-1.5 rounded-full ${
                                      v.color === 'Cream' ? 'bg-[#170000]' : 'bg-white'
                                    }`}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p
                          className={`text-[10px] font-mono uppercase mb-1.5 text-right ${
                            isLight ? 'text-[#524B4B]' : 'text-white/60'
                          }`}
                        >
                          {sizeSpec.chestInches}&Prime; × {sizeSpec.lengthInches}&Prime;
                        </p>
                        <div className="flex items-center gap-1">
                          {STARKIT_SIZES.map((sz) => {
                            const active = currentSize === sz;
                            return (
                              <button
                                key={sz}
                                type="button"
                                onClick={() =>
                                  setSelectedSizes((prev) => ({ ...prev, [product.id]: sz }))
                                }
                                className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                                  active
                                    ? isLight
                                      ? 'bg-[#170000] text-white border border-[#170000]'
                                      : 'bg-white text-[#170000] border border-white'
                                    : isLight
                                    ? 'bg-[#ECEAEA] text-[#170000] hover:bg-[#C7C1BF]/60 border border-transparent'
                                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/10'
                                }`}
                              >
                                {sz}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Fleece Fabric Spec Bar */}
                    <div
                      className={`rounded-lg px-2.5 py-2 mb-4 text-[10px] font-mono flex items-center justify-between gap-2 ${
                        isLight
                          ? 'bg-[#ECEAEA]/70 border border-[#170000]/10 text-[#170000]'
                          : 'bg-black/40 border border-white/10 text-white/75'
                      }`}
                    >
                      <span>{currentVariant.gsm} Brushed Fleece</span>
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Truck className="w-3 h-3" />
                        COD 64-Dist.
                      </span>
                    </div>
                  </div>

                  {/* High-Conversion Monochrome Actions */}
                  <div className="pt-3 border-t border-current/10 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => !isOutOfStock && handleAdd(product, currentVariant)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 transition-colors ${
                          isOutOfStock
                            ? 'bg-neutral-300 border-neutral-300 text-neutral-500 cursor-not-allowed'
                            : isAdded
                            ? 'bg-[#170000] border-[#170000] text-white cursor-pointer'
                            : isLight
                            ? 'bg-white hover:bg-[#ECEAEA] border-[#170000] text-[#170000] cursor-pointer'
                            : 'bg-transparent hover:bg-white/10 border-white text-white cursor-pointer'
                        }`}
                      >
                        {isAdded ? (
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
                        disabled={isOutOfStock}
                        onClick={() => !isOutOfStock && handleInstantBuy(product, currentVariant)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                          isOutOfStock
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                            : isLight
                            ? 'bg-[#170000] hover:bg-neutral-800 text-white cursor-pointer shadow-sm'
                            : 'bg-white hover:bg-[#C7C1BF] text-[#170000] cursor-pointer shadow-sm'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
                      </button>
                    </div>

                    <a
                      href={buildStarKiTWhatsAppHref(waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackStarKiTContact('WhatsApp', `${product.stkCode || product.id} (${currentVariant.color})`)
                      }
                      className={`w-full py-1.5 px-3 rounded-lg border text-[11px] font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isLight
                          ? 'border-[#170000]/25 text-[#170000] hover:bg-[#170000] hover:text-white'
                          : 'border-white/25 text-white hover:bg-white hover:text-[#170000]'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>
                        {language === 'en'
                          ? `Ask on StarkiT WhatsApp (${product.stkCode || product.id})`
                          : `হোয়াটসঅ্যাপে অর্ডার / প্রশ্ন (${product.stkCode || product.id})`}
                      </span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Full Spec Sheet Modal */}
      {activeSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="fixed inset-0" onClick={() => setActiveSheetModal(null)} />
          <div className="relative z-10 w-full max-w-3xl bg-[#170000] border-2 border-white/25 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="p-4 border-b border-white/15 flex items-center justify-between text-white">
              <div>
                <h3 className="font-starkit text-xl font-bold">
                  {activeSheetModal.product.name} — StarkiT Spec Sheet
                </h3>
                <p className="text-[11px] font-mono text-[#C7C1BF] tabular-nums">
                  {activeSheetModal.product.stkCode || activeSheetModal.variant.sku} ·{' '}
                  {activeSheetModal.variant.color} · ৳
                  {activeSheetModal.variant.priceBdt.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSheetModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white hover:text-[#170000] text-white cursor-pointer transition-colors"
                aria-label="Close spec sheet"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-[#170000]">
              <img
                src={activeSheetModal.variant.catalogPageImage}
                alt={`${activeSheetModal.product.name} Lookbook Spec Sheet`}
                className="w-full max-w-xl h-auto rounded-xl border border-white/15"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
