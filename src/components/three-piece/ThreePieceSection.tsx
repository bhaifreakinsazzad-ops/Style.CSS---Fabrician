import React, { useState, useEffect, useRef, Suspense } from 'react';
import {
  ArrowUpRight,
  Box,
  Check,
  Copy,
  FileText,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { ThreePieceItem } from '../../data/threePieceCatalog';
import { useStoreData } from '../../context/StoreDataContext';
import { Language, CartItem, Product } from '../../types';
import { FarizaCatalogGrid, FarizaPromoBar } from './FarizaCatalogGrid';
import { FarizaLogo } from './FarizaLogo';
import {
  FARIZA_BRAND_BOOK,
  FARIZA_BRAND_BOOK_PDF,
  FARIZA_CATALOG_PDF,
} from '../../data/farizaBrandData';
import {
  trackFarizaCustomizeProduct,
  trackFarizaPageView,
} from '../../services/metaPixel';

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
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Meta Pixel (1657670575734647): Fire Fariza's Territory PageView when collab section enters view or hash matches
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.hash.toLowerCase() === '#three-piece-edit'
    ) {
      trackFarizaPageView('section:#three-piece-edit');
      return;
    }

    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      trackFarizaPageView('section:#three-piece-edit');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          trackFarizaPageView('section:#three-piece-edit');
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
    trackFarizaCustomizeProduct(`3D Fabric Studio: ${item.code}`, item.id);
    setActive3DItem(item);
    setShow3DModal(true);
  };

  const close3D = () => {
    setShow3DModal(false);
    onClearExternal3D?.();
  };

  const handleCopyBrandLink = () => {
    const fullUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/farizas-territory`
        : '/farizas-territory';
    navigator.clipboard?.writeText(fullUrl).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section
      ref={sectionRef}
      id="three-piece-edit"
      className="scroll-mt-20 py-20 lg:py-28 bg-[#F0F2F5] text-[#050505] border-y-4 border-[#0866FF] relative overflow-hidden font-fariza"
    >
      {/* Chalk White Lattice & Controlled Subtle Tints */}
      <div className="absolute inset-0 bg-fariza-lattice pointer-events-none opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Official Brand Book Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 pb-8 border-b border-[#050505]/12">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-[#0866FF] font-semibold">
              <span>
                {language === 'en'
                  ? "Exclusive Partner House · Fariza's Territory × FABRICIAN"
                  : 'বিশেষ পার্টনার হাউস · ফারিজাস টেরিটরি × ফ্যাব্রিশিয়ান'}
              </span>
              <span className="text-[#050505]/25">·</span>
              <span className="text-[#196B2C]">
                {FARIZA_BRAND_BOOK.communityCount}{' '}
                {language === 'en' ? 'Community' : 'কমিউনিটি'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <FarizaLogo size="medium" surface="chalk" />
              <div>
                <h2 className="font-fariza-display text-3xl sm:text-5xl font-bold text-[#050505] tracking-tight leading-[1.08] text-balance">
                  {language === 'en' ? (
                    <>
                      Fariza&apos;s Territory{' '}
                      <span className="text-[#0866FF]">Three-Piece Edit</span>
                    </>
                  ) : (
                    <>
                      ফারিজাস টেরিটরি{' '}
                      <span className="text-[#0866FF]">থ্রি-পিস এডিট</span>
                    </>
                  )}
                </h2>
                <p className="font-bengali text-base sm:text-lg text-[#196B2C] font-semibold mt-1">
                  {FARIZA_BRAND_BOOK.bengaliTagline} — Mirpur, Dhaka
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#374151] leading-relaxed max-w-xl">
              {language === 'en'
                ? 'Hand-picked from our Mirpur Boutique House — 18 signature Bangladeshi three-piece sets crafted in Swiss Lawn, wax-resist Alfi & Mome batik, Magenta floral prints, and Shisha mirror embroidery.'
                : 'ঢাকার মিরপুর বুটিক হাউস থেকে বাছাইকৃত ১৮টি সিগনেচার বাংলাদেশি থ্রি-পিস — সুইস লন, আলফি ও মোমে বাটিক, ম্যাজেন্টা ফ্লোরাল এবং উৎসবের মিরর ওয়ার্ক।'}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono text-[#374151]">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#050505]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#31A24C]" />
                {FARIZA_BRAND_BOOK.valuesSummary}
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-[#050505]">
                <Truck className="w-3.5 h-3.5 text-[#0866FF]" />
                {language === 'en'
                  ? '64-District Pathao COD & bKash/Nagad'
                  : '৬৪ জেলায় পাঠাও ক্যাশ অন ডেলিভারি'}
              </span>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            {active3DItem && (
              <button
                type="button"
                onClick={() => handleLaunch3D(active3DItem)}
                className="px-4 py-2.5 bg-white border border-[#050505]/20 hover:border-[#050505] hover:bg-[#050505] text-[#050505] hover:text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <Box className="w-4 h-4 text-[#0866FF]" />
                <span>{language === 'en' ? '3D Fabric Studio' : '৩ডি ফ্যাব্রিক স্টুডিও'}</span>
              </button>
            )}

            <a
              href={FARIZA_CATALOG_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-white border border-[#050505]/20 hover:border-[#31A24C] text-[#050505] rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-[#31A24C]" />
              <span>{language === 'en' ? 'Catalog PDF' : 'ক্যাটালগ PDF'}</span>
            </a>

            <a
              href={FARIZA_BRAND_BOOK_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-white border border-[#050505]/20 hover:border-[#0866FF] text-[#050505] rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-[#0866FF]" />
              <span>{language === 'en' ? 'Brand Book' : 'ব্র্যান্ড বুক'}</span>
            </a>

            <button
              type="button"
              onClick={handleCopyBrandLink}
              className="px-3 py-2.5 bg-white border border-[#050505]/20 hover:border-[#0866FF] text-[#050505] rounded-xl text-xs font-mono font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Copy /farizas-territory share link"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-[#31A24C]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#0866FF]" />
              )}
              <span>{copiedLink ? 'Copied' : '/farizas-territory'}</span>
            </button>

            {onOpenBrandPage && (
              <a
                href="/farizas-territory"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    onOpenBrandPage();
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#0552D1] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <span>
                  {language === 'en' ? "Enter Fariza's Territory" : 'ফারিজাস টেরিটরি পেজ'}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Offer & Promo Strip */}
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
                <Box className="w-4 h-4 text-[#0866FF]" />
                <span className="font-fariza-display text-lg text-[#F5F2EB]">
                  {language === 'en'
                    ? '3D Textile Drape Simulation'
                    : '৩ডি ফ্যাব্রিক ড্র্যাপ স্টুডিও'}
                </span>
                <span className="text-xs font-mono text-white px-2 py-0.5 rounded bg-black/60 border border-white/10">
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
                <div className="h-[520px] lg:h-[620px] flex flex-col items-center justify-center bg-[#09090B] text-xs font-mono text-white">
                  <div className="w-8 h-8 border-2 border-[#0866FF] border-t-transparent rounded-full animate-spin mb-3" />
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
