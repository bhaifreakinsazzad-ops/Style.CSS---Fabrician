import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  Heart,
  Layers,
  PhoneCall,
  Ruler,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { CartItem, Language, Product } from '../../types';
import { LiveGraphicArchiveProduct, LiveProduct } from '../../types/store';
import {
  GRAPHIC_ARCHIVE_PRODUCTS,
  GraphicArchiveProduct,
  GraphicArchiveVariant,
} from '../../data/graphicArchiveCatalog';
import { FASHION_LOOKS } from '../../data/mockData';
import { useStoreData } from '../../context/StoreDataContext';
import { lookbookModelPanjabi, lookbookModelStreetwear } from '../../assets/images';

interface StarKiTBrandPageProps {
  language: Language;
  onBackHome: () => void;
  onSwitchBrand: (brand: 'farizas-territory') => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onQuickView: (product: Product) => void;
  onOpenSizeGuide: () => void;
}

const ARCHIVE_SIZES = ['M', 'L', 'XL'] as const;

const toArchiveProduct = (
  product: GraphicArchiveProduct,
  variant: GraphicArchiveVariant
): Product => ({
  id: product.id,
  slug: product.id.toLowerCase(),
  brand: product.brand || 'StarKiT',
  nameEn: `${product.name} Hoodie`,
  nameBn: `${product.name} হুডি`,
  category: 'Streetwear',
  collection: `StarKiT · ${product.category}`,
  priceBDT: variant.priceBdt,
  image: variant.previewImage,
  colors: product.variants.map((v) => ({ name: v.color, hex: v.colorHex })),
  sizes: [...ARCHIVE_SIZES],
  fabricEn: variant.fabric,
  fabricBn: `${variant.gsm} ব্রাশড ফ্লিস`,
  fitEn: variant.fit,
  fitBn: 'রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
  styleTag: 'urban',
});

