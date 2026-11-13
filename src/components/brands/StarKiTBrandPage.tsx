import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  Check,
  Copy,
  FileText,
  Heart,
  Layers,
  MessageCircle,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from 'lucide-react';
import { CartItem, Language, Product } from '../../types';
import { LiveGraphicArchiveProduct, LiveProduct } from '../../types/store';
import { GraphicArchiveProduct } from '../../data/graphicArchiveCatalog';
import { AMBASSADOR_PORTRAIT, FASHION_LOOKS } from '../../data/mockData';
import { useStoreData } from '../../context/StoreDataContext';
import { StarKiTLogo } from '../starkit/StarKiTLogo';
import {
  StarKiTCatalogGrid,
  StarKiTPromoBanner,
  StarKiTSize,
} from '../starkit/StarKiTCatalogGrid';
import { StarKiTInteractiveTools } from '../starkit/StarKiTInteractiveTools';
import {
  buildStarKiTWhatsAppHref,
  STARKIT_BRAND_BOOK,
  STARKIT_BRAND_BOOK_PDF,
  STARKIT_LOOKBOOK_PDF,
  STARKIT_WHATSAPP_DISPLAY,
} from '../../data/starkitBrandData';
import {
  trackStarKiTContact,
  trackStarKiTPageView,
} from '../../services/metaPixel';

const StarKiT3DStudio = React.lazy(() =>
  import('../starkit/StarKiT3DStudio').then((m) => ({ default: m.StarKiT3DStudio }))
);

interface StarKiTBrandPageProps {
  language: Language;
  onBackHome: () => void;
  onSwitchBrand: (brand: 'farizas-territory') => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onQuickView: (product: Product) => void;
  onOpenSizeGuide: () => void;
}

