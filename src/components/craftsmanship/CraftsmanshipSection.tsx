import React from 'react';
import { Compass, Feather, Scissors, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface CraftsmanshipSectionProps {
  language: Language;
}

export const CraftsmanshipSection: React.FC<CraftsmanshipSectionProps> = ({ language }) => {
  const t = translations[language];

  const pillars = [
    {
      icon: <Compass className="w-5 h-5" />,
      title: t.craft.pillar1Title,
      desc: t.craft.pillar1Desc,
    },
    {
      icon: <Scissors className="w-5 h-5" />,
      title: t.craft.pillar2Title,
      desc: t.craft.pillar2Desc,
    },
    {
      icon: <Feather className="w-5 h-5" />,
      title: t.craft.pillar3Title,
      desc: t.craft.pillar3Desc,
    },
  ];

  return (
    <section id="craft" className="scroll-mt-20 py-24 lg:py-32 bg-[#09090B] border-t border-white/5 relative overflow-hidden">
      {/* Background Motifs */}
      <div className="absolute inset-0 bg-jamdani-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Split: Story & Macro Textile Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          {/* Story Narrative (6 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B69A60] mb-3 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.craft.subtitle}</span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide mb-6 leading-tight text-balance">
              {t.craft.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#D8D3C9] font-light leading-relaxed mb-8">
              <p>{t.craft.storyP1}</p>
              <p>{t.craft.storyP2}</p>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-white/10 text-xs font-mono text-[#77777D] uppercase tracking-wider">
              <div>
                <span className="block text-lg font-serif-luxury text-[#F5F2EB] font-normal mb-0.5">Banani</span>
                <span>Dhaka Atelier</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block text-lg font-serif-luxury text-[#F5F2EB] font-normal mb-0.5">Batik &amp; Lawn</span>
                <span>Fariza&apos;s Edit</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block text-lg font-serif-luxury text-[#F5F2EB] font-normal mb-0.5">350 GSM</span>
                <span>StarKiT Fleece</span>
              </div>
            </div>
          </motion.div>

          {/* Textile Craft Showcase (6 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
              <img
                src="/assets/fariza/CAT-002_flat.jpg"
                alt="Fariza's Territory Wax-Resist Batik Textile Flat Lay"
                className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-60" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-xs text-[#D8D3C9] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#B69A60]">Authentic Textile</div>
                  <div className="font-serif-luxury text-sm text-[#F5F2EB]">Wax-Resist Emerald Teal Batik &amp; Tie-Dye</div>
                </div>
                <span className="text-[10px] font-mono text-[#77777D]">100% Combed Cotton</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3 Pillars of Bangladeshi Craftsmanship */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-xl bg-[#171719]/60 border border-white/10 hover:border-[#B69A60]/40 transition-colors will-change-transform"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#B69A60] mb-5">
                {pillar.icon}
              </div>
              <h3 className="font-serif-luxury text-xl text-[#F5F2EB] font-light mb-2">
                {pillar.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#77777D] leading-relaxed font-light">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
