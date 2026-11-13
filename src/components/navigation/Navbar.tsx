import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Heart, Menu, X, Globe, Truck } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenTrackOrder: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onNavigateSection,
  onOpenTrackOrder,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLinkClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#09090B]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40 py-3.5'
            : 'bg-gradient-to-b from-[#09090B]/80 via-[#09090B]/30 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark & Woven Gold Emblem */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="text-left group cursor-pointer focus:outline-none flex items-center gap-3 shrink-0"
            aria-label="Fabrician Home"
          >
            <img
              src="/assets/aistudio/Untitled_design_a468bd14.png"
              alt="Fabrician Luxury Emblem"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif-luxury text-xl sm:text-2xl tracking-[0.22em] font-semibold text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors whitespace-nowrap">
                FABRICIAN
              </span>
              <span className="text-[9px] font-mono tracking-[0.28em] text-[#B69A60] uppercase -mt-1 hidden sm:block">
                Made in Bangladesh
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Clean Single-Line Text Links) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs uppercase tracking-[0.18em] font-medium text-[#D8D3C9]">
            <button
              onClick={() => handleLinkClick('lookbook')}
              className="hover:text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:text-[#D5BA80]"
            >
              {t.nav.lookbook}
            </button>
            <button
              onClick={() => handleLinkClick('three-piece-edit')}
              className="text-[#D5BA80] hover:text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:text-[#D5BA80] font-semibold"
            >
              {t.nav.threePiece}
            </button>
            <button
              onClick={() => handleLinkClick('graphic-archive')}
              className="text-[#F5F2EB] hover:text-[#D5BA80] transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:text-[#D5BA80] font-medium"
            >
              {t.nav.graphicArchive}
            </button>
            <button
              onClick={() => handleLinkClick('collections')}
              className="hover:text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:text-[#D5BA80]"
            >
              {t.nav.collections}
            </button>
            <button
              onClick={() => handleLinkClick('essentials')}
              className="hover:text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:text-[#D5BA80]"
            >
              {t.nav.men} &amp; {t.nav.women}
            </button>
            <button
              onClick={() => handleLinkClick('style-intelligence')}
              className="hover:text-[#F5F2EB] transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:text-[#D5BA80]"
            >
              {t.nav.styleIntelligence}
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Search, Wishlist, Bag, Language Switcher) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Track Order Trigger */}
            <button
              onClick={onOpenTrackOrder}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[#D8D3C9] hover:text-[#F5F2EB] border border-white/10 hover:border-[#B69A60]/40 rounded transition-all cursor-pointer"
              title="Track Pathao Courier Delivery / অর্ডার ট্র্যাক করুন"
              aria-label="Track Order"
            >
              <Truck className="w-3.5 h-3.5 text-[#B69A60]" />
              <span className="hidden md:inline tracking-wider">{language === 'en' ? 'Track' : 'ট্র্যাক'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#D8D3C9] hover:text-[#F5F2EB] border border-white/10 hover:border-[#B69A60]/40 rounded transition-all cursor-pointer"
              title="Switch Language / ভাষা পরিবর্তন করুন"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#B69A60]" />
              <span className="tracking-wider">{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#D8D3C9] hover:text-[#F5F2EB] transition-colors cursor-pointer rounded hover:bg-white/5"
              aria-label={t.nav.search}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-[#D8D3C9] hover:text-[#F5F2EB] transition-colors cursor-pointer rounded hover:bg-white/5"
              aria-label={t.nav.wishlist}
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#B69A60] text-[#09090B] text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Bag Trigger */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-1.5 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] transition-colors rounded text-xs font-semibold tracking-wider uppercase cursor-pointer"
              aria-label={t.nav.bag}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.nav.bag}</span>
              <span className="tabular-nums font-mono font-bold">({cartCount})</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#D8D3C9] hover:text-[#F5F2EB] focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden bg-[#09090B]/98 backdrop-blur-xl flex flex-col pt-24 px-6 pb-8 overflow-y-auto transition-all">
          <div className="flex flex-col gap-5 text-lg font-serif-luxury tracking-widest text-[#F5F2EB] border-b border-white/10 pb-8">
            <button
              onClick={() => handleLinkClick('lookbook')}
              className="text-left py-2 hover:text-[#D5BA80] transition-colors cursor-pointer"
            >
              01. {t.nav.lookbook}
            </button>
            <button
              onClick={() => handleLinkClick('three-piece-edit')}
              className="text-left py-2 text-[#D5BA80] font-medium cursor-pointer"
            >
              02. {t.nav.threePiece} {language === 'en' ? '(18 Designs)' : '(১৮টি ডিজাইন)'}
            </button>
            <button
              onClick={() => handleLinkClick('graphic-archive')}
              className="text-left py-2 hover:text-[#D5BA80] transition-colors cursor-pointer"
            >
              03. {t.nav.graphicArchive} {language === 'en' ? '(11 Drops)' : '(১১টি ডিজাইন)'}
            </button>
            <button
              onClick={() => handleLinkClick('collections')}
              className="text-left py-2 hover:text-[#D5BA80] transition-colors cursor-pointer"
            >
              04. {t.nav.collections}
            </button>
            <button
              onClick={() => handleLinkClick('essentials')}
              className="text-left py-2 hover:text-[#D5BA80] transition-colors cursor-pointer"
            >
              05. {t.nav.men} &amp; {t.nav.women}
            </button>
            <button
              onClick={() => handleLinkClick('craft')}
              className="text-left py-2 hover:text-[#D5BA80] transition-colors cursor-pointer"
            >
              06. {t.nav.craft}
            </button>
            <button
              onClick={() => handleLinkClick('style-intelligence')}
              className="text-left py-2 hover:text-[#D5BA80] transition-colors cursor-pointer"
            >
              07. {t.nav.styleIntelligence}
            </button>
            <button
              onClick={() => {
                onOpenTrackOrder();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 text-[#D5BA80] flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
            >
              <Truck className="w-5 h-5 text-[#B69A60]" />
              <span>{language === 'en' ? '08. Track Delivery (Pathao)' : '০৮. অর্ডার ডেলিভারি ট্র্যাক'}</span>
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-4 text-xs text-[#77777D] uppercase tracking-[0.2em]">
            <span>{t.brand.originBadge}</span>
            <span>{t.brand.origin}</span>
          </div>
        </div>
      )}
    </>
  );
};
