import { FashionLook, Product, BrandPartner } from '../types';
import { GRAPHIC_ARCHIVE_PRODUCTS } from './graphicArchiveCatalog';
import { THREE_PIECE_CATALOG } from './threePieceCatalog';

export const AMBASSADOR_PORTRAIT =
  '/assets/aistudio/ChatGPT_Image_Jul_11__2026__10_37_49_PM_6a130cdc.png';

const starkitProduct = (id: string) => {
  const found = GRAPHIC_ARCHIVE_PRODUCTS.find((p) => p.id === id);
  if (!found) throw new Error(`Missing StarKiT product ${id}`);
  return found;
};

const farizaProduct = (id: string) => {
  const found = THREE_PIECE_CATALOG.find((p) => p.id === id);
  if (!found) throw new Error(`Missing Fariza product ${id}`);
  return found;
};

const busHoodie = starkitProduct('FAB-H003');
const dhakaHoodie = starkitProduct('FAB-H007');
const narutoHoodie = starkitProduct('FAB-H001');
const rickshawHoodie = starkitProduct('FAB-H009');

const goldenMirror = farizaProduct('tp-fs-01');
const electricMirror = farizaProduct('tp-fs-04');
const navyLawn = farizaProduct('tp-zsl-01');
const oliveLawn = farizaProduct('tp-zsl-04');
const magentaPlum = farizaProduct('tp-cat-001');
const emeraldBatik = farizaProduct('tp-cat-002');

