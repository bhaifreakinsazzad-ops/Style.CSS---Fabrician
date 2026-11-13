import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  increment,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  StoreOrder,
  StoreOrderStatus,
  StoreOrderTracking,
  CatalogOverride,
  StoreSettings,
  StoreReview,
} from '../types/store';
import { Language } from '../types';
import { saveCustomerOrder } from './pathaoCourier';

function toMillis(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (typeof val === 'number') return val;
  return Date.now();
}

export function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128) || `id-${Date.now()}`;
}

export function truncateStr(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

export async function placeStoreOrder(input: {
  orderId: string;
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
}): Promise<{ orderId: string; consignmentId: string }> {
  const cleanOrderId = sanitizeId(input.orderId.toUpperCase());
  const consignmentId = `PTH-DH-${Math.floor(100000 + Math.random() * 900000)}`;
  const isDhaka = input.division.toLowerCase().includes('dhaka');
  const hubLocation = isDhaka
    ? 'Tejgaon Central Hub, Dhaka'
    : `${truncateStr(input.division, 60)} Regional Hub`;
  const estimatedDelivery = isDhaka ? 'Within 24–48 Hours' : 'Within 2–4 Business Days';
  const trackingNote = 'Order confirmed and scheduled for quality inspection before Pathao pickup.';

  const orderDoc = {
    orderId: cleanOrderId,
    consignmentId,
    recipientName: truncateStr(input.recipientName, 120),
    recipientPhone: truncateStr(input.recipientPhone, 32),
    recipientAddress: truncateStr(input.recipientAddress, 300),
    division: truncateStr(input.division, 80),
    paymentMethod: input.paymentMethod,
    subtotalBDT: Math.max(0, Math.round(input.subtotalBDT)),
    discountBDT: Math.max(0, Math.round(input.discountBDT)),
    deliveryFeeBDT: Math.max(0, Math.round(input.deliveryFeeBDT)),
    totalBDT: Math.max(0, Math.round(input.totalBDT)),
    itemsCount: Math.max(1, Math.round(input.itemsCount)),
    itemsSummary: truncateStr(input.itemsSummary, 1200) || 'Fabrician Garment Order',
    status: 'Pending' as const,
    hubLocation,
    estimatedDelivery,
    trackingNote,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const trackingDoc = {
    orderId: cleanOrderId,
    consignmentId,
    division: truncateStr(input.division, 80),
    hubLocation,
    paymentMethod: input.paymentMethod,
    amountToCollectBDT: input.paymentMethod === 'cod' ? Math.max(0, Math.round(input.totalBDT)) : 0,
    currentStatus: 'Pending' as const,
    estimatedDelivery,
    trackingNote,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Persist local cache as well so browser-local offline lookups remain seamless
  saveCustomerOrder({
    orderId: cleanOrderId,
    recipientName: orderDoc.recipientName,
    recipientPhone: orderDoc.recipientPhone,
    recipientAddress: orderDoc.recipientAddress,
    division: orderDoc.division,
    paymentMethod: input.paymentMethod,
    totalBDT: orderDoc.totalBDT,
    consignmentId,
  });

  if (!db) {
    return { orderId: cleanOrderId, consignmentId };
  }

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'orders', cleanOrderId), orderDoc);
    batch.set(doc(db, 'orderTracking', cleanOrderId), trackingDoc);
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${cleanOrderId}`);
  }

  return { orderId: cleanOrderId, consignmentId };
}

export async function updateStoreOrderDispatch(input: {
  orderId: string;
  status: StoreOrderStatus;
  hubLocation: string;
  riderName: string;
  riderPhone: string;
  estimatedDelivery: string;
  trackingNote: string;
}): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const cleanId = sanitizeId(input.orderId);
  const orderPatch: Record<string, unknown> = {
    status: input.status,
    hubLocation: truncateStr(input.hubLocation, 160) || 'Dhaka Central Hub',
    estimatedDelivery: truncateStr(input.estimatedDelivery, 100) || 'Within 24-48 Hours',
    trackingNote: truncateStr(input.trackingNote, 300) || 'Dispatch status updated by store admin.',
    updatedAt: serverTimestamp(),
  };
  const trackingPatch: Record<string, unknown> = {
    currentStatus: input.status,
    hubLocation: orderPatch.hubLocation,
    estimatedDelivery: orderPatch.estimatedDelivery,
    trackingNote: orderPatch.trackingNote,
    updatedAt: serverTimestamp(),
  };

  if (input.riderName.trim()) {
    orderPatch.riderName = truncateStr(input.riderName, 100);
    trackingPatch.riderName = orderPatch.riderName;
  }
  if (input.riderPhone.trim()) {
    orderPatch.riderPhone = truncateStr(input.riderPhone, 32);
  }

  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'orders', cleanId), orderPatch);
    batch.update(doc(db, 'orderTracking', cleanId), trackingPatch);
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${cleanId}`);
  }
}

