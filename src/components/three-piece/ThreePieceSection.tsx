import React, { useState, useEffect, useRef, Suspense } from 'react';
import { animate, stagger } from 'animejs';
import { Sparkles, Box, ShoppingBag, Heart, Check, Eye, Search, ArrowUpRight } from 'lucide-react';
import { ThreePieceItem } from '../../data/threePieceCatalog';
import { LiveThreePieceItem } from '../../types/store';
import { useStoreData } from '../../context/StoreDataContext';
import { Language, CartItem, Product } from '../../types';

const ThreePiece3DViewer = React.lazy(() =>
  import('./ThreePiece3DViewer').then((m) => ({ default: m.ThreePiece3DViewer }))
);

interface ThreePieceSectionProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (item: Product) => void;
  isWishlisted: (id: string) => boolean;
  onQuickView?: (product: Product) => void;
  external3DItem?: ThreePieceItem | null;
  onClearExternal3D?: () => void;
  onOpenBrandPage?: () => void;
}

const toProduct = (item: ThreePieceItem): Product => ({
  id: item.id,
  slug: item.code.toLowerCase(),
  brand: item.brand || "Fariza's Territory",
  nameEn: `${item.code} — ${item.nameEn}`,
  nameBn: `${item.code} — ${item.nameBn}`,
  category: 'Women',
  collection: item.subCollection,
  priceBDT: item.priceBDT,
  image: item.flatLayImage,
  colors: item.colors,
  sizes: ['Unstitched Set', 'S', 'M', 'L', 'XL'],
  fabricEn: item.fabric,
  fabricBn: item.fabric,
  fitEn: 'Tailorable 3-Piece Ensemble',
  fitBn: 'কাস্টম টেইলরেবল থ্রি-পিস',
  styleTag: 'heritage',
});

