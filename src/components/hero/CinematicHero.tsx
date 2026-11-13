import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, Sparkles, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { animate, createTimeline, stagger, svg } from 'animejs';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { Language } from '../../types';
import { translations } from '../../data/translations';
import { heroEditorialCampaign } from '../../assets/images';
import { AMBASSADOR_PORTRAIT } from '../../data/mockData';
import { HeroAtelierCanvas } from './HeroAtelierCanvas';

interface CinematicHeroProps {
  language: Language;
  onExploreCollections: () => void;
  onEnterLookbook: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  language,
  onExploreCollections,
  onEnterLookbook,
}) => {
  const t = translations[language];
  const sectionRef = useRef<HTMLElement>(null);
  const svgFrameRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shaderBoost, setShaderBoost] = useState<number>(1);

  // Scroll-linked GPU parallax on backdrop image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  // Interactive cursor magnetic spotlight (GPU transform + radial gradient)
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(42);
  const smoothX = useSpring(pointerX, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(pointerY, { stiffness: 120, damping: 24 });
  const spotlightBackground = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(620px circle at ${x}% ${y}%, rgba(213, 186, 128, 0.14), rgba(182, 154, 96, 0.04) 40%, transparent 72%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const yPct = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
    pointerX.set(xPct);
    pointerY.set(yPct);
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

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="scroll-mt-20 relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#09090B]"
    >
      {/* Optimized Hero Photo Layer with Scroll Depth Parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <picture className="block w-full h-full">
          <source
            media="(max-width: 767px)"
            srcSet="/assets/hero-editorial-v2-960.webp"
            type="image/webp"
          />
          <source
            media="(min-width: 768px)"
            srcSet="/assets/hero-editorial-v2-1920.webp"
            type="image/webp"
          />
          <img
            src={heroEditorialCampaign}
            alt="FABRICIAN by Style.CSS — Contemporary Editorial Campaign"
            className="w-full h-full object-cover object-[72%_20%] sm:object-[68%_22%] lg:object-center opacity-90"
            referrerPolicy="no-referrer"
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        {/* Layered luxury lighting scrims: deep editorial contrast on left wall, clear subject lighting on right */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/40 to-[#09090B]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/92 via-[#09090B]/55 lg:via-[#09090B]/35 to-transparent" />
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

      {/* Hero Foreground Content — Asymmetric Left Editorial Stage on Desktop */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 pt-24 pb-16">
        <motion.div
          ref={contentRef}
          style={{ y: contentY }}
          className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left flex flex-col items-center lg:items-start will-change-transform"
        >
          {/* Brand Luxury Woven Emblem & Signature */}
          <motion.div
            whileHover={{ scale: 1.04 }}
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
          <div className="hero-stagger inline-flex items-center gap-2 px-3.5 py-1 mb-6 border border-[#B69A60]/35 rounded-full bg-[#171719]/80 backdrop-blur-sm text-xs tracking-[0.24em] text-[#D5BA80] uppercase">
            <Sparkles className="w-3 h-3 text-[#B69A60]" />
            <span>{t.hero.campaignTag}</span>
            <span className="text-white/30">·</span>
            <span>{t.brand.origin}</span>
          </div>

          {/* Hero Headline */}
          <h1 className="hero-stagger font-serif-luxury text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] text-[#F5F2EB] font-light leading-[1.06] mb-6 text-balance drop-shadow-[0_6px_28px_rgba(0,0,0,0.65)]">
            {t.hero.headline}
          </h1>

          {/* Supporting Copy */}
          <p className="hero-stagger font-sans-modern text-sm sm:text-base md:text-lg text-[#E2DDD3] max-w-xl font-normal tracking-wide leading-relaxed mb-9 text-balance">
            {t.hero.subheadline}
          </p>

          {/* Call to Actions */}
          <div className="hero-stagger flex flex-col sm:flex-row items-center lg:items-start gap-4 w-full sm:w-auto">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onEnterLookbook}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] font-medium text-xs tracking-[0.2em] uppercase transition-colors duration-200 rounded cursor-pointer shadow-lg hover:shadow-black/60 flex items-center justify-center gap-2 group"
            >
              <span>{t.hero.secondaryCta}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExploreCollections}
              className="w-full sm:w-auto px-8 py-3.5 border border-white/25 hover:border-[#B69A60] text-[#F5F2EB] hover:text-[#D5BA80] font-medium text-xs tracking-[0.2em] uppercase transition-colors duration-200 rounded cursor-pointer hover:bg-white/5 backdrop-blur-sm"
            >
              {t.hero.primaryCta}
            </motion.button>
          </div>

          {/* Delicate Woven Thread Divider */}
          <div className="hero-thread-divider w-48 my-10 thread-line opacity-60 origin-center lg:origin-left" />

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

          {/* Compact Ambassador Badge (Mobile / Tablet) */}
          <button
            type="button"
            onClick={onEnterLookbook}
            className="hero-stagger lg:hidden mt-7 flex items-center gap-3 p-2.5 pr-4 rounded-xl bg-[#141418]/90 border border-[#B69A60]/40 backdrop-blur-md text-left cursor-pointer"
          >
            <img
              src={AMBASSADOR_PORTRAIT}
              alt="FABRICIAN & StarKiT Brand Ambassador"
              className="w-12 h-14 rounded-lg object-cover object-top shrink-0 border border-white/15"
            />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D5BA80]">
                {language === 'en' ? 'Official Brand Ambassador' : 'অফিশিয়াল ব্র্যান্ড অ্যাম্বাসেডর'}
              </div>
              <div className="font-serif-luxury text-sm text-[#F5F2EB]">
                StarKiT × FABRICIAN 2026
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Desktop Brand Ambassador Campaign Spotlight */}
      <motion.button
        type="button"
        onClick={onEnterLookbook}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        className="hidden lg:flex items-center gap-3.5 absolute bottom-16 right-8 z-20 p-2.5 pr-4 rounded-2xl bg-[#111115]/90 hover:bg-[#17171C]/95 border border-[#B69A60]/40 hover:border-[#D5BA80] backdrop-blur-md shadow-2xl text-left cursor-pointer transition-colors group"
      >
        <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-black">
          <img
            src={AMBASSADOR_PORTRAIT}
            alt="FABRICIAN & StarKiT Brand Ambassador"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="max-w-[190px]">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D5BA80] mb-0.5">
            {language === 'en' ? 'Brand Ambassador' : 'ব্র্যান্ড অ্যাম্বাসেডর'}
          </div>
          <div className="font-serif-luxury text-base text-[#F5F2EB] leading-snug">
            StarKiT × FABRICIAN
          </div>
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-[#9A9892] group-hover:text-[#D5BA80] transition-colors">
            <span>{language === 'en' ? 'Shop Lookbook' : 'লুকবুক দেখুন'}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </motion.button>

      {/* Discreet Atelier 3D Shader Intensity Control */}
      <button
        type="button"
        onClick={() => setShaderBoost((prev) => (prev === 1 ? 1.85 : prev === 1.85 ? 0.35 : 1))}
        className="hidden sm:flex items-center gap-1.5 absolute bottom-5 right-6 z-20 px-3 py-1.5 rounded-full bg-[#11141C]/85 border border-white/10 hover:border-[#B69A60]/40 text-[10px] font-mono uppercase tracking-wider text-[#9A9892] hover:text-[#D5BA80] transition-colors cursor-pointer"
        title="Cycle 3D Gold Weave Intensity"
      >
        <SlidersHorizontal className="w-3 h-3 text-[#B69A60]" />
        <span>
          {shaderBoost > 1.2 ? '3D Weave: Vivid' : shaderBoost < 0.6 ? '3D Weave: Subtle' : '3D Weave: Atelier'}
        </span>
      </button>
    </section>
  );
};
