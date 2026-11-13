import { Product } from '../types';
import { LiveProduct } from '../types/store';

export const STARKIT_META_PIXEL_ID = '1390081606323661';
export const FARIZA_META_PIXEL_ID = '1657670575734647';

type FbqFn = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: FbqFn;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
    __STARKIT_PIXEL_INITIALIZED__?: boolean;
    __STARKIT_INITIAL_PAGEVIEW__?: boolean;
    __STARKIT_INITIAL_PAGEVIEW_ID__?: string;
    __STARKIT_INITIAL_URL__?: string;
    __FARIZA_PIXEL_INITIALIZED__?: boolean;
    __FARIZA_INITIAL_PAGEVIEW__?: boolean;
    __FARIZA_INITIAL_PAGEVIEW_ID__?: string;
    __FARIZA_INITIAL_URL__?: string;
  }
}

export interface MetaPixelContentItem {
  id: string;
  name: string;
  priceBDT: number;
  quantity: number;
  category?: string;
}

export interface MetaCapiCustomer {
  fullName?: string;
  phone?: string;
  division?: string;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const prefix = `${name}=`;
  for (const entry of cookies) {
    if (entry.startsWith(prefix)) {
      return decodeURIComponent(entry.slice(prefix.length));
    }
  }
  return undefined;
}

function getFbp(): string | undefined {
  return readCookie('_fbp');
}

function getFbc(): string | undefined {
  const cookieFbc = readCookie('_fbc');
  if (cookieFbc) return cookieFbc;
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  if (fbclid) {
    return `fb.1.${Date.now()}.${fbclid}`;
  }
  return undefined;
}

function generateEventId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function dispatchCapiEvent(params: {
  pixelId: string;
  eventName: string;
  eventId: string;
  customData?: Record<string, unknown>;
  customer?: MetaCapiCustomer;
}): void {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return;

  const payload = {
    pixelId: params.pixelId,
    eventName: params.eventName,
    eventId: params.eventId,
    eventSourceUrl: window.location.href,
    fbp: getFbp(),
    fbc: getFbc(),
    customData: params.customData,
    customer: params.customer,
  };

  fetch('/api/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Non-blocking telemetry: never disrupt storefront UX
  });
}

export function isStarKiTRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '').replace(/\/+$/, '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();
  return path === '/starkit' || hash === '#starkit';
}

export function isFarizaRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '').replace(/\/+$/, '').toLowerCase();
  const hash = (window.location.hash || '').toLowerCase();
  return (
    path === '/farizas-territory' ||
    hash === '#farizas-territory' ||
    hash === '#three-piece-edit'
  );
}

export function isStarKiTItem(
  productId: string,
  nameEn?: string,
  catalog?: Pick<LiveProduct, 'id' | 'brand'>[]
): boolean {
  const idUpper = (productId || '').toUpperCase();
  if (
    idUpper.startsWith('FAB-H') ||
    idUpper.startsWith('STK-') ||
    idUpper.startsWith('SK-')
  ) {
    return true;
  }
  if (nameEn && nameEn.toLowerCase().includes('starkit')) {
    return true;
  }
  if (catalog) {
    const match = catalog.find((p) => p.id === productId);
    if (match?.brand === 'StarKiT') return true;
  }
  return false;
}

export function isStarKiTProduct(
  product: Pick<Product, 'id' | 'brand' | 'nameEn'> | null | undefined,
  catalog?: Pick<LiveProduct, 'id' | 'brand'>[]
): boolean {
  if (!product) return false;
  if (product.brand === 'StarKiT') return true;
  return isStarKiTItem(product.id, product.nameEn, catalog);
}

export function isFarizaItem(
  productId: string,
  nameEn?: string,
  catalog?: Pick<LiveProduct, 'id' | 'brand'>[]
): boolean {
  const idUpper = (productId || '').toUpperCase();
  if (
    idUpper.startsWith('CAT-') ||
    idUpper.startsWith('FS-D') ||
    idUpper.startsWith('MB-BT') ||
    idUpper.startsWith('ZSL-') ||
    idUpper.startsWith('FT-')
  ) {
    return true;
  }
  if (nameEn && nameEn.toLowerCase().includes('fariza')) {
    return true;
  }
  if (catalog) {
    const match = catalog.find((p) => p.id === productId);
    if (match?.brand === "Fariza's Territory") return true;
  }
  return false;
}

export function isFarizaProduct(
  product: Pick<Product, 'id' | 'brand' | 'nameEn'> | null | undefined,
  catalog?: Pick<LiveProduct, 'id' | 'brand'>[]
): boolean {
  if (!product) return false;
  if (product.brand === "Fariza's Territory") return true;
  return isFarizaItem(product.id, product.nameEn, catalog);
}

