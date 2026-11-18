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
  ShieldCheck,
  SearchCheck,
} from 'lucide-react';
import { Product, Language } from '../../types';
import { ReviewItem } from '../../data/mockReviews';
import { useStoreData } from '../../context/StoreDataContext';
import {
  submitStoreReview,
  upvoteStoreReview,
  verifyOrderReferenceForReview,
} from '../../services/storeService';
import { getSavedCustomerOrders } from '../../services/pathaoCourier';

export type VerifiedReviewTheme = 'dark-gold' | 'starkit-light' | 'starkit-dark' | 'fariza-light';

export interface VerifiedBuyerReviewsProps {
  product: Product;
  alternateProductIds?: string[];
  language: Language;
  theme?: VerifiedReviewTheme;
  compact?: boolean;
  initialOpenForm?: boolean;
  onFormOpenHandled?: () => void;
}

const THEME_CONFIG: Record<
  VerifiedReviewTheme,
  {
    root: string;
    summaryCard: string;
    scoreText: string;
    mutedText: string;
    bodyText: string;
    primaryBtn: string;
    starFilled: string;
    starEmpty: string;
    barBg: string;
    barFill: string;
    barActive: string;
    barHover: string;
    formBox: string;
    input: string;
    filterActive: string;
    filterIdle: string;
    reviewCard: string;
    verifiedBadge: string;
    divider: string;
    helpfulActive: string;
    helpfulIdle: string;
    emptyBox: string;
    orderBox: string;
  }
