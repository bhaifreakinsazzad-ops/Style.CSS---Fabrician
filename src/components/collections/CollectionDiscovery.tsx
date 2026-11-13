import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { COLLECTIONS } from '../../data/mockData';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface CollectionDiscoveryProps {
  language: Language;
  onSelectCategory: (category: string) => void;
  onSelectBrand?: (brandRoute: 'starkit' | 'farizas-territory') => void;
}

export const CollectionDiscovery: React.FC<CollectionDiscoveryProps> = ({
  language,
  onSelectCategory,
  onSelectBrand,
}) => {
  const t = translations[language];

  return (
    <section id="collections" className="scroll-mt-20 py-20 lg:py-28 bg-[#09090B] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B69A60] mb-2 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.collections.kicker}</span>
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide mb-4">
            {t.collections.title}
          </h2>
          <div className="w-24 mx-auto thread-line opacity-50" />
        </motion.div>

        {/* Asymmetrical Collection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLLECTIONS.map((col, idx) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() =>
                onSelectBrand ? onSelectBrand(col.brandRoute) : onSelectCategory(col.category)
              }
              className={`group relative rounded-xl overflow-hidden bg-[#171719] border transition-colors duration-300 cursor-pointer flex flex-col justify-end aspect-[3/4] p-6 shadow-xl will-change-transform ${
                col.brand === "Fariza's Territory"
                  ? 'border-[#0866FF]/45 hover:border-[#0866FF]'
                  : 'border-white/25 hover:border-white'
              }`}
            >
              {/* Image with subtle zoom on hover */}
              <img
                src={col.image}
                alt={col.nameEn}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-black/20 group-hover:via-[#09090B]/40 transition-colors" />

              {/* Card Content */}
              <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#D8D3C9] tracking-widest border border-white/10 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    0{idx + 1}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white transition-colors ${
                      col.brand === "Fariza's Territory"
                        ? 'group-hover:bg-[#0866FF] group-hover:text-white'
                        : 'group-hover:bg-white group-hover:text-[#170000]'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div
                    className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-1 ${
                      col.brand === "Fariza's Territory" ? 'text-[#60A5FA]' : 'text-[#FFFFFF]'
                    }`}
                  >
                    {col.brand} · /{col.brandRoute}
                  </div>
                  <h3 className="font-serif-luxury text-2xl text-[#F5F2EB] font-light group-hover:text-white transition-colors mb-1">
                    {language === 'en' ? col.nameEn : col.nameBn}
                  </h3>
                  <p className="text-xs text-[#D8D3C9] font-light leading-relaxed mb-3">
                    {language === 'en' ? col.subtitleEn : col.subtitleBn}
                  </p>
                  <div className="text-[11px] font-mono text-[#B69A60] tracking-wider uppercase flex items-center justify-between">
                    <span>
                      {col.count} {t.collections.itemsCount}
                    </span>
                    <span className="text-[#D8D3C9] group-hover:text-[#D5BA80]">
                      {language === 'en' ? 'Showcase →' : 'শোরুম →'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