function loadFbqStubAndScript(): FbqFn | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  if (!window.fbq) {
    const f = window;
    const b = document;
    const e = 'script';
    const v = 'https://connect.facebook.net/en_US/fbevents.js';

    const n: FbqFn = function (...args: unknown[]) {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue = n.queue || [];
        n.queue.push(args);
      }
    } as FbqFn;

    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    f.fbq = n;

    const t = b.createElement(e);
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else if (b.head) {
      b.head.appendChild(t);
    }
  }

  return window.fbq || null;
}

export function ensureStarKiTMetaPixel(): FbqFn | null {
  const fbq = loadFbqStubAndScript();
  if (!fbq) return null;

  if (!window.__STARKIT_PIXEL_INITIALIZED__) {
    window.__STARKIT_PIXEL_INITIALIZED__ = true;
    fbq('init', STARKIT_META_PIXEL_ID);
  }

  return fbq;
}

export function ensureFarizaMetaPixel(): FbqFn | null {
  const fbq = loadFbqStubAndScript();
  if (!fbq) return null;

  if (!window.__FARIZA_PIXEL_INITIALIZED__) {
    window.__FARIZA_PIXEL_INITIALIZED__ = true;
    fbq('init', FARIZA_META_PIXEL_ID);
  }

  return fbq;
}

let lastTrackedStarKiTRoute: string | null = null;
let lastTrackedFarizaRoute: string | null = null;

function getCurrentRouteKey(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname + window.location.search + window.location.hash;
}

export function syncInitialPageViewCapi(): void {
  if (typeof window === 'undefined') return;

  if (window.__STARKIT_INITIAL_PAGEVIEW__) {
    window.__STARKIT_INITIAL_PAGEVIEW__ = false;
    const initialId = window.__STARKIT_INITIAL_PAGEVIEW_ID__ || generateEventId('pv');
    window.__STARKIT_INITIAL_PAGEVIEW_ID__ = undefined;
    lastTrackedStarKiTRoute = window.__STARKIT_INITIAL_URL__ || getCurrentRouteKey();
    dispatchCapiEvent({
      pixelId: STARKIT_META_PIXEL_ID,
      eventName: 'PageView',
      eventId: initialId,
    });
  }

  if (window.__FARIZA_INITIAL_PAGEVIEW__) {
    window.__FARIZA_INITIAL_PAGEVIEW__ = false;
    const initialFarizaId =
      window.__FARIZA_INITIAL_PAGEVIEW_ID__ || generateEventId('fpv');
    window.__FARIZA_INITIAL_PAGEVIEW_ID__ = undefined;
    lastTrackedFarizaRoute = window.__FARIZA_INITIAL_URL__ || getCurrentRouteKey();
    dispatchCapiEvent({
      pixelId: FARIZA_META_PIXEL_ID,
      eventName: 'PageView',
      eventId: initialFarizaId,
    });
  }
}

export function trackStarKiTPageView(): void {
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const currentRoute = getCurrentRouteKey();

  if (window.__STARKIT_INITIAL_PAGEVIEW__) {
    syncInitialPageViewCapi();
    return;
  }

  if (lastTrackedStarKiTRoute === currentRoute) {
    lastTrackedStarKiTRoute = null;
    return;
  }

  lastTrackedStarKiTRoute = currentRoute;
  const eventId = generateEventId('pv');
  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'PageView', {}, { eventID: eventId });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'PageView',
    eventId,
  });
}

export function trackFarizaPageView(forceSectionKey?: string): void {
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const routeKey = forceSectionKey || getCurrentRouteKey();

  if (window.__FARIZA_INITIAL_PAGEVIEW__) {
    syncInitialPageViewCapi();
    return;
  }

  if (lastTrackedFarizaRoute === routeKey) {
    return;
  }

  lastTrackedFarizaRoute = routeKey;
  const eventId = generateEventId('fpv');
  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'PageView', {}, { eventID: eventId });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'PageView',
    eventId,
  });
}

export function trackStarKiTViewContent(params: {
  id: string;
  name: string;
  category?: string;
  valueBDT: number;
}): void {
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('vc');
  const customData = {
    content_ids: [params.id],
    content_name: params.name,
    content_type: 'product',
    content_category: params.category || 'StarKiT Streetwear',
    contents: [{ id: params.id, quantity: 1, item_price: params.valueBDT }],
    value: params.valueBDT,
    currency: 'BDT',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'ViewContent', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'ViewContent',
    eventId,
    customData,
  });
}

