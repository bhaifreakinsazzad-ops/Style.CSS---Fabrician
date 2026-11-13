import React, { useMemo, useState, useEffect, Suspense } from 'react';
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
  PhoneCall,
  Ruler,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { CartItem, Language, Product } from '../../types';
import { LiveProduct, LiveThreePieceItem } from '../../types/store';
import { ThreePieceItem } from '../../data/threePieceCatalog';
import { FASHION_LOOKS } from '../../data/mockData';
import { useStoreData } from '../../context/StoreDataContext';
import { FarizaCatalogGrid, FarizaPromoBar } from '../three-piece/FarizaCatalogGrid';
import { FarizaInteractiveTools } from '../three-piece/FarizaInteractiveTools';
import { FarizaLogo } from '../three-piece/FarizaLogo';
import {
  buildFarizaWhatsAppHref,
  FARIZA_BRAND_ASSETS,
  FARIZA_BRAND_BOOK,
  FARIZA_BRAND_BOOK_PDF,
  FARIZA_CATALOG_PDF,
  FARIZA_WHATSAPP_DISPLAY,
  FarizaChestSize,
} from '../../data/farizaBrandData';
import {
  trackFarizaContact,
  trackFarizaCustomizeProduct,
  trackFarizaPageView,
} from '../../services/metaPixel';

const ThreePiece3DViewer = React.lazy(() =>
  import('../three-piece/ThreePiece3DViewer').then((m) => ({ default: m.ThreePiece3DViewer }))
);

interface FarizasTerritoryBrandPageProps {
  language: Language;
  onBackHome: () => void;
  onSwitchBrand: (brand: 'starkit') => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onQuickView: (product: Product) => void;
  onOpenSizeGuide: () => void;
}