export const FASHION_LOOKS: FashionLook[] = [
  {
    id: 'look-starkit-ambassador',
    slug: 'starkit-dhaka-heritage-campaign',
    brand: 'StarKiT',
    titleEn: 'StarKiT Ambassador · Dhaka Heritage Edit',
    titleBn: 'স্টারকিট অ্যাম্বাসেডর · ঢাকা হেরিটেজ এডিট',
    collectionEn: 'StarKiT Campaign 2026',
    collectionBn: 'স্টারকিট ক্যাম্পেইন ২০২৬',
    category: 'Men',
    modelImage: AMBASSADOR_PORTRAIT,
    featuredGarmentEn: '330–350 GSM Brushed Fleece Hoodies · Folk Art Bus & Aesthetic Dhaka',
    featuredGarmentBn: '৩৩০–৩৫০ জিএসএম ব্রাশড ফ্লিস হুডি · ফোক আর্ট বাস ও এস্থেটিক ঢাকা',
    totalPriceBDT: busHoodie.basePrice + dhakaHoodie.basePrice,
    storyEn:
      'Fronted by StarKiT Brand Ambassador, this Dhaka street capsule pairs vibrant highway folk typography with warm chocolate-brown Old Dhaka nostalgia on heavy 330–350 GSM one-side brushed cotton fleece.',
    storyBn:
      'স্টারকিটের অফিশিয়াল ব্র্যান্ড অ্যাম্বাসেডরের উপস্থিতিতে ঢাকার রাস্তার লোকশিল্প ও পুরান ঢাকার গল্প নিয়ে ৩৩০–৩৫০ জিএসএম ব্রাশড ফ্লিস হুডি কালেকশন।',
    colorway: 'Obsidian Black & Cocoa Brown',
    fitEn: 'Relaxed Drop-Shoulder Fit',
    fitBn: 'রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
    moodTagEn: 'Brand Ambassador Pick',
    moodTagBn: 'অ্যাম্বাসেডর সিলেকশন',
    modelStats: { height: "5'11\"", size: 'L' },
    garments: [
      {
        id: busHoodie.id,
        nameEn: `${busHoodie.name} Hoodie (${busHoodie.id})`,
        nameBn: `${busHoodie.name} হুডি (${busHoodie.id})`,
        type: busHoodie.category,
        priceBDT: busHoodie.basePrice,
        color: busHoodie.variants[0].colorHex,
        fabric: busHoodie.variants[0].fabric,
        sizes: ['M', 'L', 'XL'],
        image: busHoodie.variants[0].previewImage,
        hotspot: { x: 48, y: 40 },
      },
      {
        id: dhakaHoodie.id,
        nameEn: `${dhakaHoodie.name} Hoodie (${dhakaHoodie.id})`,
        nameBn: `${dhakaHoodie.name} হুডি (${dhakaHoodie.id})`,
        type: dhakaHoodie.category,
        priceBDT: dhakaHoodie.basePrice,
        color: dhakaHoodie.variants[0].colorHex,
        fabric: dhakaHoodie.variants[0].fabric,
        sizes: ['M', 'L', 'XL'],
        image: dhakaHoodie.variants[0].previewImage,
        hotspot: { x: 52, y: 68 },
      },
    ],
  },
  {
    id: 'look-starkit-archive',
    slug: 'starkit-shinobi-rickshaw-duo',
    brand: 'StarKiT',
    titleEn: 'StarKiT Graphic Archive · Collector Duo',
    titleBn: 'স্টারকিট গ্রাফিক আর্কাইভ · কালেক্টর ডুও',
    collectionEn: 'Anime & Folk Streetwear',
    collectionBn: 'অ্যানিমে ও ফোক স্ট্রিটওয়্যার',
    category: 'Unisex',
    modelImage: narutoHoodie.variants[0].previewImage,
    featuredGarmentEn: 'Naruto Legacy Cream & Rickshaw Bloom Fleece Hoodies',
    featuredGarmentBn: 'নারুতো লিগ্যাসি ক্রিম ও রিকশা ব্লুম ফ্লিস হুডি',
    totalPriceBDT: narutoHoodie.basePrice + rickshawHoodie.basePrice,
    storyEn:
      'Precision screen graphics across back, chest, and sleeves stitched over dense 330–350 GSM brushed fleece—engineered for layering through cool Dhaka nights.',
    storyBn:
      'সামনে, পেছনে ও হাতায় নিখুঁত স্ক্রিন গ্রাফিক্সসহ ঘন ৩৩০–৩৫০ জিএসএম ব্রাশড ফ্লিস হুডি।',
    colorway: 'Natural Cream & Enamel Black',
    fitEn: 'Contemporary Relaxed Fit',
    fitBn: 'সমসাময়িক রিল্যাক্সড ফিট',
    moodTagEn: 'Collector Graphic Edition',
    moodTagBn: 'গ্রাফিক এডিশন',
    modelStats: { height: "5'10\"", size: 'L' },
    garments: [
      {
        id: narutoHoodie.id,
        nameEn: `${narutoHoodie.name} Cream (${narutoHoodie.id})`,
        nameBn: `${narutoHoodie.name} ক্রিম (${narutoHoodie.id})`,
        type: narutoHoodie.category,
        priceBDT: narutoHoodie.basePrice,
        color: narutoHoodie.variants[0].colorHex,
        fabric: narutoHoodie.variants[0].fabric,
        sizes: ['M', 'L', 'XL'],
        image: narutoHoodie.variants[0].previewImage,
        hotspot: { x: 50, y: 38 },
      },
      {
        id: rickshawHoodie.id,
        nameEn: `${rickshawHoodie.name} Black (${rickshawHoodie.id})`,
        nameBn: `${rickshawHoodie.name} ব্ল্যাক (${rickshawHoodie.id})`,
        type: rickshawHoodie.category,
        priceBDT: rickshawHoodie.basePrice,
        color: rickshawHoodie.variants[0].colorHex,
        fabric: rickshawHoodie.variants[0].fabric,
        sizes: ['M', 'L', 'XL'],
        image: rickshawHoodie.variants[0].previewImage,
        hotspot: { x: 52, y: 72 },
      },
    ],
  },
  {
    id: 'look-fariza-mirror',
    slug: 'fariza-mirror-embroidered-edit',
    brand: "Fariza's Territory",
    titleEn: "Fariza's Embroidery & Mirror Celebration",
    titleBn: 'ফারিজাস এমব্রয়ডারি ও মিরর এডিট',
    collectionEn: 'Embroidery & Mirror',
    collectionBn: 'এমব্রয়ডারি ও মিরর',
    category: 'Women',
    modelImage: goldenMirror.modelImage,
    featuredGarmentEn: 'FS-D01 Golden Mustard & FS-D04 Electric Blue Mirror Sets',
    featuredGarmentBn: 'FS-D01 গোল্ডেন মাস্টার্ড ও FS-D04 ইলেকট্রিক ব্লু মিরর থ্রি-পিস',
    totalPriceBDT: goldenMirror.priceBDT + electricMirror.priceBDT,
    storyEn:
      'Luminous diamond-grid resham embroidery accented by reflective mirror-work embellishments, complete with coordinated patterned salwars and bordered lawn dupattas.',
    storyBn:
      'ডায়মন্ড গ্রিড এমব্রয়ডারি এবং প্রতিফলনশীল মিরর-ওয়ার্ক সমৃদ্ধ উৎসবের থ্রি-পিস কালেকশন।',
    colorway: 'Mustard Gold & Electric Cobalt',
    fitEn: 'Tailorable 3-Piece Ensemble',
    fitBn: 'কাস্টম টেইলরেবল থ্রি-পিস',
    moodTagEn: 'Festive Mirror Work',
    moodTagBn: 'ফেস্টিভ মিরর ওয়ার্ক',
    modelStats: { height: "5'7\"", size: 'Unstitched Set' },
    garments: [
      {
        id: goldenMirror.id,
        nameEn: `${goldenMirror.code} — ${goldenMirror.nameEn}`,
        nameBn: `${goldenMirror.code} — ${goldenMirror.nameBn}`,
        type: goldenMirror.subCollection,
        priceBDT: goldenMirror.priceBDT,
        color: goldenMirror.colors[0].hex,
        fabric: goldenMirror.fabric,
        sizes: ['Unstitched Set', 'S', 'M', 'L'],
        image: goldenMirror.flatLayImage,
        hotspot: { x: 48, y: 40 },
      },
      {
        id: electricMirror.id,
        nameEn: `${electricMirror.code} — ${electricMirror.nameEn}`,
        nameBn: `${electricMirror.code} — ${electricMirror.nameBn}`,
        type: electricMirror.subCollection,
        priceBDT: electricMirror.priceBDT,
        color: electricMirror.colors[0].hex,
        fabric: electricMirror.fabric,
        sizes: ['Unstitched Set', 'S', 'M', 'L'],
        image: electricMirror.flatLayImage,
        hotspot: { x: 50, y: 74 },
      },
    ],
  },
  {
    id: 'look-fariza-lawn',
    slug: 'fariza-swiss-lawn-collection',
    brand: "Fariza's Territory",
    titleEn: 'Zam Zam Swiss Lawn Three-Piece Edit',
    titleBn: 'জমজম সুইস লন থ্রি-পিস এডিট',
    collectionEn: 'Zam Zam Swiss Lawn',
    collectionBn: 'জমজম সুইস লন',
    category: 'Women',
    modelImage: navyLawn.modelImage,
    featuredGarmentEn: 'ZSL-01 Navy Royal Bloom & ZSL-04 Olive Garden Bloom',
    featuredGarmentBn: 'ZSL-01 নেভি রয়্যাল ব্লুম ও ZSL-04 অলিভ গার্ডেন ব্লুম',
    totalPriceBDT: navyLawn.priceBDT + oliveLawn.priceBDT,
    storyEn:
      'Featherweight imported Swiss lawn cotton featuring central paisley medallions, solid cambric trousers, and vivid contrast dupattas calibrated for humid daylight.',
    storyBn:
      'গরম আবহাওয়ার জন্য আরামদায়ক ইমপোর্টেড সুইস লন কটন থ্রি-পিস ও বৈপরীত্যময় ওড়না।',
    colorway: 'Royal Navy & Botanical Olive',
    fitEn: 'Tailorable 3-Piece Ensemble',
    fitBn: 'কাস্টম টেইলরেবল থ্রি-পিস',
    moodTagEn: 'Breathable Swiss Lawn',
    moodTagBn: 'ব্রিদেবল সুইস লন',
    modelStats: { height: "5'7\"", size: 'Unstitched Set' },
    garments: [
      {
        id: navyLawn.id,
        nameEn: `${navyLawn.code} — ${navyLawn.nameEn}`,
        nameBn: `${navyLawn.code} — ${navyLawn.nameBn}`,
        type: navyLawn.subCollection,
        priceBDT: navyLawn.priceBDT,
        color: navyLawn.colors[0].hex,
        fabric: navyLawn.fabric,
        sizes: ['Unstitched Set', 'S', 'M', 'L'],
        image: navyLawn.flatLayImage,
        hotspot: { x: 50, y: 42 },
      },
      {
        id: oliveLawn.id,
        nameEn: `${oliveLawn.code} — ${oliveLawn.nameEn}`,
        nameBn: `${oliveLawn.code} — ${oliveLawn.nameBn}`,
        type: oliveLawn.subCollection,
        priceBDT: oliveLawn.priceBDT,
        color: oliveLawn.colors[0].hex,
        fabric: oliveLawn.fabric,
        sizes: ['Unstitched Set', 'S', 'M', 'L'],
        image: oliveLawn.flatLayImage,
        hotspot: { x: 50, y: 74 },
      },
    ],
  },
  {
    id: 'look-fariza-batik',
    slug: 'fariza-batik-boutique-edit',
    brand: "Fariza's Territory",
    titleEn: "Alfi Batik & Magenta Plum Craft Edit",
    titleBn: 'আলফি বাটিক ও ম্যাজেন্টা প্লাম ক্রাফট এডিট',
    collectionEn: 'Alfi Boutique & Magenta Plum',
    collectionBn: 'আলফি বাটিক ও ম্যাজেন্টা প্লাম',
    category: 'Women',
    modelImage: magentaPlum.modelImage,
    featuredGarmentEn: 'CAT-001 Magenta & Plum & CAT-002 Emerald Teal Batik',
    featuredGarmentBn: 'CAT-001 ম্যাজেন্টা প্লাম ও CAT-002 এমারেল্ড টিল বাটিক',
    totalPriceBDT: magentaPlum.priceBDT + emeraldBatik.priceBDT,
    storyEn:
      'Authentic wax-resist hand-dyed cotton paired with paisley floral combed cotton ensembles finished with handcrafted cotton dupatta tassels.',
    storyBn:
      'হাতে ডাই করা ওয়াক্স-রেজিস্ট বাটিক এবং পেইসলি ফ্লোরাল কম্বড কটনের নিখুঁত সমন্বয়।',
    colorway: 'Plum Purple & Emerald Teal',
    fitEn: 'Tailorable 3-Piece Ensemble',
    fitBn: 'কাস্টম টেইলরেবল থ্রি-পিস',
    moodTagEn: 'Artisanal Batik Craft',
    moodTagBn: 'আর্টিসানাল বাটিক',
    modelStats: { height: "5'8\"", size: 'Unstitched Set' },
    garments: [
      {
        id: magentaPlum.id,
        nameEn: `${magentaPlum.code} — ${magentaPlum.nameEn}`,
        nameBn: `${magentaPlum.code} — ${magentaPlum.nameBn}`,
        type: magentaPlum.subCollection,
        priceBDT: magentaPlum.priceBDT,
        color: magentaPlum.colors[0].hex,
        fabric: magentaPlum.fabric,
        sizes: ['Unstitched Set', 'S', 'M', 'L'],
        image: magentaPlum.flatLayImage,
        hotspot: { x: 48, y: 40 },
      },
      {
        id: emeraldBatik.id,
        nameEn: `${emeraldBatik.code} — ${emeraldBatik.nameEn}`,
        nameBn: `${emeraldBatik.code} — ${emeraldBatik.nameBn}`,
        type: emeraldBatik.subCollection,
        priceBDT: emeraldBatik.priceBDT,
        color: emeraldBatik.colors[0].hex,
        fabric: emeraldBatik.fabric,
        sizes: ['Unstitched Set', 'S', 'M', 'L'],
        image: emeraldBatik.flatLayImage,
        hotspot: { x: 52, y: 72 },
      },
    ],
  },
];

