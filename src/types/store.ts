import { Language, Product } from './index';
import { ThreePieceItem } from '../data/threePieceCatalog';
import { GraphicArchiveProduct } from '../data/graphicArchiveCatalog';

export type StoreOrderStatus =
  | 'Pending'
  | 'Picked'
  | 'In_Transit'
  | 'Out_for_Delivery'
  | 'Delivered'
  | 'Returned';

export interface StoreOrder {
  orderId: string;
  consignmentId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  division: string;
  paymentMethod: 'cod' | 'mfs';
  subtotalBDT: number;
  discountBDT: number;
  deliveryFeeBDT: number;
  totalBDT: number;
  itemsCount: number;
  itemsSummary: string;
  status: StoreOrderStatus;
  hubLocation: string;
  riderName?: string;
  riderPhone?: string;
  estimatedDelivery: string;
  trackingNote: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface StoreOrderTracking {
  orderId: string;
  consignmentId: string;
  division: string;
  hubLocation: string;
  riderName?: string;
  paymentMethod: 'cod' | 'mfs';
  amountToCollectBDT: number;
  currentStatus: StoreOrderStatus;
  estimatedDelivery: string;
  trackingNote: string;
  updatedAtMs: number;
}

export type CatalogSource = 'essentials' | 'three-piece' | 'graphic-archive' | 'custom';
export type CatalogStatus = 'active' | 'out_of_stock' | 'hidden';

export interface CatalogOverride {
  id: string;
  sourceCatalog: CatalogSource;
  nameEn: string;
  nameBn: string;
  category: Product['category'];
  collection: string;
  priceBDT: number;
  compareAtPriceBDT?: number;
  stockCount: number;
  status: CatalogStatus;
  image?: string;
  fabricEn?: string;
  fabricBn?: string;
  fitEn?: string;
  fitBn?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  updatedAtMs?: number;
}

export interface StoreSettings {
  hotlineDisplay: string;
  hotlineTel: string;
  atelierAddress: string;
  freeShippingThresholdBDT: number;
  dhakaShippingFeeBDT: number;
  outsideDhakaShippingFeeBDT: number;
  bundle2DiscountBDT: number;
  bundle3DiscountBDT: number;
  announcementEnabled: boolean;
  announcementTextEn: string;
  announcementTextBn: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  hotlineDisplay: '+880 1778 307704',
  hotlineTel: 'tel:+8801778307704',
  atelierAddress: 'Road 11, Banani, Dhaka 1213, Bangladesh · Open Sat–Thu, 11:00 AM – 8:30 PM',
  freeShippingThresholdBDT: 5000,
  dhakaShippingFeeBDT: 80,
  outsideDhakaShippingFeeBDT: 130,
  bundle2DiscountBDT: 150,
  bundle3DiscountBDT: 300,
  announcementEnabled: false,
  announcementTextEn: 'Complimentary Pathao Courier delivery on orders over ৳5,000 across Bangladesh',
  announcementTextBn: 'সারা বাংলাদেশে ৳৫,০০০+ অর্ডারে সম্পূর্ণ ফ্রি পাঠাও কুরিয়ার ডেলিভারি',
};

export interface StoreSubscriber {
  id: string;
  email: string;
  language: Language;
  subscribedAtMs: number;
}

export interface StoreReview {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: number;
  sizePurchased: string;
  fitFeedback: 'Runs True to Size' | 'Slightly Relaxed' | 'Tailored & Snug';
  title: string;
  comment: string;
  status: 'approved' | 'hidden';
  helpfulCount: number;
  createdAtMs: number;
}

export interface LiveProduct extends Product {
  stockCount: number;
  status: CatalogStatus;
  sourceCatalog: CatalogSource;
  hasOverride?: boolean;
}

export interface LiveThreePieceItem extends ThreePieceItem {
  stockCount: number;
  status: CatalogStatus;
}

export interface LiveGraphicArchiveProduct extends GraphicArchiveProduct {
  stockCount: number;
  catalogStatus: CatalogStatus;
}
