export type Language = 'en' | 'bn';

export type BrandPartner = 'StarKiT' | "Fariza's Territory" | 'FABRICIAN';

export interface LookGarment {
  id: string;
  nameEn: string;
  nameBn: string;
  type: string;
  priceBDT: number;
  color: string;
  fabric: string;
  sizes: string[];
  image?: string;
  hotspot?: { x: number; y: number };
}

export interface FashionLook {
  id: string;
  slug: string;
  brand?: BrandPartner;
  titleEn: string;
  titleBn: string;
  collectionEn: string;
  collectionBn: string;
  category: 'Women' | 'Men' | 'Unisex';
  modelImage: string;
  featuredGarmentEn: string;
  featuredGarmentBn: string;
  totalPriceBDT: number;
  garments: LookGarment[];
  storyEn: string;
  storyBn: string;
  colorway: string;
  fitEn: string;
  fitBn: string;
  moodTagEn: string;
  moodTagBn: string;
  modelStats?: { height: string; size: string };
}

export interface Product {
  id: string;
  slug: string;
  brand?: BrandPartner;
  nameEn: string;
  nameBn: string;
  category: 'Men' | 'Women' | 'Unisex' | 'Traditional' | 'Streetwear';
  collection: string;
  priceBDT: number;
  compareAtPriceBDT?: number;
  image: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  fabricEn: string;
  fabricBn: string;
  fitEn: string;
  fitBn: string;
  isNew?: boolean;
  isBestseller?: boolean;
  styleTag: 'minimal' | 'urban' | 'heritage' | 'relaxed';
}

export interface CartItem {
  id: string;
  productId: string;
  nameEn: string;
  nameBn: string;
  priceBDT: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

export interface StylePreference {
  audience: 'All' | 'Men' | 'Women' | 'Unisex';
  direction: 'minimal' | 'urban' | 'heritage' | 'relaxed';
  occasion: 'everyday' | 'evening' | 'formal' | 'weekend';
}
