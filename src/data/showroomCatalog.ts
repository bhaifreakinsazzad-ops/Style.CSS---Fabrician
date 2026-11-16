import { Product } from '../types';

export type ShowroomPatternType = 'ribbed' | 'twill' | 'celestial';

export interface ShowroomGarment {
  id: string;
  sku: string;
  subtitleEn: string;
  subtitleBn: string;
  titleEn: string;
  titleBn: string;
  colorNameEn: string;
  colorNameBn: string;
  priceBDT: number;
  hex: string;
  ribHex: string;
  accentHex: string;
  patternType: ShowroomPatternType;
  fabricEn: string;
  fabricBn: string;
  fitEn: string;
  fitBn: string;
  modelNoteEn: string;
  modelNoteBn: string;
  sizes: ('S' | 'M' | 'L' | 'XL')[];
  thumbnail: string;
}

function buildGarmentThumbnailSvg(hex: string, ribHex: string, pattern: ShowroomPatternType): string {
  const motif =
    pattern === 'celestial'
      ? `<circle cx="48" cy="46" r="10" fill="none" stroke="#EAE6DF" stroke-width="1.5" opacity="0.7"/><path d="M29 46a8 8 0 0 0 8 8 6.5 6.5 0 0 1-4-12 8 8 0 0 0-4 4z" fill="#EAE6DF" opacity="0.85"/>`
      : pattern === 'ribbed'
      ? `<g stroke="rgba(110,95,80,0.16)" stroke-width="1.2"><line x1="28" y1="24" x2="28" y2="74"/><line x1="34" y1="24" x2="34" y2="74"/><line x1="40" y1="24" x2="40" y2="74"/><line x1="46" y1="24" x2="46" y2="74"/><line x1="52" y1="24" x2="52" y2="74"/></g>`
      : `<g stroke="rgba(255,255,255,0.16)" stroke-width="1"><line x1="22" y1="30" x2="58" y2="66"/><line x1="22" y1="42" x2="54" y2="74"/></g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96">
    <rect width="80" height="96" rx="10" fill="#17181C"/>
    <path d="M24 22 L33 17 L40 20 L47 17 L56 22 L66 35 L62 68 L54 68 L53 42 L53 76 L27 76 L27 42 L26 68 L18 68 L14 35 Z" fill="${hex}" stroke="${ribHex}" stroke-width="1.5"/>
    <rect x="27" y="70" width="26" height="6" rx="1" fill="${ribHex}"/>
    <line x1="40" y1="20" x2="40" y2="76" stroke="#C8CED6" stroke-width="1.5"/>
    ${motif}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SHOWROOM_GARMENTS: ShowroomGarment[] = [
  {
    id: 'fab-showroom-aurelia',
    sku: 'FAB-SR01',
    subtitleEn: 'AW26 Atelier Outer',
    subtitleBn: 'শরৎ/শীত ২৬ আতেলিয়ে আউটার',
    titleEn: 'Aurelia Rib-Knit Blouson',
    titleBn: 'অরেলিয়া রিব-নিট ব্লাউজন',
    colorNameEn: 'Alabaster Wool',
    colorNameBn: 'অ্যালাবাস্টার উল',
    priceBDT: 6800,
    hex: '#EFE7DC',
    ribHex: '#DED3C4',
    accentHex: '#B69A60',
    patternType: 'ribbed',
    fabricEn:
      '88% Virgin Combed Wool, 12% Mulberry Silk Blend. Fine vertical rib-knit structure with two-way brushed silver zipper and tonal collar.',
    fabricBn:
      '৮৮% ভার্জিন কম্বড উল ও ১২% মালবেরি সিল্ক ব্লেন্ড। সূক্ষ্ম রিব-নিট টেক্সচার ও ব্রাশড সিলভার জিপার।',
    fitEn: 'Boxy Cropped Atelier Silhouette',
    fitBn: 'বক্সি ক্রপড আতেলিয়ে সিলুয়েট',
    modelNoteEn: 'Studio model is 187cm / 6\'1" wearing size M.',
    modelNoteBn: 'স্টুডিও মডেল ১৮৭ সেমি / ৬\'১" সাইজ M পরিহিত।',
    sizes: ['S', 'M', 'L', 'XL'],
    thumbnail: buildGarmentThumbnailSvg('#EFE7DC', '#DED3C4', 'ribbed'),
  },
  {
    id: 'fab-showroom-verona',
    sku: 'FAB-SR02',
    subtitleEn: 'AW26 Atelier Outer',
    subtitleBn: 'শরৎ/শীত ২৬ আতেলিয়ে আউটার',
    titleEn: 'Verona Gabardine Zip Jacket',
    titleBn: 'ভেরোনা গ্যাবার্ডিন জিপ জ্যাকেট',
    colorNameEn: 'Ash Slate',
    colorNameBn: 'অ্যাশ স্লেট',
    priceBDT: 7400,
    hex: '#8C96A4',
    ribHex: '#737D8B',
    accentHex: '#D8D3C9',
    patternType: 'twill',
    fabricEn:
      '100% Brushed Technical Wool Gabardine. Diagonal twill drape with sculpted raglan sleeves and concealed welt pockets.',
    fabricBn:
      '১০০% ব্রাশড টেকনিক্যাল উল গ্যাবার্ডিন। ডায়াগোনাল টুইল ড্রেপ ও র‍্যাগলান স্লিভ কাট।',
    fitEn: 'Structured Tailored Drape',
    fitBn: 'স্ট্রাকচার্ড টেইলরড ড্রেপ',
    modelNoteEn: 'Relaxed shoulder allowance designed for layering over knitwear.',
    modelNoteBn: 'নিটওয়্যারের ওপর লেয়ারিংয়ের জন্য উপযোগী রিল্যাক্সড শোল্ডার কাট।',
    sizes: ['S', 'M', 'L', 'XL'],
    thumbnail: buildGarmentThumbnailSvg('#8C96A4', '#737D8B', 'twill'),
  },
  {
    id: 'fab-showroom-celestial',
    sku: 'FAB-SR03',
    subtitleEn: 'Limited Capsule Edition',
    subtitleBn: 'লিমিটেড ক্যাপসুল এডিশন',
    titleEn: 'Celestial Silk Jacquard Blouson',
    titleBn: 'সেলেস্টিয়াল সিল্ক জ্যাকার্ড ব্লাউজন',
    colorNameEn: 'Eclipse Blue',
    colorNameBn: 'ইক্লিপস ব্লু',
    priceBDT: 8900,
    hex: '#9EB3C4',
    ribHex: '#7D93A6',
    accentHex: '#EAE6DF',
    patternType: 'celestial',
    fabricEn:
      '64% Mulberry Silk, 36% Combed Cotton Tapestry Jacquard woven with signature crescent moon & sunburst motifs.',
    fabricBn:
      '৬৪% মালবেরি সিল্ক ও ৩৬% কম্বড কটন ট্যাপেস্ট্রি জ্যাকার্ড—চাঁদ ও সূর্য মোটিফে বোনা।',
    fitEn: 'Relaxed Editorial Boxy Cut',
    fitBn: 'রিল্যাক্সড এডিটরিয়াল বক্সি কাট',
    modelNoteEn: 'Numbered Dhaka Atelier capsule drop with hand-finished ribbed cuffs.',
    modelNoteBn: 'ঢাকা আতেলিয়ে লিমিটেড ক্যাপসুল ড্রপ ও হ্যান্ড-ফিনিশড রিবড কাফ।',
    sizes: ['S', 'M', 'L', 'XL'],
    thumbnail: buildGarmentThumbnailSvg('#9EB3C4', '#7D93A6', 'celestial'),
  },
];

export function showroomGarmentToProduct(garment: ShowroomGarment): Product {
  return {
    id: garment.id,
    slug: garment.sku.toLowerCase(),
    brand: 'FABRICIAN',
    nameEn: garment.titleEn,
    nameBn: garment.titleBn,
    category: 'Unisex',
    collection: 'Virtual Atelier Showroom · AW26',
    priceBDT: garment.priceBDT,
    image: garment.thumbnail,
    colors: [
      { name: garment.colorNameEn, hex: garment.hex },
      { name: 'Rib Trim', hex: garment.ribHex },
    ],
    sizes: garment.sizes,
    fabricEn: garment.fabricEn,
    fabricBn: garment.fabricBn,
    fitEn: garment.fitEn,
    fitBn: garment.fitBn,
    isNew: true,
    styleTag: 'minimal',
  };
}
