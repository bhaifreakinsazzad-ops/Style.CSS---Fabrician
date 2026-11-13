import React, { useMemo, useState, useEffect, Suspense } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Box,
  Check,
  Heart,
  Layers,
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

  const totalWomenCount = couturePieces.length + farizaThreePieceSets.length;

  return (
    <div className="pt-20 bg-[#FBF7EF] text-[#171216] relative">
      {/* Partner Navigation Sub-Bar */}
      <div className="border-b border-[#E7DEC8] bg-[#FFFDF9]/95 backdrop-blur-md sticky top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-[#4E4347] hover:text-[#C2185B] transition-colors cursor-pointer font-mono uppercase tracking-wider font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C2185B]" />
              <span>{language === 'en' ? 'FABRICIAN House' : 'মূল স্টোর'}</span>
            </button>
            <span className="text-[#D8CFC0]">/</span>
            <span className="font-mono uppercase tracking-[0.18em] text-[#C2185B] font-bold">
              Fariza&apos;s Territory × FABRICIAN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 text-[#4E4347] hover:text-[#171216] font-mono text-[11px] font-semibold cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-[#0D7A5F]" />
              <span>{language === 'en' ? 'Women Fit Guide' : 'সাইজ গাইড'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchBrand('starkit')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#171216]/20 hover:border-[#171216] bg-[#171216] text-white font-mono text-[11px] transition-colors cursor-pointer"
            >
              <span>{language === 'en' ? 'Visit StarKiT Menswear' : 'স্টারকিট মেনস দেখুন'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Vibrant Editorial Campaign Hero */}
      <section className="relative overflow-hidden border-b border-[#E7DEC8] bg-[#FBF7EF]">
        <div className="absolute inset-0 bg-fariza-lattice pointer-events-none opacity-85" />
        <div className="absolute -top-20 left-1/3 w-[520px] h-[520px] rounded-full bg-[#C2185B]/12 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[440px] h-[440px] rounded-full bg-[#0D7A5F]/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C2185B]/30 text-xs font-mono uppercase tracking-[0.2em] text-[#9D1148] font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C2185B]" />
              <span>
                {language === 'en'
                  ? 'Mirpur Artisan Boutique · Vol. 01/2026'
                  : 'মিরপুর আর্টিজান বুটিক · ভল্যুম ০১/২০২৬'}
              </span>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#171216] tracking-tight leading-[1.06] text-balance">
              Fariza&apos;s Territory{' '}
              <span className="italic font-normal text-[#C2185B]">Women&apos;s Edit</span>
            </h1>

            <p className="font-bengali text-lg sm:text-xl text-[#0D7A5F] font-semibold">
              রঙে, নকশায়, আপনার নিজস্ব স্টাইল।
            </p>

            <p className="text-sm sm:text-base text-[#4E4347] leading-relaxed max-w-xl">
              {language === 'en'
                ? 'Explore all 18 verified three-piece ensembles across Swiss lawn, wax-resist Alfi & Mome batik, Magenta & Plum prints, and festive mirror-work embroidery — available unstitched or custom-stitched to your exact chest fit.'
                : 'সুইস লন, আলফি ও মোমে বাটিক, ম্যাজেন্টা ও প্লাম এবং উৎসবের মিরর এমব্রয়ডারির ১৮টি আসল থ্রি-পিস সংকলন — আনস্টিচড বা আপনার মাপমতো স্টিচড অবস্থায় অর্ডার করুন।'}
            </p>

            {/* Key Campaign Numbers */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E7DEC8] max-w-lg">
              <div>
                <div className="font-mono text-2xl text-[#C2185B] font-bold tabular-nums">
                  {String(totalWomenCount).padStart(2, '0')}
                </div>
                <div className="text-[11px] font-mono uppercase text-[#6D5E63]">
                  {language === 'en' ? 'Women Designs' : 'মোট ডিজাইন'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#0D7A5F] font-bold tabular-nums">
                  13K+
                </div>
                <div className="text-[11px] font-mono uppercase text-[#6D5E63]">
                  {language === 'en' ? 'Community' : 'ক্রেতা পরিবার'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#171216] font-bold tabular-nums">
                  ৳1,650+
                </div>
                <div className="text-[11px] font-mono uppercase text-[#6D5E63]">
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
                className="px-6 py-3.5 rounded-xl bg-[#C2185B] hover:bg-[#9D1148] text-white text-xs font-bold uppercase tracking-[0.18em] transition-colors cursor-pointer shadow-lg"
              >
                {language === 'en'
                  ? `Shop All ${farizaThreePieceSets.length} Sets`
                  : `${farizaThreePieceSets.length}টি থ্রি-পিস কিনুন`}
              </button>
              <a
                href={storeSettings.hotlineTel}
                className="px-5 py-3.5 rounded-xl bg-white border border-[#E7DEC8] hover:border-[#0D7A5F] text-xs font-mono font-semibold text-[#171216] inline-flex items-center gap-2 transition-colors shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#0D7A5F]" />
                <span>{storeSettings.hotlineDisplay}</span>
              </a>
            </div>
          </div>

          {/* Dual Campaign Photography Pair */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-[#F4EEE1]">
              <img
                src="/assets/fariza/CAT-001_model.jpg"
                alt="Fariza's Territory CAT-001 Model Preview"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171216]/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#F5E4B7]">
                  Style 01 · Magenta &amp; Plum
                </div>
                <div className="font-serif-luxury text-lg font-medium">
                  CAT-001 Signature Set
                </div>
              </div>
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-[#F4EEE1] translate-y-4">
              <img
                src="/assets/fariza/FS-D01_model.jpg"
                alt="Fariza's Territory FS-D01 Golden Mustard Mirror Elegance"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171216]/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#F5E4B7]">
                  Style 14 · Shisha Mirror
                </div>
                <div className="font-serif-luxury text-lg font-medium">
                  FS-D01 Golden Mustard
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle & Courier Value Strip */}
      <section className="border-b border-[#E7DEC8] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#2B1F24]">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#C2185B] shrink-0" />
            <span>
              {language === 'en'
                ? `Save ৳${storeSettings.bundle2DiscountBDT} on 2 sets · Save ৳${storeSettings.bundle3DiscountBDT} on 3+`
                : `২টি সেটে ৳${storeSettings.bundle2DiscountBDT} · ৩টিতে ৳${storeSettings.bundle3DiscountBDT} ছাড়`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-[#0D7A5F] shrink-0" />
            <span>
              {language === 'en'
                ? `Free nationwide Pathao delivery over ৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}`
                : `৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+ অর্ডারে পাঠাও ফ্রি ডেলিভারি`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#B45309] shrink-0" />
            <span>
              {language === 'en'
                ? '100% original fabric set photography · Custom stitched option (+৳450)'
                : '১০০% আসল ফ্যাব্রিক সেটের ছবি · কাস্টম সেলাই সুবিধা (+৳৪৫০)'}
            </span>
          </div>
        </div>
      </section>

      {/* Part 1: Women's Couture Highlights (if any custom Atelier pieces exist) */}
      {couturePieces.length > 0 && (
        <section className="py-14 border-b border-[#E7DEC8] bg-[#FFFDF9]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C2185B] font-bold">
                  Fariza&apos;s Territory × Atelier Drops
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#171216]">
                  {language === 'en' ? 'Custom Women’s Editions' : 'কাস্টম উইমেন্স এডিশন'}
                </h2>
              </div>
              <span className="text-xs font-mono text-[#6D5E63] tabular-nums">
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
                    className="group bg-white border border-[#E7DEC8] hover:border-[#C2185B]/60 rounded-2xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all shadow-sm hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/5] bg-[#F4EEE1] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.nameEn}
                        loading="lazy"
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
                            ? 'bg-[#C2185B] text-white'
                            : 'bg-white/95 text-[#4E4347] hover:text-[#C2185B]'
                        }`}
                        aria-label="Wishlist toggle"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-5 flex flex-col justify-between flex-1">
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-[#C2185B] font-bold mb-1">
                          Fariza&apos;s Territory · {product.collection}
                        </div>
                        <h3 className="font-serif-luxury text-xl text-[#171216] font-semibold mb-1">
                          {language === 'en' ? product.nameEn : product.nameBn}
                        </h3>
                        <p className="text-xs text-[#6D5E63] mb-4">
                          {language === 'en' ? product.fabricEn : product.fabricBn}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E7DEC8] space-y-3">
                        <div className="font-mono text-lg font-bold text-[#171216] tabular-nums">
                          ৳ {product.priceBDT.toLocaleString()}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isOutOfStock || isAdded}
                            onClick={(e) => handleAddCouture(product, e)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                              isOutOfStock
                                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                                : isAdded
                                ? 'bg-[#0D7A5F] text-white'
                                : 'bg-[#171216] text-white hover:bg-[#2F262C] cursor-pointer'
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
                              className="py-2.5 px-3 rounded-xl bg-[#C2185B] hover:bg-[#9D1148] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

      {/* Part 2: Complete 18 Three-Piece Catalog */}
      <section id="fariza-threepiece" className="scroll-mt-24 py-14 lg:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C2185B] font-bold">
                Fariza&apos;s Territory · Complete Three-Piece Catalog
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-semibold text-[#171216] mt-1">
                {language === 'en'
                  ? `${farizaThreePieceSets.length} Signature Three-Piece Ensembles`
                  : `${farizaThreePieceSets.length}টি সিগনেচার থ্রি-পিস এডিট`}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => farizaThreePieceSets[0] && setActive3DItem(farizaThreePieceSets[0])}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#0D7A5F]/40 hover:bg-[#0D7A5F] text-[#0D7A5F] hover:text-white text-xs font-mono font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer self-start md:self-auto shadow-sm"
            >
              <Box className="w-4 h-4" />
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
            onLaunch3D={(item) => setActive3DItem(item)}
          />

          {/* Fariza Lookbook Ensembles */}
          {farizaLooks.length > 0 && (
            <div className="mt-20 pt-14 border-t border-[#E7DEC8]">
              <div className="mb-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#0D7A5F] font-bold">
                  {language === 'en' ? "Fariza's Territory Runway" : 'ফারিজাস টেরিটরি রানওয়ে'}
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#171216]">
                  {language === 'en' ? "Women's Signature Ensembles" : 'নারীদের সিগনেচার লুকবুক'}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {farizaLooks.map((look) => (
                  <div
                    key={look.id}
                    className="p-4 rounded-2xl bg-white border border-[#E7DEC8] shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="flex gap-4">
                      <img
                        src={look.modelImage}
                        alt={look.titleEn}
                        loading="lazy"
                        className="w-24 aspect-[3/4] object-cover object-top rounded-xl shrink-0 bg-[#F4EEE1]"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#C2185B] font-bold">
                          {look.collectionEn}
                        </div>
                        <h3 className="font-serif-luxury text-lg font-semibold text-[#171216] leading-snug mb-1">
                          {language === 'en' ? look.titleEn : look.titleBn}
                        </h3>
                        <p className="text-xs text-[#6D5E63] line-clamp-3">
                          {language === 'en' ? look.storyEn : look.storyBn}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E7DEC8] flex items-center justify-between gap-3">
                      <span className="font-mono text-base font-bold text-[#171216] tabular-nums">
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
                        className="px-4 py-2 rounded-xl bg-[#171216] hover:bg-[#C2185B] text-white text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-colors"
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
