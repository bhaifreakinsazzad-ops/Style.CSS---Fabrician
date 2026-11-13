import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  ShoppingBag,
  Eye,
  Check,
  Layers,
} from 'lucide-react';
import { animate, createTimeline, stagger, svg } from 'animejs';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { CartItem, Language, Product } from '../../types';
import { translations } from '../../data/translations';
import { AMBASSADOR_PORTRAIT } from '../../data/mockData';
import { useStoreData } from '../../context/StoreDataContext';
import { HeroAtelierCanvas } from './HeroAtelierCanvas';

interface CinematicHeroProps {
  language: Language;
  onExploreCollections: () => void;
  onEnterLookbook: () => void;
  onAddToCart?: (item: Omit<CartItem, 'id'>) => void;
  onQuickView?: (product: Product) => void;
}

interface PortraitHotspot {
  id: string;
  indexLabel: string;
  x: number;
  y: number;
  kickerEn: string;
  kickerBn: string;
  titleEn: string;
  titleBn: string;
  specEn: string;
  specBn: string;
  productId: string;
  priceBDT: number;
}

const PORTRAIT_HOTSPOTS: PortraitHotspot[] = [
  {
    id: 'overshirt',
    indexLabel: '01',
    x: 68,
    y: 56,
    kickerEn: 'Signature Outerwear · StarKiT × FABRICIAN',
    kickerBn: 'সিগনেচার আউটারওয়্যার · স্টারকিট × ফেব্রিসিয়ান',
    titleEn: 'Noir Heavyweight Atelier Overshirt & Fleece',
    titleBn: 'নয়ার হেভিওয়েট আতেলিয়ে ওভারশার্ট ও ফ্লিস',
    specEn: '350 GSM Brushed Cotton · Relaxed Drop-Shoulder Cut',
    specBn: '৩৫০ জিএসএম ব্রাশড কটন · রিল্যাক্সড ফিট',
    productId: 'FAB-H003',
    priceBDT: 1500,
  },
  {
    id: 'portrait',
    indexLabel: '02',
    x: 51,
    y: 25,
    kickerEn: '2026 Flagship Face · Dhaka Studio',
    kickerBn: '২০২৬ ফ্ল্যাগশিপ ক্যাম্পেইন · ঢাকা স্টুডিও',
    titleEn: 'Official Brand Ambassador Direction',
    titleBn: 'অফিশিয়াল ব্র্যান্ড অ্যাম্বাসেডর ক্যাম্পেইন',
    specEn: 'Octabox Studio Key-Light · Tortoiseshell Frame Styling',
    specBn: 'অক্টাবক্স স্টুডিও লাইটিং · সিগনেচার লুক',
    productId: 'FAB-H007',
    priceBDT: 1500,
  },
  {
    id: 'cuff',
    indexLabel: '03',
    x: 34,
    y: 78,
    kickerEn: 'Sartorial Detail · Nocturnal Capsule',
    kickerBn: 'সার্টোরিয়াল ডিটেইল · নকটার্নাল ক্যাপসুল',
    titleEn: 'Rolled-Cuff Matte Obsidian Ensemble',
    titleBn: 'রোলড-কাফ ম্যাট অবসিডিয়ান এডিশন',
    specEn: 'Architectural Stitch · Paired with White Combed Tee',
    specBn: 'আর্কিটেকচারাল স্টিচ · প্রিমিয়াম কটন টি',
    productId: 'FAB-H009',
    priceBDT: 1500,
  },
];

