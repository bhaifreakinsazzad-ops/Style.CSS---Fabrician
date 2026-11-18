import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Heart,
  Layers,
  Lock,
  MessageCircle,
  Ruler,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
  Zap,
} from 'lucide-react';
import { CartItem, Language, Product } from '../../types';
import { LiveGraphicArchiveProduct } from '../../types/store';
import {
  GraphicArchiveProduct,
} from '../../data/graphicArchiveCatalog';
import {
  findStarKiTDesign,
  STARKIT_44_DESIGNS_META,
  STARKIT_MEDIA_MANIFEST,
  StarKiT44Variant,
  WorkingColorName,
} from '../../data/starkit44Catalog';
import {
  buildStarKiTWhatsAppHref,
  STARKIT_BRAND_BOOK_PDF,
  STARKIT_FABRIC_SPEC,
  STARKIT_LOOKBOOK_PDF,
  STARKIT_PRIMARY_HOTLINE_DISPLAY,
  STARKIT_SIZE_CHART,
  STARKIT_SIZE_CHART_META,
  STARKIT_WHATSAPP_DISPLAY,
} from '../../data/starkitBrandData';
import { STARKIT_SIZES, StarKiTSize } from './StarKiTCatalogGrid';
import { trackStarKiTContact, trackStarKiTViewContent } from '../../services/metaPixel';
import { HoverZoomImage } from '../common/HoverZoomImage';
import { SocialShareBar } from '../common/SocialShareBar';
import { buildStarKiTDesignShareUrl } from '../../utils/shareUrl';
import { VerifiedBuyerReviews } from '../reviews/VerifiedBuyerReviews';
import { useStoreData } from '../../context/StoreDataContext';

interface StarKiTProductDetailProps {
  designId: string;
  products: LiveGraphicArchiveProduct[];
  language: Language;
  onBackToCatalog: () => void;
  onSelectDesign: (designId: string) => void;
  onLaunch3D: (product: GraphicArchiveProduct) => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onOpenSizeGuide: () => void;
}