export async function deleteStoreOrder(orderId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const cleanId = sanitizeId(orderId);
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'orders', cleanId));
    batch.delete(doc(db, 'orderTracking', cleanId));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${cleanId}`);
  }
}

export async function fetchLiveOrderTracking(orderId: string): Promise<StoreOrderTracking | null> {
  if (!db) return null;
  const cleanId = sanitizeId(orderId.toUpperCase());
  try {
    const snap = await getDoc(doc(db, 'orderTracking', cleanId));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      orderId: d.orderId,
      consignmentId: d.consignmentId,
      division: d.division,
      hubLocation: d.hubLocation,
      riderName: d.riderName,
      paymentMethod: d.paymentMethod,
      amountToCollectBDT: d.amountToCollectBDT,
      currentStatus: d.currentStatus,
      estimatedDelivery: d.estimatedDelivery,
      trackingNote: d.trackingNote,
      updatedAtMs: toMillis(d.updatedAt),
    };
  } catch {
    return null;
  }
}

export async function upsertCatalogOverride(item: CatalogOverride): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const cleanId = sanitizeId(item.id);
  const payload: Record<string, unknown> = {
    id: cleanId,
    sourceCatalog: item.sourceCatalog,
    nameEn: truncateStr(item.nameEn, 160),
    nameBn: truncateStr(item.nameBn, 160),
    category: item.category,
    collection: truncateStr(item.collection, 120),
    priceBDT: Math.max(0, Math.round(item.priceBDT)),
    stockCount: Math.max(0, Math.round(item.stockCount)),
    status: item.status,
    isNew: Boolean(item.isNew),
    isBestseller: Boolean(item.isBestseller),
    updatedAt: serverTimestamp(),
  };

  if (item.brand) {
    payload.brand = item.brand;
  }
  if (typeof item.compareAtPriceBDT === 'number' && item.compareAtPriceBDT > 0) {
    payload.compareAtPriceBDT = Math.round(item.compareAtPriceBDT);
  }
  if (item.image && item.image.trim()) {
    payload.image = truncateStr(item.image, 500);
  }
  if (item.fabricEn && item.fabricEn.trim()) {
    payload.fabricEn = truncateStr(item.fabricEn, 240);
  }
  if (item.fabricBn && item.fabricBn.trim()) {
    payload.fabricBn = truncateStr(item.fabricBn, 240);
  }
  if (item.fitEn && item.fitEn.trim()) {
    payload.fitEn = truncateStr(item.fitEn, 120);
  }
  if (item.fitBn && item.fitBn.trim()) {
    payload.fitBn = truncateStr(item.fitBn, 120);
  }

  try {
    await setDoc(doc(db, 'catalogOverrides', cleanId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `catalogOverrides/${cleanId}`);
  }
}

export async function deleteCatalogOverride(productId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const cleanId = sanitizeId(productId);
  try {
    await deleteDoc(doc(db, 'catalogOverrides', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `catalogOverrides/${cleanId}`);
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const payload = {
    hotlineDisplay: truncateStr(settings.hotlineDisplay, 40),
    hotlineTel: truncateStr(settings.hotlineTel, 48),
    atelierAddress: truncateStr(settings.atelierAddress, 200),
    freeShippingThresholdBDT: Math.max(0, Math.round(settings.freeShippingThresholdBDT)),
    dhakaShippingFeeBDT: Math.max(0, Math.round(settings.dhakaShippingFeeBDT)),
    outsideDhakaShippingFeeBDT: Math.max(0, Math.round(settings.outsideDhakaShippingFeeBDT)),
    bundle2DiscountBDT: Math.max(0, Math.round(settings.bundle2DiscountBDT)),
    bundle3DiscountBDT: Math.max(0, Math.round(settings.bundle3DiscountBDT)),
    announcementEnabled: Boolean(settings.announcementEnabled),
    announcementTextEn: truncateStr(settings.announcementTextEn, 200),
    announcementTextBn: truncateStr(settings.announcementTextBn, 200),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'storeSettings', 'main'), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'storeSettings/main');
  }
}

export async function subscribeNewsletter(email: string, language: Language): Promise<void> {
  if (!db) throw new Error('Newsletter cloud sync requires VITE_FIREBASE_API_KEY.');
  const normalizedEmail = truncateStr(email.toLowerCase(), 160);
  const subId = sanitizeId(`sub-${normalizedEmail.replace(/[@.]/g, '_')}`);
  try {
    await setDoc(doc(db, 'subscribers', subId), {
      email: normalizedEmail,
      language,
      subscribedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `subscribers/${subId}`);
  }
}

export async function deleteSubscriber(subscriberId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const cleanId = sanitizeId(subscriberId);
  try {
    await deleteDoc(doc(db, 'subscribers', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `subscribers/${cleanId}`);
  }
}

export async function submitStoreReview(input: {
  productId: string;
  author: string;
  location: string;
  rating: number;
  sizePurchased: string;
  fitFeedback: 'Runs True to Size' | 'Slightly Relaxed' | 'Tailored & Snug';
  title: string;
  comment: string;
}): Promise<StoreReview> {
  const reviewId = sanitizeId(`rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  const docPayload = {
    id: reviewId,
    productId: truncateStr(input.productId, 80),
    author: truncateStr(input.author, 100),
    location: truncateStr(input.location || 'Dhaka, Bangladesh', 100),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    sizePurchased: truncateStr(input.sizePurchased || 'M', 40),
    fitFeedback: input.fitFeedback,
    title: truncateStr(input.title, 160),
    comment: truncateStr(input.comment, 1000),
    status: 'approved' as const,
    helpfulCount: 1,
    createdAt: serverTimestamp(),
  };

  if (!db) {
    throw new Error('Reviews cloud sync requires VITE_FIREBASE_API_KEY.');
  }

  try {
    await setDoc(doc(db, 'reviews', reviewId), docPayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `reviews/${reviewId}`);
  }

  return {
    id: reviewId,
    productId: docPayload.productId,
    author: docPayload.author,
    location: docPayload.location,
    rating: docPayload.rating,
    sizePurchased: docPayload.sizePurchased,
    fitFeedback: docPayload.fitFeedback,
    title: docPayload.title,
    comment: docPayload.comment,
    status: 'approved',
    helpfulCount: 1,
    createdAtMs: Date.now(),
  };
}

