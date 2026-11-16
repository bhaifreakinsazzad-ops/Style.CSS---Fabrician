/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Canonical StarkiT DROP 01 — 44-Variant Pre-Launch Architecture
 * Derived strictly from StarkiT_44_Variant_Readiness.json (schema 3.0-prelaunch-44-slot),
 * verified original catalog metadata, and audited local media files.
 */

export type WorkingColorName = 'Black' | 'Cream' | 'Maroon' | 'Chocolate Brown';
export type WorkingColorCode = 'BLK' | 'CRM' | 'MRN' | 'BRN';
export type MediaViewType =
  | 'front'
  | 'back'
  | 'detail_01'
  | 'detail_02'
  | 'detail_03'
  | 'reference_composite';

export interface WorkingPaletteColor {
  slotSuffix: 'C01' | 'C02' | 'C03' | 'C04';
  name: WorkingColorName;
  nameBn: string;
  code: WorkingColorCode;
  hex: string;
}

export const WORKING_COLOR_PALETTE: WorkingPaletteColor[] = [
  { slotSuffix: 'C01', name: 'Black', nameBn: 'জেট ব্ল্যাক', code: 'BLK', hex: '#170000' },
  { slotSuffix: 'C02', name: 'Cream', nameBn: 'ক্রিম', code: 'CRM', hex: '#F3EFE6' },
  { slotSuffix: 'C03', name: 'Maroon', nameBn: 'মেরুন', code: 'MRN', hex: '#5B1A24' },
  { slotSuffix: 'C04', name: 'Chocolate Brown', nameBn: 'চকোলেট ব্রাউন', code: 'BRN', hex: '#4B2E24' },
];

export const EXCLUDED_HTML_DISCREPANCY = {
  htmlExtraDesignId: 'STK-H012',
  htmlExtraDesignName: 'Kinetic Stage',
  htmlExtraSourceName: 'Marshmello Brand Book Edition',
  authoritativeCatalogInclusion: false,
  reason:
    'Present only as a concept slot in supplied HTML reference; excluded from authoritative 11-design / 44-variant production catalog unless explicitly approved.',
} as const;

export interface ReleaseReadinessGates {
  assetVerified: boolean;
  sampleVerified: boolean;
  rightsVerified: boolean;
  specVerified: boolean;
  sizeChartApproved: boolean;
  commercialTermsApproved: boolean;
  publicationStatus: 'HOLD / NOT FOR PUBLIC SALES' | 'APPROVED';
}

export type ImageIntegrityStatus =
  | 'VERIFIED_LOCAL_PREVIEW'
  | 'DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO'
  | 'PROVISIONAL_NO_ASSETS';

export interface StarKiTMediaManifestEntry {
  designId: string;
  sku: string;
  color: WorkingColorName;
  view: MediaViewType;
  siteAssetPath: string;
  zipRelativePath: string;
  inSuppliedMediaZip: boolean;
  existsLocally: boolean;
}

export interface StarKiTDesignMeta {
  designId: string;
  legacyId: string;
  slug: string;
  designName: string;
  sourceDesignName: string;
  legacyTitle: string;
  nameBn: string;
  editorial: string;
  category: 'Anime Archive' | 'Playful Street' | 'Bangla Heritage' | 'Moto Culture' | 'City Stories' | 'Statement Graphics';
  priceBdtProposed: number;
  descriptionEn: string;
  descriptionBn: string;
  feature: string;
  tags: string[];
  documentedColors: WorkingColorName[];
  plannedViewsByColor: Partial<Record<WorkingColorName, MediaViewType[]>>;
  isLicensingRequired: boolean;
  artworkRightsNote: string;
  sourceFolder: string;
  sheetPages: Partial<Record<WorkingColorName, string>>;
}

const SLUG_BY_DESIGN: Record<string, string> = {
  'STK-H001': 'shinobi-sunset',
  'STK-H002': 'peace-bro-club',
  'STK-H003': 'folk-route',
  'STK-H004': 'the-rider-code',
  'STK-H005': 'moonlit-hero',
  'STK-H006': 'celluloid-nights',
  'STK-H007': 'dhaka-afterglow',
  'STK-H008': 'collective-voice',
  'STK-H009': 'rickshaw-bloom',
  'STK-H010': 'cheese-chase',
  'STK-H011': 'night-circuit',
};