export function trackFarizaViewContent(params: {
  id: string;
  name: string;
  category?: string;
  valueBDT: number;
}): void {
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fvc');
  const customData = {
    content_ids: [params.id],
    content_name: params.name,
    content_type: 'product',
    content_category: params.category || "Fariza's Territory Three-Piece",
    contents: [{ id: params.id, quantity: 1, item_price: params.valueBDT }],
    value: params.valueBDT,
    currency: 'BDT',
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'ViewContent', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'ViewContent',
    eventId,
    customData,
  });
}

export function trackStarKiTSearch(searchString: string): void {
  const q = searchString.trim();
  if (q.length < 2) return;
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('srch');
  const customData = {
    search_string: q,
    content_category: 'StarKiT',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'Search', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'Search',
    eventId,
    customData,
  });
}

export function trackFarizaSearch(searchString: string): void {
  const q = searchString.trim();
  if (q.length < 2) return;
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fsrch');
  const customData = {
    search_string: q,
    content_category: "Fariza's Territory",
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'Search', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'Search',
    eventId,
    customData,
  });
}

export function trackStarKiTAddToWishlist(params: {
  id: string;
  name: string;
  category?: string;
  valueBDT: number;
}): void {
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('wl');
  const customData = {
    content_ids: [params.id],
    content_name: params.name,
    content_type: 'product',
    content_category: params.category || 'StarKiT Streetwear',
    contents: [{ id: params.id, quantity: 1, item_price: params.valueBDT }],
    value: params.valueBDT,
    currency: 'BDT',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'AddToWishlist', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'AddToWishlist',
    eventId,
    customData,
  });
}

export function trackFarizaAddToWishlist(params: {
  id: string;
  name: string;
  category?: string;
  valueBDT: number;
}): void {
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fwl');
  const customData = {
    content_ids: [params.id],
    content_name: params.name,
    content_type: 'product',
    content_category: params.category || "Fariza's Territory Three-Piece",
    contents: [{ id: params.id, quantity: 1, item_price: params.valueBDT }],
    value: params.valueBDT,
    currency: 'BDT',
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'AddToWishlist', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'AddToWishlist',
    eventId,
    customData,
  });
}

export function trackStarKiTAddToCart(item: MetaPixelContentItem): void {
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('atc');
  const customData = {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    content_category: item.category || 'StarKiT Streetwear',
    contents: [
      {
        id: item.id,
        quantity: item.quantity,
        item_price: item.priceBDT,
      },
    ],
    num_items: item.quantity,
    value: item.priceBDT * item.quantity,
    currency: 'BDT',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'AddToCart', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'AddToCart',
    eventId,
    customData,
  });
}

export function trackFarizaAddToCart(item: MetaPixelContentItem): void {
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fatc');
  const customData = {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    content_category: item.category || "Fariza's Territory Three-Piece",
    contents: [
      {
        id: item.id,
        quantity: item.quantity,
        item_price: item.priceBDT,
      },
    ],
    num_items: item.quantity,
    value: item.priceBDT * item.quantity,
    currency: 'BDT',
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'AddToCart', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'AddToCart',
    eventId,
    customData,
  });
}

export function trackStarKiTInitiateCheckout(
  items: MetaPixelContentItem[],
  totalValueBDT: number
): void {
  if (items.length === 0) return;
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('ic');
  const numItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const customData = {
    content_ids: items.map((i) => i.id),
    content_name: items.map((i) => i.name).join(', '),
    content_type: 'product',
    content_category: 'StarKiT Streetwear',
    contents: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.priceBDT,
    })),
    num_items: numItems,
    value: Math.max(0, Math.round(totalValueBDT)),
    currency: 'BDT',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'InitiateCheckout', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'InitiateCheckout',
    eventId,
    customData,
  });
}

export function trackFarizaInitiateCheckout(
  items: MetaPixelContentItem[],
  totalValueBDT: number
): void {
  if (items.length === 0) return;
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fic');
  const numItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const customData = {
    content_ids: items.map((i) => i.id),
    content_name: items.map((i) => i.name).join(', '),
    content_type: 'product',
    content_category: "Fariza's Territory Three-Piece",
    contents: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.priceBDT,
    })),
    num_items: numItems,
    value: Math.max(0, Math.round(totalValueBDT)),
    currency: 'BDT',
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'InitiateCheckout', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'InitiateCheckout',
    eventId,
    customData,
  });
}

