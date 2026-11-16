import React, { useEffect } from 'react';
import {
  X,
  RefreshCw,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneCall,
  MapPin,
  PackageCheck,
} from 'lucide-react';
import { Language } from '../../types';
import { useStoreData } from '../../context/StoreDataContext';

interface ReturnsExchangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenTrackOrder?: () => void;
}

export const ReturnsExchangesModal: React.FC<ReturnsExchangesModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenTrackOrder,
}) => {
  const { storeSettings } = useStoreData();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEn = language === 'en';

  const pillars = [
    {
      icon: RefreshCw,
      title: isEn ? '7-Day Easy Exchange' : '৭ দিনের সহজ এক্সচেঞ্জ',
      desc: isEn
        ? 'Request a size or piece exchange within 7 calendar days of delivery.'
        : 'ডেলিভারি পাওয়ার ৭ দিনের মধ্যে সাইজ বা পোশাক পরিবর্তনের সুযোগ।',
    },
    {
      icon: Truck,
      title: isEn ? '64-District Doorstep Pickup' : '৬৪ জেলায় ডোরস্টেপ পিকআপ',
      desc: isEn
        ? 'Pathao Courier reverse pickup directly from your delivery address.'
        : 'পাঠাও কুরিয়ারের মাধ্যমে আপনার ঠিকানা থেকেই রিটার্ন পিকআপ সুবিধা।',
    },
    {
      icon: ShieldCheck,
      title: isEn ? '100% Defect Protection' : '১০০% ত্রুটি সুরক্ষা গ্যারান্টি',
      desc: isEn
        ? 'Zero return shipping fee for damaged, misprinted, or wrong items.'
        : 'ভুল বা ত্রুটিপূর্ণ পোশাকের ক্ষেত্রে কোনো রিটার্ন চার্জ প্রযোজ্য নয়।',
    },
  ];

  const eligibleItems = isEn
    ? [
        'Unworn, unwashed garments in original atelier condition with no perfume or stains.',
        'Original FABRICIAN, StarKiT, or Fariza’s Territory hangtags, barcodes, and protective packaging intact.',
        'Unstitched three-piece fabrics remaining un-cut and full-length (Kameez, Salwar & Dupatta).',
        'Size exchange requests submitted within 7 days of courier delivery confirmation.',
      ]
    : [
        'অব্যবহৃত ও না ধোয়া পোশাক, যাতে কোনো দাগ বা সুগন্ধি না থাকে।',
        'FABRICIAN, StarKiT বা Fariza’s Territory-এর মূল ট্যাগ, বারকোড ও প্যাকেজিং অক্ষুণ্ন থাকতে হবে।',
        'আনস্টিচড থ্রি-পিস সেটের কাপড় কাটা বা সেলাই করা না হয়ে থাকলে সম্পূর্ণ সেটসহ গ্রহণযোগ্য।',
        'ডেলিভারি নিশ্চিত হওয়ার ৭ ক্যালেন্ডার দিনের মধ্যে এক্সচেঞ্জ অনুরোধ জানাতে হবে।',
      ];

  const exceptionItems = isEn
    ? [
        'Custom stitched garments tailored to individual body measurements (eligible for complimentary atelier fit adjustment or defect replacement instead).',
        'Items returned after the 7-day window or showing signs of wear, wash, or missing tags.',
        'Final-sale archive drops explicitly marked non-returnable at checkout.',
      ]
    : [
        'গ্রাহকের ব্যক্তিগত মাপে কাস্টম সেলাইকৃত পোশাক (তবে ত্রুটির ক্ষেত্রে পরিবর্তন বা বিনামূল্যে ফিট অ্যাডজাস্টমেন্ট সুবিধা প্রযোজ্য)।',
        '৭ দিনের সময়সীমা অতিক্রান্ত হলে বা পোশাক ব্যবহার/ধোয়া কিংবা ট্যাগ বিহীন অবস্থায় থাকলে।',
        'চেকআউটে স্পষ্টভাবে নন-রিটার্নেবল হিসেবে উল্লেখিত স্পেশাল আর্কাইভ ডিসকাউন্ট আইটেম।',
      ];

  const steps = [
    {
      step: '01',
      title: isEn ? 'Inspect Within 7 Days' : '৭ দিনের মধ্যে যাচাই করুন',
      detail: isEn
        ? 'Keep your Order ID (FAB-XXXX) ready and inspect sizing or fabric upon delivery.'
        : 'ডেলিভারি পাওয়ার পর সাইজ ও মান যাচাই করুন এবং আপনার অর্ডার আইডি (FAB-XXXX) সংরক্ষণ করুন।',
    },
    {
      step: '02',
      title: isEn ? 'Contact Dhaka Concierge' : 'ঢাকা কনসিয়ার্জে যোগাযোগ করুন',
      detail: isEn
        ? `Call ${storeSettings.hotlineDisplay} with your Order ID and preferred replacement size or issue photo.`
        : `অর্ডার আইডি এবং কাঙ্ক্ষিত নতুন সাইজ বা ছবিসহ ${storeSettings.hotlineDisplay} নম্বরে কল করুন।`,
    },
    {
      step: '03',
      title: isEn ? 'Reverse Pickup & Reship' : 'পিকআপ ও দ্রুত ডেলিভারি',
      detail: isEn
        ? 'Our Pathao rider collects the sealed parcel; replacement dispatches or refunds settle in 3–5 business days.'
        : 'আমাদের পাঠাও রাইডার পার্সেল সংগ্রহ করবেন এবং যাচাই শেষে ৩–৫ কর্মদিবসের মধ্যে রিফান্ড বা নতুন সাইজ পাঠানো হবে।',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="returns-exchanges-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-3xl bg-[#121215] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/45">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/Untitled_design_a468bd14.png"
              alt="FABRICIAN Emblem"
              className="w-11 h-11 object-contain drop-shadow shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id="returns-exchanges-title"
                  className="font-serif-luxury text-xl sm:text-2xl text-[#F5F2EB] font-light"
                >
                  {isEn ? 'Returns & Exchanges Policy' : 'রিটার্ন ও এক্সচেঞ্জ নীতিমালা'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#B69A60]/15 text-[#D5BA80] border border-[#B69A60]/40">
                  {isEn ? '7-Day Guarantee' : '৭ দিনের গ্যারান্টি'}
                </span>
              </div>
              <p className="text-xs text-[#77777D] mt-0.5 font-mono">
                {isEn
                  ? 'FABRICIAN Client Assurance · StarKiT, Fariza’s Territory & Flagship Showroom'
                  : 'ফ্যাব্রিশিয়ান ক্রেতা সুরক্ষা · স্টারকিট, ফারিজাস টেরিটরি ও শোরুম'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#D8D3C9] hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Returns & Exchanges Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* 3 Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#B69A60]/15 border border-[#B69A60]/30 flex items-center justify-center text-[#D5BA80]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#F5F2EB] tracking-wide">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] text-[#9A9892] leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Eligibility vs Exceptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{isEn ? 'Eligible for Exchange / Return' : 'যেসব ক্ষেত্রে প্রযোজ্য'}</span>
              </div>
              <ul className="space-y-2 text-xs text-[#D8D3C9] leading-relaxed">
                {eligibleItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{isEn ? 'Exceptions & Custom Tailoring' : 'ব্যতিক্রম ও কাস্টম সেলাই'}</span>
              </div>
              <ul className="space-y-2 text-xs text-[#D8D3C9] leading-relaxed">
                {exceptionItems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Delivery Fee & Refund Terms */}
          <div className="p-4 sm:p-5 rounded-xl bg-black/45 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D5BA80]">
              <Clock className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>
                {isEn
                  ? 'Courier Fee Coverage & Refund Settlement'
                  : 'কুরিয়ার চার্জ ও রিফান্ড সময়সীমা'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
                <div className="font-semibold text-[#F5F2EB]">
                  {isEn ? 'Size or Style Exchange' : 'সাইজ বা স্টাইল পরিবর্তন'}
                </div>
                <p className="text-[#9A9892] leading-relaxed">
                  {isEn
                    ? `Standard Pathao exchange fee applies: ৳${storeSettings.dhakaShippingFeeBDT} (Dhaka Metro) or ৳${storeSettings.outsideDhakaShippingFeeBDT} (Outside Dhaka).`
                    : `পাঠাও এক্সচেঞ্জ ডেলিভারি চার্জ: ঢাকা সিটিতে ৳${storeSettings.dhakaShippingFeeBDT} এবং ঢাকার বাইরে ৳${storeSettings.outsideDhakaShippingFeeBDT}।`}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 space-y-1">
                <div className="font-semibold text-[#F5F2EB]">
                  {isEn ? 'Defective / Wrong Dispatch & Refunds' : 'ত্রুটিপূর্ণ পণ্য ও রিফান্ড'}
                </div>
                <p className="text-[#9A9892] leading-relaxed">
                  {isEn
                    ? '100% complimentary exchange pickup. Approved refunds (if replacement stock is sold out) are settled in 3–5 business days via bKash, Nagad, or Bank.'
                    : 'ত্রুটি বা ভুল পণ্যের জন্য পিকআপ সম্পূর্ণ ফ্রি। রিপ্লেসমেন্ট স্টক না থাকলে ৩–৫ কর্মদিবসের মধ্যে বিকাশ, নগদ বা ব্যাংকে রিফান্ড করা হয়।'}
                </p>
              </div>
            </div>
          </div>

          {/* 3-Step Return Process */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D5BA80]">
              <PackageCheck className="w-4 h-4 text-[#B69A60]" />
              <span>{isEn ? 'How to Initiate a Return or Exchange' : 'কীভাবে রিটার্ন বা এক্সচেঞ্জ করবেন'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map((s) => (
                <div
                  key={s.step}
                  className="p-3.5 rounded-xl bg-black/35 border border-white/10 space-y-1.5"
                >
                  <span className="text-[11px] font-mono font-bold text-[#B69A60]">
                    STEP {s.step}
                  </span>
                  <h5 className="text-xs font-semibold text-[#F5F2EB]">{s.title}</h5>
                  <p className="text-[11px] text-[#9A9892] leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-[#D8D3C9]">
            <a
              href={storeSettings.hotlineTel}
              className="inline-flex items-center gap-1.5 text-[#D5BA80] hover:text-white transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>{storeSettings.hotlineDisplay}</span>
            </a>
            <span className="inline-flex items-center gap-1.5 text-[#9A9892]">
              <MapPin className="w-3.5 h-3.5 text-[#B69A60]" />
              <span className="truncate max-w-[240px] sm:max-w-xs">
                {storeSettings.atelierAddress}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onOpenTrackOrder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTrackOrder();
                }}
                className="px-4 py-2 rounded-lg bg-[#B69A60]/15 hover:bg-[#B69A60] border border-[#B69A60]/40 text-[#D5BA80] hover:text-[#09090B] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap"
              >
                {isEn ? 'Track Order' : 'অর্ডার ট্র্যাক করুন'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5F2EB] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              {isEn ? 'Close' : 'বন্ধ করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