// Strictly zero invented essentials products — unified catalog holds the 29 real SKUs + Admin custom items
export const FEATURED_PRODUCTS: Product[] = [];

export const COLLECTIONS: {
  id: string;
  nameEn: string;
  nameBn: string;
  subtitleEn: string;
  subtitleBn: string;
  image: string;
  count: number;
  category: string;
  brand: BrandPartner;
  brandRoute: 'starkit' | 'farizas-territory';
}[] = [
  {
    id: 'col-starkit-heritage',
    nameEn: 'StarKiT Cultural & City Drops',
    nameBn: 'স্টারকিট কালচারাল ও সিটি ড্রপস',
    subtitleEn: 'Bangla Heritage, Old Dhaka & Statement 330–350 GSM fleece hoodies',
    subtitleBn: 'বাংলা হেরিটেজ, পুরান ঢাকা ও ৩৩০–৩৫০ জিএসএম ফ্লিস হুডি',
    image: AMBASSADOR_PORTRAIT,
    count: 5,
    category: 'Men',
    brand: 'StarKiT',
    brandRoute: 'starkit',
  },
  {
    id: 'col-starkit-street',
    nameEn: 'StarKiT Anime, Moto & Street',
    nameBn: 'স্টারকিট অ্যানিমে, মোটো ও স্ট্রিট',
    subtitleEn: 'Front, back & sleeve graphic editions stitched on heavy cotton fleece',
    subtitleBn: 'ফ্রন্ট, ব্যাক ও স্লিভ গ্রাফিক এডিশন ভারী কটন ফ্লিস হুডি',
    image: '/assets/aistudio/hoodie_preview_FAB-H001-CRM.png',
    count: 6,
    category: 'Streetwear',
    brand: 'StarKiT',
    brandRoute: 'starkit',
  },
  {
    id: 'col-fariza-batik',
    nameEn: "Fariza's Batik & Boutique",
    nameBn: 'ফারিজাস বাটিক ও বুটিক',
    subtitleEn: 'Magenta & Plum, Alfi Batik & Mome Boutique hand-dyed 3-piece sets',
    subtitleBn: 'ম্যাজেন্টা ও প্লাম, আলফি বাটিক ও মোম বুটিক থ্রি-পিস সেট',
    image: '/assets/fariza/CAT-001_model.jpg',
    count: 7,
    category: 'Traditional',
    brand: "Fariza's Territory",
    brandRoute: 'farizas-territory',
  },
  {
    id: 'col-fariza-lawn',
    nameEn: "Fariza's Swiss Lawn & Mirror",
    nameBn: 'ফারিজাস সুইস লন ও মিরর',
    subtitleEn: 'Zam Zam Swiss Lawn prints & Mirror-Embroidered festive three-pieces',
    subtitleBn: 'জমজম সুইস লন এবং মিরর এমব্রয়ডারি থ্রি-পিস কালেকশন',
    image: '/assets/fariza/FS-D01_model.jpg',
    count: 11,
    category: 'Women',
    brand: "Fariza's Territory",
    brandRoute: 'farizas-territory',
  },
];

