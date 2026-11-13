import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product, Language } from '../../types';
import { FEATURED_PRODUCTS } from '../../data/mockData';
import { THREE_PIECE_CATALOG } from '../../data/threePieceCatalog';
import { GRAPHIC_ARCHIVE_PRODUCTS } from '../../data/graphicArchiveCatalog';
import { translations } from '../../data/translations';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  language: Language;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  language,
}) => {
  const [query, setQuery] = useState('');
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

  // Search across all three catalogs
  const standardResults: Product[] = FEATURED_PRODUCTS.filter(
    (p) =>
      p.nameEn.toLowerCase().includes(q) ||
      p.nameBn.includes(query) ||
      p.category.toLowerCase().includes(q) ||
      p.fabricEn.toLowerCase().includes(q)
  );

  const threePieceResults: Product[] = THREE_PIECE_CATALOG.filter(
    (tp) =>
      tp.code.toLowerCase().includes(q) ||
      tp.nameEn.toLowerCase().includes(q) ||
      tp.nameBn.includes(query) ||
      tp.subCollection.toLowerCase().includes(q) ||
      tp.fabric.toLowerCase().includes(q)
  ).map((tp) => ({
    id: tp.id,
    slug: tp.code.toLowerCase(),
    nameEn: `[${tp.code}] ${tp.nameEn}`,
    nameBn: `[${tp.code}] ${tp.nameBn}`,
    category: 'Traditional' as const,
    collection: tp.subCollection,
    priceBDT: tp.priceBDT,
    image: tp.flatLayImage,
    colors: tp.colors,
    sizes: ['Unstitched Set'],
    fabricEn: tp.fabric,
    fabricBn: tp.fabric,
    fitEn: 'Custom Tailorable',
    fitBn: 'কাস্টম টেইলরেবল',
    styleTag: 'heritage' as const,
  }));

  const graphicArchiveResults: Product[] = GRAPHIC_ARCHIVE_PRODUCTS.filter(
    (ga) =>
      ga.id.toLowerCase().includes(q) ||
      ga.name.toLowerCase().includes(q) ||
      ga.category.toLowerCase().includes(q) ||
      ga.descriptionEn.toLowerCase().includes(q) ||
      ga.tags.some((tag) => tag.toLowerCase().includes(q))
  ).map((ga) => ({
    id: ga.id,
    slug: ga.id.toLowerCase(),
    nameEn: `${ga.name} Hoodie`,
    nameBn: `${ga.name} হুডি`,
    category: 'Streetwear' as const,
    collection: `Graphic Archive · ${ga.category}`,
    priceBDT: ga.variants[0].priceBdt,
    image: ga.variants[0].previewImage,
    colors: ga.variants.map((v) => ({ name: v.color, hex: v.colorHex })),
    sizes: ['M', 'L', 'XL'],
    fabricEn: ga.variants[0].fabric,
    fabricBn: `${ga.variants[0].gsm} ওয়ান-সাইড ব্রাশড ফ্লিস`,
    fitEn: ga.variants[0].fit,
    fitBn: 'সমসাময়িক রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
    styleTag: 'urban' as const,
  }));

  const allMatches = [...standardResults, ...threePieceResults, ...graphicArchiveResults];
  const results = q === '' ? FEATURED_PRODUCTS.slice(0, 4) : allMatches;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

      <div className="relative w-full max-w-2xl bg-[#171719] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#B69A60] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="w-full bg-transparent text-lg text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none font-light"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#77777D] hover:text-white rounded-full hover:bg-white/5 cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          <div className="text-[11px] font-mono text-[#77777D] uppercase tracking-wider mb-3">
            {q === ''
              ? language === 'en'
                ? 'Suggested Essentials'
                : 'প্রস্তাবিত পোশাক'
              : language === 'en'
              ? `${results.length} Results Found`
              : `${results.length}টি ফলাফল পাওয়া গেছে`}
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#77777D]">
              {t.search.noResults} "{query}"
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-black/40 hover:bg-black/80 border border-white/5 hover:border-white/15 transition-all cursor-pointer group"
                >
                  <img
                    src={product.image}
                    alt={product.nameEn}
                    className="w-14 h-16 object-cover object-top rounded bg-zinc-900 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono uppercase text-[#B69A60]">
                      {product.category} · {product.collection}
                    </span>
                    <h4 className="font-serif-luxury text-base text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors truncate">
                      {language === 'en' ? product.nameEn : product.nameBn}
                    </h4>
                    <p className="text-xs text-[#77777D] truncate">
                      {language === 'en' ? product.fabricEn : product.fabricBn}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="font-mono text-xs text-[#F5F2EB] font-semibold tabular-nums">
                      ৳ {product.priceBDT.toLocaleString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#77777D] group-hover:text-[#D5BA80] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
