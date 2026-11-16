/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const STARKIT_WHATSAPP_NUMBER = '8801931803462';
export const STARKIT_WHATSAPP_DISPLAY = '+880 1931-803462';
export const STARKIT_PRIMARY_HOTLINE_DISPLAY = '+880 1778 307704';
export const STARKIT_PRIMARY_HOTLINE_TEL = 'tel:+8801778307704';
export const STARKIT_PROMO_CODE = 'STARKIT10';
export const STARKIT_LOOKBOOK_PDF = '/assets/aistudio/StarkiT_Premium_Product_Catalog_2026_46a43cbd.pdf';
export const STARKIT_BRAND_BOOK_PDF = '/assets/aistudio/starkit_brand_book_by_pomelli_f114d27f.pdf';

export const STARKIT_FABRIC_SPEC = {
  fabricEn: 'One-side brushed cotton fleece (330–350 GSM — seller specification; physical sample verification pending)',
  fabricBn: 'ওয়ান-সাইড ব্রাশড কটন ফ্লিস (৩৩০–৩৫০ জিএসএম — বিক্রেতা প্রদত্ত তথ্য; ফিজিক্যাল নমুনা যাচাই বাকি)',
  gsmShort: '330–350 GSM (Claim)',
  sampleVerified: false,
};

export const STARKIT_SIZE_CHART_META = {
  isPhysicalVerified: false,
  badgeEn: 'Reference Estimate · Pending Physical Verification',
  badgeBn: 'আনুমানিক রেফারেন্স · ফিজিক্যাল মাপ যাচাই বাকি',
  noticeEn:
    'Inches shown below are working drop-shoulder reference estimates and have not yet been audited against finished physical Drop 01 garments.',
  noticeBn:
    'নিচের মাপগুলো প্রাথমিক রেফারেন্স হিসেবে দেওয়া হয়েছে; চূড়ান্ত প্রোডাকশন স্যাম্পল থেকে ফিজিক্যাল মাপ এখনো যাচাই বাকি রয়েছে।',
};

export function buildStarKiTWhatsAppHref(message: string): string {
  return `https://wa.me/${STARKIT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export interface StarKiTSizeSpec {
  size: 'M' | 'L' | 'XL' | 'XXL';
  chestInches: number;
  lengthInches: number;
  shoulderInches: number;
  heightRange: string;
  weightRangeKg: string;
}

export const STARKIT_SIZE_CHART: StarKiTSizeSpec[] = [
  {
    size: 'M',
    chestInches: 40,
    lengthInches: 27.5,
    shoulderInches: 20.5,
    heightRange: `5'4" – 5'7"`,
    weightRangeKg: '55 – 66 kg',
  },
  {
    size: 'L',
    chestInches: 42,
    lengthInches: 28.5,
    shoulderInches: 21.5,
    heightRange: `5'7" – 5'10"`,
    weightRangeKg: '66 – 78 kg',
  },
  {
    size: 'XL',
    chestInches: 44,
    lengthInches: 29.5,
    shoulderInches: 22.5,
    heightRange: `5'10" – 6'1"`,
    weightRangeKg: '78 – 90 kg',
  },
  {
    size: 'XXL',
    chestInches: 46,
    lengthInches: 30.5,
    shoulderInches: 23.5,
    heightRange: `6'0" – 6'3"+`,
    weightRangeKg: '90 – 105+ kg',
  },
];

/**
 * Exact Brand Book Specifications (Pages 1–7)
 * Colors: Pure White #FFFFFF & Jet Black #170000
 * Primary Typeface: Afacad Flux
 */
