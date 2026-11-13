import React, { useState, useEffect, Suspense } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  Check,
  Sparkles,
  Ruler,
  Star,
  MessageSquare,
  Zap,
  Truck,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Product, Language, CartItem } from '../../types';
import { translations } from '../../data/translations';
import { SizeGuideModal } from './SizeGuideModal';
import { ProductReviewsModule } from '../reviews/ProductReviewsModule';
import { useStoreData } from '../../context/StoreDataContext';
import { StoreReview } from '../../types/store';
import {
  isFarizaProduct,
  isStarKiTProduct,
  trackFarizaViewContent,
  trackStarKiTViewContent,
} from '../../services/metaPixel';

const GarmentTryOn3DModal = React.lazy(() =>
  import('./GarmentTryOn3DModal').then((m) => ({ default: m.GarmentTryOn3DModal }))
);

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  language: Language;
}

function getReviewSummary(
  productId: string,
  approvedReviews: StoreReview[]
): { avg: string; count: number } {
  const firestoreRatings = approvedReviews
    .filter((r) => r.productId === productId)
    .map((r) => r.rating);
  const allRatings = firestoreRatings;
  const count = allRatings.length;
  const avg =
    count > 0
      ? (allRatings.reduce((acc, r) => acc + r, 0) / count).toFixed(1)
      : '0.0';
  return { avg, count };
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  language,
}) => {
  const {
    unifiedCatalog,
    liveThreePieceItems,
    liveGraphicArchiveProducts,
    approvedReviews,
    storeSettings,
  } = useStoreData();
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [mediaView, setMediaView] = useState<'primary' | 'secondary'>('primary');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const t = translations[language];

  const liveCatalogItem = product
    ? unifiedCatalog.find((item) => item.id === product.id)
    : undefined;
  const matchedThreePiece = product
    ? liveThreePieceItems.find((tp) => tp.id === product.id)
    : undefined;
  const matchedGraphicHoodie = product
    ? liveGraphicArchiveProducts.find((h) => h.id === product.id)
    : undefined;

  const resolvedProduct = liveCatalogItem
    ? {
        ...product!,
        brand: liveCatalogItem.brand || product!.brand,
        nameEn: liveCatalogItem.nameEn,
        nameBn: liveCatalogItem.nameBn,
        priceBDT: liveCatalogItem.priceBDT,
        compareAtPriceBDT: liveCatalogItem.compareAtPriceBDT,
        fabricEn: liveCatalogItem.fabricEn,
        fabricBn: liveCatalogItem.fabricBn,
        fitEn: liveCatalogItem.fitEn,
        fitBn: liveCatalogItem.fitBn,
      }
    : product;
  const isOutOfStock = liveCatalogItem
    ? liveCatalogItem.status === 'out_of_stock' || liveCatalogItem.stockCount <= 0
    : false;
  const stockCount = liveCatalogItem ? liveCatalogItem.stockCount : 18;

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || 'Standard');
      const defaultSz = product.sizes?.includes('Unstitched Set')
        ? 'Unstitched Set'
        : product.sizes?.[1] || product.sizes?.[0] || 'L';
      setSelectedSize(defaultSz);
      setQuantity(1);
      setMediaView('primary');
      setActiveTab('details');
    }
  }, [product?.id]);

  useEffect(() => {
    if (!isOpen || !resolvedProduct) return;
    if (isStarKiTProduct(resolvedProduct, unifiedCatalog)) {
      trackStarKiTViewContent({
        id: resolvedProduct.id,
        name: resolvedProduct.nameEn,
        category: resolvedProduct.collection,
        valueBDT: resolvedProduct.priceBDT,
      });
    } else if (isFarizaProduct(resolvedProduct, unifiedCatalog)) {
      trackFarizaViewContent({
        id: resolvedProduct.id,
        name: resolvedProduct.nameEn,
        category: resolvedProduct.collection,
        valueBDT: resolvedProduct.priceBDT,
      });
    }
  }, [isOpen, resolvedProduct?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSizeGuideOpen && !isTryOnOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSizeGuideOpen, isTryOnOpen, onClose]);

  if (!isOpen || !resolvedProduct) return null;

  const activeColor = selectedColor || resolvedProduct.colors?.[0]?.name || 'Standard';

  // Resolve colorway-specific image if StarKiT hoodie or 3-piece set
  const matchedVariant = matchedGraphicHoodie?.variants.find(
    (v) => v.color.toLowerCase() === activeColor.toLowerCase()
  );

  const primaryImage = matchedVariant
    ? matchedVariant.previewImage
    : matchedThreePiece
    ? matchedThreePiece.flatLayImage
    : resolvedProduct.image;
  const secondaryImage = matchedVariant
    ? matchedVariant.catalogPageImage
    : matchedThreePiece
    ? matchedThreePiece.modelImage
    : null;
  const displayedImage =
    mediaView === 'secondary' && secondaryImage ? secondaryImage : primaryImage;

  const { avg: averageRating, count: reviewCount } = getReviewSummary(
    resolvedProduct.id,
    approvedReviews
  );

  const isThreePieceStitched =
    Boolean(matchedThreePiece) && !selectedSize.toLowerCase().includes('unstitched');
  const effectiveUnitPriceBDT =
    resolvedProduct.priceBDT + (isThreePieceStitched ? 450 : 0);

  const buildCartPayload = (): Omit<CartItem, 'id'> => ({
    productId: resolvedProduct.id,
    nameEn: resolvedProduct.nameEn,
    nameBn: resolvedProduct.nameBn,
    priceBDT: effectiveUnitPriceBDT,
    image: primaryImage,
    color: activeColor,
    size: isThreePieceStitched ? `Custom Stitched (${selectedSize})` : selectedSize,
    quantity,
  });

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(buildCartPayload());
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 950);
  };

  const handleExpressBuyNow = () => {
    if (isOutOfStock) return;
    const payload = buildCartPayload();
    onClose();
    if (onBuyNow) {
      onBuyNow(payload);
    } else {
      onAddToCart(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto md:overflow-hidden bg-[#171719] border border-white/10 rounded-2xl shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#D8D3C9] hover:text-white rounded-full bg-black/60 hover:bg-black/90 cursor-pointer"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media Stage */}
        <div className="relative aspect-[3/4] md:aspect-auto md:h-full bg-black/40 overflow-hidden flex flex-col justify-between">
          <img
            src={displayedImage}
            alt={resolvedProduct.nameEn}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== primaryImage) {
                img.src = primaryImage;
              }
            }}
            className="w-full h-full object-cover object-top transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-transparent to-transparent opacity-50 pointer-events-none" />

          {/* Top Left SKU / Stock Pill */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
            {matchedVariant && (
              <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-[#B69A60]/40 text-[10px] font-mono text-[#D5BA80] uppercase">
                SKU: {matchedVariant.sku}
              </span>
            )}
            {matchedThreePiece && (
              <span className="px-2.5 py-1 rounded bg-[#D5BA80] text-[#09090B] text-[10px] font-mono font-bold uppercase">
                {matchedThreePiece.code}
              </span>
            )}
          </div>

          {/* Bottom Media Switcher (Flat-lay vs Model or Studio vs Spec Sheet) */}
          {secondaryImage && (
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-center">
              <div className="p-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 flex items-center gap-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setMediaView('primary')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    mediaView === 'primary'
                      ? 'bg-[#B69A60] text-[#09090B] font-bold'
                      : 'text-[#D8D3C9] hover:text-white'
                  }`}
                >
                  {matchedThreePiece
                    ? language === 'en'
                      ? 'Original Fabric'
                      : 'আসল ফ্যাব্রিক'
                    : language === 'en'
                    ? 'Studio Preview'
                    : 'স্টুডিও প্রিভিউ'}
                </button>
                <button
                  type="button"
                  onClick={() => setMediaView('secondary')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    mediaView === 'secondary'
                      ? 'bg-[#B69A60] text-[#09090B] font-bold'
                      : 'text-[#D8D3C9] hover:text-white'
                  }`}
                >
                  {matchedThreePiece
                    ? language === 'en'
                      ? 'Model / Detail'
                      : 'মডেল / ডিটেইল'
                    : language === 'en'
                    ? 'Catalog Sheet'
                    : 'ক্যাটালগ শিট'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Purchase & Reviews Module */}
        <div className="p-6 sm:p-8 flex flex-col justify-between md:overflow-y-auto md:max-h-[92vh]">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[#B69A60] uppercase tracking-wider mb-2 pr-8">
              <span className="truncate">
                {resolvedProduct.brand ? `${resolvedProduct.brand} · ` : ''}
                {resolvedProduct.collection}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1.5 text-[#D5BA80] hover:text-white transition-colors cursor-pointer group shrink-0"
                title={language === 'en' ? 'View Verified Client Reviews' : 'রিভিউ দেখুন'}
              >
                <div className="flex items-center text-[#B69A60]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-[#B69A60] text-[#B69A60]" />
                  ))}
                </div>
                <span className="font-semibold tabular-nums">{averageRating}</span>
                <span className="text-[#77777D] text-[10px] group-hover:underline tabular-nums">
                  ({reviewCount})
                </span>
              </button>
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EB] font-light mb-2">
              {language === 'en' ? resolvedProduct.nameEn : resolvedProduct.nameBn}
            </h3>

            <div className="flex flex-wrap items-baseline gap-3 mb-4">
              <span className="font-mono text-2xl text-[#D5BA80] font-semibold tabular-nums">
                ৳ {effectiveUnitPriceBDT.toLocaleString()}
              </span>
              {isThreePieceStitched && (
                <span className="text-[11px] font-mono text-[#D5BA80] bg-[#B69A60]/15 border border-[#B69A60]/30 px-2 py-0.5 rounded">
                  {language === 'en' ? 'Includes +৳450 Tailoring' : 'সেলাই +৳৪৫০ সহ'}
                </span>
              )}
              {resolvedProduct.compareAtPriceBDT && (
                <span className="font-mono text-sm text-[#77777D] line-through tabular-nums">
                  ৳ {resolvedProduct.compareAtPriceBDT.toLocaleString()}
                </span>
              )}
              {isOutOfStock ? (
                <span className="text-[11px] font-mono uppercase text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                  {language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
                </span>
              ) : (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded tabular-nums">
                  {language === 'en'
                    ? `In Stock · ${stockCount} Ready`
                    : `স্টকে আছে · ${stockCount}টি`}
                </span>
              )}
            </div>

            {/* Tab Switcher: Overview vs Reviews */}
            <div className="flex items-center gap-4 border-b border-white/10 mb-5 pb-2 text-xs font-mono uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-b-2 border-[#B69A60] text-[#F5F2EB] font-bold'
                    : 'text-[#77777D] hover:text-[#D8D3C9]'
                }`}
              >
                {language === 'en' ? 'Overview & Fit' : 'বিস্তারিত ও ফিট'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-1 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-[#B69A60] text-[#F5F2EB] font-bold'
                    : 'text-[#77777D] hover:text-[#D8D3C9]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>{language === 'en' ? 'Reviews & Ratings' : 'রিভিউ ও রেটিং'}</span>
              </button>
            </div>

            {/* Tab 1: Product Details, Try-on & Sizing */}
            {activeTab === 'details' && (
              <div>
                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 mb-5 text-xs">
                  <div>
                    <span className="text-[#77777D] font-mono mr-2">FABRIC:</span>
                    <span className="text-[#D8D3C9]">
                      {language === 'en' ? resolvedProduct.fabricEn : resolvedProduct.fabricBn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#77777D] font-mono mr-2">SARTORIAL FIT:</span>
                    <span className="text-[#D8D3C9]">
                      {language === 'en' ? resolvedProduct.fitEn : resolvedProduct.fitBn}
                    </span>
                  </div>
                  {matchedThreePiece && (
                    <div className="pt-1.5 mt-1.5 border-t border-white/5 space-y-1 text-[11px]">
                      <div>
                        <span className="font-mono text-[#B69A60] mr-1.5">KAMEEZ:</span>
                        <span className="text-[#D8D3C9]">
                          {language === 'en'
                            ? matchedThreePiece.kameezEn
                            : matchedThreePiece.kameezBn}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-[#B69A60] mr-1.5">DUPATTA:</span>
                        <span className="text-[#D8D3C9]">
                          {language === 'en'
                            ? matchedThreePiece.dupattaEn
                            : matchedThreePiece.dupattaBn}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Swatches */}
                <div className="mb-5">
                  <label className="block text-xs uppercase tracking-wider text-[#D8D3C9] font-medium mb-2">
                    {language === 'en' ? 'Colorway:' : 'রঙ:'}{' '}
                    <span className="text-[#F5F2EB] font-normal">{activeColor}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {resolvedProduct.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c.name);
                          setMediaView('primary');
                        }}
                        className={`px-2.5 py-1 rounded-full border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          activeColor === c.name
                            ? 'border-[#B69A60] bg-[#B69A60]/15 text-[#F5F2EB] font-medium shadow'
                            : 'border-white/15 bg-black/40 text-[#D8D3C9] hover:border-white/40'
                        }`}
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Virtual Try-On Trigger Button */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setIsTryOnOpen(true)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#B69A60]/15 via-black/40 to-[#B69A60]/10 border border-[#B69A60]/40 hover:border-[#B69A60] text-[#D5BA80] hover:text-[#F5F2EB] flex items-center justify-between transition-all cursor-pointer shadow-lg group"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="p-1.5 rounded-lg bg-[#B69A60]/20 text-[#D5BA80] group-hover:bg-[#B69A60] group-hover:text-[#09090B] transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <span>
                            {language === 'en'
                              ? 'Virtual Try-On (3D Mannequin)'
                              : 'ভার্চুয়াল ট্রাই-অন (৩ডি ম্যানিকিন)'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#B69A60]/30 text-[#F5F2EB] rounded font-bold">
                            3D
                          </span>
                        </div>
                        <div className="text-[10px] text-[#77777D] font-light">
                          {language === 'en'
                            ? 'Interactive 360° drape simulation on contemporary silhouette'
                            : 'সমসাময়িক ফিটে ৩৬০ ডিগ্রি ড্র্যাপ অনুকরণ'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#B69A60] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                      Launch →
                    </span>
                  </button>
                </div>

                {/* Size Selector with Size Guide Trigger */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider text-[#D8D3C9] font-medium">
                      {language === 'en' ? 'Size' : 'সাইজ'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-[#D5BA80] hover:text-white underline cursor-pointer transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[#B69A60]" />
                      <span>{language === 'en' ? 'Size Guide (Bangladeshi Fit)' : 'সাইজ গাইড'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(import.meta.env.VITE_COMMERCE_BACKEND === 'supabase' &&
                    matchedThreePiece
                      ? ['Unstitched Set']
                      : resolvedProduct.sizes
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer ${
                          selectedSize === s
                            ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                            : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity & Bundle Privilege Callout */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-[#D8D3C9] font-mono">
                      {language === 'en' ? 'Qty' : 'সংখ্যা'}:
                    </span>
                    <div className="flex items-center border border-white/15 rounded-lg bg-black/60">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1 text-xs text-[#D8D3C9] hover:text-white cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-mono font-bold text-[#F5F2EB] tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="px-2.5 py-1 text-xs text-[#D8D3C9] hover:text-white cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D5BA80]">
                    <Layers className="w-3.5 h-3.5 text-[#B69A60] shrink-0" />
                    <span className="tabular-nums">
                      {quantity >= 3
                        ? language === 'en'
                          ? `✓ ৳${storeSettings.bundle3DiscountBDT} Bundle Savings Unlocked!`
                          : `✓ ৳${storeSettings.bundle3DiscountBDT} বান্ডেল ছাড় আনলক!`
                        : quantity === 2
                        ? language === 'en'
                          ? `✓ ৳${storeSettings.bundle2DiscountBDT} Off! (3+ saves ৳${storeSettings.bundle3DiscountBDT})`
                          : `✓ ৳${storeSettings.bundle2DiscountBDT} ছাড়! (৩টিতে ৳${storeSettings.bundle3DiscountBDT})`
                        : language === 'en'
                        ? `Buy 2 Save ৳${storeSettings.bundle2DiscountBDT} · 3+ Save ৳${storeSettings.bundle3DiscountBDT}`
                        : `২টিতে ৳${storeSettings.bundle2DiscountBDT} ছাড় · ৩টিতে ৳${storeSettings.bundle3DiscountBDT}`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Reviews & Ratings Module */}
            {activeTab === 'reviews' && (
              <ProductReviewsModule product={resolvedProduct} language={language} />
            )}
          </div>

          {/* Action Row & Conversion Trust Bar */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                disabled={addedAnimation || isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : addedAnimation
                    ? 'bg-[#B69A60] text-[#09090B] cursor-pointer'
                    : 'bg-white/10 hover:bg-white/20 text-[#F5F2EB] border border-white/15 cursor-pointer'
                }`}
              >
                {isOutOfStock ? (
                  <span>{language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}</span>
                ) : addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.essentials.addedToBag}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.essentials.addToBag}</span>
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <button
                  type="button"
                  onClick={handleExpressBuyNow}
                  className="flex-1 py-3 px-4 rounded-lg bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onToggleWishlist(resolvedProduct)}
                className={`p-3 rounded-lg border border-white/15 transition-colors cursor-pointer shrink-0 ${
                  isWishlisted
                    ? 'bg-[#B69A60] text-[#09090B]'
                    : 'hover:bg-white/10 text-[#D8D3C9]'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#77777D]">
              <span className="inline-flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#B69A60]" />
                {language === 'en'
                  ? 'Pathao Courier Dispatch (64 Districts)'
                  : 'পাঠাও কুরিয়ার ডেলিভারি (৬৪ জেলা)'}
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {language === 'en'
                  ? 'Cash on Delivery & bKash/Nagad'
                  : 'ক্যাশ অন ডেলিভারি ও বিকাশ/নগদ'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        language={language}
        defaultCategory={
          resolvedProduct.sizes.some(
            (s) => s.toLowerCase().includes('unstitched') || s === 'Free Size'
          )
            ? 'unstitched'
            : resolvedProduct.category === 'Women'
            ? 'kameez'
            : 'streetwear'
        }
      />

      {/* Lazy-Loaded Virtual Try-On 3D Mannequin Overlay Modal */}
      {isTryOnOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 text-xs font-mono text-[#D5BA80]">
              Loading 3D Mannequin Studio...
            </div>
          }
        >
          <GarmentTryOn3DModal
            product={resolvedProduct}
            isOpen={isTryOnOpen}
            onClose={() => setIsTryOnOpen(false)}
            onAddToCart={onAddToCart}
            language={language}
          />
        </Suspense>
      )}
    </div>
  );
};
