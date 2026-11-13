import React, { useState, useEffect, Suspense } from 'react';
import { X, ShoppingBag, Heart, Check, Sparkles, Ruler, Star, MessageSquare } from 'lucide-react';
import { Product, Language, CartItem } from '../../types';
import { translations } from '../../data/translations';
import { SizeGuideModal } from './SizeGuideModal';
import { ProductReviewsModule } from '../reviews/ProductReviewsModule';
import { INITIAL_REVIEWS, ReviewItem } from '../../data/mockReviews';

const GarmentTryOn3DModal = React.lazy(() =>
  import('./GarmentTryOn3DModal').then((m) => ({ default: m.GarmentTryOn3DModal }))
);

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  language: Language;
}

function getReviewSummary(productId: string): { avg: string; count: number } {
  let reviews: ReviewItem[] = INITIAL_REVIEWS[productId] || INITIAL_REVIEWS['default'];
  try {
    const saved = localStorage.getItem(`fabrician_reviews_${productId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        reviews = parsed;
      }
    }
  } catch {
    // ignore storage errors
  }
  const count = reviews.length;
  const avg =
    count > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)
      : '5.0';
  return { avg, count };
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  language,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const t = translations[language];

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0]?.name || 'Standard');
      setSelectedSize(product.sizes?.[1] || product.sizes?.[0] || 'M');
      setActiveTab('details');
    }
  }, [product?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSizeGuideOpen && !isTryOnOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSizeGuideOpen, isTryOnOpen, onClose]);

  if (!isOpen || !product) return null;

  const activeColor = selectedColor || product.colors?.[0]?.name || 'Standard';
  const { avg: averageRating, count: reviewCount } = getReviewSummary(product.id);

  const handleAdd = () => {
    onAddToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: activeColor,
      size: selectedSize,
      quantity: 1,
    });
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md" />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto md:overflow-hidden bg-[#171719] border border-white/10 rounded-2xl shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#D8D3C9] hover:text-white rounded-full bg-black/60 hover:bg-black/90 cursor-pointer"
          aria-label="Close quick view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Media */}
        <div className="relative aspect-[3/4] md:aspect-auto md:h-full bg-black/40 overflow-hidden">
          <img
            src={product.image}
            alt={product.nameEn}
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-transparent to-transparent opacity-40" />
        </div>

        {/* Purchase & Reviews Module */}
        <div className="p-6 sm:p-8 flex flex-col justify-between md:overflow-y-auto md:max-h-[92vh]">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-[#B69A60] uppercase tracking-wider mb-2 pr-8">
              <span className="truncate">{product.collection}</span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1.5 text-[#D5BA80] hover:text-white transition-colors cursor-pointer group shrink-0"
                title={language === 'en' ? 'View Verified Client Reviews' : 'রিভিউ দেখুন'}
              >
                <div className="flex items-center text-[#B69A60]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-[#B69A60] text-[#B69A60]" />
                  ))}
                </div>
                <span className="font-semibold tabular-nums">{averageRating}</span>
                <span className="text-[#77777D] text-[10px] group-hover:underline tabular-nums">
                  ({reviewCount})
                </span>
              </button>
            </div>

            <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#F5F2EB] font-light mb-2">
              {language === 'en' ? product.nameEn : product.nameBn}
            </h3>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-mono text-2xl text-[#D5BA80] font-semibold tabular-nums">
                ৳ {product.priceBDT.toLocaleString()}
              </span>
              {product.compareAtPriceBDT && (
                <span className="font-mono text-sm text-[#77777D] line-through tabular-nums">
                  ৳ {product.compareAtPriceBDT.toLocaleString()}
                </span>
              )}
            </div>

            {/* Tab Switcher: Overview vs Reviews */}
            <div className="flex items-center gap-4 border-b border-white/10 mb-5 pb-2 text-xs font-mono uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`pb-1 transition-all cursor-pointer ${
                  activeTab === 'details'
                    ? 'border-b-2 border-[#B69A60] text-[#F5F2EB] font-bold'
                    : 'text-[#77777D] hover:text-[#D8D3C9]'
                }`}
              >
                {language === 'en' ? 'Overview & Fit' : 'বিস্তারিত ও ফিট'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-1 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-[#B69A60] text-[#F5F2EB] font-bold'
                    : 'text-[#77777D] hover:text-[#D8D3C9]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>{language === 'en' ? 'Reviews & Ratings' : 'রিভিউ ও রেটিং'}</span>
              </button>
            </div>

            {/* Tab 1: Product Details, Try-on & Sizing */}
            {activeTab === 'details' && (
              <div>
                <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 space-y-1.5 mb-6 text-xs">
                  <div>
                    <span className="text-[#77777D] font-mono mr-2">FABRIC:</span>
                    <span className="text-[#D8D3C9]">
                      {language === 'en' ? product.fabricEn : product.fabricBn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#77777D] font-mono mr-2">SARTORIAL FIT:</span>
                    <span className="text-[#D8D3C9]">
                      {language === 'en' ? product.fitEn : product.fitBn}
                    </span>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider text-[#D8D3C9] font-medium mb-2">
                    {language === 'en' ? 'Colorway:' : 'রঙ:'}{' '}
                    <span className="text-[#F5F2EB] font-normal">{activeColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                          activeColor === c.name
                            ? 'border-[#B69A60] scale-110'
                            : 'border-white/15 hover:border-white/40'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Virtual Try-On Trigger Button */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => setIsTryOnOpen(true)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-[#B69A60]/15 via-black/40 to-[#B69A60]/10 border border-[#B69A60]/40 hover:border-[#B69A60] text-[#D5BA80] hover:text-[#F5F2EB] flex items-center justify-between transition-all cursor-pointer shadow-lg group"
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="p-1.5 rounded-lg bg-[#B69A60]/20 text-[#D5BA80] group-hover:bg-[#B69A60] group-hover:text-[#09090B] transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <span>
                            {language === 'en'
                              ? 'Virtual Try-On (3D Mannequin)'
                              : 'ভার্চুয়াল ট্রাই-অন (৩ডি ম্যানিকিন)'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-[#B69A60]/30 text-[#F5F2EB] rounded font-bold">
                            3D
                          </span>
                        </div>
                        <div className="text-[10px] text-[#77777D] font-light">
                          {language === 'en'
                            ? 'Interactive 360° drape simulation on contemporary silhouette'
                            : 'সমসাময়িক ফিটে ৩৬০ ডিগ্রি ড্র্যাপ অনুকরণ'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#B69A60] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                      Launch →
                    </span>
                  </button>
                </div>

                {/* Size Selector with Size Guide Trigger */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider text-[#D8D3C9] font-medium">
                      {language === 'en' ? 'Size' : 'সাইজ'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-[#D5BA80] hover:text-white underline cursor-pointer transition-colors"
                    >
                      <Ruler className="w-3.5 h-3.5 text-[#B69A60]" />
                      <span>{language === 'en' ? 'Size Guide (Bangladeshi Fit)' : 'সাইজ গাইড'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer ${
                          selectedSize === s
                            ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                            : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Reviews & Ratings Module */}
            {activeTab === 'reviews' && (
              <ProductReviewsModule product={product} language={language} />
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={addedAnimation}
              className={`flex-1 py-3 px-6 rounded font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                addedAnimation
                  ? 'bg-[#B69A60] text-[#09090B]'
                  : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.essentials.addedToBag}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.essentials.addToBag}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product)}
              className={`p-3 rounded border border-white/15 transition-colors cursor-pointer ${
                isWishlisted
                  ? 'bg-[#B69A60] text-[#09090B]'
                  : 'hover:bg-white/10 text-[#D8D3C9]'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        language={language}
        defaultCategory={
          product.nameEn.toLowerCase().includes('panjabi') || product.category === 'Traditional'
            ? 'panjabi'
            : product.sizes.includes('Unstitched Set') || product.sizes.includes('Free Size')
            ? 'unstitched'
            : product.category === 'Women'
            ? 'kameez'
            : 'streetwear'
        }
      />

      {/* Lazy-Loaded Virtual Try-On 3D Mannequin Overlay Modal */}
      {isTryOnOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 text-xs font-mono text-[#D5BA80]">
              Loading 3D Mannequin Studio...
            </div>
          }
        >
          <GarmentTryOn3DModal
            product={product}
            isOpen={isTryOnOpen}
            onClose={() => setIsTryOnOpen(false)}
            onAddToCart={onAddToCart}
            language={language}
          />
        </Suspense>
      )}
    </div>
  );
};
