import React from 'react';
import { ArrowDown, Sparkles, ChevronRight } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../data/translations';

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

  return (
    <section id="hero" className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#09090B]">
      {/* Background Image Layer with Editorial Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_model_campaign_1794372400425.jpg"
          alt="FABRICIAN Luxury Fashion Campaign"
          className="w-full h-full object-cover object-center lg:object-top opacity-60 scale-100 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
          fetchPriority="high"
        />
        {/* Layered luxury lighting scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-[#09090B]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/80 via-transparent to-[#09090B]/80" />
        <div className="absolute inset-0 bg-jamdani-pattern opacity-30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16 flex flex-col items-center">
        {/* Brand Luxury Woven Emblem */}
        <div className="mb-5 flex flex-col items-center">
          <img
            src="/assets/aistudio/Untitled_design_a468bd14.png"
            alt="Fabrician Master Emblem"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_10px_25px_rgba(182,154,96,0.35)] transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Quiet Brand Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-[#B69A60]/30 rounded-full bg-[#171719]/60 backdrop-blur-sm text-xs tracking-[0.25em] text-[#D5BA80] uppercase">
          <Sparkles className="w-3 h-3 text-[#B69A60]" />
          <span>{t.hero.campaignTag}</span>
          <span className="text-white/30">·</span>
          <span>{t.brand.origin}</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.1em] text-[#F5F2EB] font-light leading-[1.08] max-w-4xl mb-6 text-balance">
          {t.hero.headline}
        </h1>

        {/* Supporting Copy */}
        <p className="font-sans-modern text-sm sm:text-base md:text-lg text-[#D8D3C9] max-w-2xl font-normal tracking-wide leading-relaxed mb-10 text-balance">
          {t.hero.subheadline}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onEnterLookbook}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 rounded cursor-pointer shadow-lg hover:shadow-black/60 flex items-center justify-center gap-2 group"
          >
            <span>{t.hero.secondaryCta}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onExploreCollections}
            className="w-full sm:w-auto px-8 py-3.5 border border-white/20 hover:border-[#B69A60] text-[#F5F2EB] hover:text-[#D5BA80] font-medium text-xs tracking-[0.2em] uppercase transition-all duration-200 rounded cursor-pointer hover:bg-white/5 backdrop-blur-sm"
          >
            {t.hero.primaryCta}
          </button>
        </div>

        {/* Delicate Woven Thread Divider */}
        <div className="w-48 my-12 thread-line opacity-60" />

        {/* Scroll Discovery Indicator */}
        <div className="flex flex-col items-center gap-2 text-xs text-[#77777D] tracking-[0.2em] uppercase">
          <span>{t.hero.scrollHint}</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#B69A60]" />
        </div>
      </div>
    </section>
  );
};
