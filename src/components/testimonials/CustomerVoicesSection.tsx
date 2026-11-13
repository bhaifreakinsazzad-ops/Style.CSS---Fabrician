import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  MapPin,
  Quote,
  Sparkles,
  Star,
} from 'lucide-react';
import { Language, Product } from '../../types';
import { useStoreData } from '../../context/StoreDataContext';
import { CUSTOMER_VOICES_DATA, CustomerVoiceBrand, CustomerVoiceEntry } from '../../data/customerVoicesData';
import { isFarizaItem, isStarKiTItem } from '../../services/metaPixel';

export type CustomerVoicesTheme = 'store' | 'fariza' | 'starkit';
export type CustomerVoicesScope = 'all' | CustomerVoiceBrand;

interface CustomerVoicesSectionProps {
  language: Language;
  onQuickView?: (product: Product) => void;
  onSelectBrand?: (brand: 'starkit' | 'farizas-territory') => void;
  brandScope?: CustomerVoicesScope;
  variant?: CustomerVoicesTheme;
  sectionId?: string;
}

export const CustomerVoicesSection: React.FC<CustomerVoicesSectionProps> = ({
  language,
  onQuickView,
  onSelectBrand,
  brandScope = 'all',
  variant = 'store',
  sectionId = 'customer-voices',
}) => {
  const { unifiedCatalog, approvedReviews } = useStoreData();
  const [activeFilter, setActiveFilter] = useState<'all' | CustomerVoiceBrand>(
    brandScope === 'all' ? 'all' : brandScope
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const effectiveFilter = brandScope === 'all' ? activeFilter : brandScope;

  const visibleEntries = useMemo<CustomerVoiceEntry[]>(() => {
    if (effectiveFilter === 'all') return CUSTOMER_VOICES_DATA;
    return CUSTOMER_VOICES_DATA.filter((entry) => entry.brand === effectiveFilter);
  }, [effectiveFilter]);

  const safeIndex = Math.min(selectedIndex, Math.max(0, visibleEntries.length - 1));
  const activeVoice = visibleEntries[safeIndex] || visibleEntries[0];

  // Match any live Firestore customer reviews belonging to the active brand scope
  const liveCommunityNotes = useMemo(() => {
    if (!approvedReviews.length) return [];
    return approvedReviews
      .map((rev) => {
        const matchedProduct = unifiedCatalog.find((p) => p.id === rev.productId);
        const brand: CustomerVoiceBrand = isStarKiTItem(
          rev.productId,
          matchedProduct?.nameEn,
          unifiedCatalog
        )
          ? 'StarKiT'
          : isFarizaItem(rev.productId, matchedProduct?.nameEn, unifiedCatalog)
          ? "Fariza's Territory"
          : matchedProduct?.brand === 'StarKiT'
          ? 'StarKiT'
          : "Fariza's Territory";

        return {
          ...rev,
          brand,
          matchedProduct,
        };
      })
      .filter((rev) => effectiveFilter === 'all' || rev.brand === effectiveFilter)
      .slice(0, 3);
  }, [approvedReviews, unifiedCatalog, effectiveFilter]);

  const resolveProductById = (productId: string): Product | undefined => {
    return unifiedCatalog.find((p) => p.id === productId);
  };

  const handleFilterChange = (next: 'all' | CustomerVoiceBrand) => {
    setActiveFilter(next);
    setSelectedIndex(0);
  };

  const handleStep = (delta: number) => {
    if (!visibleEntries.length) return;
    setSelectedIndex((prev) => (prev + delta + visibleEntries.length) % visibleEntries.length);
  };

  // Visual palette per theme variant
  const theme = useMemo(() => {
    if (variant === 'fariza') {
      return {
        sectionClass: 'bg-[#F0F2F5] text-[#050505] border-t border-[#050505]/12',
        eyebrowClass: 'text-[#0866FF]',
        headingFont: 'font-fariza-display font-bold tracking-tight text-[#050505]',
        subtextClass: 'text-[#4B5563]',
        cardClass: 'bg-white border border-[#050505]/12 shadow-sm',
        cardHoverClass: 'hover:border-[#0866FF] hover:shadow-md',
        selectedCardClass: 'border-[#0866FF] ring-2 ring-[#0866FF]/20 shadow-md',
        metaTextClass: 'text-[#4B5563]',
        quoteTextClass: 'text-[#1F2937]',
        accentTextClass: 'text-[#0866FF]',
        starFilledClass: 'fill-[#0866FF] text-[#0866FF]',
        starEmptyClass: 'text-[#050505]/15',
        checkClass: 'text-[#31A24C]',
        primaryBtnClass: 'bg-[#0866FF] hover:bg-[#0552D1] text-white',
        secondaryBtnClass:
          'bg-white hover:bg-[#050505] text-[#050505] hover:text-white border border-[#050505]/20',
        dividerClass: 'border-[#050505]/10',
        fallbackBgClass: 'bg-[#E4E8EE] text-[#050505]',
        noteCardClass: 'bg-white border border-[#050505]/10',
      };
    }

    if (variant === 'starkit') {
      return {
        sectionClass: 'bg-[#170000] text-white border-t-2 border-white/15',
        eyebrowClass: 'text-[#C7C1BF]',
        headingFont: 'font-starkit font-bold uppercase tracking-tight text-white',
        subtextClass: 'text-[#C7C1BF]',
        cardClass: 'bg-[#200505] border border-white/15',
        cardHoverClass: 'hover:border-white/55',
        selectedCardClass: 'border-white ring-1 ring-white/40 bg-[#260707]',
        metaTextClass: 'text-[#C7C1BF]',
        quoteTextClass: 'text-white/90',
        accentTextClass: 'text-white',
        starFilledClass: 'fill-white text-white',
        starEmptyClass: 'text-white/20',
        checkClass: 'text-white',
        primaryBtnClass: 'bg-white hover:bg-[#ECEAEA] text-[#170000]',
        secondaryBtnClass:
          'bg-transparent hover:bg-white text-white hover:text-[#170000] border border-white/30',
        dividerClass: 'border-white/12',
        fallbackBgClass: 'bg-[#170000] text-white',
        noteCardClass: 'bg-black/35 border border-white/15',
      };
    }

    // Default unified FABRICIAN luxury store theme
    return {
      sectionClass: 'bg-[#09090B] text-[#F5F2EB] border-t border-white/10',
      eyebrowClass: 'text-[#B69A60]',
      headingFont: 'font-serif-luxury font-light text-[#F5F2EB]',
      subtextClass: 'text-[#A1A1AA]',
      cardClass: 'bg-[#121215] border border-white/10',
      cardHoverClass: 'hover:border-[#B69A60]/50',
      selectedCardClass: 'border-[#B69A60] ring-1 ring-[#B69A60]/35 bg-[#16161B]',
      metaTextClass: 'text-[#9CA3AF]',
      quoteTextClass: 'text-[#D8D3C9]',
      accentTextClass: 'text-[#D5BA80]',
      starFilledClass: 'fill-[#B69A60] text-[#B69A60]',
      starEmptyClass: 'text-white/20',
      checkClass: 'text-emerald-400',
      primaryBtnClass: 'bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B]',
      secondaryBtnClass:
        'bg-white/5 hover:bg-white/12 text-[#F5F2EB] border border-white/15',
      dividerClass: 'border-white/10',
      fallbackBgClass: 'bg-[#17171A] text-[#D5BA80]',
      noteCardClass: 'bg-[#121215] border border-white/10',
    };
  }, [variant]);

  const activeMatchedProduct = activeVoice
    ? resolveProductById(activeVoice.productId)
    : undefined;

  return (
    <section id={sectionId} className={`scroll-mt-24 py-16 lg:py-24 ${theme.sectionClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header + Brand Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div
              className={`text-[11px] font-mono uppercase tracking-[0.26em] font-semibold flex items-center gap-2 ${theme.eyebrowClass}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {brandScope === "Fariza's Territory"
                  ? language === 'en'
                    ? "Customer Voices · Fariza's Territory Verified Community"
                    : 'ক্রেতাদের কথা · ফারিজাস টেরিটরি ভেরিফায়েড অভিজ্ঞতা'
                  : brandScope === 'StarKiT'
                  ? language === 'en'
                    ? 'Customer Voices · StarKiT Streetwear Wearers'
                    : 'ক্রেতাদের কথা · স্টারকিট স্ট্রিটওয়্যার রিভিউ'
                  : language === 'en'
                  ? "Customer Voices · Fariza's Territory & StarKiT"
                  : 'ক্রেতাদের কথা · ফারিজাস টেরিটরি ও স্টারকিট'}
              </span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl lg:text-5xl leading-[1.1] ${theme.headingFont}`}
              style={{ textWrap: 'balance' }}
            >
              {language === 'en'
                ? 'Worn Across Dhaka & Chattogram'
                : 'ঢাকা ও চট্টগ্রামের ক্রেতাদের বাস্তব অভিজ্ঞতা'}
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed max-w-xl ${theme.subtextClass}`}>
              {language === 'en'
                ? 'Unfiltered notes on Swiss lawn drape, wax-resist batik cuts, and 350 GSM fleece structure directly from verified deliveries.'
                : 'সুইস লন কাপড়ের মান, বাটিক প্রিন্ট ও ৩৫০ জিএসএম ফ্লিস ফিটিং নিয়ে ক্রেতাদের সরাসরি মতামত।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {brandScope === 'all' && (
              <div
                role="tablist"
                aria-label={language === 'en' ? 'Filter customer voices by brand' : 'ব্র্যান্ড অনুযায়ী রিভিউ দেখুন'}
                className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/10"
              >
                {(
                  [
                    { key: 'all', labelEn: 'All Voices', labelBn: 'সব ব্র্যান্ড' },
                    {
                      key: "Fariza's Territory",
                      labelEn: "Fariza's Territory",
                      labelBn: 'ফারিজাস টেরিটরি',
                    },
                    { key: 'StarKiT', labelEn: 'StarKiT', labelBn: 'স্টারকিট' },
                  ] as const
                ).map((tab) => {
                  const active = effectiveFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => handleFilterChange(tab.key)}
                      className={`min-h-[40px] px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-[#B69A60] text-[#09090B]'
                          : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {language === 'en' ? tab.labelEn : tab.labelBn}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Spotlight Step Controls */}
            {visibleEntries.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  aria-label={language === 'en' ? 'Previous customer story' : 'পূর্ববর্তী মতামত'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${theme.secondaryBtnClass}`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className={`text-xs font-mono tabular-nums px-1.5 ${theme.metaTextClass}`}>
                  0{safeIndex + 1} / 0{visibleEntries.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  aria-label={language === 'en' ? 'Next customer story' : 'পরবর্তী মতামত'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${theme.secondaryBtnClass}`}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lead Interactive Customer Spotlight */}
        {activeVoice && (
          <div className={`rounded-2xl overflow-hidden transition-all ${theme.cardClass}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Customer Portrait (strictly 3:4 matching generated image geometry) */}
              <div className="lg:col-span-5 relative aspect-[3/4] lg:aspect-auto lg:min-h-[460px] overflow-hidden bg-black/20">
                {brokenImages[activeVoice.id] ? (
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center p-8 text-center ${theme.fallbackBgClass}`}
                  >
                    <Quote className="w-8 h-8 mb-3 opacity-60" />
                    <div className="font-mono text-xs uppercase tracking-widest opacity-80">
                      {activeVoice.brand}
                    </div>
                    <div className="text-lg font-semibold mt-1">{activeVoice.author}</div>
                  </div>
                ) : (
                  <img
                    src={activeVoice.image}
                    alt={language === 'en' ? activeVoice.imageAltEn : activeVoice.imageAltBn}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [activeVoice.id]: true }))
                    }
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </div>

              {/* Customer Quote & Piece Link */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  {/* Unboxed Brand · Location · Rating Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div
                      className={`text-xs font-mono uppercase tracking-[0.18em] font-semibold flex flex-wrap items-center gap-2 ${theme.accentTextClass}`}
                    >
                      <span>{activeVoice.brand}</span>
                      <span className="opacity-40">·</span>
                      <span className="inline-flex items-center gap-1 normal-case tracking-normal font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {language === 'en' ? activeVoice.locationEn : activeVoice.locationBn}
                      </span>
                    </div>

                    <div className="flex items-center gap-1" aria-label={`${activeVoice.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= activeVoice.rating ? theme.starFilledClass : theme.starEmptyClass
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-mono tabular-nums opacity-80">
                        {activeVoice.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Pull-Quote Headline */}
                  <h3
                    className={`text-2xl sm:text-3xl leading-snug ${theme.headingFont}`}
                    style={{ textWrap: 'balance' }}
                  >
                    &ldquo;{language === 'en' ? activeVoice.highlightEn : activeVoice.highlightBn}&rdquo;
                  </h3>

                  {/* Full Authentic Quote */}
                  <p className={`text-sm sm:text-base leading-relaxed ${theme.quoteTextClass}`}>
                    {language === 'en' ? activeVoice.quoteEn : activeVoice.quoteBn}
                  </p>
                </div>

                {/* Purchase Specs + Actions Footer */}
                <div className={`pt-6 border-t ${theme.dividerClass} space-y-5`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>{activeVoice.author}</span>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${theme.checkClass}`} />
                      </div>
                      {/* Zero-pill metadata separated cleanly with dots */}
                      <div className={`text-xs font-mono mt-1 ${theme.metaTextClass}`}>
                        {language === 'en'
                          ? `${activeVoice.purchaseSpecEn} · ${activeVoice.fitNoteEn} · ${activeVoice.deliveredInEn}`
                          : `${activeVoice.purchaseSpecBn} · ${activeVoice.fitNoteBn} · ${activeVoice.deliveredInBn}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {activeMatchedProduct && onQuickView && (
                      <button
                        type="button"
                        onClick={() => onQuickView(activeMatchedProduct)}
                        className={`min-h-[42px] px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer ${theme.primaryBtnClass}`}
                      >
                        <span>
                          {language === 'en'
                            ? `Inspect ${activeMatchedProduct.nameEn.split(' ').slice(0, 3).join(' ')}`
                            : 'পোশাকটি দেখুন'}
                        </span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}

                    {onSelectBrand && brandScope === 'all' && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectBrand(
                            activeVoice.brand === 'StarKiT' ? 'starkit' : 'farizas-territory'
                          )
                        }
                        className={`min-h-[42px] px-5 py-2.5 rounded-xl text-xs font-mono font-semibold uppercase tracking-wider inline-flex items-center gap-2 transition-colors cursor-pointer ${theme.secondaryBtnClass}`}
                      >
                        <span>
                          {language === 'en'
                            ? `Explore ${activeVoice.brand}`
                            : `${activeVoice.brand} দেখুন`}
                        </span>
                      </button>
                    )}

                    <span className={`text-xs font-mono ${theme.metaTextClass}`}>
                      {language === 'en' ? activeVoice.productLabelEn : activeVoice.productLabelBn}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portrait Gallery Grid (Synced Selector Cards) */}
        <div
          className={`grid gap-5 ${
            visibleEntries.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {visibleEntries.map((entry, idx) => {
            const isSelected = idx === safeIndex;
            const linkedProduct = resolveProductById(entry.productId);

            return (
              <div
                key={entry.id}
                className={`group rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
                  theme.cardClass
                } ${isSelected ? theme.selectedCardClass : theme.cardHoverClass}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className="text-left w-full flex-1 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/20">
                    {brokenImages[`thumb-${entry.id}`] ? (
                      <div
                        className={`w-full h-full flex items-center justify-center p-6 text-center font-mono text-xs ${theme.fallbackBgClass}`}
                      >
                        {entry.author} · {entry.brand}
                      </div>
                    ) : (
                      <img
                        src={entry.image}
                        alt={language === 'en' ? entry.imageAltEn : entry.imageAltBn}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [`thumb-${entry.id}`]: true,
                          }))
                        }
                        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    )}
                  </div>

                  <div className="p-4 sm:p-5 space-y-2.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${theme.accentTextClass}`}
                      >
                        {entry.brand}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums opacity-85">
                        <Star className={`w-3.5 h-3.5 ${theme.starFilledClass}`} />
                        {entry.rating.toFixed(1)}
                      </span>
                    </div>

                    <p className="text-sm font-medium leading-snug line-clamp-2">
                      &ldquo;{language === 'en' ? entry.highlightEn : entry.highlightBn}&rdquo;
                    </p>

                    <div className={`text-xs font-mono ${theme.metaTextClass}`}>
                      {entry.author} · {language === 'en' ? entry.locationEn : entry.locationBn}
                    </div>
                  </div>
                </button>

                {linkedProduct && onQuickView && (
                  <div className={`px-4 sm:px-5 py-3 border-t ${theme.dividerClass} flex items-center justify-between gap-2`}>
                    <span className={`text-[11px] font-mono truncate ${theme.metaTextClass}`}>
                      ৳{linkedProduct.priceBDT.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuickView(linkedProduct)}
                      className={`min-h-[36px] text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-opacity hover:opacity-80 cursor-pointer ${theme.accentTextClass}`}
                    >
                      <span>{language === 'en' ? 'Shop Look' : 'কিনুন'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Firestore Customer Reviews Feed (renders when store buyers have submitted approved reviews) */}
        {liveCommunityNotes.length > 0 && (
          <div className={`pt-8 border-t ${theme.dividerClass} space-y-4`}>
            <div className="flex items-baseline justify-between gap-4">
              <div className={`text-xs font-mono uppercase tracking-[0.2em] font-semibold ${theme.accentTextClass}`}>
                {language === 'en' ? 'Recent Verified Store Reviews' : 'সাম্প্রতিক ক্রেতা মতামত'}
              </div>
              <span className={`text-xs font-mono tabular-nums ${theme.metaTextClass}`}>
                {liveCommunityNotes.length} {language === 'en' ? 'live entries' : 'টি লাইভ রিভিউ'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveCommunityNotes.map((rev) => (
                <div
                  key={rev.id}
                  className={`p-4 rounded-xl space-y-2 ${theme.noteCardClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${theme.accentTextClass}`}>
                      {rev.brand}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= rev.rating ? theme.starFilledClass : theme.starEmptyClass
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-semibold line-clamp-1">{rev.title}</div>
                  <p className={`text-xs leading-relaxed line-clamp-3 ${theme.quoteTextClass}`}>
                    {rev.comment}
                  </p>
                  <div className={`pt-2 border-t ${theme.dividerClass} flex items-center justify-between text-[11px] font-mono ${theme.metaTextClass}`}>
                    <span>{rev.author} · {rev.location}</span>
                    {rev.matchedProduct && onQuickView && (
                      <button
                        type="button"
                        onClick={() => onQuickView(rev.matchedProduct!)}
                        className={`font-bold underline cursor-pointer ${theme.accentTextClass}`}
                      >
                        {language === 'en' ? 'View' : 'দেখুন'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