const VIEW_FILE_PREFIX: Record<MediaViewType, string> = {
  front: '01_front',
  back: '02_back',
  detail_01: '03_detail_01',
  detail_02: '04_detail_02',
  detail_03: '05_detail_03',
  reference_composite: '90_reference_composite',
};

export const STARKIT_44_DESIGNS_META: StarKiTDesignMeta[] = [
  {
    designId: 'STK-H001',
    legacyId: 'FAB-H001',
    slug: 'shinobi-sunset',
    designName: 'SHINOBI SUNSET',
    sourceDesignName: 'The Shinobi Legacy',
    legacyTitle: 'Naruto Legacy',
    nameBn: 'শিনোবি সানসেট (সোর্স: দ্য শিনোবি লিগ্যাসি)',
    editorial: 'THE SHINOBI LEGACY',
    category: 'Anime Archive',
    priceBdtProposed: 1590,
    descriptionEn:
      'A crimson-sun anime graphic composition built for Drop 01 across front, back, and sleeve layout references.',
    descriptionBn:
      'অ্যানিমে-অনুপ্রাণিত সাহসী গ্রাফিক—সামনে মিনিমাল এবং পেছনে স্টেটমেন্ট আর্টওয়ার্ক। স্লিভ ডিটেইল সহ।',
    feature: 'Front + Back + Sleeve Art',
    tags: ['anime', 'graphic', 'red sun', 'sleeve print', 'shinobi', 'stk-h001', 'fab-h001'],
    documentedColors: ['Black', 'Cream'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'detail_01', 'detail_02', 'detail_03', 'reference_composite'],
      Cream: ['front', 'back', 'detail_01', 'detail_02', 'detail_03', 'reference_composite'],
    },
    isLicensingRequired: true,
    artworkRightsNote: 'Third-party character and logo: written commercial licensing required before public sales.',
    sourceFolder: 'https://drive.google.com/drive/folders/1qtzNUmQEcWkFn9rpROcj5xr-2dvRahXG',
    sheetPages: {
      Cream: '/media/products/STK-H001-CRM/STK-H001-CRM__90_reference_composite.webp',
      Black: '/media/products/STK-H001-BLK/STK-H001-BLK__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H002',
    legacyId: 'FAB-H002',
    slug: 'peace-bro-club',
    designName: 'PEACE BRO CLUB',
    sourceDesignName: 'Good Vibes. No Noise.',
    legacyTitle: 'Peace Bro Cat',
    nameBn: 'পিস ব্রো ক্লাব (সোর্স: গুড ভাইবস)',
    editorial: 'GOOD VIBES. NO NOISE.',
    category: 'Playful Street',
    priceBdtProposed: 1290,
    descriptionEn:
      'High-contrast feline streetwear graphic engineered for clean everyday Dhaka layering.',
    descriptionBn:
      'প্লেফুল ক্যাট ইলাস্ট্রেশন ও কনট্রাস্ট স্ট্রিটওয়্যার কম্পোজিশন।',
    feature: 'Bold Back Graphic',
    tags: ['cat', 'fun', 'graphic', 'street', 'peace', 'stk-h002', 'fab-h002'],
    documentedColors: ['Black'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'reference_composite'],
    },
    isLicensingRequired: false,
    artworkRightsNote: 'Originality and artwork ownership to be confirmed prior to commercial launch.',
    sourceFolder: 'https://drive.google.com/drive/folders/1n45WYtN_t8DG2QBeJ86i2Fyqz4O3rfEo',
    sheetPages: {
      Black: '/media/products/STK-H002-BLK/STK-H002-BLK__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H003',
    legacyId: 'FAB-H003',
    slug: 'folk-route',
    designName: 'FOLK ROUTE',
    sourceDesignName: 'The Road Is Culture',
    legacyTitle: 'Folk Art Bus',
    nameBn: 'ফোক রুট (বাংলাদেশ লোকশিল্প বাস)',
    editorial: 'THE ROAD IS CULTURE.',
    category: 'Bangla Heritage',
    priceBdtProposed: 1390,
    descriptionEn:
      'Vivid Bangladeshi highway folk-art craft and bold Bengali motif rendered as contemporary urban streetwear.',
    descriptionBn:
      'বাংলাদেশের রঙিন লোকশিল্প ও হাইওয়ে বাস আর্টের ঐতিহ্যবাহী স্ট্রিটওয়্যার রূপ।',
    feature: 'Multicolor Heritage Art',
    tags: ['bangladesh', 'folk-art', 'bus', 'heritage', 'typography', 'stk-h003', 'fab-h003'],
    documentedColors: ['Black'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'detail_01', 'detail_02', 'reference_composite'],
    },
    isLicensingRequired: false,
    artworkRightsNote: 'Originality and artwork ownership to be confirmed prior to commercial launch.',
    sourceFolder: 'https://drive.google.com/drive/folders/1NZsxFJoRGuFEJFJ1vsR6iQFS3RkPw9CW',
    sheetPages: {
      Black: '/media/products/STK-H003-BLK/STK-H003-BLK__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H004',
    legacyId: 'FAB-H004',
    slug: 'the-rider-code',
    designName: 'THE RIDER CODE',
    sourceDesignName: 'Built For The Long Ride',
    legacyTitle: 'Royal Enfield Rider',
    nameBn: 'দ্য রাইডার কোড (মোটরসাইকেল এডিশন)',
    editorial: 'BUILT FOR THE LONG RIDE.',
    category: 'Moto Culture',
    priceBdtProposed: 1690,
    descriptionEn:
      'Maroon colorway anchor featuring vintage motorcycle typography and multi-angle graphic placement.',
    descriptionBn:
      'ভিন্টেজ মোটরসাইকেল থিমের ডিটেইলড ব্যাক ও স্লিভ গ্রাফিক—মেরুন রঙে ডকুমেন্টেড।',
    feature: 'Large Graphic + Sleeve Detail',
    tags: ['moto', 'rider', 'maroon', 'motorcycle', 'vintage', 'stk-h004', 'fab-h004'],
    documentedColors: ['Maroon'],
    plannedViewsByColor: {
      Maroon: ['front', 'back', 'detail_01', 'detail_02', 'detail_03', 'reference_composite'],
    },
    isLicensingRequired: true,
    artworkRightsNote: 'Royal Enfield trademark / motorcycle imagery: written commercial authorization required.',
    sourceFolder: 'https://drive.google.com/drive/folders/1gxKPiboPAXx1tqKZufQt-zvQx97SVmnP',
    sheetPages: {
      Maroon: '/media/products/STK-H004-MRN/STK-H004-MRN__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H005',
    legacyId: 'FAB-H005',
    slug: 'moonlit-hero',
    designName: 'MOONLIT HERO',
    sourceDesignName: 'One Hero. One Moon.',
    legacyTitle: 'One Punch Moon',
    nameBn: 'মুনলিট হিরো (ওয়ান হিরো, ওয়ান মুন)',
    editorial: 'ONE HERO. ONE MOON.',
    category: 'Anime Archive',
    priceBdtProposed: 1590,
    descriptionEn:
      'Lunar monochrome illustration contrasting deep Jet Black fleece with celestial crater detail.',
    descriptionBn:
      'চাঁদের আবহে মনোক্রোম অ্যানিমে-গ্রাফিক ও গভীর জেট ব্ল্যাক কনট্রাস্ট।',
    feature: 'Lunar Centerpiece Print',
    tags: ['anime', 'moon', 'one punch', 'graphic', 'monochrome', 'stk-h005', 'fab-h005'],
    documentedColors: ['Black'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'detail_01', 'detail_02', 'detail_03', 'reference_composite'],
    },
    isLicensingRequired: true,
    artworkRightsNote: 'Third-party character and title: written commercial licensing required.',
    sourceFolder: 'https://drive.google.com/drive/folders/1JN6xfn3hM3lRJ5uGjKL3naaFmctKWBr1',
    sheetPages: {
      Black: '/media/products/STK-H005-BLK/STK-H005-BLK__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H006',
    legacyId: 'FAB-H006',
    slug: 'celluloid-nights',
    designName: 'CELLULOID NIGHTS',
    sourceDesignName: 'The Silver Screen Chronicles',
    legacyTitle: 'Bangla Cinema',
    nameBn: 'সেলুলয়েড নাইটস (বাংলা সিনেমা আর্কাইভ)',
    editorial: 'THE SILVER SCREEN CHRONICLES',
    category: 'Bangla Heritage',
    priceBdtProposed: 1490,
    descriptionEn:
      'Tribute to golden-era Bengali cinema posters with retro typographic framing.',
    descriptionBn:
      'সোনালি যুগের বাংলা সিনেমার পোস্টার টাইপোগ্রাফি ও নস্টালজিক ভিজ্যুয়াল।',
    feature: 'Vintage Poster Typography',
    tags: ['bangla', 'cinema', 'retro', 'culture', 'nostalgia', 'stk-h006', 'fab-h006'],
    documentedColors: ['Black'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'detail_01', 'detail_02', 'reference_composite'],
    },
    isLicensingRequired: true,
    artworkRightsNote: 'Confirm rights to any identifiable actor likenesses / film artwork before commercial launch.',
    sourceFolder: 'https://drive.google.com/drive/folders/1QXfEwlocWgHXNCcUK-7zDrlYZEDhiU3U',
    sheetPages: {
      Black: '/media/products/STK-H006-BLK/STK-H006-BLK__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H007',
    legacyId: 'FAB-H007',
    slug: 'dhaka-afterglow',
    designName: 'DHAKA AFTERGLOW',
    sourceDesignName: 'Old Lanes. New Stories.',
    legacyTitle: 'Aesthetic Dhaka',
    nameBn: 'ঢাকা আফটারগ্লো (পুরান ঢাকা স্ট্রিট স্টোরি)',
    editorial: 'OLD LANES. NEW STORIES.',
    category: 'City Stories',
    priceBdtProposed: 1490,
    descriptionEn:
      'Old Dhaka alleyways, tea stalls, and evening rhythm framed on warm Chocolate Brown fleece.',
    descriptionBn:
      'পুরান ঢাকার পরিচিত গলি, রিকশা ও শহরের গল্প—চকোলেট ব্রাউন রঙে ডকুমেন্টেড।',
    feature: 'Warm Cocoa City Graphic',
    tags: ['dhaka', 'brown', 'rickshaw', 'city', 'old-dhaka', 'stk-h007', 'fab-h007'],
    documentedColors: ['Chocolate Brown'],
    plannedViewsByColor: {
      'Chocolate Brown': ['front', 'back', 'reference_composite'],
    },
    isLicensingRequired: false,
    artworkRightsNote: 'Originality and artwork ownership to be confirmed prior to commercial launch.',
    sourceFolder: 'https://drive.google.com/drive/folders/1nAWGQp0DVvR1ccwaITSSYV3b5t3aNLun',
    sheetPages: {
      'Chocolate Brown': '/media/products/STK-H007-BRN/STK-H007-BRN__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H008',
    legacyId: 'FAB-H008',
    slug: 'collective-voice',
    designName: 'COLLECTIVE VOICE',
    sourceDesignName: 'Voice Of The Generation',
    legacyTitle: 'Student Movement Emblem',
    nameBn: 'কালেক্টিভ ভয়েস (প্রজন্মের কণ্ঠস্বর)',
    editorial: 'VOICE OF THE GENERATION',
    category: 'Statement Graphics',
    priceBdtProposed: 1390,
    descriptionEn:
      'Calligraphic commemorative emblem designed across all four signature Drop 01 hues (Black & Cream photography present; Maroon & Chocolate Brown color photos pending verification).',
    descriptionBn:
      'চারটি সিগনেচার কালারওয়েতে ক্যালিগ্রাফিক এম্বলেম (ব্ল্যাক ও ক্রিম প্রিভিউ রয়েছে; মেরুন ও ব্রাউন আলাদা কালার ছবি যাচাই বাকি)।',
    feature: '4-Colorway Commemorative Crest',
    tags: ['statement', 'bengali', 'student', 'movement', 'emblem', 'stk-h008', 'fab-h008'],
    documentedColors: ['Black', 'Cream', 'Maroon', 'Chocolate Brown'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'reference_composite'],
      Cream: ['front', 'back', 'reference_composite'],
      Maroon: ['front', 'back', 'reference_composite'],
      'Chocolate Brown': ['front', 'back', 'reference_composite'],
    },
    isLicensingRequired: true,
    artworkRightsNote: 'Organization name/emblem: written authorization and sales-policy review required.',
    sourceFolder: 'https://drive.google.com/drive/folders/1My6ZK2-Vw8093Uj9LhjW8rOSwblWf4hK',
    sheetPages: {
      Black: '/media/products/STK-H008-BLK/STK-H008-BLK__90_reference_composite.webp',
      Cream: '/media/products/STK-H008-CRM/STK-H008-CRM__90_reference_composite.webp',
      Maroon: '/media/products/STK-H008-MRN/STK-H008-MRN__90_reference_composite.webp',
      'Chocolate Brown': '/media/products/STK-H008-BRN/STK-H008-BRN__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H009',
    legacyId: 'FAB-H009',
    slug: 'rickshaw-bloom',
    designName: 'RICKSHAW BLOOM',
    sourceDesignName: 'Floral Heritage At Full Speed',
    legacyTitle: 'Rickshaw Bloom',
    nameBn: 'রিকশা ব্লুম (ঐতিহ্যবাহী ফ্লোরাল আর্ট)',
    editorial: 'FLORAL HERITAGE AT FULL SPEED',
    category: 'Bangla Heritage',
    priceBdtProposed: 1490,
    descriptionEn:
      'Dhaka rickshaw floral geometry rendered in luminous enamel palette over matte Jet Black fleece.',
    descriptionBn:
      'ঢাকার রিকশা পেইন্টিংয়ের ফুলের মোটিফ জেট ব্ল্যাক ফ্লিসে আধুনিক রূপায়ণ।',
    feature: 'Enamel Floral Back Graphic',
    tags: ['rickshaw', 'floral', 'folk-art', 'dhaka', 'bloom', 'stk-h009', 'fab-h009'],
    documentedColors: ['Black'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'detail_01', 'detail_02', 'reference_composite'],
    },
    isLicensingRequired: false,
    artworkRightsNote: 'Originality and artwork ownership to be confirmed prior to commercial launch.',
    sourceFolder: 'https://drive.google.com/drive/folders/1SMaKxW61pqZKPXrCS06OUk3lRS3okqP8',
    sheetPages: {
      Black: '/media/products/STK-H009-BLK/STK-H009-BLK__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H010',
    legacyId: 'FAB-H010',
    slug: 'cheese-chase',
    designName: 'CHEESE CHASE',
    sourceDesignName: 'Chase Never Ends',
    legacyTitle: 'Tom & Jerry Cheese Club',
    nameBn: 'চিজ চেজ (প্লেফুল কমিক গ্রাফিক)',
    editorial: 'CHASE NEVER ENDS',
    category: 'Playful Street',
    priceBdtProposed: 1390,
    descriptionEn:
      'Nostalgic comic duo placement with front pocket crest and playful back artwork.',
    descriptionBn:
      'প্লেফুল কমিক চেস্ট ও ব্যাক আর্টওয়ার্ক সমৃদ্ধ ক্যাজুয়াল স্ট্রিটওয়্যার হুডি।',
    feature: 'Chest & Back Comic Graphic',
    tags: ['cartoon', 'tom and jerry', 'cheese', 'fun', 'retro', 'stk-h010', 'fab-h010'],
    documentedColors: ['Black'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'detail_01', 'reference_composite'],
    },
    isLicensingRequired: true,
    artworkRightsNote: 'Tom & Jerry characters and title: written commercial licensing required.',
    sourceFolder: 'https://drive.google.com/drive/folders/1Uxl62Ty4IbJii1tcC-x7BQba-0oLxNYs',
    sheetPages: {
      Black: '/media/products/STK-H010-BLK/STK-H010-BLK__90_reference_composite.webp',
    },
  },
  {
    designId: 'STK-H011',
    legacyId: 'FAB-H011',
    slug: 'night-circuit',
    designName: 'NIGHT CIRCUIT',
    sourceDesignName: 'Accelerate Into The Dark',
    legacyTitle: 'Hot Wheels Night Circuit',
    nameBn: 'নাইট সার্কিট (হাই-অকটেন রেসিং এডিশন)',
    editorial: 'ACCELERATE INTO THE DARK',
    category: 'Moto Culture',
    priceBdtProposed: 1590,
    descriptionEn:
      'High-octane racing livery lines and checkered sleeve accents for late-night street styling.',
    descriptionBn:
      'নাইট রেসিং লিভারি ও চেকার্ড ডিটেইল সমৃদ্ধ স্ট্রিটওয়্যার ডিজাইন।',
    feature: 'Night Racing Neon Livery',
    tags: ['racing', 'hot wheels', 'cars', 'motorsport', 'speed', 'stk-h011', 'fab-h011'],
    documentedColors: ['Black'],
    plannedViewsByColor: {
      Black: ['front', 'back', 'detail_01', 'detail_02', 'detail_03', 'reference_composite'],
    },
    isLicensingRequired: true,
    artworkRightsNote: 'Hot Wheels trademark / logos: written commercial licensing required.',
    sourceFolder: 'https://drive.google.com/drive/folders/1HkP_v8kw6VggeZ-KTRX9MxGoirLlgavF',
    sheetPages: {
      Black: '/media/products/STK-H011-BLK/STK-H011-BLK__90_reference_composite.webp',
    },
  },
];

export interface StarKiT44Variant {
  slotId: string;
  designId: string;
  legacyProductId: string;
  designName: string;
  sourceDesignName: string;
  legacyTitle: string;
  category: StarKiTDesignMeta['category'];
  color: WorkingColorName;
  colorBn: string;
  colorCode: WorkingColorCode;
  colorHex: string;
  sku: string;
  legacySku: string;
  isDocumented: boolean;
  isProvisional: boolean;
  skuStatus: 'DOCUMENTED IN SOURCE' | 'PROVISIONAL / NOT SOURCE-VERIFIED';
  colorStatus: 'DOCUMENTED MOCKUP / PHYSICAL SAMPLE UNVERIFIED' | 'PROPOSED / APPROVAL REQUIRED';
  assetStatus: 'MOCKUP_FILES_PRESENT' | 'NEW_MOCKUPS_REQUIRED';
  mediaCountPlanned: number;
  plannedViews: MediaViewType[];
  imageIntegrity: ImageIntegrityStatus;
  studioPreviewWebp: string | null;
  referenceCompositeWebp: string | null;
  priceBdtProposed: number;
  inventoryQty: number | null;
  gates: ReleaseReadinessGates;
  driveFolder: string;
  nextAction: string;
}

const DUPLICATE_PLACEHOLDER_SKUS = new Set(['STK-H008-MRN', 'STK-H008-BRN']);

export const STARKIT_44_VARIANTS: StarKiT44Variant[] = STARKIT_44_DESIGNS_META.flatMap((design) =>
  WORKING_COLOR_PALETTE.map((pal) => {
    const sku = `${design.designId}-${pal.code}`;
    const legacySku = `${design.legacyId}-${pal.code}`;
    const isDocumented = design.documentedColors.includes(pal.name);
    const isProvisional = !isDocumented;
    const plannedViews: MediaViewType[] = isDocumented
      ? design.plannedViewsByColor[pal.name] || []
      : [];

    const imageIntegrity: ImageIntegrityStatus = isProvisional
      ? 'PROVISIONAL_NO_ASSETS'
      : DUPLICATE_PLACEHOLDER_SKUS.has(sku)
      ? 'DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO'
      : 'VERIFIED_LOCAL_PREVIEW';

    const studioPreviewWebp =
      imageIntegrity === 'VERIFIED_LOCAL_PREVIEW'
        ? `/media/products/${sku}/${sku}__91_studio_preview.webp`
        : null;

    const referenceCompositeWebp = isDocumented
      ? `/media/products/${sku}/${sku}__90_reference_composite.webp`
      : null;

    return {
      slotId: `${design.designId}-${pal.slotSuffix}`,
      designId: design.designId,
      legacyProductId: design.legacyId,
      designName: design.designName,
      sourceDesignName: design.sourceDesignName,
      legacyTitle: design.legacyTitle,
      category: design.category,
      color: pal.name,
      colorBn: pal.nameBn,
      colorCode: pal.code,
      colorHex: pal.hex,
      sku,
      legacySku,
      isDocumented,
      isProvisional,
      skuStatus: isDocumented ? 'DOCUMENTED IN SOURCE' : 'PROVISIONAL / NOT SOURCE-VERIFIED',
      colorStatus: isDocumented
        ? 'DOCUMENTED MOCKUP / PHYSICAL SAMPLE UNVERIFIED'
        : 'PROPOSED / APPROVAL REQUIRED',
      assetStatus: isDocumented ? 'MOCKUP_FILES_PRESENT' : 'NEW_MOCKUPS_REQUIRED',
      mediaCountPlanned: plannedViews.length,
      plannedViews,
      imageIntegrity,
      studioPreviewWebp,
      referenceCompositeWebp,
      priceBdtProposed: design.priceBdtProposed,
      inventoryQty: null,
      gates: {
        assetVerified: imageIntegrity === 'VERIFIED_LOCAL_PREVIEW',
        sampleVerified: false,
        rightsVerified: false,
        specVerified: false,
        sizeChartApproved: false,
        commercialTermsApproved: false,
        publicationStatus: 'HOLD / NOT FOR PUBLIC SALES',
      },
      driveFolder: design.sourceFolder,
      nextAction: isDocumented
        ? 'Verify physical garment sample, approved sizes, artwork permissions, and live stock before commercial publishing.'
        : 'Confirm new colorway production, create distinct front/back/detail photographs (do not tint or reuse black photo), and verify print contrast.',
    };
  })
);

export const STARKIT_MEDIA_MANIFEST: StarKiTMediaManifestEntry[] = STARKIT_44_VARIANTS.flatMap((v) =>
  v.plannedViews.map((view) => {
    const slug = SLUG_BY_DESIGN[v.designId] || v.designId.toLowerCase();
    const filePrefix = VIEW_FILE_PREFIX[view];
    const filename = `${v.sku}__${filePrefix}.webp`;
    return {
      designId: v.designId,
      sku: v.sku,
      color: v.color,
      view,
      siteAssetPath: `/media/products/${v.sku}/${filename}`,
      zipRelativePath: `01_Product_Images/${v.designId}_${slug}/${v.sku}/${filename}`,
      inSuppliedMediaZip: true,
      // Local disk has converted 90_reference_composite.webp for all 15 documented variants
      // plus 91_studio_preview.webp for unique local preview PNGs; individual front/back/detail shots reside in the external media pack.
      existsLocally: view === 'reference_composite',
    };
  })
);

export const STARKIT_ARCHIVE_SUMMARY = {
  totalDesigns: STARKIT_44_DESIGNS_META.length, // 11
  colorwaysPerDesign: WORKING_COLOR_PALETTE.length, // 4
  totalVariantSlots: STARKIT_44_VARIANTS.length, // 44
  documentedVariantCount: STARKIT_44_VARIANTS.filter((v) => v.isDocumented).length, // 15
  provisionalVariantCount: STARKIT_44_VARIANTS.filter((v) => v.isProvisional).length, // 29
  plannedMediaAssetsCount: STARKIT_MEDIA_MANIFEST.length, // 67
  localConvertedWebpPreviews: STARKIT_44_VARIANTS.filter((v) => Boolean(v.studioPreviewWebp)).length, // 13 unique
  duplicatePlaceholderFlags: STARKIT_44_VARIANTS.filter(
    (v) => v.imageIntegrity === 'DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO'
  ).length, // 2 (STK-H008-MRN & STK-H008-BRN)
  excludedDesignCount: 1, // STK-H012 Kinetic Stage
} as const;

/**
 * Resolves any design ID, legacy FAB-Hxxx ID, or SKU string (e.g. 'STK-H001-BLK' / 'FAB-H001')
 * back to its canonical StarkiTDesignMeta.
 */
export function findStarKiTDesign(idOrCode: string | null | undefined): StarKiTDesignMeta | undefined {
  if (!idOrCode) return undefined;
  const norm = idOrCode.trim().toUpperCase();
  const base = norm.replace(/-(BLK|CRM|MRN|BRN)(-(M|L|XL|XXL))?$/, '');
  return STARKIT_44_DESIGNS_META.find(
    (d) =>
      d.designId === base ||
      d.legacyId === base ||
      d.slug.toUpperCase() === norm ||
      d.designName.toUpperCase() === norm
  );
}

export function getVariantsForDesign(designIdOrLegacyId: string): StarKiT44Variant[] {
  const design = findStarKiTDesign(designIdOrLegacyId);
  if (!design) return [];
  return STARKIT_44_VARIANTS.filter((v) => v.designId === design.designId);
}

export function findStarKiTVariantBySkuOrColor(
  designIdOrLegacyId: string,
  colorNameOrCode?: string
): StarKiT44Variant | undefined {
  const list = getVariantsForDesign(designIdOrLegacyId);
  if (list.length === 0) return undefined;
  if (!colorNameOrCode) {
    return list.find((v) => v.isDocumented) || list[0];
  }
  const needle = colorNameOrCode.trim().toUpperCase();
  return list.find(
    (v) =>
      v.sku === needle ||
      v.legacySku === needle ||
      v.color.toUpperCase() === needle ||
      v.colorCode === needle
  );
}
