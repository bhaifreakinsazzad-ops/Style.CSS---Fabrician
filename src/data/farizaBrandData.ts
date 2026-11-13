/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FARIZA_WHATSAPP_NUMBER = '8801931803462';
export const FARIZA_WHATSAPP_DISPLAY = '+880 1931-803462';
export const FARIZA_PROMO_CODE = 'FARIZA10';
export const FARIZA_CATALOG_PDF =
  '/assets/aistudio/Farizas_Territory_Premium_Master_Catalog_18_Products_2026_47a6afe1.pdf';
export const FARIZA_BRAND_BOOK_PDF =
  '/assets/aistudio/farizas_territory_brand_book_by_pomelli_b4b35ebd.pdf';

export const FARIZA_BRAND_ASSETS = {
  logo: '/assets/fariza/fariza_brand_logo.png',
  coverHero: '/assets/fariza/brandbook_cover_hero.png',
  campaignEnsemble: '/assets/fariza/brandbook_campaign_ensemble.png',
  craftPendant: '/assets/fariza/brandbook_craft_pendant.png',
  campaignNavy: '/assets/fariza/brandbook_campaign_navy.png',
} as const;

export function buildFarizaWhatsAppHref(message: string): string {
  return `https://wa.me/${FARIZA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export type FarizaChestSize = '34"' | '36"' | '38"' | '40"' | '42"' | '44"';

export interface FarizaSizeSpec {
  chest: FarizaChestSize;
  labelEn: string;
  labelBn: string;
  bustRangeIn: string;
  kameezLengthIn: string;
  salwarLengthIn: string;
  hipIn: string;
}

export const FARIZA_SIZE_CHART: FarizaSizeSpec[] = [
  {
    chest: '34"',
    labelEn: 'XS / 34',
    labelBn: 'এক্সএস / ৩৪',
    bustRangeIn: '33" – 34.5"',
    kameezLengthIn: '42" – 44"',
    salwarLengthIn: '38"',
    hipIn: '36"',
  },
  {
    chest: '36"',
    labelEn: 'S / 36',
    labelBn: 'স্মল / ৩৬',
    bustRangeIn: '35" – 36.5"',
    kameezLengthIn: '43" – 45"',
    salwarLengthIn: '38" – 39"',
    hipIn: '38"',
  },
  {
    chest: '38"',
    labelEn: 'M / 38',
    labelBn: 'মিডিয়াম / ৩৮',
    bustRangeIn: '37" – 38.5"',
    kameezLengthIn: '44" – 46"',
    salwarLengthIn: '39"',
    hipIn: '40"',
  },
  {
    chest: '40"',
    labelEn: 'L / 40',
    labelBn: 'লার্জ / ৪০',
    bustRangeIn: '39" – 40.5"',
    kameezLengthIn: '45" – 46"',
    salwarLengthIn: '39" – 40"',
    hipIn: '42"',
  },
  {
    chest: '42"',
    labelEn: 'XL / 42',
    labelBn: 'এক্সএল / ৪২',
    bustRangeIn: '41" – 42.5"',
    kameezLengthIn: '46" – 47"',
    salwarLengthIn: '40"',
    hipIn: '44"',
  },
  {
    chest: '44"',
    labelEn: 'XXL / 44',
    labelBn: 'ডাবল এক্সএল / ৪৪',
    bustRangeIn: '43" – 44.5"',
    kameezLengthIn: '46" – 48"',
    salwarLengthIn: '40" – 41"',
    hipIn: '46"',
  },
];

export const FARIZA_FABRIC_YARDAGE = [
  {
    pieceEn: 'Kameez Body & Sleeves',
    pieceBn: 'কামিজ বডি ও হাতা',
    specEn: '2.75 Yards Unstitched (Full Body + Long/3-Quarter Sleeves)',
    specBn: '২.৭৫ গজ আনস্টিচড (সম্পূর্ণ বডি ও ফুল/থ্রি-কোয়ার্টার হাতা)',
  },
  {
    pieceEn: 'Salwar Textile',
    pieceBn: 'সালোয়ার ফ্যাব্রিক',
    specEn: '2.50 Yards Solid / Printed Dyed Poplin & Cotton',
    specBn: '২.৫০ গজ ম্যাচিং পপলিন ও কটন কাপড়',
  },
  {
    pieceEn: 'Namaji / Bohur Dupatta',
    pieceBn: 'নামাজি / বহুর ওড়না',
    specEn: '5 Haat (Approx. 2.5 Yards) Breathable Voile, Cotton or Chiffon',
    specBn: '৫ হাত বড় নামাজি ওড়না (ব্রিদেবল ভয়েল / কটন / শিফন)',
  },
];

/**
 * Official Farizas Territory Brand Book Specifications (Pages 1–7)
 * Colors: Chalk White (#F0F2F5), Pure White (#FFFFFF), Azure Blue (#0866FF),
 *         Jet Black (#050505), Sea Green (#31A24C)
 * Primary Typeface: Actor
 */
export const FARIZA_BRAND_BOOK = {
  brandName: "Fariza's Territory",
  brandBookTitle: 'Farizas Territory',
  subtitleEn: 'Handmade & Crafts',
  city: 'Mirpur, Dhaka, Bangladesh',
  communityCount: '13,000+',
  quoteEn: '"Fashion accessories based in Dhaka, Bangladesh."',
  overviewEn:
    'Farizas Territory is a fashion accessories brand based in Mirpur, Dhaka, Bangladesh. The brand connects with over 13,000 social media followers through regular photos and video reels featuring its products.',
  overviewBn:
    'ফারিজাস টেরিটরি ঢাকার মিরপুর-ভিত্তিক একটি হস্তশিল্প ও ফ্যাশন ব্র্যান্ড, যা নিয়মিত ফটো ও ভিডিও রিলের মাধ্যমে ১৩,০০০+ ফলোয়ারের সাথে যুক্ত।',
  bengaliTagline: 'রঙে, নকশায়, আপনার নিজস্ব স্টাইল',
  valuesSummary: 'Style, Trendy Fashion, Community',
  valuesSummaryBn: 'স্টাইল · ট্রেন্ডি ফ্যাশন · কমিউনিটি',
  primaryTypeface: 'Actor',
  logoRules: {
    clearSpacePx: 95,
    minWidthPx: 152,
    minWidthInches: '1.58"',
  },
  colors: {
    chalkWhite: {
      name: 'Chalk White',
      hex: '#F0F2F5',
      rgb: '240, 242, 245',
      cmyk: '2%, 1%, 0%, 4%',
      hsl: '216, 20%, 95%',
      role: '60% Dominant Neutral Canvas',
    },
    pureWhite: {
      name: 'Pure White',
      hex: '#FFFFFF',
      rgb: '255, 255, 255',
      cmyk: '0%, 0%, 0%, 0%',
      hsl: '0, 0%, 100%',
      role: '30% Product & Editorial Card Surface',
    },
    azureBlue: {
      name: 'Azure Blue',
      hex: '#0866FF',
      rgb: '8, 102, 255',
      cmyk: '97%, 60%, 0%, 0%',
      hsl: '217, 100%, 52%',
      role: 'Primary Action & Interactive Focus',
    },
    jetBlack: {
      name: 'Jet Black',
      hex: '#050505',
      rgb: '5, 5, 5',
      cmyk: '0%, 0%, 0%, 98%',
      hsl: '0, 0%, 2%',
      role: 'Primary Ink, Borders & High-Contrast Framing',
    },
    seaGreen: {
      name: 'Sea Green',
      hex: '#31A24C',
      rgb: '49, 162, 76',
      cmyk: '70%, 0%, 53%, 36%',
      hsl: '134, 54%, 41%',
      role: 'Verified Craft, Stock & Delivery Accent',
    },
  },
  aestheticTraits: [
    { en: 'Folk-Art Ornamentation', bn: 'ফোক-আর্ট অলংকরণ' },
    { en: 'Heritage Patternwork', bn: 'ঐতিহ্যবাহী নকশাশৈলী' },
    { en: 'Artisanal Tactility', bn: 'হস্তশিল্পের স্পর্শানুভূতি' },
    { en: 'Botanical Intricacy', bn: 'উদ্ভিজ্জ সূক্ষ্ম কারুকাজ' },
    { en: 'Traditional Flourish', bn: 'চিরায়ত বাঙালি নকশা' },
  ],
  toneOfVoice: [
    { en: 'Casual', bn: 'স্বাভাবিক ও আন্তরিক' },
    { en: 'Modern', bn: 'আধুনিক' },
    { en: 'Trendy', bn: 'সমসাময়িক ট্রেন্ডি' },
  ],
  pillars: [
    {
      code: '01',
      titleEn: 'Style',
      titleBn: 'স্টাইল',
      descEn:
        'Crisp Swiss Lawn, hand-resisted Alfi & Mome batik, and mirror-work silhouettes tailored for everyday Dhaka confidence.',
      descBn:
        'সুইস লন, আলফি ও মোমে বাটিক এবং মিরর ওয়ার্কের নিখুঁত নকশায় প্রতিদিনের আত্মবিশ্বাসী উপস্থিতি।',
    },
    {
      code: '02',
      titleEn: 'Trendy Fashion',
      titleBn: 'ট্রেন্ডি ফ্যাশন',
      descEn:
        'Botanical intricacy paired with modern Chalk White #F0F2F5 and Azure Blue #0866FF editorial clarity.',
      descBn:
        'ঐতিহ্যবাহী ফ্লোরাল কারুকাজ এবং চক হোয়াইট ও আজুর ব্লু ভিজ্যুয়াল উপস্থাপনার আধুনিক সমন্বয়।',
    },
    {
      code: '03',
      titleEn: 'Community',
      titleBn: 'কমিউনিটি',
      descEn:
        'Nurtured in Mirpur, Dhaka across 13,000+ social patrons who shop directly via live reel showcases and custom fitting.',
      descBn:
        'ঢাকার মিরপুর থেকে গড়ে ওঠা ১৩,০০০+ ক্রেতার কমিউনিটি ও সরাসরি কাস্টম ফিটিং সেবা।',
    },
  ],
};

export const FARIZA_FAQS = [
  {
    qEn: 'Can I order a Three-Piece Unstitched or Custom Stitched?',
    qBn: 'আমি কি আনস্টিচড নাকি নিজের মাপে স্টিচড থ্রি-পিস অর্ডার করতে পারব?',
    aEn: 'Yes! On every card, select Unstitched Set (base catalog price with generous 2.75yd Kameez, 2.5yd Salwar, and 5-haat Dupatta) or switch to Custom Stitched (+৳450 tailoring fee) and choose your chest size from 34" to 44".',
    aBn: 'হ্যাঁ! প্রতিটি ডিজাইনে আনস্টিচড (২.৭৫ গজ কামিজ, ২.৫ গজ সালোয়ার ও ৫ হাত ওড়না) অথবা কাস্টম স্টিচড (+৳৪৫০ টেইলারিং) অপশনে ৩৪" থেকে ৪৪" বডি সাইজ বেছে অর্ডার করতে পারবেন।',
  },
  {
    qEn: 'How do FARIZA10 and 2-Set / 3-Set Bundle savings combine?',
    qBn: 'FARIZA10 প্রোমো কোড এবং ২/৩ সেট বান্ডেল ডিসকাউন্ট কীভাবে কাজ করে?',
    aEn: 'Adding 2 Three-Piece sets automatically applies a ৳150 bundle privilege; adding 3+ sets deducts ৳300 automatically. You can also enter code FARIZA10 at checkout for an extra 10% off—plus complimentary Pathao delivery on qualifying orders.',
    aBn: '২টি সেট নিলে স্বয়ংক্রিয়ভাবে ৳১৫০ এবং ৩টি+ নিলে ৳৩০০ বান্ডেল ছাড় যুক্ত হবে। সাথে চেকআউটে FARIZA10 কোড দিলে পাবেন আরও ১০% অতিরিক্ত ছাড় ও পাঠাও ফ্রি ডেলিভারি।',
  },
  {
    qEn: 'Is photography shot on actual Mirpur boutique fabric sets?',
    qBn: 'ছবিগুলোতে দেখানো কাপড় ও রঙ কি ডেলিভারির সাথে হুবহু মিলবে?',
    aEn: 'Every SKU carries verified dual photography—Original Fabric flat-lay and Model / Close-Up Texture—shot from real Mirpur boutique inventory. You can inspect shade, mirror work, and drape in our interactive 3D Fabric Studio before ordering.',
    aBn: 'প্রতিটি কোডের সাথে আসল কাপড়ের ফ্ল্যাট-লে এবং মডেল/ডিটেইল ছবি দেওয়া আছে। এছাড়া অর্ডারের আগেই ৩ডি ফ্যাব্রিক স্টুডিওতে কাপড়ের রঙ ও টেক্সচার ঘুরিয়ে দেখতে পারবেন।',
  },
  {
    qEn: 'What is the delivery timeline across 64 districts of Bangladesh?',
    qBn: 'সারাদেশে পাঠাও কুরিয়ারে ডেলিভারি পেতে কত সময় লাগে?',
    aEn: 'Unstitched sets ship via Pathao Courier within 24–48 hours inside Dhaka and 2–4 business days outside Dhaka with Cash on Delivery. Custom stitched orders allow 2 extra atelier tailoring days before dispatch.',
    aBn: 'আনস্টিচড সেট ঢাকার ভেতরে ২৪–৪৮ ঘণ্টায় এবং সারাদেশে ২–৪ কর্মদিবসে ক্যাশ অন ডেলিভারিতে পৌঁছে যায়। কাস্টম সেলাইয়ের ক্ষেত্রে অতিরিক্ত ২ দিন সময় প্রয়োজন হয়।',
  },
];
