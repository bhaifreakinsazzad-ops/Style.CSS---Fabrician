import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Check, Eye, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Language, CartItem, BrandPartner } from '../../types';
import { useStoreData } from '../../context/StoreDataContext';
import { translations } from '../../data/translations';

interface FeaturedEssentialsProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onQuickView: (product: Product) => void;
  selectedFilterCategory?: string | null;
  onOpenBrandPage?: (brandRoute: 'starkit' | 'farizas-territory') => void;
}

export const FeaturedEssentials: React.FC<FeaturedEssentialsProps> = ({
  language,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  selectedFilterCategory = null,
  onOpenBrandPage,
}) => {
  const { liveEssentialsProducts, unifiedCatalog } = useStoreData();
  const [activeCategory, setActiveCategory] = useState<string>(selectedFilterCategory || 'All');
  const [activeBrand, setActiveBrand] = useState<'All' | BrandPartner>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [showAllCatalog, setShowAllCatalog] = useState<boolean>(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (selectedFilterCategory) {
      setActiveCategory(selectedFilterCategory);
    }
  }, [selectedFilterCategory]);

  const categories = ['All', 'Streetwear', 'Women', 'Men', 'Unisex'];

  const visibleUnified = unifiedCatalog.filter((p) => p.status !== 'hidden');
  const sourcePool =
    showAllCatalog || activeCategory === 'Men' || activeCategory === 'Unisex'
      ? visibleUnified
      : liveEssentialsProducts;

  const filteredProducts = sourcePool
    .filter((p) => {
      const matchCategory =
        activeCategory === 'All'
          ? true
          : activeCategory === 'Men'
          ? p.category === 'Men' || p.category === 'Streetwear' || p.brand === 'StarKiT'
          : activeCategory === 'Women'
          ? p.category === 'Women' || p.brand === "Fariza's Territory"
          : activeCategory === 'Unisex'
          ? p.category === 'Unisex' || p.category === 'Streetwear'
          : p.category === activeCategory;
      const matchBrand = activeBrand === 'All' || (p.brand || 'FABRICIAN') === activeBrand;
      return matchCategory && matchBrand;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.priceBDT - b.priceBDT;
      if (sortBy === 'price-desc') return b.priceBDT - a.priceBDT;
      return 0;
    });

  const handleQuickAdd = (product: Product, isOutOfStock: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
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
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  return (
    <section id="essentials" className="scroll-mt-20 py-20 lg:py-28 bg-[#09090B] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#B69A60] mb-2 font-medium">
              {t.essentials.kicker}
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide">
              {t.essentials.title}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Brand Partner Filter */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#171719] border border-[#B69A60]/30 rounded-lg">
              {(['All', 'StarKiT', "Fariza's Territory"] as const).map((brandOpt) => (
                <button
                  key={brandOpt}
                  onClick={() => setActiveBrand(brandOpt)}
                  className={`relative px-3 py-1.5 text-xs font-mono rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeBrand === brandOpt
                      ? 'text-[#09090B] font-semibold'
                      : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeBrand === brandOpt && (
                    <motion.span
                      layoutId="ess-brand-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-md bg-[#B69A60] -z-0"
                    />
                  )}
                  <span className="relative z-10">
                    {brandOpt === 'All' ? (language === 'en' ? 'All Brands' : 'সব ব্র্যান্ড') : brandOpt}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-[#171719] border border-white/10 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'text-[#09090B] font-semibold'
                      : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeCategory === cat && (
                    <motion.span
                      layoutId="ess-cat-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-md bg-[#F5F2EB] shadow-sm -z-0"
                    />
                  )}
                  <span className="relative z-10">{cat === 'All' ? t.essentials.all : cat}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dedicated Brand Pages & Sort Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#121216] border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[#D5BA80] tabular-nums">
              {language === 'en'
                ? `Showing ${filteredProducts.length} ${showAllCatalog ? 'Catalog Pieces' : 'Signature Highlights'}`
                : `দেখানো হচ্ছে ${filteredProducts.length}টি পোশাক`}
            </span>
            <button
              type="button"
              onClick={() => setShowAllCatalog((v) => !v)}
              className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-[#F5F2EB] font-mono text-[11px] transition-colors cursor-pointer"
            >
              {showAllCatalog
                ? language === 'en'
                  ? 'Show Signature 8 Only'
                  : 'শুধু সিগনেচার ৮টি দেখুন'
                : language === 'en'
                ? `View Full Archive (${visibleUnified.length})`
                : `সম্পূর্ণ কালেকশন দেখুন (${visibleUnified.length})`}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
              aria-label="Sort products"
              className="bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-[#D8D3C9] focus:outline-none focus:border-[#B69A60] cursor-pointer"
            >
              <option value="featured">
                {language === 'en' ? 'Sort: Featured Curated' : 'সাজান: নির্বাচিত'}
              </option>
              <option value="price-asc">
                {language === 'en' ? 'Price: Low to High' : 'মূল্য: কম থেকে বেশি'}
              </option>
              <option value="price-desc">
                {language === 'en' ? 'Price: High to Low' : 'মূল্য: বেশি থেকে কম'}
              </option>
            </select>

            {onOpenBrandPage && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenBrandPage('starkit')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#B69A60] text-[#F5F2EB] hover:text-[#09090B] font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>StarKiT Menswear</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenBrandPage('farizas-territory')}
                  className="px-3 py-1.5 rounded-lg bg-[#B69A60]/15 border border-[#B69A60]/40 hover:bg-[#B69A60] text-[#D5BA80] hover:text-[#09090B] font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Fariza&apos;s Territory</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-white/10 bg-[#171719]/50">
            <p className="font-serif-luxury text-xl text-[#F5F2EB] mb-3">
              {language === 'en'
                ? 'No signature highlights match this filter combination.'
                : 'এই ফিল্টারে কোনো সিগনেচার পিস পাওয়া যায়নি।'}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All');
                setActiveBrand('All');
              }}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-[#D5BA80] cursor-pointer"
            >
              {language === 'en' ? 'Show All Signature Picks' : 'সব সিগনেচার পিস দেখুন'}
            </button>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const wish = isWishlisted(product.id);
            const isJustAdded = addedProductId === product.id;
            const isOutOfStock = product.status === 'out_of_stock' || product.stockCount <= 0;

            return (
              <motion.div
                key={product.id}
                layout
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                onClick={() => onQuickView(product)}
                className="group relative bg-[#171719] border border-white/10 hover:border-[#B69A60]/35 rounded-xl overflow-hidden transition-colors duration-300 flex flex-col justify-between cursor-pointer will-change-transform"
              >
                {/* Product Image Stage */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                  <img
                    src={product.image}
                    alt={product.nameEn}
                    loading="lazy"
                    className={`w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out ${
                      isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                    }`}
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-transparent to-transparent opacity-80" />

                  {/* Top Badges: Unboxed Text or Wishlist */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-red-300 bg-black/85 backdrop-blur-sm px-2.5 py-1 rounded border border-red-500/40">
                          {language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
                        </span>
                      ) : (
                        <>
                          {product.isNew && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D5BA80] bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded border border-[#B69A60]/30">
                              New Runway
                            </span>
                          )}
                          {product.isBestseller && (
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8D3C9] bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10">
                              Signature
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                        wish
                          ? 'bg-[#B69A60] text-[#09090B]'
                          : 'bg-black/50 text-[#D8D3C9] hover:text-white hover:bg-black/80'
                      }`}
                      aria-label="Wishlist toggle"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Hover Quick Action Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => handleQuickAdd(product, isOutOfStock, e)}
                      disabled={isJustAdded || isOutOfStock}
                      className={`flex-1 py-2 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-lg ${
                        isOutOfStock
                          ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-[#B69A60] text-[#09090B] cursor-pointer'
                          : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] cursor-pointer'
                      }`}
                    >
                      {isOutOfStock ? (
                        <span>{language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}</span>
                      ) : isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.essentials.addedToBag}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{t.essentials.addToBag}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(product);
                      }}
                      className="p-2 bg-black/70 hover:bg-black text-white rounded backdrop-blur-sm border border-white/10"
                      title={t.essentials.quickView}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Metadata Content */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#77777D] uppercase tracking-wider mb-1.5">
                      <span className="text-[#D5BA80] font-mono">
                        {product.brand || 'FABRICIAN'} · {product.category}
                      </span>
                      <span className="truncate ml-2">{product.collection}</span>
                    </div>

                    <h3 className="font-serif-luxury text-xl text-[#F5F2EB] font-light group-hover:text-[#D5BA80] transition-colors mb-2">
                      {language === 'en' ? product.nameEn : product.nameBn}
                    </h3>

                    <p className="text-xs text-[#77777D] line-clamp-1 mb-4">
                      {language === 'en' ? product.fabricEn : product.fabricBn}
                    </p>
                  </div>

                  {/* Price & Swatches Line */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base text-[#F5F2EB] font-semibold tabular-nums">
                        ৳ {product.priceBDT.toLocaleString()}
                      </span>
                      {product.compareAtPriceBDT && (
                        <span className="font-mono text-xs text-[#77777D] line-through tabular-nums">
                          ৳ {product.compareAtPriceBDT.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5">
                      {product.colors.map((c) => (
                        <span
                          key={c.name}
                          className="w-3 h-3 rounded-full border border-white/30"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
};