export const EDITORIAL_ARTICLES = [
  {
    id: 'ed-01',
    titleEn: "Inside Fariza's Territory: Wax-Resist Batik & Swiss Lawn Craft",
    titleBn: 'ফারিজাস টেরিটরি: ওয়াক্স-রেজিস্ট বাটিক ও সুইস লনের কারিগরি',
    date: 'Season 2026',
    readTime: '4 min read',
    image: '/assets/fariza/CAT-002_flat.jpg',
    snippetEn:
      'From organic wax-resist dyed cottons in Alfi & Mome Boutique to breathable Zam Zam Swiss Lawn and reflective mirror embroidery—inside our 18-piece women’s catalog.',
    snippetBn:
      'আলফি ও মোম বুটিকের অর্গানিক বাটিক থেকে শুরু করে জমজম সুইস লন ও মিরর-ওয়ার্ক এমব্রয়ডারি—আমাদের ১৮টি থ্রি-পিস কালেকশনের পেছনের গল্প।',
    bodyEn: [
      "Fariza's Territory gathers 18 distinct unstitched 3-piece ensembles curated across five tactile signatures: Magenta & Plum combed cotton, Alfi Boutique wax-resist batik, Mome Boutique tie-dye florals, Zam Zam Swiss Lawn, and festive Mirror-Work embroidery.",
      'Every ensemble is packaged as a complete tailored canvas—2.5m+ patterned kameez yardage, color-matched cotton or printed companion salwar, and an expressive contrast dupatta often finished with hand-knotted tassels.',
      'By documenting both crisp overhead flat-lays and editorial drape photography across every SKU, clients can inspect weave texture, neckline trim, and dupatta color balance with zero guesswork before visiting their tailor.',
    ],
    bodyBn: [
      'ফারিজাস টেরিটরির ১৮টি আনস্টিচড থ্রি-পিস সাজানো হয়েছে পাঁচটি স্বতন্ত্র ধারায়—ম্যাজেন্টা ও প্লাম, আলফি বুটিক বাটিক, মোম বুটিক, জমজম সুইস লন এবং এমব্রয়ডারি ও মিরর এডিট।',
      'প্রতিটি সেটে রয়েছে পূর্ণাঙ্গ মাপের কামিজ, ম্যাচিং বা কনট্রাস্ট সেলোয়ার এবং সূক্ষ্ম ট্যাসেল বা এমব্রয়ডারি বর্ডারযুক্ত ওড়না।',
      'প্রতিটি পণ্যের ফ্ল্যাট-লে এবং মডেল ড্রেপ ছবি থাকায় গ্রাহকরা অর্ডার করার আগেই কাপড়ের টেক্সচার ও রঙের সমন্বয় নির্ভুলভাবে দেখে নিতে পারেন।',
    ],
    tag: "Fariza's Territory",
  },
  {
    id: 'ed-02',
    titleEn: 'StarKiT Campaign: 330–350 GSM Fleece & Dhaka Street Stories',
    titleBn: 'স্টারকিট ক্যাম্পেইন: ৩৩০–৩৫০ জিএসএম ফ্লিস ও ঢাকার গল্প',
    date: 'Autumn / Winter 2026',
    readTime: '3 min read',
    image: AMBASSADOR_PORTRAIT,
    snippetEn:
      'Fronted by our official Brand Ambassador, the 11-piece StarKiT Graphic Archive pairs Bangladeshi highway folk typography, Old Dhaka warmth, and collector graphics over substantial one-side brushed fleece.',
    snippetBn:
      'আমাদের অফিশিয়াল ব্র্যান্ড অ্যাম্বাসেডরের সাথে স্টারকিটের ১১টি গ্রাফিক হুডি—বাংলাদেশি লোকশিল্প, পুরান ঢাকা ও আধুনিক স্ট্রিটওয়্যারের সমন্বয়।',
    bodyEn: [
      'StarKiT represents FABRICIAN’s contemporary menswear and unisex streetwear voice—built around 11 distinct graphic editions knitted on 330–350 GSM one-side brushed cotton fleece.',
      'Rather than flimsy jersey blends, each hoodie holds structured shoulder volume and soft brushed warmth tailored for crisp Dhaka evenings and highway rides alike.',
      'Across signature releases like Folk Art Bus (FAB-H003), Aesthetic Dhaka (FAB-H007), Rickshaw Bloom (FAB-H009), and collector anime and moto designs, every colorway blends expressive visual storytelling with dependable everyday durability.',
    ],
    bodyBn: [
      'স্টারকিট হলো ফ্যাব্রিশিয়ানের সমসাময়িক মেনসওয়্যার ও ইউনিসেক্স স্ট্রিটওয়্যার সংগ্রহ, যা তৈরি হয়েছে ৩৩০–৩৫০ জিএসএম ওয়ান-সাইড ব্রাশড কটন ফ্লিস দিয়ে।',
      'ফোক আর্ট বাস (FAB-H003), এস্থেটিক ঢাকা (FAB-H007) এবং রিকশা ব্লুম (FAB-H009)-সহ প্রতিটি হুডিতে বাংলাদেশের নিজস্ব সংস্কৃতি ও আধুনিক গ্রাফিকের নিখুঁত মেলবন্ধন রয়েছে।',
      'টেকসই স্টিচিং এবং ড্রপ-শোল্ডার সিলুয়েট প্রতিটি পিসকে সারাদিনের ব্যবহারে আরামদায়ক ও আকর্ষণীয় করে তোলে।',
    ],
    tag: 'StarKiT Streetwear',
  },
];