> = {
  'dark-gold': {
    root: 'text-[#F5F2EB]',
    summaryCard: 'bg-black/40 border border-white/10',
    scoreText: 'font-serif-luxury text-[#D5BA80]',
    mutedText: 'text-[#9A9892]',
    bodyText: 'text-[#D8D3C9]',
    primaryBtn: 'bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B]',
    starFilled: 'fill-[#B69A60] text-[#B69A60]',
    starEmpty: 'text-white/20',
    barBg: 'bg-white/10',
    barFill: 'bg-[#B69A60]',
    barActive: 'bg-[#B69A60]/15 text-[#F5F2EB]',
    barHover: 'text-[#D8D3C9] hover:bg-white/5',
    formBox: 'bg-black/60 border border-[#B69A60]/40',
    input: 'bg-black/70 border border-white/15 focus:border-[#B69A60] text-[#F5F2EB]',
    filterActive: 'bg-[#B69A60] text-[#09090B] font-bold shadow',
    filterIdle: 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 border border-white/5',
    reviewCard: 'bg-black/40 border border-white/10 hover:border-white/20',
    verifiedBadge:
      'bg-[#B69A60]/15 text-[#D5BA80] border border-[#B69A60]/35',
    divider: 'border-white/10',
    helpfulActive: 'bg-emerald-500/20 text-emerald-300',
    helpfulIdle: 'hover:bg-white/5 text-[#9A9892] hover:text-[#D8D3C9]',
    emptyBox: 'bg-black/25 border border-white/10',
    orderBox: 'bg-white/[0.03] border border-white/10',
  },
  'starkit-light': {
    root: 'text-[#170000]',
    summaryCard: 'bg-white border-2 border-[#170000]',
    scoreText: 'font-starkit font-bold text-[#170000]',
    mutedText: 'text-[#524B4B]',
    bodyText: 'text-[#2E2828]',
    primaryBtn: 'bg-[#170000] hover:bg-neutral-800 text-white',
    starFilled: 'fill-[#170000] text-[#170000]',
    starEmpty: 'text-[#170000]/20',
    barBg: 'bg-[#170000]/10',
    barFill: 'bg-[#170000]',
    barActive: 'bg-[#170000]/10 text-[#170000]',
    barHover: 'text-[#3F3A3A] hover:bg-[#ECEAEA]',
    formBox: 'bg-white border-2 border-[#170000]',
    input: 'bg-[#ECEAEA]/50 border border-[#170000]/25 focus:border-[#170000] text-[#170000]',
    filterActive: 'bg-[#170000] text-white font-bold',
    filterIdle: 'bg-white text-[#170000] hover:bg-[#ECEAEA] border border-[#170000]/20',
    reviewCard: 'bg-white border-2 border-[#170000]/15 hover:border-[#170000]',
    verifiedBadge: 'bg-[#170000] text-white border border-[#170000]',
    divider: 'border-[#170000]/10',
    helpfulActive: 'bg-[#170000] text-white',
    helpfulIdle: 'hover:bg-[#ECEAEA] text-[#524B4B] hover:text-[#170000]',
    emptyBox: 'bg-white border-2 border-[#170000]/15',
    orderBox: 'bg-[#ECEAEA]/65 border border-[#170000]/20',
  },
  'starkit-dark': {
    root: 'text-white',
    summaryCard: 'bg-[#200505] border border-white/15',
    scoreText: 'font-starkit font-bold text-white',
    mutedText: 'text-[#C7C1BF]',
    bodyText: 'text-white/90',
    primaryBtn: 'bg-white hover:bg-[#ECEAEA] text-[#170000]',
    starFilled: 'fill-white text-white',
    starEmpty: 'text-white/25',
    barBg: 'bg-white/15',
    barFill: 'bg-white',
    barActive: 'bg-white/15 text-white',
    barHover: 'text-[#C7C1BF] hover:bg-white/5',
    formBox: 'bg-[#200505] border border-white/30',
    input: 'bg-black/50 border border-white/20 focus:border-white text-white',
    filterActive: 'bg-white text-[#170000] font-bold',
    filterIdle: 'bg-white/5 text-white hover:bg-white/15 border border-white/15',
    reviewCard: 'bg-[#200505] border border-white/15 hover:border-white/35',
    verifiedBadge: 'bg-white text-[#170000] border border-white',
    divider: 'border-white/12',
    helpfulActive: 'bg-white text-[#170000]',
    helpfulIdle: 'hover:bg-white/10 text-[#C7C1BF] hover:text-white',
    emptyBox: 'bg-[#200505] border border-white/15',
    orderBox: 'bg-black/30 border border-white/15',
  },
  'fariza-light': {
    root: 'text-[#050505]',
    summaryCard: 'bg-white border border-[#050505]/12 shadow-sm',
    scoreText: 'font-fariza-display font-bold text-[#050505]',
    mutedText: 'text-[#4B5563]',
    bodyText: 'text-[#1F2937]',
    primaryBtn: 'bg-[#0866FF] hover:bg-[#0552D1] text-white',
    starFilled: 'fill-[#0866FF] text-[#0866FF]',
    starEmpty: 'text-[#050505]/15',
    barBg: 'bg-[#050505]/10',
    barFill: 'bg-[#0866FF]',
    barActive: 'bg-[#0866FF]/10 text-[#050505]',
    barHover: 'text-[#374151] hover:bg-[#F0F2F5]',
    formBox: 'bg-white border border-[#0866FF]/40 shadow-sm',
    input: 'bg-[#F0F2F5] border border-[#050505]/15 focus:border-[#0866FF] text-[#050505]',
    filterActive: 'bg-[#0866FF] text-white font-bold',
    filterIdle: 'bg-white text-[#050505] hover:bg-[#F0F2F5] border border-[#050505]/15',
    reviewCard: 'bg-white border border-[#050505]/12 hover:border-[#0866FF]/50',
    verifiedBadge: 'bg-[#31A24C]/12 text-[#196B2C] border border-[#31A24C]/35',
    divider: 'border-[#050505]/10',
    helpfulActive: 'bg-[#0866FF]/15 text-[#0866FF]',
    helpfulIdle: 'hover:bg-[#F0F2F5] text-[#4B5563] hover:text-[#050505]',
    emptyBox: 'bg-white border border-[#050505]/12',
    orderBox: 'bg-[#F0F2F5] border border-[#050505]/12',
  },
};

