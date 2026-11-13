import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { EDITORIAL_ARTICLES } from '../../data/mockData';
import { Language } from '../../types';
import { translations } from '../../data/translations';

interface EditorialStoriesProps {
  language: Language;
}

export const EditorialStories: React.FC<EditorialStoriesProps> = ({ language }) => {
  const t = translations[language];

  return (
    <section className="py-20 lg:py-24 bg-[#09090B] border-t border-white/5 relative">
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
              className="p-8 rounded-xl bg-[#171719]/40 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
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
                <span className="uppercase tracking-[0.2em] font-medium">{t.editorial.readArticle}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
