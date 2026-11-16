import React, { useState, useMemo, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  PenLine,
  Sparkles,
  MessageSquarePlus,
  MapPin,
  X,
} from 'lucide-react';
import { Product, Language } from '../../types';
import { ReviewItem } from '../../data/mockReviews';
import { useStoreData } from '../../context/StoreDataContext';
import { submitStoreReview, upvoteStoreReview } from '../../services/storeService';

interface ProductReviewsModuleProps {
  product: Product;
  language: Language;
  initialOpenForm?: boolean;
  onFormOpenHandled?: () => void;
}

export const ProductReviewsModule: React.FC<ProductReviewsModuleProps> = ({
  product,
  language,
  initialOpenForm = false,
  onFormOpenHandled,
}) => {
  const { approvedReviews } = useStoreData();

  const [isWritingReview, setIsWritingReview] = useState(initialOpenForm);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setFormSize(product.sizes[1] || product.sizes[0] || 'M');
    setFilterRating(null);
    setFormSubmitted(false);
    setSubmitError(null);
  }, [product.id]);

  useEffect(() => {
    if (initialOpenForm) {
      setIsWritingReview(true);
      onFormOpenHandled?.();
    }
  }, [initialOpenForm, onFormOpenHandled]);

  const firestoreReviewsForProduct = useMemo<ReviewItem[]>(() => {
    return approvedReviews
      .filter((r) => r.productId === product.id)
      .map((r) => ({
        id: r.id,
        productId: r.productId,
        author: r.author,
        location: r.location,
        rating: r.rating,
        date: new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(r.createdAtMs)),
        sizePurchased: r.sizePurchased,
        fitFeedback: r.fitFeedback,
        title: r.title,
        comment: r.comment,
        verifiedBuyer: false, // Require an order match before claiming verified buyer
        helpfulCount: r.helpfulCount,
      }));
  }, [approvedReviews, product.id]);

  // Demo reviews must never be shown as customer testimonials.
  const reviews = firestoreReviewsForProduct;

  // Calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

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

  const handleHelpfulClick = async (reviewId: string) => {
    if (upvotedReviews[reviewId]) return;
    setUpvotedReviews((prev) => ({ ...prev, [reviewId]: true }));

    const isFirestoreReview = approvedReviews.some((r) => r.id === reviewId);
    if (isFirestoreReview) {
      try {
        await upvoteStoreReview(reviewId);
      } catch {
        setUpvotedReviews((prev) => {
          const next = { ...prev };
          delete next[reviewId];
          return next;
        });
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedAuthor = formAuthor.trim();
    const trimmedComment = formComment.trim();
    if (!trimmedAuthor) {
      setSubmitError(
        language === 'en'
          ? 'Please enter your name or initial.'
          : 'অনুগ্রহ করে আপনার নাম লিখুন।'
      );
      return;
    }
    if (trimmedComment.length < 2) {
      setSubmitError(
        language === 'en'
          ? 'Please write at least a brief comment about the garment.'
          : 'অনুগ্রহ করে পোশাকটি সম্পর্কে সংক্ষিপ্ত মন্তব্য লিখুন।'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitStoreReview({
        productId: product.id,
        author: trimmedAuthor,
        location: formLocation.trim() || 'Dhaka, Bangladesh',
        rating: formRating,
        sizePurchased: formSize,
        fitFeedback: formFit,
        title:
          formTitle.trim() ||
          (language === 'en' ? 'Customer Product Feedback' : 'গ্রাহকের মতামত'),
        comment: trimmedComment,
      });
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setIsWritingReview(false);
        setFormTitle('');
        setFormComment('');
        setFormAuthor('');
      }, 1100);
    } catch {
      setSubmitError(
        language === 'en'
          ? 'Could not publish review right now. Please check your connection and try again.'
          : 'রিভিউ সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <div className="space-y-5 text-[#F5F2EB]">
      {/* 1. Rating Summary Overview Card with 5-Star Breakdown */}
      <div className="p-4 sm:p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Score & Stars */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-luxury text-4xl font-light text-[#D5BA80] tabular-nums leading-none">
                  {totalReviews > 0 ? averageRating : '—'}
                </span>
                <span className="text-xs font-mono text-[#77777D]">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-[#D5BA80]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      totalReviews > 0 && star <= Math.round(Number(averageRating))
                        ? 'fill-[#B69A60] text-[#B69A60]'
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#9A9892] mt-1 tabular-nums">
                {totalReviews}{' '}
                {language === 'en'
                  ? totalReviews === 1
                    ? 'Customer Review'
                    : 'Customer Reviews'
                  : 'টি গ্রাহক রিভিউ'}
              </span>
            </div>
          </div>

          {/* Write Review Trigger */}
          <button
            type="button"
            onClick={() => setIsWritingReview(!isWritingReview)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0"
          >
            {isWritingReview ? (
              <>
                <X className="w-4 h-4" />
                <span>{language === 'en' ? 'Close Form' : 'বন্ধ করুন'}</span>
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4" />
                <span>{language === 'en' ? 'Write a Review' : 'রিভিউ লিখুন'}</span>
              </>
            )}
          </button>
        </div>

        {/* 5-Star Visual Distribution Bars */}
        <div className="pt-3 border-t border-white/10 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            const isActiveFilter = filterRating === star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(isActiveFilter ? null : star)}
                className={`w-full flex items-center gap-2.5 text-[11px] font-mono rounded px-1.5 py-0.5 transition-colors cursor-pointer ${
                  isActiveFilter
                    ? 'bg-[#B69A60]/15 text-[#F5F2EB]'
                    : 'text-[#D8D3C9] hover:bg-white/5'
                }`}
              >
                <span className="w-8 flex items-center gap-1 shrink-0 tabular-nums">
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-[#B69A60] text-[#B69A60]" />
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#B69A60] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-14 text-right text-[10px] text-[#9A9892] tabular-nums shrink-0">
                  {pct}% ({count})
                </span>
              </button>
            );
          })}
        </div>
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
                {language === 'en' ? 'Share Your Experience' : 'আপনার অভিজ্ঞতা শেয়ার করুন'}
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#D5BA80] uppercase tracking-wider">
              {language === 'en' ? 'Product Review' : 'পণ্য রিভিউ'}
            </span>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#D8D3C9] mb-1.5">
              {language === 'en' ? 'Your Star Rating:' : 'আপনার রেটিং:'}{' '}
              <span className="text-[#D5BA80] font-normal font-sans">
                ({hoverRating || formRating}/5 · {ratingLabels[hoverRating || formRating]})
              </span>
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
              <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                {language === 'en' ? 'Your Name / Initial *' : 'আপনার নাম *'}
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Nusrat Jahan' : 'যেমন: নুসরাত জাহান'}
                className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                {language === 'en' ? 'District / City' : 'জেলা / শহর'}
              </label>
              <input
                type="text"
                maxLength={100}
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Banani, Dhaka' : 'যেমন: বনানী, ঢাকা'}
                className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Size Purchased & Fit Assessment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                {language === 'en' ? 'Size Purchased' : 'কেনা সাইজ'}
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
              <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                {language === 'en' ? 'Fit Assessment' : 'ফিটিং মতামত'}
              </label>
              <select
                value={formFit}
                onChange={(e) => setFormFit(e.target.value as 'Runs True to Size' | 'Slightly Relaxed' | 'Tailored & Snug')}
                className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
              >
                <option value="Runs True to Size">
                  {language === 'en' ? 'Runs True to Size' : 'সঠিক সাইজ'}
                </option>
                <option value="Slightly Relaxed">
                  {language === 'en' ? 'Slightly Relaxed' : 'হালকা ঢিলেঢালা'}
                </option>
                <option value="Tailored & Snug">
                  {language === 'en' ? 'Tailored & Snug' : 'টেইলর্ড ও ফিট'}
                </option>
              </select>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
              {language === 'en' ? 'Review Headline (Optional)' : 'শিরোনাম (ঐচ্ছিক)'}
            </label>
            <input
              type="text"
              maxLength={160}
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'e.g. Rich fabric texture and clean finishing'
                  : 'যেমন: দারুণ ফ্যাব্রিক এবং নিখুঁত ফিনিশিং'
              }
              className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
            />
          </div>

          {/* Review Text Body */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
              {language === 'en' ? 'Detailed Feedback *' : 'বিস্তারিত মতামত *'}
            </label>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Share thoughts on fabric weight, stitch finishing, comfort, and fit...'
                  : 'ফ্যাব্রিকের মান, সেলাই, আরাম ও ফিট সম্পর্কে লিখুন...'
              }
              className="w-full bg-black/70 border border-white/15 focus:border-[#B69A60] rounded-lg p-3 text-xs text-[#F5F2EB] focus:outline-none"
            />
          </div>

          {submitError && (
            <p className="text-[11px] text-red-400">{submitError}</p>
          )}

          {/* Submit Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <button
              type="submit"
              disabled={formSubmitted || isSubmitting}
              className="px-5 py-2.5 bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] font-semibold rounded-lg uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60"
            >
              {formSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'en' ? 'Review Published!' : 'রিভিউ প্রকাশিত হয়েছে!'}</span>
                </>
              ) : isSubmitting ? (
                <span>{language === 'en' ? 'Publishing...' : 'সংরক্ষণ হচ্ছে...'}</span>
              ) : (
                <span>{language === 'en' ? 'Submit Review' : 'রিভিউ জমা দিন'}</span>
              )}
            </button>

            <span className="text-[10px] font-mono text-[#9A9892]">
              {language === 'en'
                ? 'Published immediately for shoppers'
                : 'ক্রেতাদের জন্য সাথে সাথে প্রকাশিত হবে'}
            </span>
          </div>
        </form>
      )}

      {/* 3. Rating Filter Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1 rounded-full font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
              filterRating === null
                ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
            }`}
          >
            {language === 'en' ? `All (${totalReviews})` : `সকল (${totalReviews})`}
          </button>

          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`px-2.5 py-1 rounded-full font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  filterRating === star
                    ? 'bg-[#B69A60] text-[#09090B] font-bold shadow'
                    : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{star}</span>
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] opacity-75 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] font-mono text-[#9A9892] tabular-nums">
          {language === 'en'
            ? `Showing ${filteredReviews.length} of ${totalReviews}`
            : `মোট ${totalReviews}টির মধ্যে ${filteredReviews.length}টি`}
        </span>
      </div>

      {/* 4. Review Cards Feed */}
      <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
        {filteredReviews.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-black/25 border border-white/10 text-xs space-y-3">
            {totalReviews === 0 ? (
              <>
                <MessageSquarePlus className="w-7 h-7 text-[#B69A60] mx-auto stroke-1" />
                <div className="space-y-1">
                  <p className="text-[#F5F2EB] font-medium">
                    {language === 'en'
                      ? 'No customer reviews yet for this piece'
                      : 'এই পোশাকটির জন্য এখনো কোনো রিভিউ নেই'}
                  </p>
                  <p className="text-[#9A9892]">
                    {language === 'en'
                      ? 'Share your fit and fabric impression to help other shoppers.'
                      : 'অন্য ক্রেতাদের সাহায্য করতে আপনার অভিজ্ঞতা শেয়ার করুন।'}
                  </p>
                </div>
                {!isWritingReview && (
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(true)}
                    className="px-4 py-2 rounded-lg bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] font-mono font-semibold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Write the First Review' : 'প্রথম রিভিউ লিখুন'}
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-[#9A9892]">
                  {language === 'en'
                    ? `No ${filterRating}-star reviews yet.`
                    : `${filterRating}-স্টারের কোনো রিভিউ এখনো নেই।`}
                </p>
                <button
                  type="button"
                  onClick={() => setFilterRating(null)}
                  className="text-[#D5BA80] underline font-mono text-[11px] cursor-pointer"
                >
                  {language === 'en' ? 'Show all reviews' : 'সব রিভিউ দেখুন'}
                </button>
              </>
            )}
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