export const VerifiedBuyerReviews: React.FC<VerifiedBuyerReviewsProps> = ({
  product,
  alternateProductIds = [],
  language,
  theme = 'dark-gold',
  compact = false,
  initialOpenForm = false,
  onFormOpenHandled,
}) => {
  const { approvedReviews } = useStoreData();
  const palette = THEME_CONFIG[theme];

  const [isWritingReview, setIsWritingReview] = useState(initialOpenForm);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState(false);
  const [upvotedReviews, setUpvotedReviews] = useState<Record<string, boolean>>({});

  // Form state
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [formAuthor, setFormAuthor] = useState('');
  const [formLocation, setFormLocation] = useState('Dhaka');
  const [formSize, setFormSize] = useState(product.sizes[1] || product.sizes[0] || 'M');
  const [formFit, setFormFit] = useState<
    'Runs True to Size' | 'Slightly Relaxed' | 'Tailored & Snug'
  >('Runs True to Size');
  const [formOrderId, setFormOrderId] = useState('');
  const [orderVerifyStatus, setOrderVerifyStatus] = useState<
    'idle' | 'checking' | 'verified' | 'unverified'
  >('idle');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const savedOrders = useMemo(() => Object.values(getSavedCustomerOrders()), [isWritingReview]);

  const productMatchIds = useMemo(() => {
    const set = new Set<string>([product.id.toLowerCase()]);
    alternateProductIds.forEach((id) => {
      if (id) set.add(id.toLowerCase());
    });
    return set;
  }, [product.id, alternateProductIds]);

  useEffect(() => {
    setFormSize(product.sizes[1] || product.sizes[0] || 'M');
    setFilterRating(null);
    setVerifiedOnlyFilter(false);
    setFormSubmitted(false);
    setSubmitError(null);
  }, [product.id]);

  useEffect(() => {
    if (initialOpenForm) {
      setIsWritingReview(true);
      onFormOpenHandled?.();
    }
  }, [initialOpenForm, onFormOpenHandled]);

  const reviews = useMemo<ReviewItem[]>(() => {
    return approvedReviews
      .filter((r) => productMatchIds.has(r.productId.toLowerCase()))
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
        verifiedBuyer: Boolean(r.verifiedBuyer),
        helpfulCount: r.helpfulCount,
      }));
  }, [approvedReviews, productMatchIds]);

  const totalReviews = reviews.length;
  const verifiedCount = reviews.filter((r) => r.verifiedBuyer).length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  });

  const ratingLabels: Record<number, string> = {
    5: language === 'en' ? 'Exceptional Craft & Fit' : 'অসাধারণ মান ও ফিটিং',
    4: language === 'en' ? 'Very Good / Refined Fit' : 'খুব ভালো ফিটিং',
    3: language === 'en' ? 'Good Everyday Piece' : 'ভালো মানের পোশাক',
    2: language === 'en' ? 'Fair / Standard' : 'মোটামুটি মান',
    1: language === 'en' ? 'Needs Improvement' : 'উন্নতি প্রয়োজন',
  };

  const handleCheckOrderId = async (overrideId?: string) => {
    const candidate = (overrideId ?? formOrderId).trim().toUpperCase();
    if (!candidate) {
      setOrderVerifyStatus('idle');
      return;
    }
    setOrderVerifyStatus('checking');
    const result = await verifyOrderReferenceForReview(candidate);
    setOrderVerifyStatus(result.verified ? 'verified' : 'unverified');
  };

  const handleHelpfulClick = async (reviewId: string) => {
    if (upvotedReviews[reviewId]) return;
    setUpvotedReviews((prev) => ({ ...prev, [reviewId]: true }));

    try {
      await upvoteStoreReview(reviewId);
    } catch {
      setUpvotedReviews((prev) => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
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
          ? 'Please share a brief testimonial about fabric, print, or fit.'
          : 'অনুগ্রহ করে পোশাকটি সম্পর্কে সংক্ষিপ্ত মতামত লিখুন।'
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
          (language === 'en' ? 'Buyer Product Testimonial' : 'ক্রেতার মতামত'),
        comment: trimmedComment,
        orderReference: formOrderId.trim() || undefined,
      });
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setIsWritingReview(false);
        setFormTitle('');
        setFormComment('');
        setFormAuthor('');
        setFormOrderId('');
        setOrderVerifyStatus('idle');
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

  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== null && r.rating !== filterRating) return false;
    if (verifiedOnlyFilter && !r.verifiedBuyer) return false;
    return true;
  });

  return (
    <div className={`space-y-5 ${palette.root}`}>
      {/* 1. Verified Buyer Rating Overview */}
      <div className={`p-4 sm:p-5 rounded-xl space-y-4 ${palette.summaryCard}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-start">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-4xl tabular-nums leading-none ${palette.scoreText}`}>
                  {totalReviews > 0 ? averageRating : '—'}
                </span>
                <span className={`text-xs font-mono ${palette.mutedText}`}>/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      totalReviews > 0 && star <= Math.round(Number(averageRating))
                        ? palette.starFilled
                        : palette.starEmpty
                    }`}
                  />
                ))}
              </div>
              <div className={`text-[11px] font-mono mt-1 tabular-nums flex flex-wrap items-center gap-2 ${palette.mutedText}`}>
                <span>
                  {totalReviews}{' '}
                  {language === 'en'
                    ? totalReviews === 1
                      ? 'Review'
                      : 'Reviews'
                    : 'টি রিভিউ'}
                </span>
                {verifiedCount > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold">
                    · <ShieldCheck className="w-3 h-3" /> {verifiedCount}{' '}
                    {language === 'en' ? 'Verified' : 'ভেরিফায়েড'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWritingReview((prev) => !prev)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${palette.primaryBtn}`}
          >
            {isWritingReview ? (
              <>
                <X className="w-4 h-4" />
                <span>{language === 'en' ? 'Close Form' : 'বন্ধ করুন'}</span>
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4" />
                <span>
                  {language === 'en' ? 'Write Buyer Review' : 'রিভিউ লিখুন'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* 5-Star Visual Distribution Bars */}
        <div className={`pt-3 border-t ${palette.divider} space-y-1.5`}>
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
                  isActiveFilter ? palette.barActive : palette.barHover
                }`}
              >
                <span className="w-8 flex items-center gap-1 shrink-0 tabular-nums">
                  <span>{star}</span>
                  <Star className={`w-3 h-3 ${palette.starFilled}`} />
                </span>
                <div className={`flex-1 h-1.5 rounded-full ${palette.barBg} overflow-hidden`}>
                  <div
                    className={`h-full rounded-full ${palette.barFill} transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`w-14 text-right text-[10px] tabular-nums shrink-0 ${palette.mutedText}`}>
                  {pct}% ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Review & Optional Order Verification Form */}
      {isWritingReview && (
        <form
          onSubmit={handleSubmitReview}
          className={`p-5 rounded-2xl space-y-4 text-xs ${palette.formBox}`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${palette.divider}`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <h4 className="font-semibold text-sm sm:text-base">
                {language === 'en'
                  ? "Verified Buyer's Review"
                  : 'ভেরিফায়েড ক্রেতা রিভিউ লিখুন'}
              </h4>
            </div>
            <span className={`text-[10px] font-mono uppercase tracking-wider truncate max-w-[160px] ${palette.mutedText}`}>
              {product.nameEn}
            </span>
          </div>

          {/* Star Rating Picker */}
          <div>
            <label className="block text-[11px] font-mono uppercase mb-1.5">
              {language === 'en' ? 'Your Star Rating:' : 'আপনার রেটিং:'}{' '}
              <span className={`font-normal font-sans ${palette.mutedText}`}>
                ({hoverRating || formRating}/5 · {ratingLabels[hoverRating || formRating]})
              </span>
            </label>
            <div className="flex items-center gap-1.5">
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
                  aria-label={`Rate ${star} stars`}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || formRating) ? palette.starFilled : palette.starEmpty
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Author & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-mono uppercase mb-1 ${palette.mutedText}`}>
                {language === 'en' ? 'Your Name / Initial *' : 'আপনার নাম *'}
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Nusrat Jahan' : 'যেমন: নুসরাত জাহান'}
                className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none ${palette.input}`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-mono uppercase mb-1 ${palette.mutedText}`}>
                {language === 'en' ? 'District / City' : 'জেলা / শহর'}
              </label>
              <input
                type="text"
                maxLength={100}
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Banani, Dhaka' : 'যেমন: বনানী, ঢাকা'}
                className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none ${palette.input}`}
              />
            </div>
          </div>

          {/* Size Purchased & Fit Feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-[11px] font-mono uppercase mb-1 ${palette.mutedText}`}>
                {language === 'en' ? 'Size Purchased' : 'কেনা সাইজ'}
              </label>
              <select
                value={formSize}
                onChange={(e) => setFormSize(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none ${palette.input}`}
              >
                {product.sizes.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[11px] font-mono uppercase mb-1 ${palette.mutedText}`}>
                {language === 'en' ? 'Fit Assessment' : 'ফিটিং মতামত'}
              </label>
              <select
                value={formFit}
                onChange={(e) =>
                  setFormFit(
                    e.target.value as
                      | 'Runs True to Size'
                      | 'Slightly Relaxed'
                      | 'Tailored & Snug'
                  )
                }
                className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none ${palette.input}`}
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

          {/* Optional Order ID Verification for Verified Buyer Badge */}
          <div className={`p-3 rounded-xl space-y-2 ${palette.orderBox}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-mono uppercase font-semibold inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {language === 'en'
                    ? 'Order ID (Optional — unlocks Verified Buyer badge)'
                    : 'অর্ডার আইডি (ঐচ্ছিক — ভেরিফায়েড ক্রেতা ব্যাজ)'}
                </span>
              </label>
              {savedOrders.length > 0 && !formOrderId && (
                <button
                  type="button"
                  onClick={() => {
                    const recentId = savedOrders[0].orderId;
                    setFormOrderId(recentId);
                    void handleCheckOrderId(recentId);
                  }}
                  className="text-[10px] font-mono underline cursor-pointer"
                >
                  {language === 'en'
                    ? `Use recent: ${savedOrders[0].orderId}`
                    : `সাম্প্রতিক অর্ডার: ${savedOrders[0].orderId}`}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={64}
                value={formOrderId}
                onChange={(e) => {
                  setFormOrderId(e.target.value);
                  if (orderVerifyStatus !== 'idle') setOrderVerifyStatus('idle');
                }}
                placeholder={language === 'en' ? 'e.g. FAB-847291' : 'যেমন: FAB-847291'}
                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-mono uppercase focus:outline-none ${palette.input}`}
              />
              <button
                type="button"
                disabled={!formOrderId.trim() || orderVerifyStatus === 'checking'}
                onClick={() => void handleCheckOrderId()}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-45 whitespace-nowrap shrink-0 ${palette.primaryBtn}`}
              >
                <SearchCheck className="w-3.5 h-3.5" />
                <span>
                  {orderVerifyStatus === 'checking'
                    ? language === 'en'
                      ? 'Checking...'
                      : 'যাচাই...'
                    : language === 'en'
                    ? 'Verify'
                    : 'যাচাই'}
                </span>
              </button>
            </div>

            {orderVerifyStatus === 'verified' && (
              <p className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {language === 'en'
                    ? 'Order found — this review will display a Verified Buyer badge.'
                    : 'অর্ডার যাচাই সফল — আপনার রিভিউয়ে ভেরিফায়েড ক্রেতা ব্যাজ যুক্ত হবে।'}
                </span>
              </p>
            )}
            {orderVerifyStatus === 'unverified' && (
              <p className={`text-[11px] font-mono ${palette.mutedText}`}>
                {language === 'en'
                  ? 'Order ID not matched in live dispatch tracking — review will publish as a standard customer testimonial.'
                  : 'অর্ডার আইডি পাওয়া যায়নি — সাধারণ ক্রেতা রিভিউ হিসেবে প্রকাশিত হবে।'}
              </p>
            )}
          </div>

          {/* Headline */}
          <div>
            <label className={`block text-[11px] font-mono uppercase mb-1 ${palette.mutedText}`}>
              {language === 'en' ? 'Short Headline (Optional)' : 'শিরোনাম (ঐচ্ছিক)'}
            </label>
            <input
              type="text"
              maxLength={160}
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'e.g. Heavy fleece weight and sharp print detail'
                  : 'যেমন: দারুণ ফ্যাব্রিক এবং নিখুঁত ফিনিশিং'
              }
              className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none ${palette.input}`}
            />
          </div>

          {/* Short Text Testimonial */}
          <div>
            <label className={`block text-[11px] font-mono uppercase mb-1 ${palette.mutedText}`}>
              {language === 'en' ? 'Your Testimonial *' : 'আপনার মতামত *'}
            </label>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Share a short testimonial on fabric quality, stitch finish, or fit...'
                  : 'ফ্যাব্রিকের মান, সেলাই, আরাম ও ফিট সম্পর্কে সংক্ষিপ্ত মতামত লিখুন...'
              }
              className={`w-full rounded-lg p-3 text-xs focus:outline-none ${palette.input}`}
            />
          </div>

          {submitError && <p className="text-[11px] text-red-500">{submitError}</p>}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="submit"
              disabled={formSubmitted || isSubmitting}
              className={`px-5 py-2.5 font-semibold rounded-lg uppercase tracking-wider text-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60 ${palette.primaryBtn}`}
            >
              {formSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'en' ? 'Review Published!' : 'রিভিউ প্রকাশিত হয়েছে!'}
                  </span>
                </>
              ) : isSubmitting ? (
                <span>{language === 'en' ? 'Publishing...' : 'সংরক্ষণ হচ্ছে...'}</span>
              ) : (
                <span>{language === 'en' ? 'Publish Review' : 'রিভিউ জমা দিন'}</span>
              )}
            </button>

            <span className={`text-[10px] font-mono ${palette.mutedText}`}>
              {language === 'en'
                ? 'Synced live for store shoppers'
                : 'ক্রেতাদের জন্য লাইভ প্রকাশিত হবে'}
            </span>
          </div>
        </form>
      )}

      {/* 3. Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setFilterRating(null);
              setVerifiedOnlyFilter(false);
            }}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
              filterRating === null && !verifiedOnlyFilter
                ? palette.filterActive
                : palette.filterIdle
            }`}
          >
            {language === 'en' ? `All (${totalReviews})` : `সকল (${totalReviews})`}
          </button>

          {verifiedCount > 0 && (
            <button
              type="button"
              onClick={() => setVerifiedOnlyFilter((prev) => !prev)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                verifiedOnlyFilter ? palette.filterActive : palette.filterIdle
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>
                {language === 'en'
                  ? `Verified (${verifiedCount})`
                  : `ভেরিফায়েড (${verifiedCount})`}
              </span>
            </button>
          )}

          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  filterRating === star ? palette.filterActive : palette.filterIdle
                }`}
              >
                <span>{star}</span>
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] opacity-75 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        <span className={`text-[11px] font-mono tabular-nums ${palette.mutedText}`}>
          {language === 'en'
            ? `Showing ${filteredReviews.length} of ${totalReviews}`
            : `মোট ${totalReviews}টির মধ্যে ${filteredReviews.length}টি`}
        </span>
      </div>

      {/* 4. Review Feed */}
      <div className={`space-y-3.5 ${compact ? 'max-h-[340px] overflow-y-auto pr-1' : ''}`}>
        {filteredReviews.length === 0 ? (
          <div className={`p-6 text-center rounded-xl text-xs space-y-3 ${palette.emptyBox}`}>
            {totalReviews === 0 ? (
              <>
                <MessageSquarePlus className="w-7 h-7 mx-auto stroke-1 opacity-75" />
                <div className="space-y-1">
                  <p className="font-medium">
                    {language === 'en'
                      ? 'No buyer reviews yet for this piece'
                      : 'এই পোশাকটির জন্য এখনো কোনো রিভিউ নেই'}
                  </p>
                  <p className={palette.mutedText}>
                    {language === 'en'
                      ? 'Leave a star rating and short note on fabric weight, print, or fit.'
                      : 'ফ্যাব্রিকের মান, প্রিন্ট ও ফিটিং সম্পর্কে প্রথম মতামত লিখুন।'}
                  </p>
                </div>
                {!isWritingReview && (
                  <button
                    type="button"
                    onClick={() => setIsWritingReview(true)}
                    className={`px-4 py-2 rounded-lg font-mono font-semibold text-[11px] uppercase tracking-wider transition-colors cursor-pointer ${palette.primaryBtn}`}
                  >
                    {language === 'en' ? 'Write the First Review' : 'প্রথম রিভিউ লিখুন'}
                  </button>
                )}
              </>
            ) : (
              <>
                <p className={palette.mutedText}>
                  {language === 'en'
                    ? 'No matching reviews for the selected filter.'
                    : 'এই ফিল্টারে কোনো রিভিউ পাওয়া যায়নি।'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterRating(null);
                    setVerifiedOnlyFilter(false);
                  }}
                  className="underline font-mono text-[11px] cursor-pointer"
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
              className={`p-4 rounded-xl space-y-2.5 text-xs transition-colors ${palette.reviewCard}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold">{review.author}</span>
                    {review.verifiedBuyer && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${palette.verifiedBadge}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>
                          {language === 'en' ? 'Verified Buyer' : 'ভেরিফায়েড ক্রেতা'}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className={`flex flex-wrap items-center gap-2 text-[11px] font-mono ${palette.mutedText}`}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{review.location}</span>
                    </span>
                    <span>·</span>
                    <span>{review.date}</span>
                    <span>·</span>
                    <span>
                      {language === 'en' ? 'Size:' : 'সাইজ:'} {review.sizePurchased}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= review.rating ? palette.starFilled : palette.starEmpty
                      }`}
                    />
                  ))}
                </div>
              </div>

              {review.title && <h5 className="text-sm font-semibold">{review.title}</h5>}

              <p className={`text-xs leading-relaxed ${palette.bodyText}`}>{review.comment}</p>

              <div
                className={`pt-2 border-t ${palette.divider} flex items-center justify-between text-[11px] font-mono ${palette.mutedText}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">
                    {language === 'en' ? 'Fit:' : 'ফিটিং:'}
                  </span>
                  <span>{review.fitFeedback}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleHelpfulClick(review.id)}
                  disabled={upvotedReviews[review.id]}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    upvotedReviews[review.id] ? palette.helpfulActive : palette.helpfulIdle
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>
                    {language === 'en'
                      ? `Helpful (${review.helpfulCount})`
                      : `সহায়ক (${review.helpfulCount})`}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
