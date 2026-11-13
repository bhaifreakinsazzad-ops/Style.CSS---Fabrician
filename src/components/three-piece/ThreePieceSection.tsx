import React, { useState, useEffect, Suspense } from 'react';
import { ArrowUpRight, Box, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { ThreePieceItem } from '../../data/threePieceCatalog';
import { useStoreData } from '../../context/StoreDataContext';
import { Language, CartItem, Product } from '../../types';
import { FarizaCatalogGrid, FarizaPromoBar } from './FarizaCatalogGrid';

const ThreePiece3DViewer = React.lazy(() =>
  import('./ThreePiece3DViewer').then((m) => ({ default: m.ThreePiece3DViewer }))
);

interface ThreePieceSectionProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (item: Product) => void;
  isWishlisted: (id: string) => boolean;
  onQuickView?: (product: Product) => void;
  external3DItem?: ThreePieceItem | null;
  onClearExternal3D?: () => void;
  onOpenBrandPage?: () => void;
}

export const ThreePieceSection: React.FC<ThreePieceSectionProps> = ({
  language,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  external3DItem = null,
  onClearExternal3D,
  onOpenBrandPage,
}) => {
  const { liveThreePieceItems } = useStoreData();
  const [active3DItem, setActive3DItem] = useState<ThreePieceItem | null>(
    liveThreePieceItems[0] || null
  );
  const [show3DModal, setShow3DModal] = useState<boolean>(false);

  useEffect(() => {
    if (external3DItem) {
      setActive3DItem(external3DItem);
      setShow3DModal(true);
    }
  }, [external3DItem]);

  useEffect(() => {
    if (!show3DModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShow3DModal(false);
        onClearExternal3D?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show3DModal, onClearExternal3D]);

  const handleLaunch3D = (item: ThreePieceItem) => {
    setActive3DItem(item);
    setShow3DModal(true);
  };

  const close3D = () => {
    setShow3DModal(false);
    onClearExternal3D?.();
  };

  return (
    <section
      id="three-piece-edit"
      className="scroll-mt-20 py-20 lg:py-28 bg-[#FBF7EF] text-[#171216] border-y-4 border-[#C2185B] relative overflow-hidden"
    >
      {/* Sunlit Botanical Folk Lattice & Warm Atmospheric Halos */}
      <div className="absolute inset-0 bg-fariza-lattice pointer-events-none opacity-80" />
      <div className="absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-[#C2185B]/10 blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-[440px] h-[440px] rounded-full bg-[#0D7A5F]/10 blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Vibrant Collaboration Crest & Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#C2185B]/30 shadow-sm text-xs font-mono tracking-wider text-[#9D1148] uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#C2185B]" />
              <span>
                {language === 'en'
                  ? `Exclusive Collaboration · Fariza's Territory × FABRICIAN`
                  : `বিশেষ কোলাবরেশন · ফারিজাস টেরিটরি × ফ্যাব্রিশিয়ান`}
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-2">
              {/* Botanical Crest Emblem SVG */}
              <svg
                viewBox="0 0 48 48"
                aria-hidden="true"
                className="w-11 h-11 shrink-0 text-[#C2185B]"
                fill="none"
              >
                <circle cx="24" cy="24" r="22" fill="#FFFDF9" stroke="#C2185B" strokeWidth="1.5" />
                <path
                  d="M24 8C27 14 33 17 39 24C33 31 27 34 24 40C21 34 15 31 9 24C15 17 21 14 24 8Z"
                  stroke="#0D7A5F"
                  strokeWidth="1.5"
                  fill="#C2185B"
                  fillOpacity="0.1"
                />
                <circle cx="24" cy="24" r="4" fill="#E5A93B" />
              </svg>

              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-semibold text-[#171216] tracking-tight leading-[1.08] text-balance">
                {language === 'en' ? (
                  <>
                    Fariza&apos;s Territory{' '}
                    <span className="italic font-normal text-[#C2185B]">Three-Piece Edit</span>
                  </>
                ) : (
                  <>
                    ফারিজাস টেরিটরি{' '}
                    <span className="italic font-normal text-[#C2185B]">থ্রি-পিস এডিট</span>
                  </>
                )}
              </h2>
            </div>

            <p className="font-bengali text-base sm:text-lg text-[#0D7A5F] font-semibold mb-2">
              রঙে, নকশায়, আপনার নিজস্ব স্টাইল — Vol. 01/2026
            </p>

            <p className="text-xs sm:text-sm text-[#4E4347] leading-relaxed max-w-xl mb-4">
              {language === 'en'
                ? 'Hand-picked from Mirpur Boutique House — 18 signature Bangladeshi ensembles crafted in Swiss Lawn, Alfi & Mome wax batik, Magenta floral prints, and festive Shisha mirror embroidery. Choose unstitched fabric or custom tailoring right on each card.'
                : 'মিরপুর বুটিক হাউস থেকে বাছাইকৃত ১৮টি সিগনেচার বাংলাদেশি থ্রি-পিস — সুইস লন, আলফি ও মোমে বাটিক, ম্যাজেন্টা ফ্লোরাল এবং উৎসবের মিরর ওয়ার্ক। আনস্টিচড বা কাস্টম টেইলারিং বেছে অর্ডার করুন।'}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono text-[#4E4347]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#171216]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D7A5F]" />
                {language === 'en' ? '13,000+ Community Patrons' : '১৩,০০০+ ক্রেতার আস্থা'}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#171216]">
                <Truck className="w-3.5 h-3.5 text-[#C2185B]" />
                {language === 'en' ? '64-District COD & bKash/Nagad' : '৬৪ জেলায় ক্যাশ অন ডেলিভারি'}
              </span>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex flex-wrap items-center gap-3">
            {active3DItem && (
              <button
                type="button"
                onClick={() => setShow3DModal(true)}
                className="px-4 py-2.5 bg-white border border-[#0D7A5F]/40 hover:border-[#0D7A5F] hover:bg-[#0D7A5F] text-[#0D7A5F] hover:text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Box className="w-4 h-4" />
                <span>{language === 'en' ? '3D Fabric Studio' : '৩ডি ফ্যাব্রিক স্টুডিও'}</span>
              </button>
            )}

            {onOpenBrandPage && (
              <button
                type="button"
                onClick={onOpenBrandPage}
                className="px-5 py-2.5 rounded-xl bg-[#C2185B] hover:bg-[#9D1148] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <span>
                  {language === 'en' ? "Enter Fariza's Territory" : 'ফারিজাস টেরিটরি পেজ'}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* High-Conversion Offer & Promo Strip */}
        <FarizaPromoBar language={language} />

        {/* Shared Interactive Catalog Grid */}
        <FarizaCatalogGrid
          items={liveThreePieceItems}
          language={language}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={isWishlisted}
          onQuickView={onQuickView}
          onLaunch3D={handleLaunch3D}
          animateOnMount
        />
      </div>

      {/* Interactive 3D Fabric Studio Modal */}
      {show3DModal && active3DItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={close3D} className="fixed inset-0 bg-black/90" />

          <div className="relative w-full max-w-4xl bg-[#09090B] border border-white/15 rounded-3xl overflow-hidden z-10 shadow-2xl">
            <div className="p-4 bg-[#171719] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#B69A60]" />
                <span className="font-serif-luxury text-lg text-[#F5F2EB]">
                  {language === 'en' ? '3D Textile Drape Simulation' : '৩ডি ফ্যাব্রিক ড্র্যাপ স্টুডিও'}
                </span>
                <span className="text-xs font-mono text-[#D5BA80] px-2 py-0.5 rounded bg-black/60 border border-white/10">
                  {active3DItem.code} · {active3DItem.nameEn}
                </span>
              </div>

              <button
                type="button"
                onClick={close3D}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs uppercase tracking-wider text-[#F5F2EB] cursor-pointer"
              >
                {language === 'en' ? 'Close 3D' : 'বন্ধ করুন'}
              </button>
            </div>

            <Suspense
              fallback={
                <div className="h-[520px] lg:h-[620px] flex flex-col items-center justify-center bg-[#09090B] text-xs font-mono text-[#D5BA80]">
                  <div className="w-8 h-8 border-2 border-[#B69A60] border-t-transparent rounded-full animate-spin mb-3" />
                  <span>Loading 3D Textile Studio...</span>
                </div>
              }
            >
              <ThreePiece3DViewer
                selectedItem={active3DItem}
                onClose={close3D}
              />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
};