type StudioMood = 'atelier' | 'spotlight' | 'runway';

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  language,
  onExploreCollections,
  onEnterLookbook,
  onAddToCart,
  onQuickView,
}) => {
  const t = translations[language];
  const { unifiedCatalog } = useStoreData();
  const sectionRef = useRef<HTMLElement>(null);
  const svgFrameRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [studioMood, setStudioMood] = useState<StudioMood>('atelier');
  const [activeHotspotId, setActiveHotspotId] = useState<string>('overshirt');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const shaderBoost = studioMood === 'spotlight' ? 1.85 : studioMood === 'runway' ? 0.55 : 1.15;

  // Scroll-linked GPU parallax on backdrop image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  // Interactive cursor magnetic spotlight (GPU transform + radial gradient)
  const pointerX = useMotionValue(62);
  const pointerY = useMotionValue(42);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24 });

  // 3D Portrait Card Tilt Motion Values
  const cardRotateX = useSpring(useTransform(smoothY, [0, 100], [5, -5]), {
    stiffness: 150,
    damping: 22,
  });
  const cardRotateY = useSpring(useTransform(smoothX, [0, 100], [-6, 6]), {
    stiffness: 150,
    damping: 22,
  });

  const spotlightBackground = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(680px circle at ${x}% ${y}%, rgba(213, 186, 128, 0.18), rgba(182, 154, 96, 0.05) 42%, transparent 74%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const yPct = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
    pointerX.set(xPct);
    pointerY.set(yPct);
  };

  const handleMouseLeave = () => {
    pointerX.set(62);
    pointerY.set(42);
  };

  // Anime.js v4 choreographed timeline + SVG thread line drawing
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tl = createTimeline({
      defaults: { ease: 'outCubic', duration: 750 },
    });

    if (svgFrameRef.current) {
      const paths = svgFrameRef.current.querySelectorAll('.hero-loom-stroke');
      if (paths.length > 0) {
        tl.add(svg.createDrawable(paths), {
          draw: ['0 0', '0 1'],
          duration: 1300,
          delay: stagger(140),
          ease: 'inOutQuad',
        });
      }
    }

    if (contentRef.current) {
      const items = contentRef.current.querySelectorAll('.hero-stagger');
      if (items.length > 0) {
        tl.add(
          items,
          {
            opacity: [0, 1],
            translateY: [22, 0],
            delay: stagger(85),
            duration: 720,
            ease: 'outExpo',
          },
          '-=950'
        );
      }

      const divider = contentRef.current.querySelector('.hero-thread-divider');
      if (divider) {
        animate(divider, {
          scaleX: [0, 1],
          opacity: [0, 0.7],
          duration: 900,
          delay: 520,
          ease: 'outExpo',
        });
      }
    }
  }, [language]);

  const activeHotspot =
    PORTRAIT_HOTSPOTS.find((h) => h.id === activeHotspotId) || PORTRAIT_HOTSPOTS[0];

  const matchedProduct = unifiedCatalog.find((p) => p.id === activeHotspot.productId);

  const handleQuickAddHotspot = () => {
    if (!onAddToCart) {
      onEnterLookbook();
      return;
    }
    const targetPrice = matchedProduct ? matchedProduct.priceBDT : activeHotspot.priceBDT;
    const targetNameEn = matchedProduct ? matchedProduct.nameEn : activeHotspot.titleEn;
    const targetNameBn = matchedProduct ? matchedProduct.nameBn : activeHotspot.titleBn;
    onAddToCart({
      productId: activeHotspot.productId,
      nameEn: targetNameEn,
      nameBn: targetNameBn,
      priceBDT: targetPrice,
      image: AMBASSADOR_PORTRAIT,
      color: 'Obsidian Black',
      size: 'L',
      quantity: 1,
    });
    setJustAddedId(activeHotspot.id);
    setTimeout(() => setJustAddedId(null), 1600);
  };

  const handleInspectHotspot = () => {
    if (onQuickView && matchedProduct) {
      onQuickView({
        ...matchedProduct,
        image: AMBASSADOR_PORTRAIT,
      });
    } else {
      onEnterLookbook();
    }
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="scroll-mt-20 relative min-h-[94vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#09090B]"
    >
      {/* Full-Bleed Atmospheric Portrait Backdrop with Scroll Depth Parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        {/* Ambient blurred studio aura fill */}
        <img
          src={AMBASSADOR_PORTRAIT}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-center scale-110 blur-2xl opacity-35"
          decoding="async"
        />

        {/* Crisp right-aligned architectural campaign backdrop */}
        <img
          src={AMBASSADOR_PORTRAIT}
          alt="FABRICIAN by Style.CSS — Official Brand Ambassador Campaign"
          className={`w-full h-full object-cover object-[center_18%] lg:object-[75%_18%] transition-all duration-700 ${
            studioMood === 'spotlight'
              ? 'opacity-45 contrast-125'
              : studioMood === 'runway'
              ? 'opacity-30 saturate-110'
              : 'opacity-35'
          }`}
          fetchPriority="high"
          decoding="async"
        />

        {/* Layered luxury lighting scrims for crisp typographic contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-[#09090B]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/85 lg:via-[#09090B]/70 to-[#09090B]/30" />
        <div className="absolute inset-0 bg-jamdani-pattern opacity-20" />
      </motion.div>

      {/* Three.js Custom GLSL Shader Jamdani Gold Warp-Weft & Particle Layer */}
      <HeroAtelierCanvas intensity={shaderBoost} />

      {/* Pointer Magnetic Light Gradient */}
      <motion.div
        aria-hidden="true"
        style={{ background: spotlightBackground }}
        className="absolute inset-0 z-[2] pointer-events-none"
      />

      {/* Anime.js SVG Geometric Jamdani Architectural Filigree Frame */}
      <svg
        ref={svgFrameRef}
        aria-hidden="true"
        viewBox="0 0 1200 720"
        preserveAspectRatio="none"
        className="absolute inset-4 sm:inset-8 lg:inset-10 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] lg:w-[calc(100%-5rem)] h-[calc(100%-2rem)] sm:h-[calc(100%-4rem)] lg:h-[calc(100%-5rem)] z-[3] pointer-events-none opacity-45"
        fill="none"
      >
        <path
          className="hero-loom-stroke"
          d="M 24 90 L 24 24 L 90 24"
          stroke="#D5BA80"
          strokeWidth="1.25"
        />
        <path
          className="hero-loom-stroke"
          d="M 1110 24 L 1176 24 L 1176 90"
          stroke="#D5BA80"
          strokeWidth="1.25"
        />
        <path
          className="hero-loom-stroke"
          d="M 24 630 L 24 696 L 90 696"
          stroke="#D5BA80"
          strokeWidth="1.25"
        />
        <path
          className="hero-loom-stroke"
          d="M 1110 696 L 1176 696 L 1176 630"
          stroke="#D5BA80"
          strokeWidth="1.25"
        />
        <path
          className="hero-loom-stroke"
          d="M 600 18 L 614 32 L 600 46 L 586 32 Z"
          stroke="#B69A60"
          strokeWidth="1"
        />
      </svg>

      {/* Main Split Editorial Stage: Left Story & Controls / Right Interactive 3D Ambassador Portrait */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Brand Editorial Manifesto & Interactive Controls */}
          <motion.div
            ref={contentRef}
            style={{ y: contentY }}
            className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start will-change-transform"
          >
            {/* Brand Luxury Woven Emblem & Signature */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="hero-stagger mb-5 flex items-center gap-3.5"
            >
              <img
                src="/assets/aistudio/Untitled_design_a468bd14.png"
                alt="Fabrician Master Emblem"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_10px_25px_rgba(182,154,96,0.38)]"
              />
              <div className="text-left">
                <div className="font-serif-luxury text-lg sm:text-xl tracking-[0.22em] text-[#F5F2EB] uppercase leading-none">
                  FABRICIAN
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-serif-luxury italic text-[#D5BA80] tracking-[0.16em]">
                  <span className="inline-block w-5 h-px bg-[#B69A60]/70" />
                  <span>by Style.CSS</span>
                </div>
              </div>
            </motion.div>

            {/* Quiet Brand Kicker */}
            <div className="hero-stagger inline-flex items-center gap-2 px-3.5 py-1 mb-5 border border-[#B69A60]/35 rounded-full bg-[#171719]/85 backdrop-blur-sm text-xs tracking-[0.22em] text-[#D5BA80] uppercase">
              <Sparkles className="w-3 h-3 text-[#B69A60]" />
              <span>{t.hero.campaignTag}</span>
              <span className="text-white/30">·</span>
              <span>{t.brand.origin}</span>
            </div>

            {/* Hero Headline */}
            <h1 className="hero-stagger font-serif-luxury text-4xl sm:text-5xl md:text-6xl xl:text-7xl tracking-[0.07em] text-[#F5F2EB] font-light leading-[1.05] mb-5 text-balance drop-shadow-[0_6px_28px_rgba(0,0,0,0.65)]">
              {t.hero.headline}
            </h1>

            {/* Supporting Copy */}
            <p className="hero-stagger font-sans-modern text-sm sm:text-base md:text-lg text-[#E2DDD3] max-w-xl font-normal tracking-wide leading-relaxed mb-8 text-balance">
              {t.hero.subheadline}
            </p>

            {/* Call to Actions */}
            <div className="hero-stagger flex flex-col sm:flex-row items-center lg:items-start gap-3.5 w-full sm:w-auto">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onEnterLookbook}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] font-semibold text-xs tracking-[0.2em] uppercase transition-colors duration-200 rounded-lg cursor-pointer shadow-xl flex items-center justify-center gap-2 group"
              >
                <span>{t.hero.secondaryCta}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={onExploreCollections}
                className="w-full sm:w-auto px-7 py-3.5 border border-white/25 hover:border-[#B69A60] text-[#F5F2EB] hover:text-[#D5BA80] font-medium text-xs tracking-[0.2em] uppercase transition-colors duration-200 rounded-lg cursor-pointer hover:bg-white/5 backdrop-blur-sm"
              >
                {t.hero.primaryCta}
              </motion.button>
            </div>

            {/* Interactive Studio Lighting & Hotspot Selector Strip */}
            <div className="hero-stagger mt-8 p-2 rounded-xl bg-[#131317]/90 border border-white/10 backdrop-blur-md flex flex-wrap items-center gap-2">
              <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#B69A60] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" />
                <span>{language === 'en' ? 'Atelier Stage:' : 'স্টুডিও মোড:'}</span>
              </span>
              {(
                [
                  { id: 'atelier', labelEn: 'Warm Gold Key', labelBn: 'গোল্ড লাইট' },
                  { id: 'spotlight', labelEn: 'Nocturnal Contrast', labelBn: 'নকটার্নাল' },
                  { id: 'runway', labelEn: 'Runway Softbox', labelBn: 'রানওয়ে' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setStudioMood(mode.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                    studioMood === mode.id
                      ? 'bg-[#B69A60] text-[#09090B] font-semibold shadow'
                      : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {language === 'en' ? mode.labelEn : mode.labelBn}
                </button>
              ))}
            </div>

            {/* Delicate Woven Thread Divider */}
            <div className="hero-thread-divider w-48 my-7 thread-line opacity-60 origin-center lg:origin-left" />

            {/* Scroll Discovery Indicator */}
            <motion.button
              type="button"
              onClick={onEnterLookbook}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="hero-stagger flex items-center gap-2.5 text-xs text-[#9E9B95] hover:text-[#D5BA80] transition-colors tracking-[0.2em] uppercase cursor-pointer"
            >
              <span>{t.hero.scrollHint}</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#B69A60]" />
            </motion.button>
          </motion.div>

          {/* Right Column: Interactive 3D-Tilt Editorial Portrait Stage with Shoppable Hotspots */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <motion.div
              style={{
                rotateX: cardRotateX,
                rotateY: cardRotateY,
                transformPerspective: 1100,
              }}
              className="relative w-full max-w-[440px] rounded-2xl p-2.5 bg-gradient-to-b from-[#B69A60]/40 via-white/10 to-[#B69A60]/25 shadow-[0_28px_80px_rgba(0,0,0,0.85)] will-change-transform"
            >
              {/* Inner Portrait Frame */}
              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#101014] border border-white/15">
                <img
                  src={AMBASSADOR_PORTRAIT}
                  alt="FABRICIAN Official Brand Ambassador"
                  className={`w-full h-full object-cover object-top transition-all duration-700 ${
                    studioMood === 'spotlight'
                      ? 'contrast-110 brightness-105'
                      : studioMood === 'runway'
                      ? 'saturate-110'
                      : ''
                  }`}
                  fetchPriority="high"
                />

                {/* Subtle Luxury Vignette & Bottom Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/95 via-transparent to-black/20 pointer-events-none" />

                {/* Top Editorial Frame Header Badge */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#B69A60]/45 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rotate-45 bg-[#B69A60]" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#F5F2EB]">
                      {language === 'en' ? 'Brand Ambassador · Editorial' : 'ব্র্যান্ড অ্যাম্বাসেডর'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[10px] font-mono text-[#D5BA80] tabular-nums">
                    2026 EDIT
                  </span>
                </div>

                {/* Interactive Sartorial Hotspot Pins on the Portrait */}
                {PORTRAIT_HOTSPOTS.map((spot) => {
                  const isSelected = spot.id === activeHotspot.id;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => setActiveHotspotId(spot.id)}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#B69A60] text-[#09090B] ring-4 ring-[#B69A60]/40 scale-110 shadow-xl'
                          : 'bg-black/80 text-[#F5F2EB] border border-[#D5BA80]/60 hover:bg-[#B69A60] hover:text-[#09090B] hover:scale-110'
                      }`}
                      aria-label={`Inspect ${spot.titleEn}`}
                    >
                      <span className="font-mono text-[10px] font-bold tabular-nums">
                        {spot.indexLabel}
                      </span>
                    </button>
                  );
                })}

                {/* Active Hotspot Interactive Shoppable Glass Card Overlay */}
                <div className="absolute bottom-3 left-3 right-3 z-20">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeHotspot.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="p-3.5 rounded-xl bg-[#0D0E12]/92 backdrop-blur-xl border border-[#B69A60]/45 shadow-2xl"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#D5BA80]">
                            {activeHotspot.indexLabel} ·{' '}
                            {language === 'en' ? activeHotspot.kickerEn : activeHotspot.kickerBn}
                          </div>
                          <h3 className="font-serif-luxury text-base sm:text-lg text-[#F5F2EB] leading-snug">
                            {language === 'en' ? activeHotspot.titleEn : activeHotspot.titleBn}
                          </h3>
                        </div>
                        <span className="font-mono text-sm font-bold text-[#D5BA80] shrink-0 tabular-nums">
                          ৳{' '}
                          {(matchedProduct
                            ? matchedProduct.priceBDT
                            : activeHotspot.priceBDT
                          ).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#9A9892] mb-3">
                        {language === 'en' ? activeHotspot.specEn : activeHotspot.specBn}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                        {/* Hotspot Switcher Pills */}
                        <div className="flex items-center gap-1">
                          {PORTRAIT_HOTSPOTS.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => setActiveHotspotId(h.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer tabular-nums ${
                                h.id === activeHotspot.id
                                  ? 'bg-[#B69A60] text-[#09090B] font-bold'
                                  : 'bg-white/5 text-[#D8D3C9] hover:bg-white/15'
                              }`}
                            >
                              {h.indexLabel}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleInspectHotspot}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5F2EB] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-[#D5BA80]" />
                            <span>{language === 'en' ? 'Inspect' : 'দেখুন'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleQuickAddHotspot}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              justAddedId === activeHotspot.id
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B]'
                            }`}
                          >
                            {justAddedId === activeHotspot.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>{language === 'en' ? 'Added' : 'যুক্ত'}</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                <span>{language === 'en' ? 'Shop Look' : 'কিনুন'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Interactive Caption Bar Below Portrait */}
            <div className="mt-3 flex items-center justify-between w-full max-w-[440px] px-2 text-[11px] font-mono text-[#9A9892]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>
                  {language === 'en'
                    ? 'Tap pins 01–03 on portrait to shop'
                    : 'ছবির ০১–০৩ পিনে ক্লিক করে অর্ডার করুন'}
                </span>
              </span>
              <button
                type="button"
                onClick={onEnterLookbook}
                className="text-[#D5BA80] hover:text-white underline cursor-pointer"
              >
                {language === 'en' ? 'Full Lookbook →' : 'সম্পূর্ণ লুকবুক →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
