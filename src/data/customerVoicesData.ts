import {
  farizaVoicePlumLawn,
  farizaVoiceTealBatik,
  starkitVoiceCreamHoodie,
  starkitVoiceFolkHoodie,
} from '../assets/images';

export type CustomerVoiceBrand = "Fariza's Territory" | 'StarKiT';

export interface CustomerVoiceEntry {
  id: string;
  brand: CustomerVoiceBrand;
  author: string;
  locationEn: string;
  locationBn: string;
  productId: string;
  productLabelEn: string;
  productLabelBn: string;
  purchaseSpecEn: string;
  purchaseSpecBn: string;
  fitNoteEn: string;
  fitNoteBn: string;
  deliveredInEn: string;
  deliveredInBn: string;
  rating: number;
  highlightEn: string;
  highlightBn: string;
  quoteEn: string;
  quoteBn: string;
  image: string;
  imageAltEn: string;
  imageAltBn: string;
}

export const CUSTOMER_VOICES_DATA: CustomerVoiceEntry[] = [
  {
    id: 'voice-fariza-plum-lawn',
    brand: "Fariza's Territory",
    author: 'Nusrat Jahan Chowdhury',
    locationEn: 'Banani, Dhaka',
    locationBn: 'বনানী, ঢাকা',
    productId: 'tp-cat-001',
    productLabelEn: 'Magenta & Plum Printed Three-Piece (CAT-001)',
    productLabelBn: 'ম্যাজেন্টা ও প্লাম প্রিন্টেড থ্রি-পিস (CAT-001)',
    purchaseSpecEn: 'Custom Stitched 38" · Tassel Dupatta',
    purchaseSpecBn: 'কাস্টম সেলাই ৩৮" · ট্যাসেল ওড়না',
    fitNoteEn: 'Runs True to Size',
    fitNoteBn: 'সঠিক সাইজ ফিট',
    deliveredInEn: 'Same-day Banani Courier',
    deliveredInBn: 'একই দিনে বনানী ডেলিভারি',
    rating: 5,
    highlightEn: 'Breathable Swiss lawn drape with exact catalog dye fidelity',
    highlightBn: 'ক্যাটালগের ছবির সাথে শতভাগ রঙ ও সুইস লন কাপড়ের মিল',
    quoteEn:
      'I was skeptical about buying printed three-piece sets online, especially seeing if the plum tone stays deep in daylight. What arrived matched the catalog weave stitch-for-stitch—lightweight enough for Dhaka afternoons, and the hand-tied dupatta tassels stayed crisp after washing.',
    quoteBn:
      'অনলাইনে থ্রি-পিস কিনতে গেলে ছবির সাথে রঙের অমিল নিয়ে ভয় থাকে, কিন্তু ফারিজাস টেরিটরির এই প্লাম সেটটি দিনের আলোতে আরও স্নিগ্ধ লাগে। সুতির মান খুবই আরামদায়ক এবং ওড়নার ট্যাসেলগুলো ধোয়ার পরও একদম পরিপাটি আছে।',
    image: farizaVoicePlumLawn,
    imageAltEn: "Customer Nusrat in Banani wearing Fariza's Territory Magenta & Plum Three-Piece",
    imageAltBn: 'বনানীতে ফারিজাস টেরিটরির ম্যাজেন্টা ও প্লাম থ্রি-পিস পরিহিত ক্রেতা নুসরাত',
  },
  {
    id: 'voice-starkit-folk-hoodie',
    brand: 'StarKiT',
    author: 'Rafid Ahmed Tonmoy',
    locationEn: 'Dhanmondi 27, Dhaka',
    locationBn: 'ধানমন্ডি ২৭, ঢাকা',
    productId: 'FAB-H003',
    productLabelEn: 'Folk Art Bus Heavyweight Hoodie (STK-H003)',
    productLabelBn: 'ফোক আর্ট বাস হেভিওয়েট হুডি (STK-H003)',
    purchaseSpecEn: 'Size L · 350 GSM Brushed Fleece',
    purchaseSpecBn: 'সাইজ L · ৩৫০ জিএসএম ব্রাশড ফ্লিস',
    fitNoteEn: 'Relaxed Drop-Shoulder',
    fitNoteBn: 'রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
    deliveredInEn: '18h Dhaka Metro Delivery',
    deliveredInBn: '১৮ ঘণ্টায় ঢাকা মেট্রো ডেলিভারি',
    rating: 5,
    highlightEn: 'Proper 350 GSM structure that holds a boxy shoulder on rooftops',
    highlightBn: 'আসল ৩৫০ জিএসএম হেভি ফ্লিস যা বক্সি শোল্ডার ধরে রাখে',
    quoteEn:
      'Most local hoodies lose collar tension after two weeks. StarKiT actually nailed the dense brushed interior and structured hood silhouette—zero lint shedding on black tees underneath, and the screenprint ink feels cured straight into the cotton.',
    quoteBn:
      'বেশিরভাগ দেশি হুডির কলার ও হাতা কয়েকদিনেই ঢিলা হয়ে যায়, কিন্তু স্টারকিটের ৩৫০ জিএসএম ফ্লিস অনেক মজবুত। কালো টি-শার্টের ওপর কোনো রোঁয়া ওঠে না আর স্লিভ প্রিন্টও দারুণ নিখুঁত।',
    image: starkitVoiceFolkHoodie,
    imageAltEn: 'Customer Rafid on a Dhaka rooftop wearing StarKiT heavyweight black fleece hoodie',
    imageAltBn: 'ঢাকার ছাদে স্টারকিট হেভিওয়েট ব্ল্যাক ফ্লিস হুডি পরিহিত ক্রেতা রাফিদ',
  },
  {
    id: 'voice-fariza-teal-batik',
    brand: "Fariza's Territory",
    author: 'Tasnim Tabassum',
    locationEn: 'Nasirabad, Chattogram',
    locationBn: 'নাসিরাবাদ, চট্টগ্রাম',
    productId: 'tp-cat-002',
    productLabelEn: 'Emerald Teal Batik Three-Piece (CAT-002)',
    productLabelBn: 'এমারেল্ড টিল বাটিক থ্রি-পিস (CAT-002)',
    purchaseSpecEn: 'Unstitched Full Cut · 2.5m Dupatta',
    purchaseSpecBn: 'আনস্টিচড ফুল কাট · ২.৫ মিটার ওড়না',
    fitNoteEn: 'Tailor-Ready Margin',
    fitNoteBn: 'টেলারিংয়ের জন্য পর্যাপ্ত কাপড়',
    deliveredInEn: '36h Pathao Chattogram',
    deliveredInBn: '৩৬ ঘণ্টায় পাঠাও চট্টগ্রাম',
    rating: 5,
    highlightEn: 'Full uncut width even for tailored long-length kameez',
    highlightBn: 'লং-লেন্থ কামিজ ও ফুল হাতার জন্য পর্যাপ্ত বহরের কাপড়',
    quoteEn:
      'What stood out immediately for my Chattogram tailor was the generous full-width cotton cut and clean wax-resist batik borders. No color bleed during cold pre-soak before stitching, and delivery arrived inside two days with Cash on Delivery inspection.',
    quoteBn:
      'চট্টগ্রামে আমার টেইলার সবচেয়ে প্রশংসা করেছে কাপড়ের চওড়া বহর ও বাটিক বর্ডারের পরিচ্ছন্নতার। সেলাইয়ের আগে ভিজিয়ে রাখার পরও বিন্দুমাত্র রঙ ওঠেনি, আর ক্যাশ অন ডেলিভারিতে দুদিনেই হাতে পেয়েছি।',
    image: farizaVoiceTealBatik,
    imageAltEn: "Customer Tasnim wearing Fariza's Territory Emerald Teal Batik Three-Piece",
    imageAltBn: 'নাসিরাবাদে ফারিজাস টেরিটরির এমারেল্ড টিল বাটিক থ্রি-পিস পরিহিত ক্রেতা তাসনিম',
  },
  {
    id: 'voice-starkit-cream-hoodie',
    brand: 'StarKiT',
    author: 'Maliha Rahman',
    locationEn: 'Mirpur DOHS, Dhaka',
    locationBn: 'মিরপুর ডিওএইচএস, ঢাকা',
    productId: 'FAB-H007',
    productLabelEn: 'Aesthetic Dhaka Studio Fleece (STK-H007)',
    productLabelBn: 'অ্যাসথেটিক ঢাকা স্টুডিও ফ্লিস (STK-H007)',
    purchaseSpecEn: 'Size M · 350 GSM Brushed Fleece',
    purchaseSpecBn: 'সাইজ M · ৩৫০ জিএসএম ব্রাশড ফ্লিস',
    fitNoteEn: 'Slightly Relaxed Boxy Cut',
    fitNoteBn: 'হালকা রিল্যাক্সড বক্সি কাট',
    deliveredInEn: 'Mirpur Hub Same-Day',
    deliveredInBn: 'মিরপুর হাব থেকে একই দিনে ডেলিভারি',
    rating: 5,
    highlightEn: 'Clean Dhaka studio aesthetic that pairs effortlessly from morning coffee to late dinners',
    highlightBn: 'সকালের ক্যাফে স্টুডিও থেকে রাতের আড্ডা—সবখানেই মানানসই ঢাকা এডিশন',
    quoteEn:
      'Picked up my StarKiT studio fleece alongside a Fariza three-piece gift for my sister in one bag—the bundle discount applied automatically and Pathao called at the gate the next morning. Heavy ribbed cuffs sit neatly at the wrist without bunching.',
    quoteBn:
      'বোনের জন্য ফারিজাস টেরিটরির থ্রি-পিসের সাথে নিজের জন্য স্টারকিট হুডি একই ব্যাগে অর্ডার করেছিলাম—বান্ডেল ডিসকাউন্ট অটো অ্যাড হয়েছে। রিবড কাফ ও সফট ফ্লিস শীতের সকালের জন্য পারফেক্ট।',
    image: starkitVoiceCreamHoodie,
    imageAltEn: 'Customer Maliha at a Dhaka coffee studio wearing StarKiT Cream Fleece Hoodie',
    imageAltBn: 'ঢাকার ক্যাফে স্টুডিওতে স্টারকিট ক্রিম ফ্লিস হুডি পরিহিত ক্রেতা মালিহা',
  },
];
