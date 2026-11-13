/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  PhoneCall,
  Check,
  Layers,
  SlidersHorizontal,
  Eye,
  Info,
  Truck,
  Heart,
  ArrowUpRight,
} from 'lucide-react';
import {
  GRAPHIC_ARCHIVE_PRODUCTS,
  GraphicArchiveProduct,
  GraphicArchiveVariant,
} from '../../data/graphicArchiveCatalog';
import { useStoreData } from '../../context/StoreDataContext';
import { Language, CartItem, Product } from '../../types';

interface GraphicArchiveSectionProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: (productId: string) => boolean;
  onOpenQuickView?: (product: Product) => void;
  onOpenBrandPage?: () => void;
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
  fabricBn: `${variant.gsm} ওয়ান-সাইড ব্রাশড ফ্লিস`,
  fitEn: variant.fit,
  fitBn: 'সমসাময়িক রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
  styleTag: 'urban',
});

export const GraphicArchiveSection: React.FC<GraphicArchiveSectionProps> = ({
  language,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenQuickView,
  onOpenBrandPage,
}) => {
  const { liveGraphicArchiveProducts, storeSettings } = useStoreData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
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

  const [addedSku, setAddedSku] = useState<string | null>(null);

  useEffect(() => {
    if (!activeLookbookSheet) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveLookbookSheet(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLookbookSheet]);

  const filteredProducts = liveGraphicArchiveProducts.filter((product) => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
    return a.priority - b.priority;
  });

  const handleSelectColor = (productId: string, variant: GraphicArchiveVariant) => {
    setSelectedVariantSkus((prev) => ({
      ...prev,
      [productId]: variant.sku,
    }));
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleAddToCart = (product: GraphicArchiveProduct, variant: GraphicArchiveVariant) => {
    const size = selectedSizes[product.id] || 'L';
    onAddToCart({
      productId: product.id,
      nameEn: `${product.name} Hoodie (${variant.sku})`,
      nameBn: `${product.name} হুডি (${variant.sku})`,
      priceBDT: variant.priceBdt,
      image: variant.previewImage,
      color: variant.color,
      size,
      quantity: 1,
    });

    setAddedSku(variant.sku);
    setTimeout(() => setAddedSku(null), 2200);
  };

  const categories = [
    {
      id: 'all',
      labelEn: `All Designs (${liveGraphicArchiveProducts.length})`,
      labelBn: `সকল ডিজাইন (${liveGraphicArchiveProducts.length}টি)`,
    },
    { id: 'Bangla Heritage', labelEn: 'Bangla Heritage', labelBn: 'বাংলা হেরিটেজ' },
    { id: 'Anime Archive', labelEn: 'Anime Archive', labelBn: 'অ্যানিমে আর্কাইভ' },
    { id: 'Moto Culture', labelEn: 'Moto Culture', labelBn: 'মটো কালচার' },
    { id: 'Playful Street', labelEn: 'Playful Street', labelBn: 'প্লেফুল স্ট্রিট' },
    { id: 'City Stories', labelEn: 'City Stories', labelBn: 'সিটি স্টোরিজ' },
    { id: 'Statement Graphics', labelEn: 'Statement Graphics', labelBn: 'স্টেটমেন্ট গ্রাফিক্স' },
  ];

  return (
    <section
      id="graphic-archive"
      className="scroll-mt-20 relative py-24 bg-[#0D0D10] border-t border-white/10 overflow-hidden"
    >
      {/* Background glow & luxury accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#B69A60]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#18181C] border border-[#B69A60]/30 text-xs font-mono tracking-widest text-[#D5BA80] mb-5">
            <img
              src="/assets/aistudio/Untitled_design_a468bd14.png"
              alt="Fabrician Emblem"
              className="w-4 h-4 object-contain"
            />
            <span>STARKIT × FABRICIAN</span>
            <span className="text-white/20">·</span>
            <span>DROP 01 · 11 DESIGNS · 15 COLORWAYS</span>
          </div>

          <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-light text-[#F5F2EB] tracking-tight leading-[1.1] mb-5 text-balance">
            {language === 'en' ? (
              <>
                The Graphic Archive <br />
                <span className="italic font-light text-[#D5BA80]">The Heavyweight Fleece Edit</span>
              </>
            ) : (
              <>
                দ্য গ্রাফিক আর্কাইভ <br />
                <span className="italic font-light text-[#D5BA80]">হেভিওয়েট ফ্লিস হুডি সংকলন</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-[#9A9892] max-w-2xl mx-auto font-light leading-relaxed mb-6">
            {language === 'en'
              ? 'Meticulously crafted from 330–350 GSM one-side brushed fleece with contemporary relaxed silhouettes. Every piece carries an authentic narrative rooted in Dhaka streets, retro moto speedways, and bold pop art.'
              : '৩৩০-৩৫০ জিএসএম প্রিমিয়াম ব্রাশড ফ্লিসে তৈরি সমকালীন ড্রপ-শোল্ডার হুডি। পুরান ঢাকার নস্টালজিয়া, মোটরস্পোর্ট স্পিডওয়ে এবং অ্যানিমে কালচারের সাহসী শৈল্পিক প্রকাশ।'}
          </p>

          {onOpenBrandPage && (
            <div className="mb-8">
              <button
                type="button"
                onClick={onOpenBrandPage}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#18181C] border border-[#B69A60]/50 hover:bg-[#B69A60] text-[#D5BA80] hover:text-[#09090B] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>
                  {language === 'en'
                    ? 'Explore StarKiT Brand Showcase'
                    : 'স্টারকিট ব্র্যান্ড শোরুম দেখুন'}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bundle Promotions & Hotline Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto bg-gradient-to-r from-[#17171B] via-[#1E1E24] to-[#17171B] border border-[#B69A60]/25 rounded-2xl p-4 sm:p-5 shadow-xl text-left">
            <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-4">
              <div className="w-9 h-9 rounded-xl bg-[#B69A60]/15 border border-[#B69A60]/30 flex items-center justify-center shrink-0 text-[#D5BA80]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-mono tracking-wider text-[#B69A60] uppercase">
                  {language === 'en' ? 'Bundle Privilege' : 'বান্ডেল ছাড়'}
                </p>
                <p className="text-xs font-semibold text-[#F5F2EB] tabular-nums">
                  {language === 'en'
                    ? `Save ৳${storeSettings.bundle2DiscountBDT} on 2 · Save ৳${storeSettings.bundle3DiscountBDT} on 3`
                    : `২টিতে ৳${storeSettings.bundle2DiscountBDT} ছাড় · ৩টিতে ৳${storeSettings.bundle3DiscountBDT} ছাড়`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase">
                  {language === 'en' ? 'Nationwide Delivery' : 'ডেলিভারি সুবিধা'}
                </p>
                <p className="text-xs font-semibold text-[#F5F2EB]">
                  {language === 'en'
                    ? `Free over ৳${storeSettings.freeShippingThresholdBDT.toLocaleString()} via Pathao`
                    : `৳${storeSettings.freeShippingThresholdBDT.toLocaleString()}+ অর্ডারে পাঠাও ফ্রি`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#8E2228]/25 border border-[#8E2228]/40 flex items-center justify-center shrink-0 text-[#E07A7F]">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-mono tracking-wider text-[#E07A7F] uppercase">
                  {language === 'en' ? 'Direct Order Hotline' : 'অর্ডার হটলাইন'}
                </p>
                <a
                  href={storeSettings.hotlineTel}
                  className="text-xs font-semibold text-[#F5F2EB] hover:text-[#D5BA80] transition-colors flex items-center gap-1 font-mono"
                >
                  {storeSettings.hotlineDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#B69A60] text-black shadow-lg shadow-[#B69A60]/25 font-semibold'
                    : 'bg-[#18181C] text-[#A09D94] border border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                {language === 'en' ? cat.labelEn : cat.labelBn}
              </button>
            ))}
          </div>

          {/* Price Sort */}
          <div className="flex items-center gap-2 bg-[#18181C] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#A09D94] self-end lg:self-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B69A60]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
              aria-label={language === 'en' ? 'Sort collection' : 'সংকলন সাজান'}
              className="bg-transparent text-xs text-[#F5F2EB] focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#18181C] text-white">
                {language === 'en' ? 'Featured Edit Order' : 'নির্বাচিত ক্রম'}
              </option>
              <option value="price-asc" className="bg-[#18181C] text-white">
                {language === 'en' ? 'Price: Low to High (৳1,290+)' : 'মূল্য: কম থেকে বেশি'}
              </option>
              <option value="price-desc" className="bg-[#18181C] text-white">
                {language === 'en' ? 'Price: High to Low (৳1,690)' : 'মূল্য: বেশি থেকে কম'}
              </option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid: 11 Unique Designs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const activeSku = selectedVariantSkus[product.id];
            const currentVariant =
              product.variants.find((v) => v.sku === activeSku) || product.variants[0];
            const currentSize = selectedSizes[product.id] || 'L';
            const isAdded = addedSku === currentVariant.sku;
            const isOutOfStock = product.catalogStatus === 'out_of_stock' || product.stockCount <= 0;
            const mappedProduct = toArchiveProduct(product, currentVariant);
            const isWish = isWishlisted?.(product.id) ?? false;

            return (
              <div
                key={product.id}
                className="group relative bg-[#131317] border border-white/10 hover:border-[#B69A60]/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] bg-[#0A0A0D] overflow-hidden">
                  <img
                    src={currentVariant.previewImage}
                    alt={`${product.name} - ${currentVariant.color}`}
                    className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105 ${
                      isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
                    }`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />

                  {/* Top Overlay Controls */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-wider text-[#D5BA80] uppercase pointer-events-none">
                        {product.id} · {product.category}
                      </span>
                      {isOutOfStock && (
                        <span className="px-2 py-1 rounded bg-black/90 border border-red-500/40 text-[10px] font-mono text-red-300 uppercase pointer-events-none">
                          {language === 'en' ? 'Out of Stock' : 'স্টক শেষ'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenQuickView && (
                        <button
                          type="button"
                          onClick={() => onOpenQuickView(mappedProduct)}
                          className="p-2 rounded-full bg-black/70 hover:bg-black text-[#D8D3C9] hover:text-white border border-white/10 transition-colors cursor-pointer"
                          aria-label={language === 'en' ? `Quick view ${product.name}` : `${product.name} বিস্তারিত দেখুন`}
                          title={language === 'en' ? 'Quick View & Reviews' : 'বিস্তারিত ও রিভিউ'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onToggleWishlist && (
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(mappedProduct)}
                          className={`p-2 rounded-full transition-colors cursor-pointer ${
                            isWish
                              ? 'bg-[#B69A60] text-[#09090B]'
                              : 'bg-black/70 text-[#D8D3C9] hover:text-white hover:bg-black'
                          }`}
                          aria-label={language === 'en' ? `Save ${product.name} to wishlist` : 'উইশলিস্টে যোগ করুন'}
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Feature Tag */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#D8D3C9]">
                      {product.feature}
                    </span>
                  </div>

                  {/* Hover Quick Action: Lookbook Sheet */}
                  <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 pointer-events-none">
                    <button
                      type="button"
                      onClick={() => setActiveLookbookSheet({ product, variant: currentVariant })}
                      className="pointer-events-auto px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold tracking-wider flex items-center gap-2 hover:bg-[#D5BA80] transition-colors cursor-pointer shadow-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'View Lookbook Sheet' : 'লুকবুক শিট দেখুন'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Content & Variant Selection */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-[#B69A60] uppercase mb-1">
                      {product.brand || 'StarKiT'} · {product.editorial}
                    </p>

                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-serif-luxury text-xl font-light text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors">
                        {product.name}
                      </h3>
                      <span className="font-mono text-base font-semibold text-[#F5F2EB] shrink-0 tabular-nums">
                        ৳{currentVariant.priceBdt.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#8E8B83] font-light line-clamp-2 leading-relaxed mb-4">
                      {language === 'en' ? product.descriptionEn : product.descriptionBn}
                    </p>

                    {/* Color Swatches & Size Selector */}
                    <div className="flex items-end justify-between gap-3 mb-4">
                      <div>
                        <p className="text-[10px] font-mono text-[#777570] uppercase mb-2">
                          {language === 'en' ? 'Color:' : 'রঙ:'}{' '}
                          <span className="text-white font-medium">{currentVariant.color}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          {product.variants.map((v) => {
                            const isSelected = v.sku === currentVariant.sku;
                            return (
                              <button
                                key={v.sku}
                                type="button"
                                onClick={() => handleSelectColor(product.id, v)}
                                title={`${v.color} - ৳${v.priceBdt}`}
                                aria-label={`Select color ${v.color}`}
                                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer relative ${
                                  isSelected
                                    ? 'border-[#B69A60] scale-110 shadow-md shadow-[#B69A60]/40'
                                    : 'border-white/20 hover:border-white/60'
                                }`}
                                style={{ backgroundColor: v.colorHex }}
                              >
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        v.color === 'Cream' ? 'bg-black' : 'bg-white'
                                      }`}
                                    />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Size Pills */}
                      <div>
                        <p className="text-[10px] font-mono text-[#777570] uppercase mb-2 text-right">
                          {language === 'en' ? 'Size' : 'সাইজ'}
                        </p>
                        <div className="flex items-center gap-1">
                          {ARCHIVE_SIZES.map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleSelectSize(product.id, sz)}
                              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                                currentSize === sz
                                  ? 'bg-[#B69A60] text-[#09090B] font-bold'
                                  : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fabric Spec Tag */}
                    <div className="bg-[#18181D] border border-white/5 rounded-lg p-2.5 mb-4 text-[11px] font-mono text-[#A09D94] flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-[#B69A60] shrink-0 mt-0.5" />
                      <span>
                        {currentVariant.gsm} · One-side brushed fleece · {currentVariant.fit}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && handleAddToCart(product, currentVariant)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isOutOfStock
                          ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-500 text-white cursor-pointer'
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
                          <span>{language === 'en' ? 'Add to Bag' : 'অর্ডারে যোগ করুন'}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={storeSettings.hotlineTel}
                      title={language === 'en' ? 'Call order concierge' : 'হটলাইনে কল করুন'}
                      aria-label="Call Fabrician order concierge"
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#D5BA80] hover:bg-white/10 transition-colors shrink-0"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lookbook Sheet Inspector Modal */}
      {activeLookbookSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="fixed inset-0" onClick={() => setActiveLookbookSheet(null)} />

          <div className="relative w-full max-w-4xl bg-[#121215] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/Untitled_design_a468bd14.png"
                  alt="Fabrician Emblem"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <div>
                  <h3 className="font-serif-luxury text-lg sm:text-xl text-[#F5F2EB]">
                    {activeLookbookSheet.product.name} — Lookbook Detail
                  </h3>
                  <p className="text-[11px] font-mono text-[#B69A60] tabular-nums">
                    {activeLookbookSheet.variant.sku} · {activeLookbookSheet.variant.color} · ৳
                    {activeLookbookSheet.variant.priceBdt.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveLookbookSheet(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
                aria-label="Close lookbook sheet"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center bg-[#09090B]">
              <img
                src={activeLookbookSheet.variant.catalogPageImage}
                alt={`${activeLookbookSheet.product.name} Lookbook Sheet`}
                className="w-full max-w-2xl h-auto rounded-xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#9A9892]">
                <span>{activeLookbookSheet.variant.fabric}</span>
                <span className="mx-2">·</span>
                <span className="text-[#D5BA80]">{activeLookbookSheet.variant.fit}</span>
              </div>

              <div className="flex items-center gap-3">
                {(() => {
                  const liveEntry = liveGraphicArchiveProducts.find(
                    (g) => g.id === activeLookbookSheet.product.id
                  );
                  const sheetOutOfStock =
                    liveEntry ? liveEntry.catalogStatus === 'out_of_stock' || liveEntry.stockCount <= 0 : false;
                  return (
                    <button
                      type="button"
                      disabled={sheetOutOfStock}
                      onClick={() => {
                        if (sheetOutOfStock) return;
                        handleAddToCart(activeLookbookSheet.product, activeLookbookSheet.variant);
                        setActiveLookbookSheet(null);
                      }}
                      className={`px-5 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 ${
                        sheetOutOfStock
                          ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                          : 'bg-[#F5F2EB] text-black hover:bg-[#D5BA80] cursor-pointer'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>
                        {sheetOutOfStock
                          ? language === 'en'
                            ? 'Out of Stock'
                            : 'স্টক শেষ'
                          : language === 'en'
                          ? 'Add This Piece to Bag'
                          : 'ব্যাগে যোগ করুন'}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