export const STARKIT_BRAND_BOOK = {
  brandName: 'StarkiT',
  spacedWordmark: 'S T Λ R K I T',
  arabicName: 'ستاركيت',
  taglinePrimary: 'WEAR YOUR WORLD.',
  collectionName: 'DROP 01 / THE GRAPHIC ARCHIVE',
  founder: 'Nafe Munawer',
  city: 'Dhaka, Bangladesh',
  quoteEn: '"Dhaka-based clothing brand by Nafe Munawer."',
  overviewEn:
    'StarkiT is a Dhaka-based urban streetwear brand founded by Nafe Munawer, built on Community, Style, and Authenticity.',
  overviewBn:
    'স্টারকিট হলো নাফে মুনাওয়ার কর্তৃক প্রতিষ্ঠিত ঢাকা-ভিত্তিক আরবান স্ট্রিটওয়্যার ব্র্যান্ড।',
  tagline: 'Community · Style · Authenticity',
  taglineBn: 'কমিউনিটি · স্টাইল · স্বকীয়তা',
  primaryTypeface: 'Afacad Flux',
  colors: {
    pureWhite: { name: 'Pure White', hex: '#FFFFFF', rgb: '255, 255, 255' },
    jetBlack: { name: 'Jet Black', hex: '#170000', rgb: '23, 0, 0' },
  },
  aestheticTraits: [
    { en: 'Urban Streetwear', bn: 'আরবান স্ট্রিটওয়্যার' },
    { en: 'Youthful Dynamism', bn: 'তারুণ্যের গতিশীলতা' },
    { en: 'Playful Tactility', bn: 'প্লেফুল ট্যাকটিলিটি' },
    { en: 'Kinetic Energy', bn: 'কাইনেটিক এনার্জি' },
    { en: 'Graphic Flair', bn: 'গ্রাফিক ফ্লেয়ার' },
  ],
  toneOfVoice: [
    { en: 'Casual', bn: 'ক্যাজুয়াল' },
    { en: 'Modern', bn: 'আধুনিক' },
    { en: 'Approachable', bn: 'সহজবোধ্য' },
  ],
  pillars: [
    {
      code: '01',
      titleEn: 'Community',
      titleBn: 'কমিউনিটি',
      descEn: 'Rooted in Dhaka youth culture, local illustrators, and community-driven archive drops.',
      descBn: 'ঢাকার তরুণ সমাজ, শিল্পী ও কমিউনিটি ড্রপের অনুপ্রেরণায় গড়া।',
    },
    {
      code: '02',
      titleEn: 'Style',
      titleBn: 'স্টাইল',
      descEn: 'Unapologetic Pure White #FFFFFF and Jet Black #170000 monochrome visual discipline.',
      descBn: 'পিওর হোয়াইট (#FFFFFF) ও জেট ব্ল্যাক (#170000) মনোক্রোম মিনিমালিজম।',
    },
    {
      code: '03',
      titleEn: 'Authenticity',
      titleBn: 'স্বকীয়তা',
      descEn: 'Transparent pre-launch standards: verified rights, honest colorways, and real 330–350 GSM fleece samples.',
      descBn: 'স্বচ্ছ প্রি-লঞ্চ মানদণ্ড: যাচাইকৃত স্যাম্পল, সঠিক কালারওয়ে ও ৩৩০–৩৫০ জিএসএম ফ্লিস স্পেসিফিকেশন।',
    },
  ],
};

export const STARKIT_FAQS = [
  {
    qEn: 'What fabric specification is planned for StarkiT Drop 01 hoodies?',
    qBn: 'স্টারকিট ড্রপ ০১ হুডির কাপড়ের স্পেসিফিকেশন কী?',
    aEn: 'Drop 01 garments are specified as 330–350 GSM one-side brushed cotton fleece (seller-provided target specification; physical sample audit pending before commercial launch).',
    aBn: 'ড্রপ ০১ হুডিগুলো ৩৩০–৩৫০ জিএসএম ওয়ান-সাইড ব্রাশড কটন ফ্লিস স্পেসিফিকেশনে পরিকল্পিত (বাণিজ্যিক বিক্রির আগে ফিজিক্যাল নমুনা যাচাই প্রক্রিয়াধীন)।',
  },
  {
    qEn: 'Why are some colorways marked "Colorway in Development / Awaiting Approval"?',
    qBn: 'কিছু কালারওয়ে কেন "ইন ডেভেলপমেন্ট / অনুমোদনের অপেক্ষায়" দেখানো হয়েছে?',
    aEn: 'Drop 01 organizes 11 graphic designs across 4 standard hues (Black, Cream, Maroon, Chocolate Brown = 44 slots). Only the 15 source-documented colorways have preview artwork; the 29 new slots await real mockups, sample checks, and owner sign-off before ordering.',
    aBn: 'ড্রপ ০১-এর ১১টি ডিজাইন ৪টি রঙে (ব্ল্যাক, ক্রিম, মেরুন, চকোলেট ব্রাউন = ৪৪টি স্লট) সাজানো হয়েছে। ১৫টি স্লটে প্রাথমিক মকআপ রয়েছে; বাকি ২৯টি নতুন কালারওয়ে স্যাম্পল ও ছবির অনুমোদনের আগে অর্ডারযোগ্য নয়।',
  },
  {
    qEn: 'Which payment methods are currently supported?',
    qBn: 'বর্তমানে কোন কোন পেমেন্ট মাধ্যম চালু রয়েছে?',
    aEn: 'Orders run on Cash on Delivery (COD) across Bangladesh via Pathao Courier, subject to pre-dispatch confirmation. Digital MFS gateways (bKash/Nagad) remain offline until merchant onboarding completes.',
    aBn: 'সারা বাংলাদেশে পাঠাও কুরিয়ারের মাধ্যমে ক্যাশ অন ডেলিভারি (COD) সমর্থিত (অর্ডার কনফার্মেশনের পর ডিসপ্যাচ করা হয়)। বিকাশ/নগদ গেটওয়ে মার্চেন্ট অনবোর্ডিং শেষে চালু হবে।',
  },
  {
    qEn: 'How can I reach StarkiT & Graphic Archive support?',
    qBn: 'স্টারকিট সাপোর্টে কীভাবে যোগাযোগ করব?',
    aEn: 'Direct Order Hotline: +880 1778 307704 · WhatsApp Style Desk: +880 1931-803462 (Sat–Thu, 11:00 AM – 8:30 PM BDT).',
    aBn: 'অর্ডার হটলাইন: +880 1778 307704 · হোয়াটসঅ্যাপ ডেস্ক: +880 1931-803462 (শনি–বৃহস্পতি, সকাল ১১টা – রাত ৮:৩০)।',
  },
];