export const StarKiTBrandPage: React.FC<StarKiTBrandPageProps> = ({
  language,
  onBackHome,
  onSwitchBrand,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  onOpenSizeGuide,
}) => {
  const { unifiedCatalog, liveGraphicArchiveProducts, storeSettings } = useStoreData();
  const [activeFilter, setActiveFilter] = useState<'all' | 'sartorial' | 'hoodies' | 'essentials'>('all');
  const [archiveSubFilter, setArchiveSubFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedKey, setAddedKey] = useState<string | null>(null);

  const [selectedVariantSkus, setSelectedVariantSkus] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    GRAPHIC_ARCHIVE_PRODUCTS.forEach((p) => {
      initial[p.id] = p.variants[0]?.sku || '';
    });
    return initial;
  });

  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    GRAPHIC_ARCHIVE_PRODUCTS.forEach((p) => {
      initial[p.id] = 'L';
    });
    return initial;
  });

  const [activeLookbookSheet, setActiveLookbookSheet] = useState<{
    product: GraphicArchiveProduct;
    variant: GraphicArchiveVariant;
  } | null>(null);

  useEffect(() => {
    if (!activeLookbookSheet) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveLookbookSheet(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLookbookSheet]);

  const starKiTEssentials = useMemo<LiveProduct[]>(
    () =>
      unifiedCatalog.filter(
        (p) =>
          p.brand === 'StarKiT' &&
          p.sourceCatalog !== 'graphic-archive' &&
          p.status !== 'hidden'
      ),
    [unifiedCatalog]
  );

  const starKiTHoodies = useMemo<LiveGraphicArchiveProduct[]>(
    () => liveGraphicArchiveProducts.filter((g) => g.brand === 'StarKiT'),
    [liveGraphicArchiveProducts]
  );

  const starKiTLooks = useMemo(
    () => FASHION_LOOKS.filter((l) => l.brand === 'StarKiT'),
    []
  );

  const filteredEssentials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return starKiTEssentials.filter((p) => {
      const matchTab =
        activeFilter === 'all' ||
        (activeFilter === 'sartorial' && (p.category === 'Men' || p.category === 'Traditional')) ||
        (activeFilter === 'essentials' && (p.category === 'Streetwear' || p.category === 'Unisex'));
      const matchQuery =
        !q ||
        p.nameEn.toLowerCase().includes(q) ||
        p.nameBn.includes(searchQuery) ||
        p.collection.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [starKiTEssentials, activeFilter, searchQuery]);

  const filteredHoodies = useMemo(() => {
    if (activeFilter === 'sartorial' || activeFilter === 'essentials') return [];
    const q = searchQuery.trim().toLowerCase();
    return starKiTHoodies.filter((h) => {
      const matchCat = archiveSubFilter === 'all' || h.category === archiveSubFilter;
      const matchQuery =
        !q ||
        h.id.toLowerCase().includes(q) ||
        h.name.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q) ||
        h.tags.some((t) => t.includes(q));
      return matchCat && matchQuery;
    });
  }, [starKiTHoodies, activeFilter, archiveSubFilter, searchQuery]);

  const handleQuickAddEssential = (product: LiveProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.status === 'out_of_stock' || product.stockCount <= 0) return;
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
    setAddedKey(product.id);
    setTimeout(() => setAddedKey(null), 1800);
  };

  const handleAddHoodie = (product: GraphicArchiveProduct, variant: GraphicArchiveVariant) => {
    const size = selectedSizes[product.id] || 'L';
    onAddToCart({
      productId: variant.sku,
      nameEn: `StarKiT — ${product.name} Hoodie`,
      nameBn: `স্টারকিট — ${product.name} হুডি`,
      priceBDT: variant.priceBdt,
      image: variant.previewImage,
      color: variant.color,
      size,
      quantity: 1,
    });
    setAddedKey(variant.sku);
    setTimeout(() => setAddedKey(null), 1800);
  };

  const archiveCategories = [
    'all',
    'Bangla Heritage',
    'Anime Archive',
    'Moto Culture',
    'Playful Street',
    'City Stories',
    'Statement Graphics',
  ];

  const totalCount = starKiTEssentials.length + starKiTHoodies.length;

  return (
    <div className="pt-20 bg-[#09090B] text-[#F5F2EB]">
      {/* Partner Navigation Sub-Bar */}
      <div className="border-b border-white/10 bg-[#111114]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-[#D8D3C9] hover:text-[#D5BA80] transition-colors cursor-pointer font-mono uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>{language === 'en' ? 'FABRICIAN House' : 'মূল স্টোর'}</span>
            </button>
            <span className="text-white/20">/</span>
            <span className="font-mono uppercase tracking-[0.2em] text-[#D5BA80]">
              StarKiT × FABRICIAN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="inline-flex items-center gap-1.5 text-[#D8D3C9] hover:text-white font-mono text-[11px] cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>{language === 'en' ? 'Men Fit Guide' : 'সাইজ গাইড'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchBrand('farizas-territory')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-white/15 hover:border-[#B69A60]/50 text-[#D8D3C9] hover:text-[#D5BA80] font-mono text-[11px] transition-colors cursor-pointer"
            >
              <span>{language === 'en' ? "Visit Fariza's Territory" : 'ফারিজাস টেরিটরি দেখুন'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Campaign Hero */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#0A0A0D]">
        <div className="absolute inset-0 bg-jamdani-pattern opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="text-xs font-mono uppercase tracking-[0.28em] text-[#B69A60]">
              {language === 'en'
                ? 'Official Menswear & Streetwear Partner · 2026 Campaign'
                : 'অফিশিয়াল মেনসওয়্যার ও স্ট্রিটওয়্যার পার্টনার · ২০২৬ ক্যাম্পেইন'}
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-light text-[#F5F2EB] tracking-wide leading-[1.08] text-balance">
              StarKiT <span className="italic text-[#D5BA80]">Archive &amp; Tailored</span>
            </h1>

            <p className="text-sm sm:text-base text-[#D8D3C9] font-light leading-relaxed max-w-xl">
              {language === 'en'
                ? 'Bringing together geometric Jamdani cuff Panjabis, Gazipur-knitted 480 GSM monolith fleece, and 11 graphic archive drops designed for modern Bangladeshi men.'
                : 'জ্যামিতিক জামদানি কাফ পাঞ্জাবি, ৪৮০ জিএসএম মনোলিথ ফ্লিস এবং ১১টি এক্সক্লুসিভ গ্রাফিক আর্কাইভ হুডির সমন্বয়ে স্টারকিট মেনস কালেকশন।'}
            </p>

            {/* Key Campaign Numbers */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-lg">
              <div>
                <div className="font-mono text-2xl text-[#F5F2EB] font-semibold tabular-nums">
                  {String(totalCount).padStart(2, '0')}
                </div>
                <div className="text-[11px] font-mono uppercase text-[#77777D]">
                  {language === 'en' ? 'Active Drops' : 'সক্রিয় ডিজাইন'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#D5BA80] font-semibold tabular-nums">
                  350–480
                </div>
                <div className="text-[11px] font-mono uppercase text-[#77777D]">
                  {language === 'en' ? 'GSM Cotton' : 'জিএসএম কটন'}
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl text-[#F5F2EB] font-semibold tabular-nums">
                  ৳1,290+
                </div>
                <div className="text-[11px] font-mono uppercase text-[#77777D]">
                  {language === 'en' ? 'Direct Pricing' : 'শুরুর মূল্য'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  document.getElementById('starkit-catalog')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-6 py-3 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] text-xs font-semibold uppercase tracking-[0.18em] transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Shop StarKiT Lineup' : 'স্টারকিট কালেকশন দেখুন'}
              </button>
              <a
                href={storeSettings.hotlineTel}
                className="px-5 py-3 rounded-lg border border-white/15 hover:border-[#B69A60] text-xs font-mono text-[#D8D3C9] hover:text-white inline-flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>{storeSettings.hotlineDisplay}</span>
              </a>
            </div>
          </div>

          {/* Dual Campaign Photography Pair */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#171719]">
              <img
                src={lookbookModelPanjabi}
                alt="StarKiT Sovereign Tailored Panjabi"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B69A60]">
                  Sartorial Line
                </div>
                <div className="font-serif-luxury text-lg text-[#F5F2EB]">
                  Obsidian Panjabi &amp; Shirts
                </div>
              </div>
            </div>

            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#171719] translate-y-4">
              <img
                src={lookbookModelStreetwear}
                alt="StarKiT Brutalist Heavyweight Streetwear"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B69A60]">
                  Graphic Drop 01
                </div>
                <div className="font-serif-luxury text-lg text-[#F5F2EB]">
                  Heavyweight Fleece Hoodies
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bundle & Courier Campaign Value Strip */}
      <section className="border-b border-white/10 bg-[#121216]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#B69A60] shrink-0" />
            <span className="text-[#D8D3C9]">
              {language === 'en'
                ? `Save ৳${storeSettings.bundle2DiscountBDT} on 2 pieces · Save ৳${storeSettings.bundle3DiscountBDT} on 3+`
                : `২টিতে ৳${storeSettings.bundle2DiscountBDT} · ৩টিতে ৳${storeSettings.bundle3DiscountBDT} বান্ডেল ছাড়`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[#D8D3C9]">
              {language === 'en'
                ? `Complimentary Pathao delivery over ৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}`
                : `৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+ অর্ডারে পাঠাও ফ্রি ডেলিভারি`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-[#B69A60] shrink-0" />
            <span className="text-[#D8D3C9]">
              {language === 'en'
                ? 'Dhaka Atelier quality inspection & 7-day size exchange'
                : 'ঢাকা আতেলিয়ে মান যাচাই ও ৭ দিনের সাইজ পরিবর্তন সুবিধা'}
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog Showcase */}
      <section id="starkit-catalog" className="scroll-mt-24 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 rounded-xl bg-[#141418] border border-white/10 mb-10">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', labelEn: `All StarKiT (${totalCount})`, labelBn: `সব (${totalCount})` },
                { id: 'sartorial', labelEn: 'Panjabi & Tailored', labelBn: 'পাঞ্জাবি ও শার্ট' },
                { id: 'essentials', labelEn: '480GSM & Heavy Tees', labelBn: '৪৮০ জিএসএম ও টি-শার্ট' },
                { id: 'hoodies', labelEn: `Graphic Hoodies (${starKiTHoodies.length})`, labelBn: `গ্রাফিক হুডি (${starKiTHoodies.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-[#F5F2EB] text-[#09090B] font-semibold'
                      : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {language === 'en' ? tab.labelEn : tab.labelBn}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 text-[#77777D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search Panjabi, Hoodie, SKU...'
                    : 'পাঞ্জাবি, হুডি বা কোড খুঁজুন...'
                }
                className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
              />
            </div>
          </div>

          {/* Part 1: StarKiT Sartorial & Heavyweight Essentials */}
          {filteredEssentials.length > 0 && activeFilter !== 'hoodies' && (
            <div className="mb-16">
              <div className="flex items-baseline justify-between mb-6 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#B69A60]">
                    StarKiT × Atelier Signatures
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-light text-[#F5F2EB]">
                    {language === 'en' ? 'Panjabis, Shirts & Heavyweight Basics' : 'পাঞ্জাবি, শার্ট ও হেভিওয়েট বেসিকস'}
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#77777D] tabular-nums">
                  {filteredEssentials.length} {language === 'en' ? 'pieces' : 'টি পিস'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredEssentials.map((product) => {
                  const isOutOfStock = product.status === 'out_of_stock' || product.stockCount <= 0;
                  const isAdded = addedKey === product.id;
                  const wish = isWishlisted(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => onQuickView(product)}
                      className="group bg-[#171719] border border-white/10 hover:border-[#B69A60]/40 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer transition-all"
                    >
                      <div className="relative aspect-[3/4] bg-black/50 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.nameEn}
                          loading="lazy"
                          className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ${
                            isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-transparent to-transparent opacity-80" />

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(product);
                            }}
                            className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                              wish
                                ? 'bg-[#B69A60] text-[#09090B]'
                                : 'bg-black/60 text-[#D8D3C9] hover:text-white'
                            }`}
                            aria-label="Wishlist toggle"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#B69A60] mb-1">
                            StarKiT · {product.category}
                          </div>
                          <h3 className="font-serif-luxury text-lg text-[#F5F2EB] font-light group-hover:text-[#D5BA80] transition-colors mb-1">
                            {language === 'en' ? product.nameEn : product.nameBn}
                          </h3>
                          <p className="text-xs text-[#77777D] line-clamp-1 mb-3">
                            {language === 'en' ? product.fabricEn : product.fabricBn}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                          <div>
                            <span className="font-mono text-sm font-semibold text-[#F5F2EB] tabular-nums">
                              ৳ {product.priceBDT.toLocaleString()}
                            </span>
                            {product.compareAtPriceBDT && (
                              <span className="ml-1.5 font-mono text-[11px] text-[#77777D] line-through tabular-nums">
                                ৳ {product.compareAtPriceBDT.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock || isAdded}
                            onClick={(e) => handleQuickAddEssential(product, e)}
                            className={`px-3 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                              isOutOfStock
                                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                : isAdded
                                ? 'bg-[#B69A60] text-[#09090B]'
                                : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] cursor-pointer'
                            }`}
                          >
                            {isOutOfStock ? (
                              <span>{language === 'en' ? 'Out' : 'শেষ'}</span>
                            ) : isAdded ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>{language === 'en' ? 'Added' : 'যুক্ত'}</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                <span>{language === 'en' ? 'Add' : 'কিনুন'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Part 2: StarKiT Graphic Archive Hoodies (11 Drops) */}
          {(activeFilter === 'all' || activeFilter === 'hoodies') && (
            <div>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-3 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#B69A60]">
                    StarKiT · Drop 01 Graphic Archive
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-light text-[#F5F2EB]">
                    {language === 'en'
                      ? '350 GSM Brushed Fleece Graphic Hoodies'
                      : '৩৫০ জিএসএম ব্রাশড ফ্লিস গ্রাফিক হুডি'}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {archiveCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setArchiveSubFilter(cat)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
                        archiveSubFilter === cat
                          ? 'bg-[#B69A60] text-[#09090B] font-semibold'
                          : 'bg-white/5 text-[#A09D94] hover:text-white'
                      }`}
                    >
                      {cat === 'all' ? (language === 'en' ? 'All Themes' : 'সকল থিম') : cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredHoodies.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-white/10 bg-[#141418] text-xs text-[#9A9892]">
                  {language === 'en'
                    ? 'No StarKiT hoodies match your current filter.'
                    : 'কোনো হুডি খুঁজে পাওয়া যায়নি।'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredHoodies.map((product) => {
                    const activeSku = selectedVariantSkus[product.id];
                    const currentVariant =
                      product.variants.find((v) => v.sku === activeSku) || product.variants[0];
                    const currentSize = selectedSizes[product.id] || 'L';
                    const isAdded = addedKey === currentVariant.sku;
                    const isOutOfStock =
                      product.catalogStatus === 'out_of_stock' || product.stockCount <= 0;
                    const mappedProduct = toArchiveProduct(product, currentVariant);
                    const wish = isWishlisted(product.id);

                    return (
                      <div
                        key={product.id}
                        className="group bg-[#131317] border border-white/10 hover:border-[#B69A60]/40 rounded-2xl overflow-hidden flex flex-col transition-all"
                      >
                        <div className="relative aspect-[4/5] bg-[#0A0A0D] overflow-hidden">
                          <img
                            src={currentVariant.previewImage}
                            alt={`${product.name} - ${currentVariant.color}`}
                            loading="lazy"
                            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ${
                              isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                            }`}
                          />

                          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                            <span className="px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-wider text-[#D5BA80] uppercase">
                              {product.id} · StarKiT
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onQuickView(mappedProduct)}
                                className="p-2 rounded-full bg-black/70 hover:bg-black text-[#D8D3C9] hover:text-white border border-white/10 cursor-pointer"
                                title={language === 'en' ? 'Quick View & Reviews' : 'বিস্তারিত'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleWishlist(mappedProduct)}
                                className={`p-2 rounded-full cursor-pointer ${
                                  wish
                                    ? 'bg-[#B69A60] text-[#09090B]'
                                    : 'bg-black/70 text-[#D8D3C9] hover:text-white'
                                }`}
                                aria-label="Wishlist toggle"
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                              </button>
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveLookbookSheet({ product, variant: currentVariant })
                              }
                              className="pointer-events-auto px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold tracking-wider flex items-center gap-2 hover:bg-[#D5BA80] cursor-pointer shadow-lg"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'View Spec Sheet' : 'স্পেক শিট'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] font-mono tracking-widest text-[#B69A60] uppercase mb-1">
                              {product.category} · {product.editorial}
                            </p>
                            <div className="flex items-baseline justify-between gap-2 mb-2">
                              <h3 className="font-serif-luxury text-xl font-light text-[#F5F2EB]">
                                {product.name}
                              </h3>
                              <span className="font-mono text-base font-semibold text-[#F5F2EB] tabular-nums">
                                ৳{currentVariant.priceBdt.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#8E8B83] font-light line-clamp-2 mb-4">
                              {language === 'en' ? product.descriptionEn : product.descriptionBn}
                            </p>

                            <div className="flex items-end justify-between gap-3 mb-4">
                              <div>
                                <p className="text-[10px] font-mono text-[#777570] uppercase mb-1.5">
                                  {currentVariant.color}
                                </p>
                                <div className="flex items-center gap-1.5">
                                  {product.variants.map((v) => {
                                    const isSel = v.sku === currentVariant.sku;
                                    return (
                                      <button
                                        key={v.sku}
                                        type="button"
                                        onClick={() =>
                                          setSelectedVariantSkus((prev) => ({
                                            ...prev,
                                            [product.id]: v.sku,
                                          }))
                                        }
                                        aria-label={`Color ${v.color}`}
                                        className={`w-5 h-5 rounded-full border-2 cursor-pointer ${
                                          isSel
                                            ? 'border-[#B69A60] scale-110'
                                            : 'border-white/25 hover:border-white/60'
                                        }`}
                                        style={{ backgroundColor: v.colorHex }}
                                      />
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                {ARCHIVE_SIZES.map((sz) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() =>
                                      setSelectedSizes((prev) => ({ ...prev, [product.id]: sz }))
                                    }
                                    className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer ${
                                      currentSize === sz
                                        ? 'bg-[#B69A60] text-[#09090B] font-bold'
                                        : 'bg-white/5 text-[#D8D3C9] border border-white/10'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => !isOutOfStock && handleAddHoodie(product, currentVariant)}
                            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all ${
                              isOutOfStock
                                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                : isAdded
                                ? 'bg-[#B69A60] text-[#09090B]'
                                : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] cursor-pointer'
                            }`}
                          >
                            {isOutOfStock ? (
                              <span>{language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}</span>
                            ) : isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{language === 'en' ? 'Added to Bag' : 'ব্যাগে যোগ হয়েছে'}</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>{language === 'en' ? 'Add to Bag' : 'ব্যাগে যোগ করুন'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* StarKiT Lookbook Ensemble Strip */}
          {starKiTLooks.length > 0 && (
            <div className="mt-20 pt-14 border-t border-white/10">
              <div className="mb-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#B69A60]">
                  {language === 'en' ? 'StarKiT Styled Looks' : 'স্টারকিট স্টাইলড লুক'}
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-3xl font-light text-[#F5F2EB]">
                  {language === 'en' ? 'Complete Menswear Ensembles' : 'সম্পূর্ণ মেনস লুকবুক'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {starKiTLooks.map((look) => (
                  <div
                    key={look.id}
                    className="p-5 rounded-2xl bg-[#141418] border border-white/10 flex flex-col sm:flex-row gap-5 items-center"
                  >
                    <img
                      src={look.modelImage}
                      alt={look.titleEn}
                      loading="lazy"
                      className="w-full sm:w-40 aspect-[3/4] object-cover object-top rounded-xl shrink-0"
                    />
                    <div className="flex-1 space-y-2.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#B69A60]">
                        StarKiT · {look.collectionEn}
                      </div>
                      <h3 className="font-serif-luxury text-xl text-[#F5F2EB]">
                        {language === 'en' ? look.titleEn : look.titleBn}
                      </h3>
                      <p className="text-xs text-[#9A9892] font-light leading-relaxed">
                        {language === 'en' ? look.storyEn : look.storyBn}
                      </p>
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <span className="font-mono text-sm font-semibold text-[#D5BA80] tabular-nums">
                          ৳ {look.totalPriceBDT.toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            look.garments.forEach((g) =>
                              onAddToCart({
                                productId: g.id,
                                nameEn: g.nameEn,
                                nameBn: g.nameBn,
                                priceBDT: g.priceBDT,
                                image: g.image || look.modelImage,
                                color: look.colorway,
                                size: g.sizes[0] || 'M',
                                quantity: 1,
                              })
                            );
                          }}
                          className="px-4 py-2 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          {language === 'en' ? 'Add Full Look' : 'সম্পূর্ণ লুক নিন'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catalog Spec Sheet Modal */}
      {activeLookbookSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="fixed inset-0" onClick={() => setActiveLookbookSheet(null)} />
          <div className="relative w-full max-w-3xl bg-[#121215] border border-white/15 rounded-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-xl text-[#F5F2EB]">
                  {activeLookbookSheet.product.name} — StarKiT Spec Sheet
                </h3>
                <p className="text-[11px] font-mono text-[#B69A60] tabular-nums">
                  {activeLookbookSheet.variant.sku} · ৳{activeLookbookSheet.variant.priceBdt.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLookbookSheet(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close spec sheet"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-[#09090B]">
              <img
                src={activeLookbookSheet.variant.catalogPageImage}
                alt={activeLookbookSheet.product.name}
                className="w-full max-w-xl h-auto rounded-xl border border-white/10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
