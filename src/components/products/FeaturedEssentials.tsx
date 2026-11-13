import React, { useState } from 'react';
import { Heart, ShoppingBag, Check, Eye } from 'lucide-react';
import { Product, Language, CartItem } from '../../types';
import { FEATURED_PRODUCTS } from '../../data/mockData';
import { translations } from '../../data/translations';

interface FeaturedEssentialsProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  onQuickView: (product: Product) => void;
  selectedFilterCategory?: string | null;
}

export const FeaturedEssentials: React.FC<FeaturedEssentialsProps> = ({
  language,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickView,
  selectedFilterCategory = null,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedFilterCategory || 'All');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const t = translations[language];

  const categories = ['All', 'Men', 'Women', 'Unisex', 'Traditional', 'Streetwear'];

  const filteredProducts = activeCategory === 'All'
    ? FEATURED_PRODUCTS
    : FEATURED_PRODUCTS.filter((p) => p.category === activeCategory);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
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
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  return (
    <section id="essentials" className="py-20 lg:py-28 bg-[#09090B] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#B69A60] mb-2 font-medium">
              {t.essentials.kicker}
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-light text-[#F5F2EB] tracking-wide">
              {t.essentials.title}
            </h2>
          </div>

          {/* Functional Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#171719] border border-white/10 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#F5F2EB] text-[#09090B] shadow-sm font-semibold'
                    : 'text-[#D8D3C9] hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'All' ? t.essentials.all : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const wish = isWishlisted(product.id);
            const isJustAdded = addedProductId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => onQuickView(product)}
                className="group relative bg-[#171719] border border-white/10 hover:border-white/20 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                {/* Product Image Stage */}
                <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                  <img
                    src={product.image}
                    alt={product.nameEn}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-transparent to-transparent opacity-80" />

                  {/* Top Badges: Unboxed Text or Wishlist */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                      onClick={(e) => handleQuickAdd(product, e)}
                      disabled={isJustAdded}
                      className={`flex-1 py-2 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg ${
                        isJustAdded
                          ? 'bg-[#B69A60] text-[#09090B]'
                          : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80]'
                      }`}
                    >
                      {isJustAdded ? (
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
                      <span>{product.category}</span>
                      <span>{product.collection}</span>
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