export function trackStarKiTAddPaymentInfo(
  paymentMethod: 'cod' | 'mfs',
  items: MetaPixelContentItem[],
  totalValueBDT: number
): void {
  if (items.length === 0) return;
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('api');
  const customData = {
    content_ids: items.map((i) => i.id),
    content_name: items.map((i) => i.name).join(', '),
    content_type: 'product',
    contents: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.priceBDT,
    })),
    payment_type: paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash / Nagad MFS',
    value: Math.max(0, Math.round(totalValueBDT)),
    currency: 'BDT',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'AddPaymentInfo', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'AddPaymentInfo',
    eventId,
    customData,
  });
}

export function trackFarizaAddPaymentInfo(
  paymentMethod: 'cod' | 'mfs',
  items: MetaPixelContentItem[],
  totalValueBDT: number
): void {
  if (items.length === 0) return;
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fapi');
  const customData = {
    content_ids: items.map((i) => i.id),
    content_name: items.map((i) => i.name).join(', '),
    content_type: 'product',
    contents: items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.priceBDT,
    })),
    payment_type: paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash / Nagad MFS',
    value: Math.max(0, Math.round(totalValueBDT)),
    currency: 'BDT',
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'AddPaymentInfo', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'AddPaymentInfo',
    eventId,
    customData,
  });
}

export function trackStarKiTPurchase(params: {
  orderId: string;
  items: MetaPixelContentItem[];
  totalValueBDT: number;
  customer?: MetaCapiCustomer;
}): void {
  if (params.items.length === 0) return;
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = `purchase_${params.orderId}`;
  const numItems = params.items.reduce((sum, i) => sum + i.quantity, 0);
  const customData = {
    order_id: params.orderId,
    content_ids: params.items.map((i) => i.id),
    content_name: params.items.map((i) => i.name).join(', '),
    content_type: 'product',
    content_category: 'StarKiT Streetwear',
    contents: params.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.priceBDT,
    })),
    num_items: numItems,
    value: Math.max(0, Math.round(params.totalValueBDT)),
    currency: 'BDT',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'Purchase', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'Purchase',
    eventId,
    customData,
    customer: params.customer,
  });
}

export function trackFarizaPurchase(params: {
  orderId: string;
  items: MetaPixelContentItem[];
  totalValueBDT: number;
  customer?: MetaCapiCustomer;
}): void {
  if (params.items.length === 0) return;
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = `fpurchase_${params.orderId}`;
  const numItems = params.items.reduce((sum, i) => sum + i.quantity, 0);
  const customData = {
    order_id: params.orderId,
    content_ids: params.items.map((i) => i.id),
    content_name: params.items.map((i) => i.name).join(', '),
    content_type: 'product',
    content_category: "Fariza's Territory Three-Piece",
    contents: params.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.priceBDT,
    })),
    num_items: numItems,
    value: Math.max(0, Math.round(params.totalValueBDT)),
    currency: 'BDT',
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'Purchase', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'Purchase',
    eventId,
    customData,
    customer: params.customer,
  });
}

export function trackStarKiTContact(channel: string, detail?: string): void {
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('cnt');
  const customData = {
    content_name: detail || 'StarKiT WhatsApp Desk',
    content_category: channel,
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'Contact', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'Contact',
    eventId,
    customData,
  });
}

export function trackFarizaContact(channel: string, detail?: string): void {
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fcnt');
  const customData = {
    content_name: detail || "Fariza's Territory Concierge",
    content_category: channel,
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'Contact', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'Contact',
    eventId,
    customData,
  });
}

export function trackStarKiTCustomizeProduct(detail: string, productId?: string): void {
  const fbq = ensureStarKiTMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('cust');
  const customData = {
    ...(productId ? { content_ids: [productId] } : {}),
    content_name: detail,
    content_category: 'StarKiT Studio',
  };

  fbq('trackSingle', STARKIT_META_PIXEL_ID, 'CustomizeProduct', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: STARKIT_META_PIXEL_ID,
    eventName: 'CustomizeProduct',
    eventId,
    customData,
  });
}

export function trackFarizaCustomizeProduct(detail: string, productId?: string): void {
  const fbq = ensureFarizaMetaPixel();
  if (!fbq) return;

  const eventId = generateEventId('fcust');
  const customData = {
    ...(productId ? { content_ids: [productId] } : {}),
    content_name: detail,
    content_category: "Fariza's Territory Studio",
  };

  fbq('trackSingle', FARIZA_META_PIXEL_ID, 'CustomizeProduct', customData, {
    eventID: eventId,
  });
  dispatchCapiEvent({
    pixelId: FARIZA_META_PIXEL_ID,
    eventName: 'CustomizeProduct',
    eventId,
    customData,
  });
}
