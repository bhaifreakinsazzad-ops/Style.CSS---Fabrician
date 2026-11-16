import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  Heart,
  Maximize2,
  Ruler,
  ShoppingBag,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react';
import { CartItem, Language, Product } from '../../types';
import {
  SHOWROOM_GARMENTS,
  showroomGarmentToProduct,
} from '../../data/showroomCatalog';
import {
  ShowroomStudioMood,
  ShowroomViewMode,
  VirtualShowroomCanvas,
} from './VirtualShowroomCanvas';
import { playAtelierTone } from '../../utils/showroomProcedural';

interface VirtualShowroomSectionProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onQuickView?: (product: Product) => void;
  onOpenSizeGuide: () => void;
}

export const VirtualShowroomSection: React.FC<VirtualShowroomSectionProps> = ({
  language,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  onOpenSizeGuide,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [viewMode, setViewMode] = useState<ShowroomViewMode>('rack');
  const [studioMood, setStudioMood] = useState<ShowroomStudioMood>('warm');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const activeGarment = SHOWROOM_GARMENTS[selectedIndex] || SHOWROOM_GARMENTS[0];
  const activeProduct = showroomGarmentToProduct(activeGarment);
  const wishlisted = isWishlisted(activeGarment.id);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const buildCartPayload = (): Omit<CartItem, 'id'> => ({
    productId: activeGarment.id,
    nameEn: `${activeGarment.titleEn} (${activeGarment.sku})`,
    nameBn: `${activeGarment.titleBn} (${activeGarment.sku})`,
    priceBDT: activeGarment.priceBDT,
    image: activeGarment.thumbnail,
    color: language === 'en' ? activeGarment.colorNameEn : activeGarment.colorNameBn,
    size: selectedSize,
    quantity: 1,
  });

  const handleAdd = () => {
    playAtelierTone(740, soundEnabled);
    onAddToCart(buildCartPayload());
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleBuy = () => {
    playAtelierTone(820, soundEnabled);
    onBuyNow(buildCartPayload());
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) playAtelierTone(660, true);
  };

  return (
    <section
      id="virtual-showroom"
      className="scroll-mt-20 py-20 lg:py-28 bg-[#E6E8ED] text-[#14171A] border-t border-black/10 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-[0.22em] text-[#555B66] mb-2">
              {language === 'en'
                ? 'FABRICIAN Flagship · Interactive 3D Atelier'
                : 'ফ্যাব্রিশিয়ান ফ্ল্যাগশিপ · ইন্টারেক্টিভ ৩ডি আতেলিয়ে'}
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-semibold text-[#14171A] tracking-tight leading-[1.08] text-balance">
              {language === 'en' ? (
                <>
                  Virtual Flagship{' '}
                  <span className="italic font-normal text-[#4B5563]">3D Showroom</span>
                </>
              ) : (
                <>
                  ভার্চুয়াল ফ্ল্যাগশিপ{' '}
                  <span className="italic font-normal text-[#4B5563]">৩ডি শোরুম</span>
                </>
              )}
            </h2>
            <p className="mt-3 text-sm text-[#4B525E] leading-relaxed max-w-xl">
              {language === 'en'
                ? 'Inspect our AW26 tailored outerwear capsule along the brushed chrome showroom rail, switch instantly to 3D on-model fitting, and rotate 360° in calibrated studio light.'
                : 'ব্রাশড ক্রোম র‍্যাকে AW26 আউটারওয়্যার ক্যাপসুল দেখুন, ৩ডি মডেলে ট্রাই-অন করুন এবং স্টুডিও লাইটিংয়ে ৩৬০° ঘুরে কাপড়ের টেক্সচার যাচাই করুন।'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#14171A] hover:bg-[#1E2D36] text-white text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 transition-colors cursor-pointer shadow-md whitespace-nowrap"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#D5BA80]" />
              <span>
                {language === 'en' ? 'Enter Fullscreen Showroom' : 'ফুলস্ক্রিন শোরুম'}
              </span>
            </button>
          </div>
        </div>

        {/* 12-Column Editorial Showroom Split: 8-Col 3D Viewport + 4-Col Contiguous Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left: Unobstructed 3D Showroom Viewport */}
          <div className="lg:col-span-8 flex flex-col">
            {!isFullscreen && (
              <VirtualShowroomCanvas
                garments={SHOWROOM_GARMENTS}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                studioMood={studioMood}
                onToggleStudioMood={() =>
                  setStudioMood((m) => (m === 'warm' ? 'cool' : 'warm'))
                }
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
                isFullscreen={false}
                onToggleFullscreen={() => setIsFullscreen(true)}
                language={language}
              />
            )}
          </div>

          {/* Right: Contiguous Purchase & Garment Dossier Module */}
          <aside className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              {/* Header: Kicker, Title, Price */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-slate-400 mb-1">
                    {activeGarment.sku} ·{' '}
                    {language === 'en' ? activeGarment.subtitleEn : activeGarment.subtitleBn}
                  </div>
                  <h3 className="font-serif-luxury text-2xl font-semibold text-slate-900 leading-tight">
                    {language === 'en' ? activeGarment.titleEn : activeGarment.titleBn}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                    ৳ {activeGarment.priceBDT.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-700 font-semibold">
                    {language === 'en' ? 'In Stock' : 'স্টকে আছে'}
                  </div>
                </div>
              </div>

              {/* Capsule Piece Selector */}
              <div className="py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-medium text-slate-600">
                    {language === 'en' ? 'Colorway & Weave' : 'রঙ ও বুনন'}
                  </span>
                  <span className="text-xs font-semibold text-slate-900">
                    {language === 'en'
                      ? activeGarment.colorNameEn
                      : activeGarment.colorNameBn}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SHOWROOM_GARMENTS.map((item, idx) => {
                    const active = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          playAtelierTone(440 + idx * 90, soundEnabled);
                          setSelectedIndex(idx);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-1.5 border border-black/10"
                          style={{
                            background:
                              item.patternType === 'celestial'
                                ? `linear-gradient(135deg, ${item.hex}, ${item.ribHex})`
                                : item.hex,
                          }}
                        />
                        <div className="text-[11px] font-semibold truncate">
                          {language === 'en'
                            ? item.colorNameEn.split(' ')[0]
                            : item.colorNameBn}
                        </div>
                        <div
                          className={`text-[10px] font-mono tabular-nums ${
                            active ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          ৳{item.priceBDT.toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-medium text-slate-600">
                    {language === 'en' ? 'Select Size' : 'সাইজ নির্বাচন'}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-950 underline cursor-pointer"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>{language === 'en' ? 'Size Guide' : 'সাইজ গাইড'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {activeGarment.sizes.map((sz) => {
                    const active = sz === selectedSize;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          playAtelierTone(580, soundEnabled);
                          setSelectedSize(sz);
                        }}
                        className={`py-2 rounded-xl text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#14171A] text-white border-[#14171A]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Composition & Fit Accordion */}
              <div className="py-3.5">
                <button
                  type="button"
                  onClick={() => setDetailsOpen((o) => !o)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  <span>
                    {language === 'en' ? 'Composition & Fit' : 'ফ্যাব্রিক ও ফিট'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      detailsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {detailsOpen && (
                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 leading-relaxed">
                    <p>
                      {language === 'en' ? activeGarment.fabricEn : activeGarment.fabricBn}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {language === 'en' ? activeGarment.fitEn : activeGarment.fitBn} ·{' '}
                      {language === 'en'
                        ? activeGarment.modelNoteEn
                        : activeGarment.modelNoteBn}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Primary Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md ${
                    addedFeedback
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#14171A] hover:bg-[#1E2D36] text-white'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{language === 'en' ? 'Added to Bag' : 'ব্যাগে যোগ হয়েছে'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {language === 'en' ? 'Add to Bag' : 'ব্যাগে নিন'} · ৳
                        {activeGarment.priceBDT.toLocaleString()}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(activeProduct)}
                  aria-label="Save to Wishlist"
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    wishlisted
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setViewMode((prev) => (prev === 'rack' ? 'model' : 'rack'))
                  }
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>
                    {viewMode === 'rack'
                      ? language === 'en'
                        ? 'Try On Model'
                        : 'মডেলে দেখুন'
                      : language === 'en'
                      ? 'Back to Rack'
                      : 'র‍্যাকে ফিরুন'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBuy}
                  className="py-2.5 px-3 rounded-xl bg-[#B69A60] hover:bg-[#A3874E] text-[#09090B] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Buy Now' : 'এখনই কিনুন'}</span>
                </button>
              </div>

              {onQuickView && (
                <button
                  type="button"
                  onClick={() => onQuickView(activeProduct)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-950 text-[11px] font-mono inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 text-[#B69A60] fill-[#B69A60]" />
                  <span>
                    {language === 'en'
                      ? 'Inspect Specs & Customer Reviews'
                      : 'বিস্তারিত ও ক্রেতাদের রিভিউ দেখুন'}
                  </span>
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Fullscreen Showroom Modal Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#DCE0E6] flex flex-col">
          <div className="flex-1 relative">
            <VirtualShowroomCanvas
              garments={SHOWROOM_GARMENTS}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              studioMood={studioMood}
              onToggleStudioMood={() =>
                setStudioMood((m) => (m === 'warm' ? 'cool' : 'warm'))
              }
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              isFullscreen={true}
              onToggleFullscreen={() => setIsFullscreen(false)}
              language={language}
            />

            {/* Quick Close + Add to Bag Strip in Top Center of Fullscreen */}
            <div className="absolute top-16 sm:top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-[#14171A] hover:bg-[#1E2D36] text-white text-xs font-semibold shadow-lg inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#D5BA80]" />
                <span>
                  {language === 'en' ? 'Add' : 'যোগ করুন'} {selectedSize} · ৳
                  {activeGarment.priceBDT.toLocaleString()}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-xl bg-white/95 hover:bg-white border border-slate-200 text-slate-800 shadow-lg cursor-pointer"
                aria-label="Close Fullscreen Showroom"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