export const ThreePieceSection: React.FC<ThreePieceSectionProps> = ({
  language,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  external3DItem = null,
  onClearExternal3D,
  onOpenBrandPage,
}) => {
  const { liveThreePieceItems } = useStoreData();
  const [activeSubEdit, setActiveSubEdit] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'flatlay' | 'model'>('flatlay');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [active3DItem, setActive3DItem] = useState<ThreePieceItem | null>(
    liveThreePieceItems[0] || null
  );
  const [show3DModal, setShow3DModal] = useState<boolean>(false);
  const [addedItemCode, setAddedItemCode] = useState<string | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

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

  const edits = [
    'All',
    'Magenta & Plum',
    'Alfi Boutique',
    'Mome Boutique',
    'Zam Zam Swiss Lawn',
    'Embroidery & Mirror',
  ];

  const filteredItems = liveThreePieceItems.filter((item) => {
    const matchEdit = activeSubEdit === 'All' || item.subCollection === activeSubEdit;
    const matchQuery =
      searchQuery.trim() === '' ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameBn.includes(searchQuery) ||
      item.subCollection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kameezEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchEdit && matchQuery;
  });

  const minPrice = liveThreePieceItems.length
    ? Math.min(...liveThreePieceItems.map((i) => i.priceBDT))
    : 1650;
  const maxPrice = liveThreePieceItems.length
    ? Math.max(...liveThreePieceItems.map((i) => i.priceBDT))
    : 2450;

  // Anime.js Staggered Card Entrance Animation
  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.tp-product-card');
    if (cards.length === 0) return;

    animate(cards, {
      opacity: [0, 1],
      translateY: [24, 0],
      scale: [0.97, 1],
      delay: stagger(45, { start: 50 }),
      duration: 550,
      ease: 'outCubic',
    });
  }, [activeSubEdit, viewMode, searchQuery]);

  // Anime.js Counter Animation for filtered count
  useEffect(() => {
    if (!counterRef.current) return;
    const obj = { val: 0 };
    animate(obj, {
      val: filteredItems.length,
      duration: 500,
      ease: 'outExpo',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(obj.val)).padStart(2, '0');
        }
      },
    });
  }, [filteredItems.length]);

  const handleQuickAdd = (item: LiveThreePieceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.status === 'out_of_stock' || item.stockCount <= 0) return;
    onAddToCart({
      productId: item.id,
      nameEn: `${item.code} — ${item.nameEn}`,
      nameBn: `${item.code} — ${item.nameBn}`,
      priceBDT: item.priceBDT,
      image: item.flatLayImage,
      color: item.colors[0]?.name || 'Standard Color',
      size: 'Unstitched Set',
      quantity: 1,
    });
    setAddedItemCode(item.code);
    setTimeout(() => setAddedItemCode(null), 1800);
  };

  const handleLaunch3D = (item: ThreePieceItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActive3DItem(item);
    setShow3DModal(true);
  };

  const close3D = () => {
    setShow3DModal(false);
    onClearExternal3D?.();
  };

  return (
    <section id="three-piece-edit" className="scroll-mt-20 py-24 lg:py-32 bg-[#09090B] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B69A60]/10 border border-[#B69A60]/30 rounded-full text-xs font-mono tracking-widest text-[#D5BA80] uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>
                {language === 'en'
                  ? `Fariza's Territory · ${liveThreePieceItems.length} Curated Designs`
                  : `ফারিজাস টেরিটরি · ${liveThreePieceItems.length}টি ডিজাইন`}
              </span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide mb-2 text-balance">
              {language === 'en' ? 'THE THREE-PIECE EDIT.' : 'দ্য থ্রি-পিস এডিট।'}
            </h2>

            <p className="font-bengali text-base sm:text-lg text-[#D5BA80] font-normal mb-2">
              রঙে, নকশায়, আপনার নিজস্ব স্টাইল।
            </p>

            <p className="text-xs sm:text-sm text-[#77777D] font-light max-w-xl">
              {language === 'en'
                ? 'Authentic Bangladeshi three-piece sets curated with original fabric references, artisanal batik, Swiss lawn, and festive mirror embroidery.'
                : 'আসল বাটিক, সুইস লন এবং উৎসবের মিরর এমব্রয়ডারিতে তৈরি বাংলাদেশের ঐতিহ্যবাহী থ্রি-পিস সংকলন।'}
            </p>
          </div>

          {/* Quick Stats & View Mode Segmented Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-1 bg-[#171719] border border-white/10 rounded-lg flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('flatlay')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === 'flatlay'
                    ? 'bg-[#F5F2EB] text-[#09090B] shadow'
                    : 'text-[#D8D3C9] hover:text-white'
                }`}
              >
                {language === 'en' ? 'Original Fabric' : 'আসল ফ্যাব্রিক'}
              </button>
              <button
                onClick={() => setViewMode('model')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  viewMode === 'model'
                    ? 'bg-[#F5F2EB] text-[#09090B] shadow'
                    : 'text-[#D8D3C9] hover:text-white'
                }`}
              >
                {language === 'en' ? 'Model / Detail' : 'মডেল / ডিটেইল'}
              </button>
            </div>

            {/* Launch Active 3D Studio Button */}
            {active3DItem && (
              <button
                onClick={() => setShow3DModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#B69A60]/20 to-[#756BFF]/20 border border-[#B69A60]/40 hover:border-[#B69A60] rounded-lg text-xs font-mono text-[#F5F2EB] hover:text-[#D5BA80] flex items-center gap-2 cursor-pointer transition-all shadow-md group"
              >
                <Box className="w-4 h-4 text-[#B69A60] group-hover:rotate-12 transition-transform" />
                <span>{language === 'en' ? '3D Fabric Studio' : '৩ডি ফ্যাব্রিক স্টুডিও'}</span>
              </button>
            )}

            {onOpenBrandPage && (
              <button
                onClick={onOpenBrandPage}
                className="px-4 py-2 rounded-lg bg-[#171719] border border-[#B69A60]/50 hover:bg-[#B69A60] text-[#D5BA80] hover:text-[#09090B] text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {language === 'en' ? "Fariza's Territory Page" : 'ফারিজাস টেরিটরি পেজ'}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Navigation Bar & Code Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-[#171719] border border-white/10 rounded-xl mb-10">
          {/* Edit Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {edits.map((edit) => (
              <button
                key={edit}
                onClick={() => setActiveSubEdit(edit)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                  activeSubEdit === edit
                    ? 'bg-[#B69A60] text-[#09090B] font-bold shadow-md'
                    : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                }`}
              >
                {edit === 'All' && language === 'bn' ? 'সকল' : edit}
              </button>
            ))}
          </div>

          {/* Search by Product Code */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-[#77777D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search code (e.g. CAT-001, ZSL-01)...' : 'কোড খুঁজুন (CAT-001)...'}
              className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
            />
          </div>
        </div>

        {/* Dynamic Counter Strip */}
        <div className="flex items-center justify-between text-xs font-mono text-[#77777D] uppercase tracking-wider mb-8 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span>{language === 'en' ? 'Showing' : 'দেখানো হচ্ছে'}</span>
            <span ref={counterRef} className="text-[#D5BA80] font-bold tabular-nums">
              {String(filteredItems.length).padStart(2, '0')}
            </span>
            <span>
              {language === 'en'
                ? `of ${liveThreePieceItems.length} Designs`
                : `টি (মোট ${liveThreePieceItems.length} ডিজাইন)`}
            </span>
          </div>
          <span className="tabular-nums">
            {language === 'en'
              ? `Price Range: ৳ ${minPrice.toLocaleString()} — ৳ ${maxPrice.toLocaleString()}`
              : `মূল্য: ৳ ${minPrice.toLocaleString()} — ৳ ${maxPrice.toLocaleString()}`}
          </span>
        </div>

        {/* 18-Product Responsive Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-white/10 bg-[#171719]/40">
            <p className="font-serif-luxury text-xl text-[#F5F2EB] mb-2">
              {language === 'en' ? 'No matching three-piece sets found' : 'কোনো থ্রি-পিস ডিজাইন পাওয়া যায়নি'}
            </p>
            <button
              onClick={() => {
                setActiveSubEdit('All');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-[#D5BA80] cursor-pointer"
            >
              {language === 'en' ? 'Reset Filters' : 'ফিল্টার রিসেট করুন'}
            </button>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => {
              const isWish = isWishlisted(item.id);
              const isJustAdded = addedItemCode === item.code;
              const isOutOfStock = item.status === 'out_of_stock' || item.stockCount <= 0;
              const displayImage = viewMode === 'flatlay' ? item.flatLayImage : item.modelImage;
              const mappedProduct = toProduct(item);

              return (
                <div
                  key={item.id}
                  onClick={() => onQuickView?.(mappedProduct)}
                  className={`tp-product-card group relative bg-[#171719] border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-xl ${
                    onQuickView ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Media Stage */}
                  <div className="relative aspect-[4/3] sm:aspect-[3/4] overflow-hidden bg-black/60">
                    <img
                      src={displayImage}
                      alt={item.nameEn}
                      loading="lazy"
                      className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out ${
                        isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                      }`}
                      referrerPolicy="no-referrer"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#09090B] bg-[#D5BA80] px-2.5 py-0.5 rounded shadow">
                          {item.code}
                        </span>
                        {isOutOfStock && (
                          <span className="font-mono text-[10px] font-semibold text-red-300 bg-black/85 border border-red-500/40 px-2 py-0.5 rounded">
                            {language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onQuickView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickView(mappedProduct);
                            }}
                            className="p-1.5 bg-black/70 hover:bg-black text-[#D8D3C9] hover:text-white rounded-full backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                            title={language === 'en' ? 'Quick View' : 'দ্রুত দেখুন'}
                            aria-label="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={(e) => handleLaunch3D(item, e)}
                          className="p-1.5 bg-black/70 hover:bg-black text-[#D5BA80] hover:text-white rounded-full backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
                          title={language === 'en' ? 'Inspect in 3D Studio' : '৩ডি স্টুডিওতে দেখুন'}
                          aria-label="Inspect in 3D Studio"
                        >
                          <Box className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(mappedProduct);
                          }}
                          className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                            isWish
                              ? 'bg-[#B69A60] text-[#09090B]'
                              : 'bg-black/50 text-[#D8D3C9] hover:text-white hover:bg-black/80'
                          }`}
                          aria-label="Wishlist toggle"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                    {/* Mode Label Tag */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-mono text-[#D8D3C9] bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                        {viewMode === 'flatlay'
                          ? language === 'en'
                            ? 'Original Fabric'
                            : 'আসল ফ্যাব্রিক'
                          : item.hasModelConcept === false
                          ? language === 'en'
                            ? 'Fabric Close-up'
                            : 'ফ্যাব্রিক ক্লোজ-আপ'
                          : language === 'en'
                          ? 'Model Concept'
                          : 'মডেল প্রিভিউ'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & 3-Piece Breakdown */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#B69A60] mb-1">
                        {item.brand || "Fariza's Territory"} · {item.subCollection}
                      </div>

                      <h3 className="font-serif-luxury text-xl text-[#F5F2EB] font-light group-hover:text-[#D5BA80] transition-colors mb-1">
                        {language === 'en' ? item.nameEn : item.nameBn}
                      </h3>

                      <p className="text-xs text-[#77777D] line-clamp-2 font-light mb-4">
                        {language === 'en' ? item.descriptionEn : item.descriptionBn}
                      </p>

                      {/* 3-Piece Detailed Specifications Box */}
                      <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-[11px] mb-4">
                        <div className="flex gap-2">
                          <span className="font-mono text-[#B69A60] shrink-0">KAMEEZ:</span>
                          <span className="text-[#D8D3C9] truncate">
                            {language === 'en' ? item.kameezEn : item.kameezBn}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-mono text-[#B69A60] shrink-0">SALWAR:</span>
                          <span className="text-[#D8D3C9] truncate">
                            {language === 'en' ? item.salwarEn : item.salwarBn}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-mono text-[#B69A60] shrink-0">DUPATTA:</span>
                          <span className="text-[#D8D3C9] truncate">
                            {language === 'en' ? item.dupattaEn : item.dupattaBn}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-mono text-lg text-[#F5F2EB] font-bold tabular-nums">
                          ৳ {item.priceBDT.toLocaleString()}
                        </div>
                        {item.priceNote && (
                          <div className="text-[9px] text-[#B69A60]">{item.priceNote}</div>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(item, e)}
                        disabled={isJustAdded || isOutOfStock}
                        className={`py-2 px-3.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          isOutOfStock
                            ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                            : isJustAdded
                            ? 'bg-[#B69A60] text-[#09090B] cursor-pointer'
                            : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] cursor-pointer'
                        }`}
                      >
                        {isOutOfStock ? (
                          <span>{language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}</span>
                        ) : isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'en' ? 'Added' : 'যুক্ত হয়েছে'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{language === 'en' ? 'Order Set' : 'অর্ডার করুন'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive 3D Fabric Studio Modal */}
      {show3DModal && active3DItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={close3D}
            className="fixed inset-0 bg-black/90"
          />

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
