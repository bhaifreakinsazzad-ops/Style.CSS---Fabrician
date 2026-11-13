/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect, useState } from 'react';
import { ArrowUpRight, Box, Check, Copy, ShieldCheck, Truck } from 'lucide-react';
import { GraphicArchiveProduct } from '../../data/graphicArchiveCatalog';
import { useStoreData } from '../../context/StoreDataContext';
import { Language, CartItem, Product } from '../../types';
import { StarKiTLogo } from '../starkit/StarKiTLogo';
import { StarKiTCatalogGrid, StarKiTPromoBanner } from '../starkit/StarKiTCatalogGrid';
import { STARKIT_BRAND_BOOK } from '../../data/starkitBrandData';

const StarKiT3DStudio = React.lazy(() =>
  import('../starkit/StarKiT3DStudio').then((m) => ({ default: m.StarKiT3DStudio }))
);

interface GraphicArchiveSectionProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: (productId: string) => boolean;
  onOpenQuickView?: (product: Product) => void;
  onOpenBrandPage?: () => void;
}

export const GraphicArchiveSection: React.FC<GraphicArchiveSectionProps> = ({
  language,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onOpenQuickView,
  onOpenBrandPage,
}) => {
  const { liveGraphicArchiveProducts } = useStoreData();
  const [studioProduct, setStudioProduct] = useState<GraphicArchiveProduct | null>(null);
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [copiedStarKiTLink, setCopiedStarKiTLink] = useState(false);

  const starKiTProducts = liveGraphicArchiveProducts.filter((p) => p.brand === 'StarKiT');

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/starkit` : '/starkit';
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopiedStarKiTLink(true);
    setTimeout(() => setCopiedStarKiTLink(false), 2000);
  };

  useEffect(() => {
    if (!showStudioModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStudioModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showStudioModal]);

  const handleLaunch3D = (product?: GraphicArchiveProduct) => {
    setStudioProduct(product || starKiTProducts[0] || null);
    setShowStudioModal(true);
  };

  return (
    <section
      id="graphic-archive"
      className="scroll-mt-20 relative py-20 lg:py-28 bg-[#ECEAEA] text-[#170000] border-t-4 border-[#170000] overflow-hidden"
    >
      {/* Crisp Minimalist Architectural Dot Matrix Background */}
      <div className="absolute inset-0 bg-starkit-grid-light opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Authentic StarkiT Jet Black (#170000) & Pure White (#FFFFFF) Masthead */}
        <div className="rounded-3xl bg-[#170000] text-white border-2 border-[#170000] p-6 sm:p-10 mb-10 relative overflow-hidden shadow-[10px_10px_0px_#C7C1BF]">
          <div className="absolute inset-0 bg-starkit-grid-dark opacity-45 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded bg-white text-[#170000] text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                  Drop 01 · 11 Designs · 15 Colorways
                </span>
                <a
                  href="/starkit"
                  onClick={(e) => {
                    if (onOpenBrandPage && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onOpenBrandPage();
                    }
                  }}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-mono uppercase tracking-wider text-white/90 transition-colors"
                >
                  /starkit
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white hover:text-[#170000] border border-white/20 text-[10px] font-mono text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy direct StarKiT storefront URL"
                >
                  {copiedStarKiTLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedStarKiTLink ? 'Copied /starkit' : 'Copy Link'}</span>
                </button>
              </div>

              <StarKiTLogo variant="light-on-dark" size="lg" showTagline />

              <h2 className="font-starkit text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[1.0] pt-1">
                {language === 'en' ? (
                  <>
                    Community, Style, Authenticity —{' '}
                    <span className="text-[#C7C1BF]">StarkiT Drop 01</span>
                  </>
                ) : (
                  <>
                    নিজস্ব স্টাইলে{' '}
                    <span className="text-[#C7C1BF]">স্টারকিট ড্রপ ০১</span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                {language === 'en'
                  ? STARKIT_BRAND_BOOK.overviewEn
                  : STARKIT_BRAND_BOOK.overviewBn}
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-[11px] font-mono text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  {language === 'en'
                    ? '330–350 GSM One-Side Brushed Fleece'
                    : '৩৩০–৩৫০ জিএসএম প্রিমিয়াম ফ্লিস'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C7C1BF]" />
                  {language === 'en'
                    ? '48-Hour Exchange · 64-District COD'
                    : '৪৮ ঘণ্টায় এক্সচেঞ্জ · ৬৪ জেলায় ডেলিভারি'}
                </span>
              </div>
            </div>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleLaunch3D(starKiTProducts[0])}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white text-white hover:text-[#170000] border border-white/30 text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>{language === 'en' ? '3D Hoodie Studio' : '৩ডি হুডি স্টুডিও'}</span>
              </button>

              {onOpenBrandPage && (
                <a
                  href="/starkit"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onOpenBrandPage();
                    }
                  }}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-[#C7C1BF] text-[#170000] text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
                >
                  <span>
                    {language === 'en'
                      ? 'Visit /starkit Flagship'
                      : 'স্টারকিট ফ্ল্যাগশিপ পেজ'}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Promo & Direct WhatsApp Strip */}
        <StarKiTPromoBanner language={language} />

        {/* Shared High-Conversion Catalog Grid */}
        <StarKiTCatalogGrid
          products={starKiTProducts}
          language={language}
          onAddToCart={onAddToCart}
          onBuyNow={onBuyNow}
          onToggleWishlist={onToggleWishlist}
          isWishlisted={isWishlisted}
          onOpenQuickView={onOpenQuickView}
          onLaunch3D={handleLaunch3D}
          surfaceTheme="light"
        />
      </div>

      {/* 3D Hoodie Studio Modal */}
      {showStudioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="fixed inset-0" onClick={() => setShowStudioModal(false)} />
          <div className="relative z-10 w-full max-w-4xl bg-[#170000] border-2 border-white/25 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/15 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4 text-white" />
                <span className="font-starkit text-lg font-bold uppercase tracking-wider">
                  {language === 'en'
                    ? 'StarkiT 3D Hoodie & Artwork Studio'
                    : 'স্টারকিট ৩ডি হুডি স্টুডিও'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowStudioModal(false)}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white hover:text-[#170000] text-white text-xs font-mono uppercase cursor-pointer transition-colors"
              >
                {language === 'en' ? 'Close' : 'বন্ধ'}
              </button>
            </div>

            <Suspense
              fallback={
                <div className="h-[560px] lg:h-[640px] flex flex-col items-center justify-center bg-[#170000] text-xs font-mono text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-3" />
                  <span>Initializing StarkiT 3D Studio...</span>
                </div>
              }
            >
              <StarKiT3DStudio
                products={starKiTProducts}
                initialProduct={studioProduct || undefined}
                language={language}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
};