export async function upvoteStoreReview(reviewId: string): Promise<void> {
  if (!db) return;
  const cleanId = sanitizeId(reviewId);
  try {
    await updateDoc(doc(db, 'reviews', cleanId), {
      helpfulCount: increment(1),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${cleanId}`);
  }
}

export async function moderateStoreReview(
  reviewId: string,
  status: 'approved' | 'hidden'
): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const cleanId = sanitizeId(reviewId);
  try {
    await updateDoc(doc(db, 'reviews', cleanId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `reviews/${cleanId}`);
  }
}

export async function deleteStoreReview(reviewId: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured. Set VITE_FIREBASE_API_KEY.');
  const cleanId = sanitizeId(reviewId);
  try {
    await deleteDoc(doc(db, 'reviews', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `reviews/${cleanId}`);
  }
}

export function mapOrderDoc(data: Record<string, unknown>): StoreOrder {
  return {
    orderId: String(data.orderId || ''),
    consignmentId: String(data.consignmentId || ''),
    recipientName: String(data.recipientName || ''),
    recipientPhone: String(data.recipientPhone || ''),
    recipientAddress: String(data.recipientAddress || ''),
    division: String(data.division || ''),
    paymentMethod: data.paymentMethod === 'mfs' ? 'mfs' : 'cod',
    subtotalBDT: Number(data.subtotalBDT || 0),
    discountBDT: Number(data.discountBDT || 0),
    deliveryFeeBDT: Number(data.deliveryFeeBDT || 0),
    totalBDT: Number(data.totalBDT || 0),
    itemsCount: Number(data.itemsCount || 1),
    itemsSummary: String(data.itemsSummary || ''),
    status: (data.status as StoreOrderStatus) || 'Pending',
    hubLocation: String(data.hubLocation || ''),
    riderName: data.riderName ? String(data.riderName) : undefined,
    riderPhone: data.riderPhone ? String(data.riderPhone) : undefined,
    estimatedDelivery: String(data.estimatedDelivery || ''),
    trackingNote: String(data.trackingNote || ''),
    createdAtMs: toMillis(data.createdAt),
    updatedAtMs: toMillis(data.updatedAt),
  };
}
