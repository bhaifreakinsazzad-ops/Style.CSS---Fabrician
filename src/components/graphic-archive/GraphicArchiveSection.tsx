/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  ExternalLink, 
  Check, 
  Layers, 
  SlidersHorizontal,
  Eye,
  Info,
  Truck,
  ArrowRight
} from 'lucide-react';
import { 
  GRAPHIC_ARCHIVE_PRODUCTS, 
  GRAPHIC_ARCHIVE_HOTLINE, 
  GRAPHIC_ARCHIVE_HOTLINE_TEL,
  BUNDLE_PROMOTIONS, 
  GraphicArchiveProduct, 
  GraphicArchiveVariant 
} from '../../data/graphicArchiveCatalog';
import { Language, CartItem } from '../../types';

interface GraphicArchiveSectionProps {
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onOpenTrackOrder?: (orderId?: string) => void;
  onOpenQuickView?: (product: any) => void;
}

export const GraphicArchiveSection: React.FC<GraphicArchiveSectionProps> = ({ 
  language, 
  onAddToCart,
  onOpenTrackOrder,
  onOpenQuickView 
}) => {

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rightsFilter, setRightsFilter] = useState<'all' | 'approved' | 'licensing'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, GraphicArchiveVariant>>(() => {
    const initial: Record<string, GraphicArchiveVariant> = {};
    GRAPHIC_ARCHIVE_PRODUCTS.forEach(p => {
      initial[p.id] = p.variants[0];
    });
    return initial;
  });

  const [activeCatalogSheet, setActiveCatalogSheet] = useState<{
    product: GraphicArchiveProduct;
    variant: GraphicArchiveVariant;
  } | null>(null);

  const [addedSku, setAddedSku] = useState<string | null>(null);

  // Filter products
  const filteredProducts = GRAPHIC_ARCHIVE_PRODUCTS.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    if (rightsFilter === 'approved' && product.isLicensingRequired) {
      return false;
    }
    if (rightsFilter === 'licensing' && !product.isLicensingRequired) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
    return a.priority - b.priority;
  });

  const handleSelectColor = (productId: string, variant: GraphicArchiveVariant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [productId]: variant,
    }));
  };

  const handleAddToCart = (product: GraphicArchiveProduct, variant: GraphicArchiveVariant) => {
    onAddToCart({
      productId: variant.sku,
      nameEn: `${product.name} Hoodie`,
      nameBn: `${product.name} হুডি`,
      priceBDT: variant.priceBdt,
      image: variant.previewImage,
      color: variant.color,
      size: 'L (Free Fit)',
      quantity: 1,
    });

    setAddedSku(variant.sku);
    setTimeout(() => setAddedSku(null), 2200);
  };

  const categories = [
    { id: 'all', labelEn: 'All Designs (11)', labelBn: 'সকল ডিজাইন (১১টি)' },
    { id: 'Bangla Heritage', labelEn: 'Bangla Heritage', labelBn: 'বাংলা হেরিটেজ' },
    { id: 'Anime Archive', labelEn: 'Anime Archive', labelBn: 'অ্যানিমে আর্কাইভ' },
    { id: 'Moto Culture', labelEn: 'Moto Culture', labelBn: 'মটো কালচার' },
    { id: 'Playful Street', labelEn: 'Playful Street', labelBn: 'প্লেফুল স্ট্রিট' },
    { id: 'City Stories', labelEn: 'City Stories', labelBn: 'সিটি স্টোরিজ' },
    { id: 'Statement Graphics', labelEn: 'Statement Graphics', labelBn: 'স্টেটমেন্ট গ্রাফিক্স' },
  ];

  return (
    <section id="graphic-archive" className="relative py-24 bg-[#0D0D10] border-t border-white/10 overflow-hidden">
      {/* Background glow & luxury accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#B69A60]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: DROP 01 / THE GRAPHIC ARCHIVE */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#18181C] border border-[#B69A60]/30 text-xs font-mono tracking-widest text-[#D5BA80] mb-5">
            <img 
              src="/assets/aistudio/Untitled_design_a468bd14.png" 
              alt="Fabrician Emblem" 
              className="w-4 h-4 object-contain"
            />
            <span>DROP 01 / 2026 CATALOG INTEGRATION</span>
            <span className="text-white/20">·</span>
            <span>11 DESIGNS · 15 COLORWAYS</span>
          </div>

          <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-light text-[#F5F2EB] tracking-tight leading-[1.1] mb-5">
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

          <p className="text-sm sm:text-base text-[#9A9892] max-w-2xl mx-auto font-light leading-relaxed mb-8">
            {language === 'en'
              ? 'Meticulously crafted from 330–350 GSM one-side brushed fleece with contemporary relaxed silhouettes. Every piece carries an authentic narrative rooted in Dhaka streets, retro moto speedways, and bold pop art.'
              : '৩৩০-৩৫০ জিএসএম প্রিমিয়াম ব্রাশড ফ্লিসে তৈরি সমকালীন ড্রপ-শোল্ডার হুডি। পুরান ঢাকার নস্টালজিয়া, মোটরস্পোর্ট স্পিডওয়ে এবং অ্যানিমে কালচারের সাহসী শৈল্পিক প্রকাশ।'}
          </p>

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
                <p className="text-xs font-semibold text-[#F5F2EB]">
                  {language === 'en' ? 'Save ৳150 on 2 · Save ৳300 on 3' : '২টিতে ৳১৫০ ছাড় · ৩টিতে ৳৩০০ ছাড়'}
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
                  {language === 'en' ? 'Free on 2+ Pieces via Pathao' : 'পাঠাও কুরিয়ারে ২+ পিসে ফ্রি ডেলিভারি'}
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
                  href={GRAPHIC_ARCHIVE_HOTLINE_TEL}
                  className="text-xs font-semibold text-[#F5F2EB] hover:text-[#D5BA80] transition-colors flex items-center gap-1 font-mono"
                >
                  {GRAPHIC_ARCHIVE_HOTLINE}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {categories.map(cat => (
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

          {/* Rights & Sorting Sub-Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Rights Clearance Filter */}
            <div className="flex items-center bg-[#18181C] border border-white/10 rounded-lg p-0.5 text-[11px] font-mono">
              <button
                onClick={() => setRightsFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  rightsFilter === 'all' ? 'bg-[#282830] text-white font-semibold' : 'text-[#888890] hover:text-white'
                }`}
              >
                {language === 'en' ? 'All (11)' : 'সব (১১)'}
              </button>
              <button
                onClick={() => setRightsFilter('approved')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  rightsFilter === 'approved' ? 'bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-500/30' : 'text-[#888890] hover:text-white'
                }`}
                title="Designs cleared for immediate commercial sale"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{language === 'en' ? 'Cleared' : 'অনুমোদিত'}</span>
              </button>
              <button
                onClick={() => setRightsFilter('licensing')}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  rightsFilter === 'licensing' ? 'bg-amber-950/60 text-amber-300 font-semibold border border-amber-500/30' : 'text-[#888890] hover:text-white'
                }`}
                title="Third-party marks requiring commercial licensing verification before paid marketing"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>{language === 'en' ? 'Licensing Audit' : 'লাইসেন্স যাচাই'}</span>
              </button>
            </div>

            {/* Price Sort */}
            <div className="flex items-center gap-2 bg-[#18181C] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#A09D94]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B69A60]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label={language === 'en' ? 'Sort collection' : 'সংকলন সাজান'}
                className="bg-transparent text-xs text-[#F5F2EB] focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-[#18181C] text-white">
                  {language === 'en' ? 'Featured Master Order' : 'মাস্টার ক্রম'}
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
        </div>

        {/* Product Cards Grid: 11 Unique Designs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const currentVariant = selectedVariants[product.id] || product.variants[0];
            const isAdded = addedSku === currentVariant.sku;

            return (
              <div
                key={product.id}
                className="group relative bg-[#131317] border border-white/10 hover:border-[#B69A60]/40 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[4/5] bg-[#0A0A0D] overflow-hidden">
                  <img
                    src={currentVariant.previewImage}
                    alt={`${product.name} - ${currentVariant.color}`}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Top Overlay Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-wider text-[#D5BA80] uppercase">
                      {product.id} · {product.category}
                    </span>

                    {product.isLicensingRequired ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-[9px] font-mono text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>LICENSING CHECK</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[9px] font-mono text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>CLEARED</span>
                      </span>
                    )}
                  </div>

                  {/* Feature Tag Bottom Pill */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#D8D3C9]">
                      {product.feature}
                    </span>
                  </div>

                  {/* Hover Quick Action: Inspect Master Catalog Sheet */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                    <button
                      onClick={() => setActiveCatalogSheet({ product, variant: currentVariant })}
                      className="px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold tracking-wider flex items-center gap-2 hover:bg-[#D5BA80] transition-colors cursor-pointer shadow-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Inspect Master Sheet' : 'মাস্টার শিট দেখুন'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Content & Variant Selection */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Editorial Kicker */}
                    <p className="text-[10px] font-mono tracking-widest text-[#B69A60] uppercase mb-1">
                      {product.editorial}
                    </p>

                    {/* Product Title */}
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-serif-luxury text-xl font-light text-[#F5F2EB] group-hover:text-[#D5BA80] transition-colors">
                        {product.name}
                      </h3>
                      <span className="font-mono text-base font-semibold text-[#F5F2EB] shrink-0">
                        ৳{currentVariant.priceBdt.toLocaleString()}
                      </span>
                    </div>

                    {/* Bilingual Description */}
                    <p className="text-xs text-[#8E8B83] font-light line-clamp-2 leading-relaxed mb-4">
                      {language === 'en' ? product.descriptionEn : product.descriptionBn}
                    </p>

                    {/* Color Swatches */}
                    <div className="mb-4">
                      <p className="text-[10px] font-mono text-[#777570] uppercase mb-2">
                        {language === 'en' ? 'Colorway:' : 'কালার ভ্যারিয়েন্ট:'}{' '}
                        <span className="text-white font-medium">{currentVariant.color}</span>
                        <span className="text-white/30 ml-1">({currentVariant.sku})</span>
                      </p>
                      <div className="flex items-center gap-2">
                        {product.variants.map((v) => {
                          const isSelected = v.sku === currentVariant.sku;
                          return (
                            <button
                              key={v.sku}
                              onClick={() => handleSelectColor(product.id, v)}
                              title={`${v.color} - ৳${v.priceBdt}`}
                              className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer relative ${
                                isSelected ? 'border-[#B69A60] scale-110 shadow-md shadow-[#B69A60]/40' : 'border-white/20 hover:border-white/60'
                              }`}
                              style={{ backgroundColor: v.colorHex }}
                            >
                              {isSelected && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className={`w-1.5 h-1.5 rounded-full ${v.color === 'Cream' ? 'bg-black' : 'bg-white'}`} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Fabric Spec Claim Tag */}
                    <div className="bg-[#18181D] border border-white/5 rounded-lg p-2.5 mb-4 text-[11px] font-mono text-[#A09D94] flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-[#B69A60] shrink-0 mt-0.5" />
                      <span>{currentVariant.gsm} · One-side brushed fleece · {currentVariant.fit}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => handleAddToCart(product, currentVariant)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80]'
                      }`}
                    >
                      {isAdded ? (
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
                      href={`${GRAPHIC_ARCHIVE_HOTLINE_TEL}?text=Hello%20Fabrician,%20I%20want%20to%20order%20${product.name}%20(${currentVariant.sku})`}
                      title="Direct hotline phone or message order"
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

        {/* Notice of Commercial Verification Transparency */}
        <div className="mt-16 bg-[#141418] border border-white/10 rounded-2xl p-6 text-xs text-[#8E8B83] leading-relaxed max-w-4xl mx-auto flex items-start gap-4">
          <ShieldCheck className="w-5 h-5 text-[#B69A60] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#F5F2EB] mb-1">
              {language === 'en' ? 'Fabrician Compliance & Material Integrity' : 'ফেব্রিসিয়ান কোয়ালিটি ও লাইসেন্সিং স্বচ্ছতা'}
            </p>
            <p>
              {language === 'en'
                ? 'All 11 unique designs in Drop 01 reflect exact catalog specifications. Designs bearing cultural emblems or third-party artistic homages (such as Naruto, One Punch Man, Royal Enfield, Tom & Jerry, and Student Movement insignias) undergo strict intellectual property audits prior to commercial paid advertising campaigns. Fabric specifications (330–350 GSM) are currently subject to sample lab verification.'
                : 'ড্রপ ০১-এর সকল ১১টি ডিজাইন সুনির্দিষ্ট ক্যাটালগ তথ্যের ভিত্তিতে উপস্থাপন করা হয়েছে। থার্ড-পার্টি ক্যারেক্টার ও প্রতীকযুক্ত ডিজাইনসমূহের ক্ষেত্রে পেইড ক্যাম্পেইনের পূর্বে যথাযথ স্বত্বাধিকার নিশ্চিত করা হচ্ছে। ৩৩০-৩৫০ জিএসএম ফ্লিস ফেব্রিক কোয়ালিটি আমাদের নিজস্ব ল্যাব চেকের আওতাধীন।'}
            </p>
          </div>
        </div>

      </div>

      {/* Master Catalog Sheet Inspector Modal */}
      {activeCatalogSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
          <div 
            className="fixed inset-0"
            onClick={() => setActiveCatalogSheet(null)}
          />

          <div className="relative w-full max-w-4xl bg-[#121215] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
            {/* Sheet Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/Untitled_design_a468bd14.png"
                  alt="Fabrician Master Emblem"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <div>
                  <h3 className="font-serif-luxury text-lg sm:text-xl text-[#F5F2EB]">
                    {activeCatalogSheet.product.name} — Master Catalog Sheet
                  </h3>
                  <p className="text-[11px] font-mono text-[#B69A60]">
                    {activeCatalogSheet.variant.sku} · {activeCatalogSheet.variant.color} · BDT {activeCatalogSheet.variant.priceBdt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveCatalogSheet(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
                aria-label="Close sheet"
              >
                ✕
              </button>
            </div>

            {/* Sheet High-Res Viewer */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center bg-[#09090B]">
              <img
                src={activeCatalogSheet.variant.catalogPageImage}
                alt={`${activeCatalogSheet.product.name} Full Catalog Sheet`}
                className="w-full max-w-2xl h-auto rounded-xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Sheet Footer Controls */}
            <div className="p-4 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-mono text-[#9A9892]">
                <span>{activeCatalogSheet.variant.fabric}</span>
                <span className="mx-2">·</span>
                <span className="text-[#D5BA80]">{activeCatalogSheet.variant.rightsClearance}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleAddToCart(activeCatalogSheet.product, activeCatalogSheet.variant);
                    setActiveCatalogSheet(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#F5F2EB] text-black font-semibold text-xs hover:bg-[#D5BA80] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Add This Piece to Bag' : 'ব্যাগে যোগ করুন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