export const StarKiTProductDetail: React.FC<StarKiTProductDetailProps> = ({
  designId,
  products,
  language,
  onBackToCatalog,
  onSelectDesign,
  onLaunch3D,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onOpenSizeGuide,
}) => {
  const { approvedReviews } = useStoreData();
  const designMeta = findStarKiTDesign(designId) || STARKIT_44_DESIGNS_META[0];
  const liveProduct =
    products.find((p) => p.stkCode === designMeta.designId || p.id === designMeta.legacyId) ||
    products[0];

  const colorSlots = liveProduct?.allColorSlots || [];

  const [selectedColor, setSelectedColor] = useState<WorkingColorName>(() => {
    const firstDoc = colorSlots.find((s) => s.isDocumented);
    return firstDoc ? firstDoc.color : 'Black';
  });
  const [selectedSize, setSelectedSize] = useState<StarKiTSize>('L');
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // Sync default documented color when changing design route
  useEffect(() => {
    const firstDoc = colorSlots.find((s) => s.isDocumented);
    setSelectedColor(firstDoc ? firstDoc.color : 'Black');
    setActiveMediaIndex(0);
    setIsLightboxOpen(false);
  }, [designMeta.designId]);

  const activeSlot: StarKiT44Variant =
    colorSlots.find((s) => s.color === selectedColor) || colorSlots[0];

  useEffect(() => {
    if (!liveProduct || !activeSlot) return;
    trackStarKiTViewContent({
      id: activeSlot.sku,
      name: `StarkiT ${liveProduct.designName} Hoodie (${activeSlot.color})`,
      category: `StarKiT Drop 01 · ${liveProduct.category}`,
      valueBDT: activeSlot.priceBdtProposed,
    });
  }, [activeSlot?.sku, liveProduct?.designName]);

  // Inject dynamic SEO JSON-LD Schema.org Product block while mounted
  useEffect(() => {
    if (!liveProduct || !activeSlot) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'starkit-pdp-jsonld';
    const previewImg = activeSlot.studioPreviewWebp || activeSlot.referenceCompositeWebp || '';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `StarkiT ${liveProduct.designName} Hoodie (${designMeta.designId})`,
      sku: activeSlot.sku,
      brand: { '@type': 'Brand', name: 'StarkiT' },
      category: `Drop 01 / The Graphic Archive / ${liveProduct.category}`,
      description: liveProduct.descriptionEn,
      image: previewImg ? [`${window.location.origin}${previewImg}`] : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'BDT',
        price: activeSlot.priceBdtProposed,
        availability:
          activeSlot.gates.publicationStatus === 'APPROVED' &&
          (liveProduct.stockCount || 0) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/PreOrder',
      },
    });
    document.getElementById('starkit-pdp-jsonld')?.remove();
    document.head.appendChild(script);
    return () => {
      document.getElementById('starkit-pdp-jsonld')?.remove();
    };
  }, [activeSlot, designMeta.designId, liveProduct]);

  const gallerySlides = useMemo(() => {
    if (!activeSlot || activeSlot.isProvisional) return [];
    const slides: { id: string; labelEn: string; labelBn: string; src: string; isSheet?: boolean }[] = [];
    if (activeSlot.studioPreviewWebp) {
      slides.push({
        id: 'studio-preview',
        labelEn: 'Studio Front Artwork Preview',
        labelBn: 'স্টুডিও ফ্রন্ট প্রিভিউ',
        src: activeSlot.studioPreviewWebp,
      });
    }
    if (activeSlot.referenceCompositeWebp) {
      slides.push({
        id: 'reference-composite',
        labelEn: 'Archive Reference Spec Sheet',
        labelBn: 'আর্কাইভ স্পেক শিট',
        src: activeSlot.referenceCompositeWebp,
        isSheet: true,
      });
    }
    return slides;
  }, [activeSlot]);

  useEffect(() => {
    if (activeMediaIndex >= gallerySlides.length) {
      setActiveMediaIndex(0);
    }
  }, [gallerySlides.length, activeMediaIndex]);

  const plannedAssetsForSku = useMemo(
    () => STARKIT_MEDIA_MANIFEST.filter((m) => m.sku === activeSlot?.sku),
    [activeSlot?.sku]
  );

  const currentDesignIndex = STARKIT_44_DESIGNS_META.findIndex(
    (d) => d.designId === designMeta.designId
  );
  const prevDesign =
    STARKIT_44_DESIGNS_META[
      (currentDesignIndex - 1 + STARKIT_44_DESIGNS_META.length) % STARKIT_44_DESIGNS_META.length
    ];
  const nextDesign =
    STARKIT_44_DESIGNS_META[(currentDesignIndex + 1) % STARKIT_44_DESIGNS_META.length];

  const siblingDesigns = STARKIT_44_DESIGNS_META.filter(
    (d) => d.designId !== designMeta.designId
  ).slice(0, 4);

  const sizeSpec =
    STARKIT_SIZE_CHART.find((s) => s.size === selectedSize) || STARKIT_SIZE_CHART[1];

  const isProvisional = activeSlot?.isProvisional ?? true;
  const isDuplicatePlaceholder =
    activeSlot?.imageIntegrity === 'DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO';
  const isPublishedOrderable =
    !isProvisional &&
    !isDuplicatePlaceholder &&
    activeSlot?.gates.publicationStatus === 'APPROVED' &&
    (liveProduct?.stockCount || 0) > 0;

  const wishProductPayload: Product = {
    id: liveProduct?.id || designMeta.legacyId,
    slug: designMeta.slug,
    brand: 'StarKiT',
    nameEn: `${designMeta.designName} Hoodie (${designMeta.designId})`,
    nameBn: `${designMeta.nameBn} (${designMeta.designId})`,
    category: 'Streetwear',
    collection: `Drop 01 · ${designMeta.category}`,
    priceBDT: activeSlot?.priceBdtProposed || designMeta.priceBdtProposed,
    image:
      activeSlot?.studioPreviewWebp ||
      activeSlot?.referenceCompositeWebp ||
      '/media/products/STK-H001-BLK/STK-H001-BLK__91_studio_preview.webp',
    colors: colorSlots.map((c) => ({ name: c.color, hex: c.colorHex })),
    sizes: [...STARKIT_SIZES],
    fabricEn: STARKIT_FABRIC_SPEC.fabricEn,
    fabricBn: STARKIT_FABRIC_SPEC.fabricBn,
    fitEn: 'Drop-shoulder silhouette (measurements pending physical check)',
    fitBn: 'রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
    styleTag: 'urban',
  };

  const designReviewStats = useMemo(() => {
    const idSet = new Set(
      [wishProductPayload.id, designMeta.designId, designMeta.legacyId]
        .filter(Boolean)
        .map((id) => id.toLowerCase())
    );
    const matching = approvedReviews.filter((r) => idSet.has(r.productId.toLowerCase()));
    const count = matching.length;
    const avg =
      count > 0
        ? (matching.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)
        : '0.0';
    return { count, avg, numericAvg: Number(avg) };
  }, [approvedReviews, wishProductPayload.id, designMeta.designId, designMeta.legacyId]);

  const handleBagAction = (instant: boolean) => {
    if (!isPublishedOrderable || !activeSlot) return;
    const item: Omit<CartItem, 'id'> = {
      productId: liveProduct.id,
      nameEn: `StarkiT ${designMeta.designName} Hoodie (${activeSlot.sku})`,
      nameBn: `স্টারকিট ${designMeta.nameBn} (${activeSlot.sku})`,
      priceBDT: activeSlot.priceBdtProposed,
      image:
        activeSlot.studioPreviewWebp ||
        activeSlot.referenceCompositeWebp ||
        '/media/products/STK-H001-BLK/STK-H001-BLK__91_studio_preview.webp',
      color: activeSlot.color,
      size: selectedSize,
      quantity: 1,
    };
    if (instant && onBuyNow) {
      onBuyNow(item);
    } else {
      onAddToCart(item);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 1800);
    }
  };

  const whatsappQuery = buildStarKiTWhatsAppHref(
    `Assalamu Alaikum StarkiT! Pre-launch inquiry for ${activeSlot?.sku || designMeta.designId} (${designMeta.designName} — Color: ${activeSlot?.color || selectedColor}, Size: ${selectedSize}).`
  );

  return (
    <div className="pt-[64px] sm:pt-[68px] bg-[#ECEAEA] text-[#170000] min-h-screen pb-24 lg:pb-16">
      {/* Top Archive Breadcrumb & Prev/Next Bar */}
      <div className="bg-[#170000] text-white border-b-2 border-[#170000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 text-white/85 hover:text-white uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'All 11 Designs (44 Slots)' : 'সকল ১১ ডিজাইন (৪৪টি স্লট)'}</span>
            </button>
            <span className="text-white/30">/</span>
            <span className="text-[#C7C1BF] uppercase">{designMeta.designId}</span>
            <span className="text-white/30">·</span>
            <span className="font-starkit font-bold tracking-wider uppercase text-white">
              {designMeta.designName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectDesign(prevDesign.designId)}
              className="px-2.5 py-1 rounded border border-white/25 hover:border-white hover:bg-white/10 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{prevDesign.designId}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectDesign(nextDesign.designId)}
              className="px-2.5 py-1 rounded border border-white/25 hover:border-white hover:bg-white/10 inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{nextDesign.designId}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Multi-Image Visual Canvas + Media Manifest */}
          <div className="lg:col-span-7 space-y-5">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#170000] bg-[#170000] text-white shadow-[8px_8px_0px_#170000]">
              {isProvisional ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-starkit-grid-dark">
                  <div
                    className="w-20 h-20 rounded-full border-2 border-white/40 mb-5 flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: activeSlot.colorHex }}
                  >
                    <Lock
                      className={`w-7 h-7 ${
                        activeSlot.color === 'Cream' ? 'text-[#170000]' : 'text-white'
                      }`}
                    />
                  </div>
                  <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#C7C1BF] mb-2">
                    {activeSlot.sku} · {activeSlot.color} ({activeSlot.colorCode})
                  </div>
                  <h2 className="font-starkit text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white max-w-md mb-3">
                    {language === 'en'
                      ? 'COLORWAY IN DEVELOPMENT / AWAITING APPROVAL'
                      : 'কালারওয়ে উন্নয়নাধীন / অনুমোদনের অপেক্ষায়'}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/75 max-w-md leading-relaxed mb-6">
                    {language === 'en'
                      ? `The ${activeSlot.color} edition of ${designMeta.designName} is part of Drop 01's 44-variant roadmap. Real colorway mockup creation, sample dye proofing, and owner approval are required before imagery is published.`
                      : `${designMeta.designName}-এর ${activeSlot.colorBn} সংস্করণটি ড্রপ ০১-এর ৪৪-ভ্যারিয়েন্ট পরিকল্পনার অংশ। আসল ফটোগ্রাফি ও স্যাম্পল অনুমোদনের আগে কোনো নকল ছবি প্রদর্শন করা হবে না।`}
                  </p>
                  <div className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-[11px] font-mono text-white/80 max-w-md">
                    {activeSlot.nextAction}
                  </div>
                </div>
              ) : gallerySlides[activeMediaIndex] ? (
                <>
                  <HoverZoomImage
                    src={gallerySlides[activeMediaIndex].src}
                    alt={`${designMeta.designName} (${activeSlot.color}) — ${gallerySlides[activeMediaIndex].labelEn}`}
                    zoomScale={2.0}
                    onClick={() => setIsLightboxOpen(true)}
                    containerClassName="w-full h-full"
                    imgClassName={`w-full h-full ${
                      gallerySlides[activeMediaIndex].isSheet
                        ? 'object-contain p-4 bg-[#170000]'
                        : 'object-cover object-center'
                    }`}
                    showHint
                    hintPosition="bottom-right"
                    language={language}
                  />

                  {gallerySlides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMediaIndex(
                            (i) => (i - 1 + gallerySlides.length) % gallerySlides.length
                          )
                        }
                        aria-label="Previous media view"
                        className="absolute z-20 left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#170000]/85 hover:bg-white text-white hover:text-[#170000] border border-white/30 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveMediaIndex((i) => (i + 1) % gallerySlides.length)
                        }
                        aria-label="Next media view"
                        className="absolute z-20 right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#170000]/85 hover:bg-white text-white hover:text-[#170000] border border-white/30 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute z-20 top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-3 py-1 rounded bg-[#170000]/90 border border-white/25 text-[11px] font-mono font-bold uppercase text-white">
                      {activeSlot.sku} · {gallerySlides[activeMediaIndex].labelEn}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="pointer-events-auto px-3 py-1 rounded bg-white text-[#170000] text-[10px] font-mono font-bold uppercase cursor-pointer hover:bg-[#ECEAEA]"
                    >
                      Lightbox
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            {/* Duplicate Black Placeholder Warning Banner (STK-H008-MRN / BRN) */}
            {isDuplicatePlaceholder && (
              <div className="p-4 rounded-xl border-2 border-[#170000] bg-white text-[#170000] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#170000] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <div className="font-mono font-bold uppercase tracking-wider">
                    Media Integrity Alert · Duplicate Preview Detected ({activeSlot.sku})
                  </div>
                  <p className="text-[#474040] mt-1">
                    {language === 'en'
                      ? 'The supplied source PNG for this colorway has the exact same file hash as the Black edition preview. Dedicated Maroon / Chocolate Brown photography must replace this slot before public sales.'
                      : 'এই কালারওয়ের জন্য প্রদত্ত সোর্স ছবিটি ব্ল্যাক ভার্সনের হুবহু কপি। বিক্রয়ের আগে আসল মেরুন/ব্রাউন ছবি আপলোড করা আবশ্যক।'}
                  </p>
                </div>
              </div>
            )}

            {/* Thumbnail Strip */}
            {gallerySlides.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {gallerySlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-[#170000] ${
                      activeMediaIndex === idx
                        ? 'border-[#170000] ring-2 ring-[#170000]'
                        : 'border-[#170000]/25 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={slide.src}
                      alt={slide.labelEn}
                      className={`w-full h-full ${slide.isSheet ? 'object-contain p-1' : 'object-cover'}`}
                    />
                    <span className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded bg-[#170000]/85 text-[9px] font-mono text-white text-center truncate">
                      {slide.isSheet ? 'Spec Sheet' : 'Preview'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 67-Asset Media Manifest Coverage Box */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#170000]/15 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#170000]/10">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#170000]">
                  Media Asset Audit ({activeSlot.sku})
                </div>
                <span className="text-[11px] font-mono text-[#524B4B]">
                  {plannedAssetsForSku.length > 0
                    ? `${gallerySlides.length} local WebP verified · ${plannedAssetsForSku.length} planned archive views`
                    : '0/4+ New Mockup Photos Required'}
                </span>
              </div>

              {plannedAssetsForSku.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                  {plannedAssetsForSku.map((m) => (
                    <div
                      key={m.siteAssetPath}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 ${
                        m.existsLocally
                          ? 'bg-[#ECEAEA]/70 border-[#170000]/20 text-[#170000]'
                          : 'bg-white border-dashed border-[#170000]/20 text-[#665F5F]'
                      }`}
                    >
                      <span className="truncate uppercase">{m.view.replace('_', ' ')}</span>
                      <span className="text-[9px] font-bold shrink-0">
                        {m.existsLocally ? 'LOCAL WEBP' : 'EXT. DRIVE ZIP'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#524B4B]">
                  {language === 'en'
                    ? 'No photos exist yet for this colorway slot. Planned studio files will follow /media/products/' +
                      activeSlot.sku +
                      '/__01_front.webp convention once produced.'
                    : 'এই কালারওয়ে স্লটের জন্য এখনো কোনো ছবি তৈরি হয়নি।'}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Purchase & Release Gate Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <div className="p-6 rounded-2xl bg-white border-2 border-[#170000] shadow-[6px_6px_0px_#170000] space-y-5">
              {/* Header Identity */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-widest text-[#524B4B] font-bold">
                  <span>
                    {designMeta.designId} · {designMeta.category}
                  </span>
                  <span>Legacy Ref: {designMeta.legacyId}</span>
                </div>
                <h1 className="font-starkit text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#170000] leading-none">
                  {designMeta.designName}
                </h1>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="text-xs font-mono text-[#524B4B]">
                    {language === 'en'
                      ? `Source Edition: "${designMeta.sourceDesignName}"`
                      : designMeta.nameBn}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById('pdp-verified-reviews')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#170000] hover:underline cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${
                            designReviewStats.count > 0 &&
                            s <= Math.round(designReviewStats.numericAvg)
                              ? 'fill-[#170000] text-[#170000]'
                              : 'text-[#170000]/20'
                          }`}
                        />
                      ))}
                    </span>
                    <span className="tabular-nums">
                      {designReviewStats.count > 0
                        ? `${designReviewStats.avg} (${designReviewStats.count})`
                        : language === 'en'
                        ? 'Be the first to review'
                        : 'প্রথম রিভিউ লিখুন'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Price & Honest Availability Status */}
              <div className="flex flex-wrap items-baseline justify-between gap-3 py-3 border-y border-[#170000]/15">
                <div>
                  <div className="font-mono text-2xl sm:text-3xl font-black text-[#170000] tabular-nums">
                    ৳{activeSlot.priceBdtProposed.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono uppercase text-[#524B4B]">
                    {language === 'en'
                      ? 'Proposed Retail Price · Subject to Verification'
                      : 'প্রস্তাবিত বিক্রয় মূল্য · যাচাই সাপেক্ষে চূড়ান্ত'}
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    isPublishedOrderable
                      ? 'bg-[#170000] text-white border-[#170000]'
                      : 'bg-[#ECEAEA] text-[#170000] border-[#170000]/30'
                  }`}
                >
                  {isProvisional
                    ? 'In Development (29 Pending)'
                    : isPublishedOrderable
                    ? `Live Stock: ${liveProduct.stockCount}`
                    : 'HOLD · Pre-Launch Preview'}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#3F3A3A] leading-relaxed">
                {language === 'en' ? designMeta.descriptionEn : designMeta.descriptionBn}
              </p>

              {/* Full 4-Colorway Selector (44-Slot Standard) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="uppercase font-bold text-[#170000]">
                    {language === 'en' ? 'Working Colorways (4-Slot Palette):' : 'কালারওয়ে নির্বাচন (৪-স্লট):'}
                  </span>
                  <span className="text-[#524B4B]">
                    {activeSlot.color} · {activeSlot.sku}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {colorSlots.map((slot) => {
                    const active = slot.color === activeSlot.color;
                    return (
                      <button
                        key={slot.sku}
                        type="button"
                        onClick={() => {
                          setSelectedColor(slot.color);
                          setActiveMediaIndex(0);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          active
                            ? 'border-[#170000] bg-[#170000] text-white'
                            : 'border-[#170000]/20 bg-[#ECEAEA]/50 hover:border-[#170000] text-[#170000]'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-white/40 shrink-0 shadow-inner"
                          style={{ backgroundColor: slot.colorHex }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{slot.color}</div>
                          <div
                            className={`text-[9px] font-mono uppercase truncate ${
                              active ? 'text-white/75' : 'text-[#524B4B]'
                            }`}
                          >
                            {slot.isDocumented ? 'Documented Mockup' : 'In Development'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector + Unverified Size Estimate Notice */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="uppercase font-bold text-[#170000]">
                    {language === 'en' ? 'Size (Reference Est.):' : 'সাইজ (আনুমানিক):'}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="inline-flex items-center gap-1 underline text-[#170000] hover:opacity-75 cursor-pointer"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>{language === 'en' ? 'Size Chart' : 'সাইজ চার্ট'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {STARKIT_SIZES.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border-2 transition-colors cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#170000] text-white border-[#170000]'
                          : 'bg-white text-[#170000] border-[#170000]/20 hover:border-[#170000]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                <div className="p-2.5 rounded-lg bg-[#ECEAEA] text-[10px] font-mono text-[#3F3A3A] flex items-center justify-between gap-2">
                  <span className="tabular-nums">
                    Chest {sizeSpec.chestInches}&Prime; × Length {sizeSpec.lengthInches}&Prime;
                  </span>
                  <span className="font-bold text-[#170000]">
                    {language === 'en' ? 'Pending Garment Verification' : 'মাপ যাচাই বাকি'}
                  </span>
                </div>
              </div>

              {/* Commerce / Release Gate Notice & Action Controls */}
              <div className="space-y-2.5 pt-2 border-t border-[#170000]/15">
                {!isPublishedOrderable && (
                  <div className="p-3 rounded-xl bg-[#ECEAEA] border border-[#170000]/25 text-[11px] leading-relaxed text-[#170000] flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#170000] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-mono uppercase block">
                        {isProvisional
                          ? 'COLORWAY IN DEVELOPMENT / AWAITING APPROVAL'
                          : 'PRE-LAUNCH PREVIEW · NOT YET OPEN FOR PUBLIC SALES'}
                      </strong>
                      <span>
                        {isProvisional
                          ? 'Purchasing is disabled until this new colorway passes design proofing, garment sample inspection, and photography.'
                          : designMeta.isLicensingRequired
                          ? `${designMeta.artworkRightsNote} Orders unlock only after owner clearance and inventory verification in Admin Console.`
                          : 'Physical fleece sample, garment measurements, and confirmed inventory stock are required before enabling public checkout.'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={!isPublishedOrderable}
                    onClick={() => handleBagAction(false)}
                    className={`py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border-2 flex items-center justify-center gap-1.5 transition-colors ${
                      isPublishedOrderable
                        ? addedFeedback
                          ? 'bg-[#170000] border-[#170000] text-white cursor-pointer'
                          : 'bg-white hover:bg-[#ECEAEA] border-[#170000] text-[#170000] cursor-pointer'
                        : 'bg-[#ECEAEA] border-[#170000]/20 text-[#170000]/40 cursor-not-allowed'
                    }`}
                  >
                    {addedFeedback ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    <span>
                      {isProvisional
                        ? language === 'en'
                          ? 'In Development'
                          : 'উন্নয়নাধীন'
                        : !isPublishedOrderable
                        ? language === 'en'
                          ? 'Sale on Hold'
                          : 'বিক্রয় হোল্ড'
                        : addedFeedback
                        ? language === 'en'
                          ? 'Added'
                          : 'যুক্ত'
                        : language === 'en'
                        ? 'Add to Bag'
                        : 'ব্যাগে নিন'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={!isPublishedOrderable}
                    onClick={() => handleBagAction(true)}
                    className={`py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                      isPublishedOrderable
                        ? 'bg-[#170000] hover:bg-neutral-800 text-white cursor-pointer'
                        : 'bg-[#170000]/15 text-[#170000]/40 cursor-not-allowed'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{language === 'en' ? 'COD Checkout' : 'ক্যাশ অন ডেলিভারি'}</span>
                  </button>
                </div>

                {/* Secondary Actions: 3D Lab + Wishlist + WhatsApp Pre-Launch Desk */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onLaunch3D(liveProduct)}
                    className="py-2.5 px-3 rounded-xl border border-[#170000]/30 hover:border-[#170000] hover:bg-[#ECEAEA] text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? '3D Hood Studio' : '৩ডি স্টুডিও'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(wishProductPayload)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      isWishlisted(liveProduct.id)
                        ? 'bg-[#170000] border-[#170000] text-white'
                        : 'border-[#170000]/30 hover:border-[#170000] text-[#170000]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>{language === 'en' ? 'Wishlist' : 'পছন্দ তালিকা'}</span>
                  </button>
                </div>

                <a
                  href={whatsappQuery}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackStarKiTContact('WhatsApp', `PDP Inquiry: ${activeSlot.sku}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#170000] hover:bg-neutral-800 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {language === 'en'
                      ? `Pre-Launch Inquiry · WhatsApp ${STARKIT_WHATSAPP_DISPLAY}`
                      : `প্রি-লঞ্চ জিজ্ঞাসা · হোয়াটসঅ্যাপ (${STARKIT_WHATSAPP_DISPLAY})`}
                  </span>
                </a>

                <SocialShareBar
                  url={buildStarKiTDesignShareUrl(designMeta.designId)}
                  title={`StarkiT ${designMeta.designName} Hoodie (${designMeta.designId})`}
                  description={`${activeSlot.color} · Proposed ৳${activeSlot.priceBdtProposed.toLocaleString()} · Drop 01 Graphic Archive`}
                  language={language}
                  theme="starkit-light"
                />
              </div>
            </div>

            {/* Honest Specifications & Verification Ledger */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#170000]/15 space-y-3 text-xs">
              <div className="font-mono font-bold uppercase tracking-wider text-[#170000] pb-2 border-b border-[#170000]/10">
                {language === 'en' ? 'Technical Specs & Release Gates' : 'স্পেসিফিকেশন ও রিলিজ গেট'}
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between gap-2">
                  <span className="text-[#524B4B]">Fabric (Seller Claim):</span>
                  <span className="text-[#170000] font-semibold text-right">
                    330–350 GSM Brushed Fleece
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#524B4B]">Sample Audit:</span>
                  <span className="text-[#170000] font-bold">
                    {activeSlot.gates.sampleVerified ? 'Verified' : 'Pending Sample Inspection'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#524B4B]">Size Chart ({STARKIT_SIZE_CHART_META.isPhysicalVerified ? 'Verified' : 'Est.'}):</span>
                  <span className="text-[#170000] font-bold">M / L / XL / XXL (Unverified)</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#524B4B]">Artwork Rights:</span>
                  <span className="text-[#170000] font-bold text-right">
                    {designMeta.isLicensingRequired ? 'Written License Required' : 'Originality Audit Pending'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#524B4B]">Fulfillment Plan:</span>
                  <span className="text-[#170000] text-right">
                    Bangladesh 64-Dist. COD (Pathao)
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#524B4B]">Order Hotline:</span>
                  <span className="text-[#170000] font-semibold">{STARKIT_PRIMARY_HOTLINE_DISPLAY}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#170000]/10 flex flex-wrap gap-3 text-[11px] font-mono">
                <a
                  href={STARKIT_LOOKBOOK_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline font-bold text-[#170000]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Catalog PDF</span>
                </a>
                <a
                  href={STARKIT_BRAND_BOOK_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline font-bold text-[#170000]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Brand Book PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Buyer's Reviews Section */}
        <section
          id="pdp-verified-reviews"
          className="mt-14 pt-10 border-t-2 border-[#170000]/15"
        >
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#524B4B] font-bold">
                {language === 'en'
                  ? 'Community Feedback · Drop 01'
                  : 'ক্রেতাদের অভিজ্ঞতা · ড্রপ ০১'}
              </div>
              <h2 className="font-starkit text-2xl sm:text-3xl font-bold uppercase text-[#170000]">
                {language === 'en'
                  ? "Verified Buyer's Reviews"
                  : 'ভেরিফায়েড ক্রেতাদের রিভিউ'}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#524B4B]">
              {designMeta.designId} · {designMeta.designName}
            </span>
          </div>

          <VerifiedBuyerReviews
            product={wishProductPayload}
            alternateProductIds={[designMeta.designId, designMeta.legacyId]}
            language={language}
            theme="starkit-light"
          />
        </section>

        {/* Related Drop 01 Archive Designs */}
        <section className="mt-14 pt-10 border-t-2 border-[#170000]/15">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#524B4B] font-bold">
                Drop 01 · Continue Exploring
              </div>
              <h2 className="font-starkit text-2xl sm:text-3xl font-bold uppercase text-[#170000]">
                {language === 'en' ? 'Other Designs in The Graphic Archive' : 'আর্কাইভের অন্যান্য ডিজাইন'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onBackToCatalog}
              className="px-4 py-2 rounded-xl border-2 border-[#170000] text-xs font-mono font-bold uppercase hover:bg-[#170000] hover:text-white transition-colors cursor-pointer"
            >
              {language === 'en' ? 'View All 11' : 'সবগুলো দেখুন'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {siblingDesigns.map((sib) => {
              const sibProduct = products.find((p) => p.stkCode === sib.designId);
              const firstDocSlot = sibProduct?.allColorSlots.find((s) => s.isDocumented);
              const thumb = firstDocSlot?.studioPreviewWebp || firstDocSlot?.referenceCompositeWebp;
              return (
                <button
                  key={sib.designId}
                  type="button"
                  onClick={() => onSelectDesign(sib.designId)}
                  className="text-left group rounded-2xl overflow-hidden bg-white border-2 border-[#170000]/15 hover:border-[#170000] hover:shadow-[6px_6px_0px_#170000] transition-all cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[4/5] bg-[#170000] overflow-hidden">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={sib.designName}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4 text-white font-starkit text-xl font-bold">
                        {sib.designId}
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#170000] text-white font-mono text-[10px] font-bold">
                      {sib.designId}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#524B4B]">
                        {sib.category} · {sib.documentedColors.length}/4 Documented
                      </div>
                      <div className="font-starkit text-lg font-bold text-[#170000] mt-0.5">
                        {sib.designName}
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between font-mono text-xs font-bold text-[#170000]">
                      <span>৳{sib.priceBdtProposed.toLocaleString()}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Mobile Bottom Sticky Bar (Compact <= 15% height) */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-[#170000] text-white border-t border-white/20 px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] text-[#C7C1BF] truncate">
            {activeSlot.sku} · {selectedSize}
          </div>
          <div className="font-mono text-sm font-bold tabular-nums">
            ৳{activeSlot.priceBdtProposed.toLocaleString()}
          </div>
        </div>
        {isPublishedOrderable ? (
          <button
            type="button"
            onClick={() => handleBagAction(true)}
            className="px-4 py-2 rounded-lg bg-white text-[#170000] text-xs font-mono font-bold uppercase shrink-0 cursor-pointer"
          >
            {language === 'en' ? 'COD Checkout' : 'অর্ডার করুন'}
          </button>
        ) : (
          <a
            href={whatsappQuery}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-white text-[#170000] text-xs font-mono font-bold uppercase shrink-0"
          >
            {isProvisional
              ? language === 'en'
                ? 'In Development'
                : 'উন্নয়নাধীন'
              : language === 'en'
              ? 'Hold · Inquire'
              : 'জিজ্ঞাসা'}
          </a>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && gallerySlides[activeMediaIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close zoom preview"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-[#170000] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={gallerySlides[activeMediaIndex].src}
            alt={gallerySlides[activeMediaIndex].labelEn}
            className="max-h-[85vh] max-w-full object-contain rounded-xl"
          />
          <div className="mt-3 text-xs font-mono text-white/80">
            {activeSlot.sku} · {gallerySlides[activeMediaIndex].labelEn}
          </div>
        </div>
      )}
    </div>
  );
};
