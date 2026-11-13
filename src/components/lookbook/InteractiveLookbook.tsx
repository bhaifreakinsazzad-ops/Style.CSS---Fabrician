import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  Maximize2, 
  RotateCcw, 
  Ruler, 
  ArrowLeft, 
  Layers, 
  ShieldCheck
} from 'lucide-react';
import { FashionLook, Language, CartItem, LookGarment } from '../../types';
import { translations } from '../../data/translations';
import { SizeGuideModal } from '../modals/SizeGuideModal';

interface InteractiveLookbookProps {
  looks: FashionLook[];
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onOpenVirtualTryOn?: () => void;
}

export const InteractiveLookbook: React.FC<InteractiveLookbookProps> = ({
  looks,
  language,
  onAddToCart,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [addedAnimationLook, setAddedAnimationLook] = useState(false);
  const [addedItemAnimation, setAddedItemAnimation] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState<LookGarment | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const t = translations[language];

  const currentLook = looks[activeIndex] || looks[0];

  // Initialize selected sizes for garments in active look
  useEffect(() => {
    if (currentLook) {
      const initialSizes: Record<string, string> = {};
      currentLook.garments.forEach((g) => {
        initialSizes[g.id] = g.sizes[1] || g.sizes[0] || 'M';
      });
      setSelectedSizes(initialSizes);
      setSelectedGarmentId(currentLook.garments[0]?.id || null);
    }
  }, [activeIndex, currentLook]);

  const selectLook = useCallback((index: number) => {
    if (index < 0 || index >= looks.length) return;
    setActiveIndex(index);
    setHoveredHotspot(null);
  }, [looks.length]);

  const nextLook = useCallback(() => {
    selectLook((activeIndex + 1) % looks.length);
  }, [activeIndex, looks.length, selectLook]);

  const prevLook = useCallback(() => {
    selectLook((activeIndex - 1 + looks.length) % looks.length);
  }, [activeIndex, looks.length, selectLook]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') nextLook();
      if (e.key === 'ArrowLeft') prevLook();
      if (e.key === 'Escape' && isFocusMode) setIsFocusMode(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextLook, prevLook, isFocusMode]);

  // Touch Swipe Support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextLook();
      else prevLook();
    }
    touchStartX.current = null;
  };

  // Add individual piece
  const handleAddSingleGarment = (garment: LookGarment) => {
    const size = selectedSizes[garment.id] || garment.sizes[0] || 'M';
    onAddToCart({
      productId: garment.id,
      nameEn: garment.nameEn,
      nameBn: garment.nameBn,
      priceBDT: garment.priceBDT,
      image: garment.image || currentLook.modelImage,
      color: currentLook.colorway,
      size: size,
      quantity: 1,
    });
    setAddedItemAnimation(garment.id);
    setTimeout(() => setAddedItemAnimation(null), 1500);
  };

  // Add entire look (all garments at once)
  const handleAddFullLook = () => {
    currentLook.garments.forEach((garment) => {
      const size = selectedSizes[garment.id] || garment.sizes[0] || 'M';
      onAddToCart({
        productId: garment.id,
        nameEn: garment.nameEn,
        nameBn: garment.nameBn,
        priceBDT: garment.priceBDT,
        image: garment.image || currentLook.modelImage,
        color: currentLook.colorway,
        size: size,
        quantity: 1,
      });
    });

    setAddedAnimationLook(true);
    setTimeout(() => setAddedAnimationLook(false), 2200);
  };

  const handleSizeChange = (garmentId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [garmentId]: size }));
  };

  return (
    <section 
      id="lookbook" 
      className="scroll-mt-20 py-16 lg:py-24 bg-[#0a0a0c] text-[#F5F2EB] relative overflow-hidden border-t border-white/5 select-none"
    >
      {/* Background Studio Ambience & Vignette */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#B69A60]/10 via-[#B69A60]/3 to-transparent rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header Bar: Dynamic between 'Try the Look.' and 'Focused Look Title' */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12 transition-all duration-500">
          <div>
            {isFocusMode ? (
              <div className="space-y-1">
                <button
                  onClick={() => setIsFocusMode(false)}
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#D5BA80] hover:text-white mb-2 transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>{language === 'en' ? 'Back to Runway Lineup' : 'রানওয়ে লাইনআপে ফিরে যান'}</span>
                </button>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B69A60]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? currentLook.collectionEn : currentLook.collectionBn}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-[#D8D3C9]">{currentLook.category}</span>
                </div>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide">
                  {language === 'en' ? currentLook.titleEn : currentLook.titleBn}
                </h2>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 text-xs uppercase tracking-[0.25em] text-[#B69A60] mb-2 font-medium">
                  <img
                    src="/assets/aistudio/Untitled_design_a468bd14.png"
                    alt="Fabrician Emblem"
                    className="w-4 h-4 object-contain"
                  />
                  <span>{language === 'en' ? '2026 Interactive Runway' : '২০২৬ ইন্টারেক্টিভ রানওয়ে'}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-[#D8D3C9]">{t.brand.originBadge}</span>
                </div>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide">
                  {language === 'en' ? 'Try the Look.' : 'লুকটি পরখ করুন।'}
                </h2>
                <p className="text-xs sm:text-sm text-[#77777D] mt-1.5 max-w-xl font-light">
                  {language === 'en' 
                    ? 'Click on any model or drag across the lineup to inspect tailored silhouettes.' 
                    : 'যেকোনো মডেলে ক্লিক করে অথবা ড্র্যাগ করে সমসাময়িক কাটের পোশাক পরখ করুন।'}
                </p>
              </div>
            )}
          </div>

          {/* Runway Navigation & Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {currentLook.modelStats && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#D8D3C9]">
                <span>Height: {currentLook.modelStats.height}</span>
                <span className="text-white/20">·</span>
                <span>Wearing {currentLook.modelStats.size}</span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-full p-1 pl-3 text-xs font-mono text-[#D8D3C9]">
              <span className="tabular-nums">0{activeIndex + 1} / 0{looks.length}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevLook}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#F5F2EB] transition-colors cursor-pointer"
                  aria-label="Previous Look"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextLook}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#F5F2EB] transition-colors cursor-pointer"
                  aria-label="Next Look"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isFocusMode && (
              <button
                onClick={() => setIsFocusMode(true)}
                className="px-3.5 py-2 rounded-full bg-[#B69A60]/15 hover:bg-[#B69A60]/30 border border-[#B69A60]/40 text-[#D5BA80] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'en' ? 'Focus Look' : 'ফোকাস মোড'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Interactive Stage Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual Stage (Lineup / Isolated Focused Model) */}
          <div 
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`transition-all duration-700 ease-out ${
              isFocusMode ? 'lg:col-span-7' : 'lg:col-span-8'
            }`}
          >
            {/* Stage Viewport */}
            <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/11] rounded-2xl overflow-hidden bg-gradient-to-b from-[#131317] via-[#0e0e11] to-[#09090b] border border-white/10 shadow-2xl flex items-center justify-center">
              {/* Studio Backdrop Soft Lighting Floor Grid */}
              <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-16 bg-black/80 rounded-full blur-2xl pointer-events-none" />

              {/* ----------------- MODE A: Multi-Model Depth Perspective Lineup ----------------- */}
              {!isFocusMode && (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {looks.map((look, idx) => {
                    const offset = idx - activeIndex;
                    const isCenter = offset === 0;
                    const isImmediate = Math.abs(offset) === 1;
                    const isVisible = Math.abs(offset) <= 2;

                    if (!isVisible) return null;

                    // Compute smooth horizontal spread and depth scaling
                    const xTranslate = offset * 28; // percentage offset
                    const scale = isCenter ? 1.08 : isImmediate ? 0.88 : 0.76;
                    const zIndex = 20 - Math.abs(offset) * 5;
                    const blurValue = isCenter ? 0 : Math.abs(offset) === 1 ? 3.5 : 7;
                    const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.65 : 0.4;

                    return (
                      <div
                        key={look.id}
                        onClick={() => {
                          if (isCenter) {
                            setIsFocusMode(true);
                          } else {
                            selectLook(idx);
                          }
                        }}
                        style={{
                          transform: `translateX(${xTranslate}%) scale(${scale})`,
                          zIndex: zIndex,
                          filter: `blur(${blurValue}px)`,
                          opacity: opacity,
                        }}
                        className={`absolute top-0 bottom-0 w-[42%] sm:w-[32%] lg:w-[28%] flex flex-col items-center justify-end pb-8 transition-all duration-500 ease-out cursor-pointer group hover:opacity-100 ${
                          !isCenter ? 'hover:scale-[0.92] hover:filter-none' : ''
                        }`}
                      >
                        {/* Model Figure Image */}
                        <div className="relative w-full h-[88%] flex items-end justify-center">
                          <img
                            src={look.modelImage}
                            alt={look.titleEn}
                            className="w-full h-full object-contain object-bottom drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                            referrerPolicy="no-referrer"
                          />

                          {/* Ground Reflection & Contact Shadow */}
                          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/90 rounded-full blur-md -z-10" />
                        </div>

                        {/* Center Model Highlight Ring / Badge */}
                        {isCenter && (
                          <div className="mt-2 flex flex-col items-center gap-1.5 animate-fadeIn">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsFocusMode(true);
                              }}
                              className="px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#B69A60]/60 hover:border-[#B69A60] text-[#D5BA80] hover:text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all hover:scale-105 cursor-pointer"
                            >
                              <Maximize2 className="w-3.5 h-3.5 text-[#B69A60]" />
                              <span>{language === 'en' ? 'Click to Try Look' : 'লুকটি পরখ করুন'}</span>
                            </button>
                            <span className="text-[11px] font-serif-luxury text-[#F5F2EB]/80 font-medium">
                              {language === 'en' ? look.titleEn : look.titleBn}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ----------------- MODE B: Isolated Focused Single Model with Hotspots ----------------- */}
              {isFocusMode && (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  {/* Model Figure in Sharp Focus */}
                  <div className="relative h-full max-h-[92%] w-auto aspect-[3/4] flex items-center justify-center">
                    <img
                      src={currentLook.modelImage}
                      alt={currentLook.titleEn}
                      className="w-full h-full object-contain object-bottom drop-shadow-2xl"
                      referrerPolicy="no-referrer"
                    />

                    {/* Ground Shadow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/95 rounded-full blur-lg -z-10" />

                    {/* Interactive Hotspot Pins on the Model */}
                    {currentLook.garments.map((garment) => {
                      const hotspot = garment.hotspot || { x: 50, y: 50 };
                      const isSelected = selectedGarmentId === garment.id;

                      return (
                        <div
                          key={garment.id}
                          style={{
                            top: `${hotspot.y}%`,
                            left: `${hotspot.x}%`,
                          }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                        >
                          {/* Tactile Hotspot Pin */}
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => setSelectedGarmentId(garment.id)}
                              onMouseEnter={() => setHoveredHotspot(garment)}
                              onMouseLeave={() => setHoveredHotspot(null)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                                isSelected
                                  ? 'bg-[#B69A60] text-[#09090B] ring-4 ring-[#B69A60]/40 scale-110'
                                  : 'bg-black/85 text-white border border-white/30 hover:border-[#B69A60] hover:scale-110'
                              }`}
                              aria-label={`Inspect ${garment.nameEn}`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-current" />
                            </button>

                            {/* Floating Tooltip Card */}
                            {(hoveredHotspot?.id === garment.id || isSelected) && (
                              <div
                                className={`hidden sm:block absolute top-1/2 -translate-y-1/2 w-52 p-3 rounded-xl bg-black/95 border border-[#B69A60]/40 shadow-2xl text-left pointer-events-none z-40 animate-fadeIn ${
                                  hotspot.x > 60 ? 'right-9' : 'left-9'
                                }`}
                              >
                                <span className="text-[10px] font-mono text-[#B69A60] uppercase tracking-wider block mb-0.5">
                                  {garment.type}
                                </span>
                                <h5 className="font-serif-luxury text-sm text-[#F5F2EB] font-medium leading-tight">
                                  {language === 'en' ? garment.nameEn : garment.nameBn}
                                </h5>
                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 font-mono text-xs">
                                  <span className="text-[#D5BA80] font-semibold tabular-nums">
                                    ৳ {garment.priceBDT.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-[#77777D] truncate max-w-[95px]">{garment.fabric}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mode Overlay Controls */}
                  <div className="absolute top-4 left-4 z-20">
                    <button
                      onClick={() => setIsFocusMode(false)}
                      className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 hover:border-white/40 text-xs font-mono text-[#D8D3C9] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#B69A60]" />
                      <span>{language === 'en' ? 'Show All Models' : 'সব মডেল দেখুন'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Subtle Bar for Active Look Title */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none text-xs font-mono text-[#77777D]">
                <span>FABRICIAN Runway Studio · Dhaka</span>
                <span className="hidden sm:inline">Use Arrow Keys or Swipe to Navigate</span>
              </div>
            </div>

            {/* Runway Thumbnails Quick Carousel */}
            <div className="mt-4 flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none">
              {looks.map((look, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={look.id}
                    onClick={() => selectLook(idx)}
                    className={`flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all cursor-pointer shrink-0 text-left ${
                      isSelected
                        ? 'bg-white/10 border-[#B69A60] text-white shadow-lg'
                        : 'bg-black/30 border-white/5 text-[#77777D] hover:border-white/20 hover:text-[#D8D3C9]'
                    }`}
                  >
                    <div className="w-9 h-12 rounded-lg overflow-hidden bg-black/60 shrink-0">
                      <img
                        src={look.modelImage}
                        alt={look.titleEn}
                        className="w-full h-full object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-[#B69A60]">
                        0{idx + 1} · {look.category}
                      </div>
                      <div className="font-serif-luxury text-xs text-[#F5F2EB] font-medium truncate max-w-[140px]">
                        {language === 'en' ? look.titleEn : look.titleBn}
                      </div>
                      <div className="text-[10px] font-mono text-[#D5BA80] tabular-nums">
                        ৳ {look.totalPriceBDT.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: "In this look" Product Drawer & Direct Ensemble Checkout */}
          <div className={`transition-all duration-700 ${
            isFocusMode ? 'lg:col-span-5' : 'lg:col-span-4'
          }`}>
            <div className="p-5 sm:p-6 rounded-2xl bg-[#141417]/95 border border-white/10 shadow-2xl backdrop-blur-md flex flex-col justify-between">
              <div>
                {/* Header: "In this look" */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="font-serif-luxury text-xl sm:text-2xl font-light text-[#F5F2EB]">
                      {language === 'en' ? 'In this look' : 'এই লুকের পোশাকসমূহ'}
                    </h3>
                    <p className="text-[11px] font-mono text-[#77777D] uppercase tracking-wider mt-0.5">
                      {currentLook.garments.length} {language === 'en' ? 'Curated Masterpieces' : 'টি মাস্টারপিস'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#B69A60]/10 border border-[#B69A60]/30 text-[#D5BA80]">
                    <Layers className="w-4 h-4 text-[#B69A60]" />
                  </div>
                </div>

                {/* Individual Garment Item Cards */}
                <div className="space-y-3.5 mb-6">
                  {currentLook.garments.map((garment) => {
                    const isSelected = selectedGarmentId === garment.id;
                    const activeSize = selectedSizes[garment.id] || garment.sizes[0] || 'M';

                    return (
                      <div
                        key={garment.id}
                        onClick={() => setSelectedGarmentId(garment.id)}
                        className={`p-3.5 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? 'bg-black/60 border-[#B69A60] shadow-lg ring-1 ring-[#B69A60]/40'
                            : 'bg-black/30 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          <img
                            src={garment.image || currentLook.modelImage}
                            alt={garment.nameEn}
                            className="w-14 h-18 object-cover object-top rounded-lg bg-zinc-900 shrink-0 border border-white/10"
                            referrerPolicy="no-referrer"
                          />

                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono uppercase text-[#B69A60] tracking-wider">
                              {garment.type}
                            </span>
                            <h4 className="font-serif-luxury text-sm text-[#F5F2EB] font-medium truncate">
                              {language === 'en' ? garment.nameEn : garment.nameBn}
                            </h4>
                            <p className="text-[11px] text-[#77777D] truncate mt-0.5">
                              {garment.fabric}
                            </p>
                            <div className="font-mono text-xs text-[#D5BA80] font-semibold tabular-nums mt-1">
                              ৳ {garment.priceBDT.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Garment Size Selector & Single Add Button */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-[#77777D] uppercase">Size:</span>
                            {garment.sizes.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSizeChange(garment.id, sz);
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                                  activeSize === sz
                                    ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                                    : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSingleGarment(garment);
                            }}
                            className={`px-3 py-1 rounded text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              addedItemAnimation === garment.id
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/10 hover:bg-[#B69A60] hover:text-[#09090B] text-[#F5F2EB]'
                            }`}
                          >
                            {addedItemAnimation === garment.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Size Guide Trigger */}
                <div className="flex items-center justify-between pb-4 text-xs font-mono">
                  <span className="text-[#77777D] uppercase text-[11px]">Bangladeshi Fit Standard</span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="flex items-center gap-1.5 text-[#D5BA80] hover:text-white underline cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5 text-[#B69A60]" />
                    <span>{language === 'en' ? 'Size Guide' : 'সাইজ গাইড'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Sticky Action: ADD FULL LOOK TO BAG */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-baseline justify-between mb-3 font-mono">
                  <span className="text-xs uppercase tracking-wider text-[#77777D]">
                    {language === 'en' ? 'Complete Ensemble Price' : 'সম্পূর্ণ লুকের মোট মূল্য'}
                  </span>
                  <span className="font-serif-luxury text-2xl text-[#D5BA80] font-semibold tabular-nums">
                    ৳ {currentLook.totalPriceBDT.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleAddFullLook}
                  disabled={addedAnimationLook}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                    addedAnimationLook
                      ? 'bg-[#B69A60] text-[#09090B]'
                      : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80]'
                  }`}
                >
                  {addedAnimationLook ? (
                    <>
                      <Check className="w-4 h-4 text-[#09090B]" />
                      <span>{language === 'en' ? 'Full Look Added to Bag' : 'সম্পূর্ণ লুক ব্যাগে যুক্ত হয়েছে'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {language === 'en' 
                          ? `Add Full Look to Bag (৳ ${currentLook.totalPriceBDT.toLocaleString()})` 
                          : `সম্পূর্ণ লুক কিনুন (৳ ${currentLook.totalPriceBDT.toLocaleString()})`}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-[#77777D] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span>Free Express Courier Across Bangladesh</span>
                </div>
              </div>
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
          currentLook.category === 'Men' ? 'panjabi' : currentLook.category === 'Women' ? 'kameez' : 'streetwear'
        }
      />
    </section>
  );
};
