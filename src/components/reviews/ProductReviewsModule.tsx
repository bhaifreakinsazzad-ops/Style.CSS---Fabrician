import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  ThumbsUp, 
  PenLine, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  X,
  Filter
} from 'lucide-react';
import { Product, Language } from '../../types';
import { ReviewItem, INITIAL_REVIEWS } from '../../data/mockReviews';

interface ProductReviewsModuleProps {
  product: Product;
  language: Language;
}

export const ProductReviewsModule: React.FC<ProductReviewsModuleProps> = ({
  product,
  language,
}) => {
  const storageKey = `fabrician_reviews_${product.id}`;

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS[product.id] || INITIAL_REVIEWS['default'];
  });

  const [isWritingReview, setIsWritingReview] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [upvotedReviews, setUpvotedReviews] = useState<Record<string, boolean>>({});

  // Review form state
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [formAuthor, setFormAuthor] = useState('');
  const [formLocation, setFormLocation] = useState('Dhaka');
  const [formSize, setFormSize] = useState(product.sizes[1] || product.sizes[0] || 'M');
  const [formFit, setFormFit] = useState<'Runs True to Size' | 'Slightly Relaxed' | 'Tailored & Snug'>('Runs True to Size');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Sync to local storage on review list update
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(reviews));
    } catch {
      // ignore quota errors
    }
  }, [reviews, storageKey]);

  // Calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  });

  const ratingLabels: Record<number, string> = {
    5: language === 'en' ? 'Exceptional Sartorial Quality' : 'অসাধারণ কোয়ালিটি',
    4: language === 'en' ? 'Very Good / Refined Fit' : 'খুব ভালো ফিটিং',
    3: language === 'en' ? 'Good Everyday Piece' : 'ভালো মানের পোশাক',
    2: language === 'en' ? 'Fair / Standard' : 'মোটামুটি মান',
    1: language === 'en' ? 'Needs Improvement' : 'উন্নতি প্রয়োজন',
  };

  const handleHelpfulClick = (reviewId: string) => {
    if (upvotedReviews[reviewId]) return;
    setUpvotedReviews((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formComment.trim()) return;

    const newReview: ReviewItem = {
      id: `rev-user-${Date.now()}`,
      productId: product.id,
      author: formAuthor.trim(),
      location: formLocation.trim() || 'Dhaka, Bangladesh',
      rating: formRating,
      date: 'Just now',
      sizePurchased: formSize,
      fitFeedback: formFit,
      title: formTitle.trim() || (language === 'en' ? 'Verified Client Feedback' : 'যাচাইকৃত ক্রেতা মতামত'),
      comment: formComment.trim(),
      verifiedBuyer: true,
      helpfulCount: 1,
    };

    setReviews([newReview, ...reviews]);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsWritingReview(false);
      // Reset form
      setFormTitle('');
      setFormComment('');
      setFormAuthor('');
    }, 1400);
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <div className="space-y-6 text-[#F5F2EB]">
      {/* 1. Rating Summary Overview Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left: Big Score & Stars */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <div className="flex flex-col items-center sm:items-start">
            <span className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#D5BA80] tabular-nums leading-none">
              {averageRating}
            </span>
            <div className="flex items-center gap-1 mt-2 text-[#D5BA80]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(averageRating))
                      ? 'fill-[#B69A60] text-[#B69A60]'
                      : 'text-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-[#77777D] mt-1">
              {totalReviews} {language === 'en' ? 'Verified Client Reviews' : 'টি যাচাইকৃত রিভিউ'}
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-[1px] h-16 bg-white/10" />

          {/* Quick Satisfaction Metrics */}
          <div className="text-xs space-y-1 text-[#D8D3C9]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>98% recommend this piece</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B69A60] shrink-0" />
              <span>100% Verified Bangladesh Deliveries</span>
            </div>
          </div>
        </div>

        {/* Right: Write Review Trigger */}
        <button
          onClick={() => setIsWritingReview(!isWritingReview)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
        >
          {isWritingReview ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" />
              <span>{language === 'en' ? 'Write a Review' : 'রিভিউ লিখুন'}</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Interactive Write Review Form Drawer */}
      {isWritingReview && (
        <form
          onSubmit={handleSubmitReview}
          className="p-5 rounded-2xl bg-black/60 border border-[#B69A60]/40 space-y-4 animate-fadeIn shadow-2xl text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B69A60]" />
              <h4 className="font-serif-luxury text-base sm:text-lg text-[#F5F2EB] font-light">
                {language === 'en' ? 'Share Your Sartorial Experience' : 'আপনার অভিজ্ঞতার রিভিউ দিন'}
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#D5BA80] uppercase tracking-wider">
              Verified Client
            </span>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#D8D3C9] mb-1.5">
              Your Overall Rating: <span className="text-[#D5BA80] font-normal font-sans">({ratingLabels[hoverRating || formRating]})</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(formRating)}
                  onClick={() => {
                    setFormRating(star);
                    setHoverRating(star);
                  }}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || formRating)
                        ? 'fill-[#B69A60] text-[#B69A60]'
                        : 'text-white/20'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Author Name and Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#77777D] mb-1">
                Your Name / Initial *
              </label>
              <input
                type="text"
                required
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. Sazzad Sharif"
                className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#77777D] mb-1">
                Location (City / District)
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Gulshan-2, Dhaka"
                className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Size Purchased & Fit Assessment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#77777D] mb-1">
                Size Purchased
              </label>
              <select
                value={formSize}
                onChange={(e) => setFormSize(e.target.value)}
                className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
              >
                {product.sizes.map((sz) => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#77777D] mb-1">
                Fit Assessment
              </label>
              <select
                value={formFit}
                onChange={(e) => setFormFit(e.target.value as any)}
                className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
              >
                <option value="Runs True to Size">Runs True to Size</option>
                <option value="Slightly Relaxed">Slightly Relaxed</option>
                <option value="Tailored & Snug">Tailored &amp; Snug</option>
              </select>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#77777D] mb-1">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Exceptional hand-feel and collar crispness"
              className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
            />
          </div>

          {/* Review Text Body */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#77777D] mb-1">
              Detailed Feedback *
            </label>
            <textarea
              required
              rows={3}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Describe the fabric weight, stitch finishing, breathability, and how it fit for your occasion..."
              className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg p-3 text-xs text-[#F5F2EB] focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={formSubmitted}
              className="px-6 py-2.5 bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] font-semibold rounded-lg uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {formSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Review Published!</span>
                </>
              ) : (
                <span>Publish Verified Review</span>
              )}
            </button>

            <span className="text-[10px] font-mono text-[#77777D]">
              Verified buyers only · Instant publication
            </span>
          </div>
        </form>
      )}

      {/* 3. Rating Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1 rounded-full font-mono text-[11px] transition-colors cursor-pointer ${
              filterRating === null
                ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
            }`}
          >
            All Reviews ({totalReviews})
          </button>

          {[5, 4, 3].map((star) => {
            const count = ratingCounts[star] || 0;
            return (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`px-2.5 py-1 rounded-full font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                  filterRating === star
                    ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                    : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{star}</span>
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] font-mono text-[#77777D]">
          Showing {filteredReviews.length} of {totalReviews} reviews
        </span>
      </div>

      {/* 4. Review Cards Feed */}
      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-black/20 border border-white/5 text-xs text-[#77777D]">
            No reviews matching this star filter.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2.5 text-xs hover:border-white/10 transition-colors"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#F5F2EB]">{review.author}</span>
                    {review.verifiedBuyer && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#B69A60]/15 text-[#D5BA80] border border-[#B69A60]/30">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#77777D] font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#B69A60]" />
                      <span>{review.location}</span>
                    </span>
                    <span>·</span>
                    <span>{review.date}</span>
                    <span>·</span>
                    <span>Size: {review.sizePurchased}</span>
                  </div>
                </div>

                {/* Star Score */}
                <div className="flex items-center gap-0.5 text-[#D5BA80] shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= review.rating ? 'fill-[#B69A60] text-[#B69A60]' : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Headline */}
              {review.title && (
                <h5 className="font-serif-luxury text-sm text-[#F5F2EB] font-medium">
                  {review.title}
                </h5>
              )}

              {/* Body */}
              <p className="text-xs text-[#D8D3C9] leading-relaxed font-light">
                {review.comment}
              </p>

              {/* Footer Fit Feedback & Helpful Trigger */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#77777D]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#B69A60]">Fit:</span>
                  <span>{review.fitFeedback}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleHelpfulClick(review.id)}
                  disabled={upvotedReviews[review.id]}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    upvotedReviews[review.id]
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'hover:bg-white/5 text-[#77777D] hover:text-[#D8D3C9]'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
