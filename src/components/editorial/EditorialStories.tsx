import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, X } from 'lucide-react';
import { EDITORIAL_ARTICLES } from '../../data/mockData';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface EditorialStoriesProps {
  language: Language;
}

type EditorialArticle = (typeof EDITORIAL_ARTICLES)[number];

export const EditorialStories: React.FC<EditorialStoriesProps> = ({ language }) => {
  const [activeArticle, setActiveArticle] = useState<EditorialArticle | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (!activeArticle) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveArticle(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeArticle]);

  return (
    <section
      id="editorial"
      className="scroll-mt-20 py-20 lg:py-24 bg-[#09090B] border-t border-white/5 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#B69A60] mb-2 font-medium">
              {t.editorial.kicker}
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl font-light text-[#F5F2EB] tracking-wide">
              {t.editorial.title}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EDITORIAL_ARTICLES.map((article) => (
            <article
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="p-8 rounded-xl bg-[#171719]/40 border border-white/10 hover:border-[#B69A60]/40 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-3 text-xs text-[#77777D] font-mono uppercase tracking-wider mb-4">
                  <span>{article.tag}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                  <span>·</span>
                  <span>{article.date}</span>
                </div>

                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EB] font-light leading-snug group-hover:text-[#D5BA80] transition-colors mb-4">
                  {language === 'en' ? article.titleEn : article.titleBn}
                </h3>

                <p className="text-xs sm:text-sm text-[#D8D3C9] leading-relaxed font-light mb-6">
                  {language === 'en' ? article.snippetEn : article.snippetBn}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#B69A60] group-hover:text-[#D5BA80]">
                <span className="uppercase tracking-[0.2em] font-medium">
                  {t.editorial.readArticle}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => setActiveArticle(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <div className="relative w-full max-w-2xl bg-[#121215] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="relative h-56 sm:h-64 bg-black overflow-hidden shrink-0">
              <img
                src={activeArticle.image}
                alt={activeArticle.titleEn}
                className="w-full h-full object-cover object-top opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/40 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                aria-label="Close article"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#D5BA80] uppercase tracking-wider mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span>{activeArticle.tag}</span>
                  <span>·</span>
                  <span>{activeArticle.readTime}</span>
                  <span>·</span>
                  <span>{activeArticle.date}</span>
                </div>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EB] font-light leading-snug">
                  {language === 'en' ? activeArticle.titleEn : activeArticle.titleBn}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-sm text-[#D8D3C9] leading-relaxed font-light">
              {(language === 'en' ? activeArticle.bodyEn : activeArticle.bodyBn).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="p-4 sm:px-8 border-t border-white/10 bg-black/50 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-wider text-[#F5F2EB] cursor-pointer transition-colors"
              >
                {language === 'en' ? 'Close Essay' : 'বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
