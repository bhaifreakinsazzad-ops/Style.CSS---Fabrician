import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { Product, Language, CartItem } from '../../types';
import { useStoreData } from '../../context/StoreDataContext';
import { translations } from '../../data/translations';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart?: (item: Omit<CartItem, 'id'>) => void;
  language: Language;
}

const POPULAR_SEARCH_CHIPS = [
  { labelEn: 'StarKiT Hoodies', labelBn: 'স্টারকিট হুডি', query: 'StarKiT' },
  { labelEn: "Fariza's Territory", labelBn: 'ফারিজাস টেরিটরি', query: "Fariza's Territory" },
  { labelEn: 'Swiss Lawn', labelBn: 'সুইস লন', query: 'Swiss Lawn' },
  { labelEn: 'Batik 3-Piece', labelBn: 'বাটিক থ্রি-পিস', query: 'Batik' },
  { labelEn: 'Mirror Embroidery', labelBn: 'মিরর ওয়ার্ক', query: 'Mirror' },
  { labelEn: 'Dhaka Heritage', labelBn: 'ঢাকা হেরিটেজ', query: 'Dhaka' },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
  language,
}) => {
  const { unifiedCatalog, liveEssentialsProducts } = useStoreData();
  const [query, setQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setQuery('');
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const visibleCatalog = unifiedCatalog.filter((p) => p.status !== 'hidden');

  const allMatches = visibleCatalog.filter(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.nameBn.includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.fabricEn.toLowerCase().includes(q)
  );

  const results = q === '' ? liveEssentialsProducts.slice(0, 6) : allMatches;

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAddToCart) return;
    const defaultSize = product.sizes.includes('Unstitched Set')
      ? 'Unstitched Set'
      : product.sizes[1] || product.sizes[0] || 'L';
    onAddToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: product.colors[0]?.name || 'Standard',
      size: defaultSize,
      quantity: 1,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl bg-[#171719] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#B69A60] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full bg-transparent text-base sm:text-lg text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none font-light"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="px-2 py-1 text-[10px] font-mono uppercase text-[#D8D3C9] hover:text-white bg-white/5 rounded cursor-pointer"
            >
              {language === 'en' ? 'Clear' : 'মুছুন'}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#77777D] hover:text-white rounded-full hover:bg-white/5 cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Discovery Chips */}
        <div className="px-4 sm:px-6 py-3 bg-black/30 border-b border-white/5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#77777D] mr-1">
            {language === 'en' ? 'Quick Filter:' : 'দ্রুত খুঁজুন:'}
          </span>
          {POPULAR_SEARCH_CHIPS.map((chip) => {
            const active = query.toLowerCase() === chip.query.toLowerCase();
            return (
              <button
                key={chip.query}
                type="button"
                onClick={() => setQuery(active ? '' : chip.query)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#B69A60] text-[#09090B] font-semibold'
                    : 'bg-white/5 hover:bg-white/10 text-[#D8D3C9] border border-white/10'
                }`}
              >
                {language === 'en' ? chip.labelEn : chip.labelBn}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#77777D] uppercase tracking-wider mb-3">
            <span>
              {q === ''
                ? language === 'en'
                  ? 'Suggested Signature Pieces'
                  : 'প্রস্তাবিত সিগনেচার পোশাক'
                : language === 'en'
                ? `${results.length} Results Found`
                : `${results.length}টি ফলাফল পাওয়া গেছে`}
            </span>
            <span className="tabular-nums text-[#D5BA80]">
              {visibleCatalog.length} {language === 'en' ? 'Total in Archive' : 'টি মোট পোশাক'}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#77777D]">
              <p className="mb-3">
                {t.search.noResults} &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-4 py-1.5 rounded bg-white/10 hover:bg-white/20 text-[#D5BA80] font-mono cursor-pointer"
              >
                {language === 'en' ? 'Show Suggested Pieces' : 'প্রস্তাবিত পোশাক দেখুন'}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {results.map((product) => {
                const liveItem = unifiedCatalog.find((u) => u.id === product.id);
                const isOutOfStock = liveItem
                  ? liveItem.status === 'out_of_stock' || liveItem.stockCount <= 0
                  : false;
                const isAdded = addedId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-black/40 hover:bg-black/80 border border-white/5 hover:border-[#B69A60]/40 transition-all cursor-pointer group"
                  >
                    <img
                      src={product.image}
                      alt={product.nameEn}
                      className="w-14 h-16 object-cover object-top rounded-lg bg-zinc-900 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase text-[#B69A60] truncate">
                          {product.brand ? `${product.brand} · ` : ''}
                          {product.category} · {product.collection}
                        </span>
                        {isOutOfStock && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 shrink-0">
                            {language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif-luxury text-base text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors truncate">
                        {language === 'en' ? product.nameEn : product.nameBn}
                      </h4>
                      <p className="text-xs text-[#77777D] truncate">
                        {language === 'en' ? product.fabricEn : product.fabricBn}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2.5">
                      <span className="font-mono text-xs text-[#F5F2EB] font-semibold tabular-nums">
                        ৳ {product.priceBDT.toLocaleString()}
                      </span>
                      {onAddToCart && !isOutOfStock && (
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isAdded
                              ? 'bg-[#B69A60] text-[#09090B]'
                              : 'bg-white/10 hover:bg-[#B69A60] text-[#F5F2EB] hover:text-[#09090B]'
                          }`}
                          title={language === 'en' ? 'Quick Add to Bag' : 'ব্যাগে যোগ করুন'}
                        >
                          {isAdded ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <ShoppingBag className="w-3 h-3" />
                          )}
                          <span className="hidden sm:inline">
                            {isAdded
                              ? language === 'en'
                                ? 'Added'
                                : 'যুক্ত'
                              : language === 'en'
                              ? 'Bag'
                              : 'ব্যাগ'}
                          </span>
                        </button>
                      )}
                      <ArrowRight className="w-4 h-4 text-[#77777D] group-hover:text-[#D5BA80] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
