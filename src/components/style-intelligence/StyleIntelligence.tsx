import React, { useState, useMemo } from 'react';
import { Cpu, Sparkles, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { Language, Product, CartItem } from '../../types';
import { useStoreData } from '../../context/StoreDataContext';
import { translations } from '../../data/translations';

interface StyleIntelligenceProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onQuickView: (product: Product) => void;
  onOpenQuiz?: () => void;
}

export const StyleIntelligence: React.FC<StyleIntelligenceProps> = ({
  language,
  onAddToCart,
  onQuickView,
  onOpenQuiz,
}) => {
  const { liveEssentialsProducts } = useStoreData();
  const [selectedAudience, setSelectedAudience] = useState<string>('All');
  const [selectedDirection, setSelectedDirection] = useState<'minimal' | 'urban' | 'heritage' | 'relaxed'>('minimal');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('evening');
  const [addedId, setAddedId] = useState<string | null>(null);
  const t = translations[language];

  const availableProducts = useMemo(
    () =>
      liveEssentialsProducts.filter(
        (p) => p.status !== 'out_of_stock' && p.stockCount > 0
      ),
    [liveEssentialsProducts]
  );

  // Deterministic recommendation algorithm based on user selection
  const recommendations = useMemo(() => {
    return availableProducts.filter((product) => {
      const matchAudience =
        selectedAudience === 'All' ||
        product.category === selectedAudience ||
        (selectedAudience === 'Unisex' && product.category === 'Unisex') ||
        (selectedAudience === 'Men' && (product.category === 'Men' || product.category === 'Traditional')) ||
        (selectedAudience === 'Women' && product.category === 'Women');

      const matchDirection = product.styleTag === selectedDirection;
      return matchAudience && matchDirection;
    }).slice(0, 3);
  }, [availableProducts, selectedAudience, selectedDirection]);

  // Fallback to ensure there's always an intelligent match
  const displayResults =
    recommendations.length > 0 ? recommendations : availableProducts.slice(0, 3);

  const handleAdd = (product: Product) => {
    onAddToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: product.colors[0]?.name || 'Standard',
      size: product.sizes[0] || 'M',
      quantity: 1,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section id="style-intelligence" className="scroll-mt-20 py-20 lg:py-28 bg-[#171719]/40 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-[#756BFF]/40 rounded-full text-xs font-mono tracking-widest text-[#756BFF] mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.styleIntel.badge}</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide mb-3">
              {t.styleIntel.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#D8D3C9] font-light leading-relaxed">
              {t.styleIntel.desc}
            </p>
          </div>

          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#B69A60] via-[#D5BA80] to-[#756BFF] text-[#09090B] font-semibold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-[1.02] transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#09090B]" />
              <span>{language === 'en' ? 'Start 5-Question Style AI Quiz' : '৫-প্রশ্নের স্টাইল কুইজ শুরু করুন'}</span>
            </button>
          )}
        </div>

        {/* Intelligence Configurator Panel */}
        <div className="bg-[#171719] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Category */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#D8D3C9] font-medium mb-3">
                01 · {t.styleIntel.categoryLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Men', 'Women', 'Unisex'].map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setSelectedAudience(aud)}
                    className={`py-2 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                      selectedAudience === aud
                        ? 'bg-[#B69A60] text-[#09090B] font-semibold shadow-md'
                        : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Aesthetic Direction */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#D8D3C9] font-medium mb-3">
                02 · {t.styleIntel.aestheticLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'minimal', label: 'Minimalist Line' },
                  { id: 'urban', label: 'Brutalist Urban' },
                  { id: 'heritage', label: 'Heritage Weave' },
                  { id: 'relaxed', label: 'Relaxed Resort' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDirection(item.id as any)}
                    className={`py-2 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                      selectedDirection === item.id
                        ? 'bg-[#B69A60] text-[#09090B] font-semibold shadow-md'
                        : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Occasion */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-[#D8D3C9] font-medium mb-3">
                03 · {t.styleIntel.occasionLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'evening', label: 'Evening Soirée' },
                  { id: 'everyday', label: 'Everyday Atelier' },
                  { id: 'formal', label: 'Formal Ceremony' },
                  { id: 'weekend', label: 'Weekend Gallery' },
                ].map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => setSelectedOccasion(occ.id)}
                    className={`py-2 px-3 text-xs font-medium rounded transition-all cursor-pointer ${
                      selectedOccasion === occ.id
                        ? 'bg-[#756BFF] text-white font-semibold shadow-md'
                        : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Results Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#D5BA80]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.styleIntel.matchingResults}</span>
              <span className="text-white/20">·</span>
              <span className="text-xs font-mono text-[#77777D]">{displayResults.length} matches</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayResults.map((product) => (
              <div
                key={product.id}
                className="bg-[#171719] border border-white/10 hover:border-[#756BFF]/40 rounded-xl p-4 flex gap-4 items-center transition-all group"
              >
                <div
                  onClick={() => onQuickView(product)}
                  className="w-20 h-24 rounded-lg overflow-hidden bg-black/40 shrink-0 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.nameEn}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B69A60] block truncate">
                    {product.collection}
                  </span>
                  <h4
                    onClick={() => onQuickView(product)}
                    className="font-serif-luxury text-base text-[#F5F2EB] font-medium truncate cursor-pointer hover:text-[#D5BA80] transition-colors"
                  >
                    {language === 'en' ? product.nameEn : product.nameBn}
                  </h4>
                  <div className="font-mono text-xs text-[#F5F2EB] font-semibold tabular-nums mt-1">
                    ৳ {product.priceBDT.toLocaleString()}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleAdd(product)}
                      className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                        addedId === product.id
                          ? 'bg-[#B69A60] text-[#09090B]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onQuickView(product)}
                      className="text-[11px] text-[#77777D] hover:text-[#D8D3C9] transition-colors"
                    >
                      {t.styleIntel.viewRecommendation}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