export const FarizasTerritoryBrandPage: React.FC<FarizasTerritoryBrandPageProps> = ({
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
  const { unifiedCatalog, liveThreePieceItems, storeSettings } = useStoreData();
  const [addedKey, setAddedKey] = useState<string | null>(null);
  const [addedLookId, setAddedLookId] = useState<string | null>(null);
  const [active3DItem, setActive3DItem] = useState<ThreePieceItem | null>(null);
  const [recommendedChestSize, setRecommendedChestSize] =
    useState<FarizaChestSize | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    trackFarizaPageView();
  }, []);

  useEffect(() => {
    if (!active3DItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive3DItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active3DItem]);

  const handleCopyFarizaLink = () => {
    const fullUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/farizas-territory`
        : '/farizas-territory';
    navigator.clipboard?.writeText(fullUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

  const handleBuyCouture = (product: LiveProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.status === 'out_of_stock' || product.stockCount <= 0) return;
    const payload: Omit<CartItem, 'id'> = {
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: product.colors[0]?.name || 'Standard',
      size: product.sizes[0] || 'Free Size',
      quantity: 1,
    };
    if (onBuyNow) {
      onBuyNow(payload);
    } else {
      onAddToCart(payload);
    }
  };

  const handleOpen3D = (item: ThreePieceItem) => {
    trackFarizaCustomizeProduct(`3D Fabric Studio: ${item.code}`, item.id);
    setActive3DItem(item);
  };

  const totalWomenCount = couturePieces.length + farizaThreePieceSets.length;

  return (
    <div className="pt-[64px] sm:pt-[68px] bg-[#F0F2F5] text-[#050505] relative font-fariza">
      {/* Partner Navigation Sub-Bar (Jet Black #050505 Header Frame) */}
      <div className="border-b border-[#050505]/15 bg-[#050505] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors cursor-pointer font-mono uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#0866FF]" />
              <span>{language === 'en' ? 'FABRICIAN House' : 'মূল স্টোর'}</span>
            </button>
            <span className="text-white/25">/</span>
            <span className="font-fariza font-bold tracking-wider text-white whitespace-nowrap">
              Fariza&apos;s Territory
            </span>
            <a
              href="/farizas-territory"
              className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[10px] font-mono text-white/85 hover:bg-white/20 transition-colors whitespace-nowrap shrink-0"
            >
              /farizas-territory
            </a>
            <button
              type="button"
              onClick={handleCopyFarizaLink}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-[#0866FF] border border-white/20 text-[10px] font-mono text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Copy direct Fariza's Territory link"
            >
              {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={FARIZA_CATALOG_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white font-mono text-[11px] whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#31A24C]" />
              <span>{language === 'en' ? 'Catalog PDF' : 'ক্যাটালগ PDF'}</span>
            </a>
            <a
              href={FARIZA_BRAND_BOOK_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white font-mono text-[11px] whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#0866FF]" />
              <span>{language === 'en' ? 'Brand Book PDF' : 'ব্র্যান্ড বুক PDF'}</span>
            </a>
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white font-mono text-[11px] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Ruler className="w-3.5 h-3.5 text-[#31A24C]" />
              <span>{language === 'en' ? 'Women Fit Guide' : 'সাইজ গাইড'}</span>
            </button>
            <a
              href="/starkit"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                  e.preventDefault();
                  onSwitchBrand('starkit');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-[#050505] hover:bg-[#0866FF] hover:text-white font-mono text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{language === 'en' ? 'Visit StarkiT' : 'স্টারকিট'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Editorial Campaign Hero (Chalk White #F0F2F5 + Pure White #FFFFFF + Azure Blue #0866FF) */}
      <section className="relative overflow-hidden border-b border-[#050505]/12 bg-[#F0F2F5]">
        <div className="absolute inset-0 bg-fariza-lattice pointer-events-none opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-[#0866FF] font-semibold">
              <span>
                {language === 'en'
                  ? 'Mirpur, Dhaka · Handmade & Crafts'
                  : 'মিরপুর, ঢাকা · হস্তশিল্প ও থ্রি-পিস'}
              </span>
              <span className="text-[#050505]/25">·</span>
              <span className="text-[#196B2C]">Vol. 01/2026</span>
            </div>

            <div className="pt-1">
              <FarizaLogo size="medium" surface="chalk" />
            </div>

            <h1 className="font-fariza-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#050505] tracking-tight leading-[1.06] text-balance">
              Fariza&apos;s Territory{' '}
              <span className="text-[#0866FF]">Women&apos;s Edit</span>
            </h1>

            <p className="font-bengali text-lg sm:text-xl text-[#196B2C] font-semibold">
              {FARIZA_BRAND_BOOK.bengaliTagline}।
            </p>

            <p className="text-sm sm:text-base text-[#374151] leading-relaxed max-w-xl">
              {language === 'en'
                ? 'Explore all 18 verified three-piece ensembles across Swiss lawn, wax-resist Alfi & Mome batik, Magenta & Plum prints, and festive Shisha mirror-work embroidery — available unstitched or custom-stitched to your exact bust fit.'
                : 'সুইস লন, আলফি ও মোমে বাটিক, ম্যাজেন্টা ও প্লাম এবং উৎসবের মিরর এমব্রয়ডারির ১৮টি আসল থ্রি-পিস সংকলন — আনস্টিচড বা আপনার মাপমতো স্টিচড অবস্থায় অর্ডার করুন।'}
            </p>

            {/* Key Campaign Numbers */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#050505]/12 max-w-lg">
              <div>
                <div className="font-mono text-2xl text-[#0866FF] font-bold tabular-nums">
                  {String(totalWomenCount).padStart(2, '0')}
                </div>
                <div className="text-[11px] font-mono uppercase text-[#4B5563]">
                  {language === 'en' ? 'Women Designs' : 'মোট ডিজাইন'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#196B2C] font-bold tabular-nums">
                  {FARIZA_BRAND_BOOK.communityCount}
                </div>
                <div className="text-[11px] font-mono uppercase text-[#4B5563]">
                  {language === 'en' ? 'Community' : 'ক্রেতা পরিবার'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#050505] font-bold tabular-nums">
                  ৳1,650+
                </div>
                <div className="text-[11px] font-mono uppercase text-[#4B5563]">
                  {language === 'en' ? 'Direct Sets' : 'থ্রি-পিস মূল্য'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById('fariza-threepiece')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-6 py-3.5 rounded-xl bg-[#0866FF] hover:bg-[#0552D1] text-white text-xs font-mono font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer shadow-lg"
              >
                {language === 'en'
                  ? `Shop All ${farizaThreePieceSets.length} Sets`
                  : `${farizaThreePieceSets.length}টি থ্রি-পিস কিনুন`}
              </button>

              <a
                href={buildFarizaWhatsAppHref(
                  "Assalamu Alaikum Fariza's Territory! I'd like help choosing a Three-Piece design."
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackFarizaContact('WhatsApp', "Fariza /farizas-territory Hero")
                }
                className="px-4 py-3.5 rounded-xl bg-[#31A24C] hover:bg-[#27893E] text-white text-xs font-mono font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'en' ? 'WhatsApp Desk' : 'হোয়াটসঅ্যাপ ডেস্ক'}</span>
              </a>

              <a
                href={storeSettings.hotlineTel}
                onClick={() => trackFarizaContact('Phone', FARIZA_WHATSAPP_DISPLAY)}
                className="px-4 py-3.5 rounded-xl bg-white border border-[#050505]/15 hover:border-[#0866FF] text-xs font-mono font-semibold text-[#050505] inline-flex items-center gap-2 transition-colors shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#0866FF]" />
                <span>{storeSettings.hotlineDisplay}</span>
              </a>
            </div>
          </div>

          {/* Dual Campaign Photography Pair */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white">
              {brokenImages['hero-1'] ? (
                <div className="w-full h-full flex items-center justify-center p-6 text-center text-xs font-mono text-[#050505]">
                  CAT-001 Signature Set
                </div>
              ) : (
                <img
                  src="/assets/fariza/CAT-001_model.jpg"
                  alt="Fariza's Territory CAT-001 Model Preview"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, 'hero-1': true }))
                  }
                  className="w-full h-full object-cover object-top"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[10px] font-mono uppercase tracking-widest text-white/80">
                  Style 01 · Signature Lawn
                </div>
                <div className="font-fariza-display text-lg font-bold">
                  CAT-001 Magenta &amp; Plum
                </div>
              </div>
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white translate-y-4">
              {brokenImages['hero-2'] ? (
                <div className="w-full h-full flex items-center justify-center p-6 text-center text-xs font-mono text-[#050505]">
                  Handmade &amp; Crafts Heritage Textile
                </div>
              ) : (
                <img
                  src={FARIZA_BRAND_ASSETS.coverHero}
                  alt="Fariza's Territory Embroidered Heritage Textile Campaign"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setBrokenImages((prev) => ({ ...prev, 'hero-2': true }))
                  }
                  className="w-full h-full object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#31A24C] font-bold">
                  Brand Book Edition
                </div>
                <div className="font-fariza-display text-lg font-bold">
                  Botanical Craft Heritage
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle & Courier Value Strip */}
      <section className="border-b border-[#050505]/12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#050505]">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#0866FF] shrink-0" />
            <span className="tabular-nums">
              {language === 'en'
                ? `Save ৳${storeSettings.bundle2DiscountBDT} on 2 sets · Save ৳${storeSettings.bundle3DiscountBDT} on 3+`
                : `২টি সেটে ৳${storeSettings.bundle2DiscountBDT} · ৩টিতে ৳${storeSettings.bundle3DiscountBDT} ছাড়`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-[#31A24C] shrink-0" />
            <span className="tabular-nums">
              {language === 'en'
                ? `Free nationwide Pathao delivery over ৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}`
                : `৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+ অর্ডারে পাঠাও ফ্রি ডেলিভারি`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#0866FF] shrink-0" />
            <span>
              {language === 'en'
                ? '100% original fabric photography · Custom stitched option (+৳450)'
                : '১০০% আসল ফ্যাব্রিক সেটের ছবি · কাস্টম সেলাই সুবিধা (+৳৪৫০)'}
            </span>
          </div>
        </div>
      </section>

      {/* Part 1: Women's Couture Highlights (if any custom Atelier pieces exist) */}
      {couturePieces.length > 0 && (
        <section className="py-14 border-b border-[#050505]/12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#0866FF] font-bold">
                  Fariza&apos;s Territory × Atelier Drops
                </span>
                <h2 className="font-fariza-display text-2xl sm:text-3xl font-bold text-[#050505]">
                  {language === 'en' ? 'Custom Women’s Editions' : 'কাস্টম উইমেন্স এডিশন'}
                </h2>
              </div>
              <span className="text-xs font-mono text-[#4B5563] tabular-nums">
                {couturePieces.length} {language === 'en' ? 'editions' : 'টি এডিশন'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {couturePieces.map((product) => {
                const isOutOfStock = product.status === 'out_of_stock' || product.stockCount <= 0;
                const isAdded = addedKey === product.id;
                const wish = isWishlisted(product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => onQuickView(product)}
                    className="group bg-[#F0F2F5] border border-[#050505]/12 hover:border-[#0866FF] rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all shadow-sm hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/5] bg-white overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.nameEn}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ${
                          isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                        }`}
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors cursor-pointer ${
                          wish
                            ? 'bg-[#0866FF] text-white'
                            : 'bg-white/95 text-[#374151] hover:text-[#0866FF]'
                        }`}
                        aria-label="Wishlist toggle"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1 bg-white">
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#0866FF] font-bold mb-1">
                          Fariza&apos;s Territory · {product.collection}
                        </div>
                        <h3 className="font-fariza-display text-xl text-[#050505] font-bold mb-1">
                          {language === 'en' ? product.nameEn : product.nameBn}
                        </h3>
                        <p className="text-xs text-[#4B5563] mb-4">
                          {language === 'en' ? product.fabricEn : product.fabricBn}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#050505]/10 space-y-3">
                        <div className="font-mono text-lg font-bold text-[#050505] tabular-nums">
                          ৳ {product.priceBDT.toLocaleString()}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isOutOfStock || isAdded}
                            onClick={(e) => handleAddCouture(product, e)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                              isOutOfStock
                                ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                                : isAdded
                                ? 'bg-[#31A24C] text-white'
                                : 'bg-[#050505] text-white hover:bg-[#1F2937] cursor-pointer'
                            }`}
                          >
                            {isOutOfStock ? (
                              <span>{language === 'en' ? 'Sold Out' : 'স্টক শেষ'}</span>
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

                          {!isOutOfStock && (
                            <button
                              type="button"
                              onClick={(e) => handleBuyCouture(product, e)}
                              className="py-2.5 px-3 rounded-xl bg-[#0866FF] hover:bg-[#0552D1] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5 fill-current" />
                              <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
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
        </section>
      )}

      {/* Part 2: Complete 18 Three-Piece Catalog + Brand Tools */}
      <section id="fariza-threepiece" className="scroll-mt-24 py-14 lg:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#0866FF] font-bold">
                Fariza&apos;s Territory · Complete Three-Piece Catalog
              </span>
              <h2 className="font-fariza-display text-3xl sm:text-4xl font-bold text-[#050505] mt-1">
                {language === 'en'
                  ? `${farizaThreePieceSets.length} Signature Three-Piece Ensembles`
                  : `${farizaThreePieceSets.length}টি সিগনেচার থ্রি-পিস এডিট`}
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                farizaThreePieceSets[0] && handleOpen3D(farizaThreePieceSets[0])
              }
              className="px-4 py-2.5 rounded-xl bg-white border border-[#050505]/20 hover:bg-[#050505] text-[#050505] hover:text-white text-xs font-mono font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto shadow-sm"
            >
              <Box className="w-4 h-4 text-[#0866FF]" />
              <span>{language === 'en' ? 'Open 3D Fabric Studio' : '৩ডি ফ্যাব্রিক স্টুডিও'}</span>
            </button>
          </div>

          <FarizaPromoBar language={language} />

          <FarizaCatalogGrid
            items={farizaThreePieceSets}
            language={language}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={isWishlisted}
            onQuickView={onQuickView}
            onLaunch3D={handleOpen3D}
            recommendedChestSize={recommendedChestSize}
          />

          {/* Interactive Fit Calculator, Bundle Builder, Brand Book Specimen & Concierge */}
          <div className="mt-16">
            <FarizaInteractiveTools
              items={farizaThreePieceSets}
              language={language}
              onApplyRecommendedChestSize={(chest) => {
                setRecommendedChestSize(chest);
                document
                  .getElementById('fariza-threepiece')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
            />
          </div>

          {/* Fariza Lookbook Ensembles */}
          {farizaLooks.length > 0 && (
            <div className="mt-16 pt-14 border-t border-[#050505]/12">
              <div className="mb-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#196B2C] font-bold">
                  {language === 'en' ? "Fariza's Territory Runway" : 'ফারিজাস টেরিটরি রানওয়ে'}
                </span>
                <h2 className="font-fariza-display text-2xl sm:text-3xl font-bold text-[#050505]">
                  {language === 'en'
                    ? "Women's Signature Ensembles"
                    : 'নারীদের সিগনেচার লুকবুক'}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {farizaLooks.map((look) => {
                  const netLookPrice = Math.max(
                    0,
                    look.totalPriceBDT - storeSettings.bundle2DiscountBDT
                  );
                  const isAdded = addedLookId === look.id;

                  return (
                    <div
                      key={look.id}
                      className="p-4 rounded-2xl bg-white border border-[#050505]/12 shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        {brokenImages[look.id] ? (
                          <div className="w-24 aspect-[3/4] rounded-xl shrink-0 bg-[#F0F2F5] flex items-center justify-center text-[10px] font-mono text-[#050505] p-2 text-center">
                            {look.titleEn}
                          </div>
                        ) : (
                          <img
                            src={look.modelImage}
                            alt={look.titleEn}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setBrokenImages((prev) => ({ ...prev, [look.id]: true }))
                            }
                            className="w-24 aspect-[3/4] object-cover object-top rounded-xl shrink-0 bg-[#F0F2F5]"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#0866FF] font-bold">
                            {look.collectionEn}
                          </div>
                          <h3 className="font-fariza-display text-lg font-bold text-[#050505] leading-snug mb-1">
                            {language === 'en' ? look.titleEn : look.titleBn}
                          </h3>
                          <p className="text-xs text-[#4B5563] line-clamp-3">
                            {language === 'en' ? look.storyEn : look.storyBn}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#050505]/10 flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-base font-bold text-[#050505] tabular-nums">
                            ৳ {netLookPrice.toLocaleString()}
                          </span>
                          {netLookPrice < look.totalPriceBDT && (
                            <span className="font-mono text-xs text-[#6B7280] line-through tabular-nums">
                              ৳ {look.totalPriceBDT.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={isAdded}
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
                            setAddedLookId(look.id);
                            setTimeout(() => setAddedLookId(null), 1800);
                          }}
                          className={`px-4 py-2 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                            isAdded
                              ? 'bg-[#31A24C] text-white'
                              : 'bg-[#0866FF] hover:bg-[#0552D1] text-white'
                          }`}
                        >
                          {isAdded
                            ? language === 'en'
                              ? '✓ Added Look'
                              : '✓ যুক্ত হয়েছে'
                            : language === 'en'
                            ? 'Add Ensemble'
                            : 'সম্পূর্ণ লুক'}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                <Box className="w-4 h-4 text-[#0866FF]" />
                <span className="font-fariza-display text-lg text-[#F5F2EB]">
                  {language === 'en'
                    ? "Fariza's Territory · 3D Fabric Studio"
                    : '৩ডি ফ্যাব্রিক ড্র্যাপ স্টুডিও'}
                </span>
                <span className="text-xs font-mono text-white px-2 py-0.5 rounded bg-black/60 border border-white/10">
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
                <div className="h-[520px] flex items-center justify-center bg-[#09090B] text-xs font-mono text-white">
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
