/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const STARKIT_WHATSAPP_NUMBER = '8801931803462';
export const STARKIT_WHATSAPP_DISPLAY = '+880 1931-803462';
export const STARKIT_PROMO_CODE = 'STARKIT10';
export const STARKIT_LOOKBOOK_PDF = '/assets/aistudio/Fabrician_Premium_Master_Catalog_2026_57366f45.pdf';
export const STARKIT_BRAND_BOOK_PDF = '/assets/aistudio/starkit_brand_book_by_pomelli_f114d27f.pdf';

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
  founder: 'Nafe Munawer',
  city: 'Dhaka, Bangladesh',
  quoteEn: '"Dhaka-based clothing brand by Nafe Munawer."',
  overviewEn:
    'StarkiT is a Dhaka-based clothing brand created by Nafe Munawer, operating primarily through its Facebook presence.',
  overviewBn:
    'স্টারকিট হলো নাফে মুনাওয়ার কর্তৃক প্রতিষ্ঠিত একটি ঢাকা-ভিত্তিক পোশাক ব্র্যান্ড।',
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
      descEn: 'Rooted in Dhaka youth culture, local illustrators, and Facebook community drops.',
      descBn: 'ঢাকার তরুণ সমাজ, শিল্পী ও কমিউনিটি ড্রপের অনুপ্রেরণায় গড়া।',
    },
    {
      code: '02',
      titleEn: 'Style',
      titleBn: 'স্টাইল',
      descEn: 'Unapologetic Pure White #FFFFFF and Jet Black #170000 minimalist garment discipline.',
      descBn: 'পিওর হোয়াইট (#FFFFFF) ও জেট ব্ল্যাক (#170000) মনোক্রোম মিনিমালিজম।',
    },
    {
      code: '03',
      titleEn: 'Authenticity',
      titleBn: 'স্বকীয়তা',
      descEn: 'Dense 330–350 GSM brushed cotton fleece built with Afacad Flux graphic precision.',
      descBn: '৩৩০–৩৫০ জিএসএম প্রিমিয়াম কটন ফ্লিসে দীর্ঘস্থায়ী নিখুঁত গ্রাফিক।',
    },
  ],
};

export const STARKIT_FAQS = [
  {
    qEn: 'How heavy is the StarkiT Drop 01 fleece fabric?',
    qBn: 'স্টারকিট ড্রপ ০১ হুডির কাপড় কেমন এবং কত জিএসএম?',
    aEn: 'Every StarkiT Graphic Archive hoodie is stitched from 330–350 GSM one-side brushed cotton fleece—warm yet breathable for Dhaka evenings and highway rides.',
    aBn: 'প্রতিটি হুডি ৩৩০–৩৫০ জিএসএম ওয়ান-সাইড ব্রাশড কটন ফ্লিসে তৈরি, যা আরামদায়ক উষ্ণতা ও দীর্ঘস্থায়ী গঠন ধরে রাখে।',
  },
  {
    qEn: 'How does the 48-Hour Size & Defect Exchange guarantee work?',
    qBn: '৪৮ ঘণ্টার সাইজ ও ডিফেক্ট এক্সচেঞ্জ কীভাবে কাজ করে?',
    aEn: 'If your fit feels snug or loose—or any print defect is spotted upon delivery—message our WhatsApp Concierge (+880 1931-803462) within 48 hours with unworn tags intact for swift replacement.',
    aBn: 'ডেলিভারির ৪৮ ঘণ্টার মধ্যে সাইজ বা প্রিন্টে কোনো সমস্যা থাকলে আন-ওয়্যারড ও ট্যাগসহ আমাদের হোয়াটসঅ্যাপ ডেস্কে (+880 1931-803462) জানালেই দ্রুত এক্সচেঞ্জ করে দেওয়া হয়।',
  },
  {
    qEn: 'How do StarkiT bundle discounts stack with promo STARKIT10?',
    qBn: 'বান্ডেল ডিসকাউন্ট ও STARKIT10 প্রোমো কোড কি একসাথে পাওয়া যাবে?',
    aEn: 'Yes! Buying 2 pieces automatically deducts ৳150 and 3+ pieces deducts ৳300 plus unlocks complimentary Pathao delivery—and you can apply code STARKIT10 at checkout for an extra 10% off.',
    aBn: 'হ্যাঁ! ২টি নিলে ৳১৫০ ছাড় এবং ৩টি+ নিলে ৳৩০০ ছাড় ও ফ্রি ডেলিভারি স্বয়ংক্রিয়ভাবে যুক্ত হবে, সাথে চেকআউটে STARKIT10 কোডে আরও ১০% ছাড় পাবেন।',
  },
  {
    qEn: 'How fast is Pathao Courier delivery across Bangladesh?',
    qBn: 'বাংলাদেশের সব জেলায় ডেলিভারি পেতে কতদিন লাগে?',
    aEn: 'Inside Dhaka delivery arrives in 24–48 hours (Cash on Delivery available). Outside Dhaka across all 64 districts takes 2–4 business days via Pathao Courier.',
    aBn: 'ঢাকার ভেতরে ২৪–৪৮ ঘণ্টায় এবং সারাদেশের ৬৪ জেলায় ২–৪ কর্মদিবসের মধ্যে পাঠাও কুরিয়ারে ক্যাশ অন ডেলিভারি পৌঁছায়।',
  },
];