export const StarKiTBrandPage: React.FC<StarKiTBrandPageProps> = ({
  language,
  onBackHome,
  onSwitchBrand,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  onOpenSizeGuide,
}) => {
  const { unifiedCatalog, liveGraphicArchiveProducts, storeSettings } = useStoreData();
  const [studioProduct, setStudioProduct] = useState<GraphicArchiveProduct | undefined>(undefined);
  const [recommendedSize, setRecommendedSize] = useState<StarKiTSize | null>(null);
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    trackStarKiTPageView();
  }, []);

  const handleCopyStarKiTLink = () => {
    const fullUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/starkit` : '/starkit';
    navigator.clipboard?.writeText(fullUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const starKiTEssentials = useMemo<LiveProduct[]>(
    () =>
      unifiedCatalog.filter(
        (p) =>
          p.brand === 'StarKiT' &&
          p.sourceCatalog !== 'graphic-archive' &&
          p.status !== 'hidden'
      ),
    [unifiedCatalog]
  );

  const starKiTHoodies = useMemo<LiveGraphicArchiveProduct[]>(
    () => liveGraphicArchiveProducts.filter((g) => g.brand === 'StarKiT'),
    [liveGraphicArchiveProducts]
  );

  const starKiTLooks = useMemo(
    () => FASHION_LOOKS.filter((l) => l.brand === 'StarKiT'),
    []
  );

  const handleLaunch3D = (product: GraphicArchiveProduct) => {
    setStudioProduct(product);
    document.getElementById('starkit-3d-studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAddEssential = (
    product: LiveProduct,
    instantBuy: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (product.status === 'out_of_stock' || product.stockCount <= 0) return;
    const payload: Omit<CartItem, 'id'> = {
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: product.colors[0]?.name || 'Standard',
      size: product.sizes[0] || 'L',
      quantity: 1,
    };
    if (instantBuy && onBuyNow) {
      onBuyNow(payload);
    } else {
      onAddToCart(payload);
      setAddedKey(product.id);
      setTimeout(() => setAddedKey(null), 1800);
    }
  };

  const totalDropsCount = starKiTHoodies.length + starKiTEssentials.length;

  return (
    <div className="pt-20 bg-[#ECEAEA] text-[#170000]">
      {/* Partner Navigation Sub-Bar */}
      <div className="border-b-2 border-[#170000] bg-[#170000] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer font-mono uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
              <span>{language === 'en' ? 'FABRICIAN House' : 'মূল স্টোর'}</span>
            </button>
            <span className="text-white/25">/</span>
            <span className="font-starkit font-bold tracking-widest uppercase text-white">
              StarkiT (ستاركيت)
            </span>
            <a
              href="/starkit"
              className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white/85 hover:bg-white/20 transition-colors"
            >
              /starkit
            </a>
            <button
              type="button"
              onClick={handleCopyStarKiTLink}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white hover:text-[#170000] border border-white/20 text-[10px] font-mono text-white transition-colors cursor-pointer"
              title="Copy direct StarKiT link"
            >
              {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                document.getElementById('starkit-fit-lab')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white font-mono text-[11px] cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-[#C7C1BF]" />
              <span>{language === 'en' ? 'Fit Calculator' : 'ফিট ক্যালকুলেটর'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white font-mono text-[11px] cursor-pointer"
            >
              <span>{language === 'en' ? 'Size Guide' : 'সাইজ গাইড'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchBrand('farizas-territory')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-white/25 hover:border-white text-white font-mono text-[11px] transition-colors cursor-pointer"
            >
              <span>{language === 'en' ? "Fariza's Territory" : 'ফারিজাস টেরিটরি'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Jet Black #170000 & Pure White #FFFFFF StarkiT Flagship Hero */}
      <section className="relative overflow-hidden bg-[#170000] text-white border-b-4 border-white/25">
        <div className="absolute inset-0 bg-starkit-grid-dark opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-white text-[#170000] text-[11px] font-mono font-bold uppercase tracking-[0.2em]">
              <span>Drop 01 · Official Brand Flagship · Dhaka</span>
            </div>

            <StarKiTLogo variant="light-on-dark" size="lg" showTagline />

            <h1 className="font-starkit text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.0]">
              {language === 'en' ? (
                <>
                  {STARKIT_BRAND_BOOK.tagline} <br />
                  <span className="text-[#C7C1BF]">The Graphic Archive</span>
                </>
              ) : (
                <>
                  স্টারকিট গ্রাফিক আর্কাইভ <br />
                  <span className="text-[#C7C1BF]">হেভিওয়েট ফ্লিস এডিট</span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
              {language === 'en'
                ? STARKIT_BRAND_BOOK.overviewEn
                : STARKIT_BRAND_BOOK.overviewBn}
            </p>

            {/* Brand Book Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/15 max-w-lg">
              <div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {String(totalDropsCount).padStart(2, '0')}
                </div>
                <div className="text-[11px] font-mono uppercase text-[#C7C1BF]">
                  {language === 'en' ? 'Active Drops' : 'সক্রিয় ডিজাইন'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
                  330–480
                </div>
                <div className="text-[11px] font-mono uppercase text-[#C7C1BF]">
                  {language === 'en' ? 'GSM Fleece' : 'জিএসএম ফ্লিস'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums">
                  ৳1,290+
                </div>
                <div className="text-[11px] font-mono uppercase text-[#C7C1BF]">
                  {language === 'en' ? 'Direct BDT' : 'শুরুর মূল্য'}
                </div>
              </div>
            </div>

            {/* Hero Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('starkit-catalog')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-6 py-3 rounded-xl bg-white hover:bg-[#C7C1BF] text-[#170000] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Shop Drop 01 Archive' : 'কালেকশন দেখুন'}
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('starkit-3d-studio')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-5 py-3 rounded-xl border border-white/35 hover:border-white hover:bg-white/10 text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>{language === 'en' ? 'Interactive 3D Studio' : '৩ডি স্টুডিও'}</span>
              </button>
              <a
                href={buildStarKiTWhatsAppHref(
                  'Assalamu Alaikum StarkiT! I would like assistance ordering from /starkit.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackStarKiTContact('WhatsApp', 'StarKiT /starkit Hero')}
                className="px-4 py-3 rounded-xl border border-white/35 hover:bg-white hover:text-[#170000] text-white text-xs font-mono font-bold inline-flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{STARKIT_WHATSAPP_DISPLAY}</span>
              </a>
            </div>
          </div>

          {/* Dual Campaign Photography */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/25 bg-[#170000]">
              <img
                src={AMBASSADOR_PORTRAIT}
                alt="StarkiT Official Brand Ambassador"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#170000] via-transparent to-transparent opacity-85" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#C7C1BF] font-bold">
                  Brand Ambassador
                </div>
                <div className="font-starkit text-lg font-bold text-white uppercase">
                  Face of StarkiT 2026
                </div>
              </div>
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/45 bg-[#170000] translate-y-4">
              <img
                src="/assets/aistudio/hoodie_preview_FAB-H003-BLK.png"
                alt="StarkiT Folk Art Bus Heavyweight Hoodie"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#170000] via-transparent to-transparent opacity-85" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#C7C1BF] font-bold">
                  STK-H003 Flagship
                </div>
                <div className="font-starkit text-lg font-bold text-white uppercase">
                  330–350 GSM Brushed Fleece
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Guarantee Value Strip */}
      <section className="border-b-2 border-[#170000] bg-white text-[#170000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#170000] shrink-0" />
            <span>
              {language === 'en'
                ? `Save ৳${storeSettings.bundle2DiscountBDT} on 2 pcs · Save ৳${storeSettings.bundle3DiscountBDT} on 3+`
                : `২টিতে ৳${storeSettings.bundle2DiscountBDT} · ৩টিতে ৳${storeSettings.bundle3DiscountBDT} ছাড়`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-[#170000] shrink-0" />
            <span>
              {language === 'en'
                ? `Free Pathao delivery above ৳${storeSettings.freeShippingThresholdBDT.toLocaleString()} (64 Districts)`
                : `৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+ অর্ডারে ফ্রি পাঠাও ডেলিভারি`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#170000] shrink-0" />
              <span>
                {language === 'en'
                  ? '48-Hour Size Exchange'
                  : '৪৮ ঘণ্টার সাইজ এক্সচেঞ্জ'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={STARKIT_LOOKBOOK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline font-bold text-[#170000] hover:opacity-70"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Catalog PDF</span>
              </a>
              <a
                href={STARKIT_BRAND_BOOK_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline font-bold text-[#170000] hover:opacity-70"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Brand Book</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Interactive 3D Hoodie & Artwork Studio */}
      <section
        id="starkit-3d-studio"
        className="scroll-mt-24 py-16 bg-[#170000] text-white border-b-4 border-[#170000]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C7C1BF] mb-1">
                WebGL Garment Lab · Real-Time GSM &amp; Colorway Inspector
              </div>
              <h2 className="font-starkit text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                {language === 'en'
                  ? 'Interactive 3D Hoodie Studio'
                  : 'ইন্টারঅ্যাক্টিভ ৩ডি হুডি স্টুডিও'}
              </h2>
            </div>
            <p className="text-xs font-mono text-white/65 max-w-md">
              {language === 'en'
                ? 'Drag 360° to inspect front crest, full back print, sleeve badge, and adjust fabric GSM density.'
                : '৩৬০° ঘুরিয়ে সামনের ক্রেস্ট, পেছনের প্রিন্ট ও ফ্লিস জিএসএম ঘনত্ব যাচাই করুন।'}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="h-[560px] lg:h-[640px] rounded-2xl border border-white/15 bg-black/50 flex flex-col items-center justify-center text-xs font-mono text-white">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-3" />
                <span>Loading StarkiT 3D Garment Studio...</span>
              </div>
            }
          >
            <StarKiT3DStudio
              products={starKiTHoodies}
              initialProduct={studioProduct}
              language={language}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          </Suspense>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section id="starkit-catalog" className="scroll-mt-24 py-16 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div>
            <StarKiTPromoBanner language={language} />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#524B4B] font-bold">
                  StarkiT · Official Drop 01 Lineup
                </div>
                <h2 className="font-starkit text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#170000]">
                  {language === 'en'
                    ? 'All 11 Graphic Archive Hoodies'
                    : 'সকল ১১টি গ্রাফিক আর্কাইভ হুডি'}
                </h2>
              </div>
              {recommendedSize && (
                <div className="px-3 py-1.5 rounded-lg bg-[#170000] text-white text-xs font-mono">
                  Fit Applied: <span className="font-bold">Size {recommendedSize}</span>
                </div>
              )}
            </div>

            <StarKiTCatalogGrid
              products={starKiTHoodies}
              language={language}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={isWishlisted}
              onOpenQuickView={onQuickView}
              onLaunch3D={handleLaunch3D}
              recommendedSize={recommendedSize}
              surfaceTheme="light"
            />
          </div>

          {/* Admin Custom StarkiT Drops (when created in Admin Console) */}
          {starKiTEssentials.length > 0 && (
            <div>
              <div className="flex items-baseline justify-between mb-6 pb-3 border-b-2 border-[#170000]/15">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#524B4B] font-bold">
                    StarkiT × Atelier Releases
                  </span>
                  <h2 className="font-starkit text-2xl sm:text-3xl font-bold uppercase text-[#170000]">
                    {language === 'en' ? 'Custom StarkiT Editions' : 'কাস্টম স্টারকিট এডিশন'}
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#524B4B] tabular-nums">
                  {starKiTEssentials.length} pieces
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {starKiTEssentials.map((product) => {
                  const isOutOfStock = product.status === 'out_of_stock' || product.stockCount <= 0;
                  const isAdded = addedKey === product.id;
                  const wish = isWishlisted(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => onQuickView(product)}
                      className="group bg-white border-2 border-[#170000]/15 hover:border-[#170000] hover:shadow-[6px_6px_0px_#170000] rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all"
                    >
                      <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.nameEn}
                          loading="lazy"
                          className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ${
                            isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''
                          }`}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(product);
                          }}
                          aria-label="Wishlist toggle"
                          className={`absolute top-3 right-3 p-2 rounded-full border transition-colors cursor-pointer ${
                            wish
                              ? 'bg-white border-[#170000] text-[#170000]'
                              : 'bg-[#170000]/80 border-white/25 text-white hover:bg-[#170000]'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#524B4B] font-bold mb-1">
                            StarkiT · {product.category}
                          </div>
                          <h3 className="font-starkit text-lg font-bold text-[#170000] mb-1">
                            {language === 'en' ? product.nameEn : product.nameBn}
                          </h3>
                        </div>

                        <div className="pt-3 border-t border-[#170000]/10 space-y-2">
                          <div className="font-mono text-base font-black text-[#170000] tabular-nums">
                            ৳{product.priceBDT.toLocaleString()}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={(e) => handleQuickAddEssential(product, false, e)}
                              className="py-1.5 rounded-lg border-2 border-[#170000] bg-white hover:bg-[#ECEAEA] text-[#170000] text-[11px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                            >
                              {isAdded ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                              <span>{language === 'en' ? 'Add' : 'যোগ'}</span>
                            </button>
                            {onBuyNow && (
                              <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={(e) => handleQuickAddEssential(product, true, e)}
                                className="py-1.5 rounded-lg bg-[#170000] hover:bg-neutral-800 text-white text-[11px] font-mono font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                              >
                                <Zap className="w-3 h-3" />
                                <span>{language === 'en' ? 'Buy' : 'কিনুন'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fit Calculator, Smart 3-Piece Kit Builder, Brand Book & Direct WhatsApp Desk */}
          <StarKiTInteractiveTools
            products={starKiTHoodies}
            language={language}
            onApplyRecommendedSize={(sz) => {
              setRecommendedSize(sz);
              document.getElementById('starkit-catalog')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />

          {/* StarkiT Styled Ensembles */}
          {starKiTLooks.length > 0 && (
            <div className="pt-8 border-t-2 border-[#170000]/15">
              <div className="mb-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#524B4B] font-bold">
                  {language === 'en' ? 'Curated Streetwear Pairings' : 'স্টারকিট স্টাইলড লুক'}
                </span>
                <h2 className="font-starkit text-2xl sm:text-3xl font-bold uppercase text-[#170000]">
                  {language === 'en' ? 'Complete 2-Hoodie Lookbook Sets' : 'সম্পূর্ণ লুকবুক সেট'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {starKiTLooks.map((look) => (
                  <div
                    key={look.id}
                    className="p-5 rounded-2xl bg-white border-2 border-[#170000]/15 hover:border-[#170000] flex flex-col sm:flex-row gap-5 items-center shadow-sm transition-colors"
                  >
                    <img
                      src={look.modelImage}
                      alt={look.titleEn}
                      loading="lazy"
                      className="w-full sm:w-40 aspect-[3/4] object-cover object-top rounded-xl shrink-0"
                    />
                    <div className="flex-1 space-y-2.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#524B4B] font-bold">
                        StarkiT · {look.collectionEn}
                      </div>
                      <h3 className="font-starkit text-xl font-bold text-[#170000]">
                        {language === 'en' ? look.titleEn : look.titleBn}
                      </h3>
                      <p className="text-xs text-[#474040] leading-relaxed">
                        {language === 'en' ? look.storyEn : look.storyBn}
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-base font-black text-[#170000] tabular-nums">
                          ৳{look.totalPriceBDT.toLocaleString()}
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
                                size: g.sizes[1] || g.sizes[0] || 'L',
                                quantity: 1,
                              })
                            );
                          }}
                          className="px-4 py-2 rounded-xl bg-[#170000] hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          {language === 'en' ? 'Add Full Duo (-৳150)' : 'সম্পূর্ণ সেট নিন (-৳১৫০)'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
