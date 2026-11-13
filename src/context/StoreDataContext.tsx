import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  PRIMARY_ADMIN_EMAIL,
  testFirestoreConnection,
} from '../firebase';
import { THREE_PIECE_CATALOG, ThreePieceItem } from '../data/threePieceCatalog';
import { GRAPHIC_ARCHIVE_PRODUCTS, GraphicArchiveProduct } from '../data/graphicArchiveCatalog';
import {
  CatalogOverride,
  DEFAULT_STORE_SETTINGS,
  LiveGraphicArchiveProduct,
  LiveProduct,
  LiveThreePieceItem,
  StoreReview,
  StoreSettings,
} from '../types/store';

function resolveThreePieceStyleTag(
  sub: ThreePieceItem['subCollection']
): LiveProduct['styleTag'] {
  if (sub === 'Zam Zam Swiss Lawn') return 'minimal';
  if (sub === 'Magenta & Plum') return 'relaxed';
  return 'heritage';
}

function resolveGraphicStyleTag(
  cat: GraphicArchiveProduct['category']
): LiveProduct['styleTag'] {
  if (cat === 'Bangla Heritage' || cat === 'City Stories') return 'heritage';
  if (cat === 'Playful Street') return 'relaxed';
  if (cat === 'Statement Graphics') return 'minimal';
  return 'urban';
}

const CURATED_SIGNATURE_IDS = new Set([
  'FAB-H001',
  'FAB-H003',
  'FAB-H007',
  'FAB-H008',
  'tp-cat-001',
  'tp-zsl-01',
  'tp-fs-01',
  'tp-mb-01',
]);

interface StoreDataContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  authNotice: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  storeSettings: StoreSettings;
  catalogOverrides: Record<string, CatalogOverride>;
  unifiedCatalog: LiveProduct[];
  liveEssentialsProducts: LiveProduct[];
  liveThreePieceItems: LiveThreePieceItem[];
  liveGraphicArchiveProducts: LiveGraphicArchiveProduct[];
  approvedReviews: StoreReview[];
}

const StoreDataContext = createContext<StoreDataContextValue | null>(null);

export const StoreDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [catalogOverrides, setCatalogOverrides] = useState<Record<string, CatalogOverride>>({});
  const [approvedReviews, setApprovedReviews] = useState<StoreReview[]>([]);

  useEffect(() => {
    if (!auth || !db) {
      setAuthReady(true);
      return;
    }

    testFirestoreConnection();

    getRedirectResult(auth).catch((err) => {
      const code = (err as { code?: string })?.code || '';
      if (code && code !== 'auth/popup-closed-by-user') {
        setAuthNotice(formatAuthErrorMessage(err));
      }
    });

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setAuthNotice(null);
      setAuthReady(true);
    });

    const unsubSettings = onSnapshot(
      doc(db, 'storeSettings', 'main'),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setStoreSettings({
            hotlineDisplay: d.hotlineDisplay || DEFAULT_STORE_SETTINGS.hotlineDisplay,
            hotlineTel: d.hotlineTel || DEFAULT_STORE_SETTINGS.hotlineTel,
            atelierAddress: d.atelierAddress || DEFAULT_STORE_SETTINGS.atelierAddress,
            freeShippingThresholdBDT:
              typeof d.freeShippingThresholdBDT === 'number'
                ? d.freeShippingThresholdBDT
                : DEFAULT_STORE_SETTINGS.freeShippingThresholdBDT,
            dhakaShippingFeeBDT:
              typeof d.dhakaShippingFeeBDT === 'number'
                ? d.dhakaShippingFeeBDT
                : DEFAULT_STORE_SETTINGS.dhakaShippingFeeBDT,
            outsideDhakaShippingFeeBDT:
              typeof d.outsideDhakaShippingFeeBDT === 'number'
                ? d.outsideDhakaShippingFeeBDT
                : DEFAULT_STORE_SETTINGS.outsideDhakaShippingFeeBDT,
            bundle2DiscountBDT:
              typeof d.bundle2DiscountBDT === 'number'
                ? d.bundle2DiscountBDT
                : DEFAULT_STORE_SETTINGS.bundle2DiscountBDT,
            bundle3DiscountBDT:
              typeof d.bundle3DiscountBDT === 'number'
                ? d.bundle3DiscountBDT
                : DEFAULT_STORE_SETTINGS.bundle3DiscountBDT,
            announcementEnabled: Boolean(d.announcementEnabled),
            announcementTextEn:
              d.announcementTextEn ?? DEFAULT_STORE_SETTINGS.announcementTextEn,
            announcementTextBn:
              d.announcementTextBn ?? DEFAULT_STORE_SETTINGS.announcementTextBn,
          });
        }
      },
      (err) => {
        console.warn('Store settings listener error:', err);
      }
    );

    const unsubCatalog = onSnapshot(
      collection(db, 'catalogOverrides'),
      (snap) => {
        const next: Record<string, CatalogOverride> = {};
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          next[docSnap.id] = {
            id: docSnap.id,
            sourceCatalog: d.sourceCatalog || 'custom',
            brand: d.brand,
            nameEn: d.nameEn || '',
            nameBn: d.nameBn || '',
            category: d.category || 'Men',
            collection: d.collection || '',
            priceBDT: Number(d.priceBDT ?? 0),
            compareAtPriceBDT:
              typeof d.compareAtPriceBDT === 'number' ? d.compareAtPriceBDT : undefined,
            stockCount: Number(d.stockCount ?? 0),
            status: d.status || 'active',
            image: d.image,
            fabricEn: d.fabricEn,
            fabricBn: d.fabricBn,
            fitEn: d.fitEn,
            fitBn: d.fitBn,
            isNew: d.isNew,
            isBestseller: d.isBestseller,
            updatedAtMs:
              d.updatedAt instanceof Timestamp ? d.updatedAt.toMillis() : Date.now(),
          };
        });
        setCatalogOverrides(next);
      },
      (err) => {
        console.warn('Catalog overrides listener error:', err);
      }
    );

    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved')
    );
    const unsubReviews = onSnapshot(
      reviewsQuery,
      (snap) => {
        const rows: StoreReview[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          rows.push({
            id: docSnap.id,
            productId: String(d.productId || ''),
            author: String(d.author || ''),
            location: String(d.location || ''),
            rating: Number(d.rating || 5),
            sizePurchased: String(d.sizePurchased || 'M'),
            fitFeedback: d.fitFeedback || 'Runs True to Size',
            title: String(d.title || ''),
            comment: String(d.comment || ''),
            status: d.status || 'approved',
            helpfulCount: Number(d.helpfulCount || 1),
            createdAtMs:
              d.createdAt instanceof Timestamp ? d.createdAt.toMillis() : Date.now(),
          });
        });
        rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setApprovedReviews(rows);
      },
      (err) => {
        console.warn('Reviews listener error:', err);
      }
    );

    return () => {
      unsubAuth();
      unsubSettings();
      unsubCatalog();
      unsubReviews();
    };
  }, []);

  const isAdmin = Boolean(
    user && user.emailVerified && user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
  );

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Authentication is not configured. Set VITE_FIREBASE_API_KEY.');
    }
    setAuthNotice(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-blocked') {
        // Fallback smoothly if browser/PWA blocked popup
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw new Error(formatAuthErrorMessage(err));
    }
  };

  const signInWithGoogleRedirect = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Firebase Authentication is not configured. Set VITE_FIREBASE_API_KEY.');
    }
    setAuthNotice(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      throw new Error(formatAuthErrorMessage(err));
    }
  };

  const signOutAdmin = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  // Build unified live catalog strictly from StarKiT Graphic Archive (11), Fariza's Territory Three-Piece Edit (18), and Admin Custom Items
  const unifiedCatalog = useMemo<LiveProduct[]>(() => {
    const threePieceRows: LiveProduct[] = THREE_PIECE_CATALOG.map((tp) => {
      const ov = catalogOverrides[tp.id];
      return {
        id: tp.id,
        slug: tp.code.toLowerCase(),
        brand: ov?.brand || tp.brand || "Fariza's Territory",
        nameEn: ov?.nameEn || `${tp.code} — ${tp.nameEn}`,
        nameBn: ov?.nameBn || `${tp.code} — ${tp.nameBn}`,
        category: ov?.category || 'Women',
        collection: ov?.collection || tp.subCollection,
        priceBDT: ov ? ov.priceBDT : tp.priceBDT,
        compareAtPriceBDT: ov?.compareAtPriceBDT,
        image: ov?.image || tp.flatLayImage,
        colors: tp.colors,
        sizes: ['Unstitched Set', 'S', 'M', 'L', 'XL'],
        fabricEn: ov?.fabricEn || tp.fabric,
        fabricBn: ov?.fabricBn || tp.fabric,
        fitEn: ov?.fitEn || 'Tailorable 3-Piece Ensemble',
        fitBn: ov?.fitBn || 'কাস্টম টেইলরেবল থ্রি-পিস',
        isNew: ov?.isNew,
        isBestseller: ov?.isBestseller,
        styleTag: resolveThreePieceStyleTag(tp.subCollection),
        stockCount: ov ? ov.stockCount : 14,
        status: ov ? ov.status : 'active',
        sourceCatalog: 'three-piece',
        hasOverride: Boolean(ov),
      };
    });

    const graphicRows: LiveProduct[] = GRAPHIC_ARCHIVE_PRODUCTS.map((ga) => {
      const ov = catalogOverrides[ga.id];
      return {
        id: ga.id,
        slug: ga.id.toLowerCase(),
        brand: ov?.brand || ga.brand || 'StarKiT',
        nameEn: ov?.nameEn || `${ga.name} Hoodie`,
        nameBn: ov?.nameBn || `${ga.name} হুডি`,
        category: ov?.category || 'Streetwear',
        collection: ov?.collection || `Graphic Archive · ${ga.category}`,
        priceBDT: ov ? ov.priceBDT : ga.basePrice,
        compareAtPriceBDT: ov?.compareAtPriceBDT,
        image: ov?.image || ga.variants[0].previewImage,
        colors: ga.variants.map((v) => ({ name: v.color, hex: v.colorHex })),
        sizes: ['M', 'L', 'XL'],
        fabricEn: ov?.fabricEn || ga.variants[0].fabric,
        fabricBn: ov?.fabricBn || `${ga.variants[0].gsm} ব্রাশড ফ্লিস`,
        fitEn: ov?.fitEn || ga.variants[0].fit,
        fitBn: ov?.fitBn || 'রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
        isNew: ov?.isNew,
        isBestseller: ov?.isBestseller,
        styleTag: resolveGraphicStyleTag(ga.category),
        stockCount: ov ? ov.stockCount : 24,
        status: ov ? ov.status : 'active',
        sourceCatalog: 'graphic-archive',
        hasOverride: Boolean(ov),
      };
    });

    const customRows: LiveProduct[] = Object.values(catalogOverrides)
      .filter((ov) => ov.sourceCatalog === 'custom')
      .map((ov) => ({
        id: ov.id,
        slug: ov.id.toLowerCase(),
        brand:
          ov.brand ||
          (ov.category === 'Women'
            ? "Fariza's Territory"
            : ov.category === 'Men' || ov.category === 'Streetwear'
            ? 'StarKiT'
            : 'FABRICIAN'),
        nameEn: ov.nameEn,
        nameBn: ov.nameBn,
        category: ov.category,
        collection: ov.collection,
        priceBDT: ov.priceBDT,
        compareAtPriceBDT: ov.compareAtPriceBDT,
        image: ov.image || '/assets/aistudio/hoodie_preview_FAB-H001-CRM.png',
        colors: [{ name: 'Obsidian', hex: '#09090B' }],
        sizes: ov.category === 'Women' ? ['Unstitched Set', 'S', 'M', 'L'] : ['M', 'L', 'XL'],
        fabricEn: ov.fabricEn || 'Signature Atelier Textile',
        fabricBn: ov.fabricBn || 'আতেলিয়ে ফ্যাব্রিক',
        fitEn: ov.fitEn || 'Contemporary Fit',
        fitBn: ov.fitBn || 'সমসাময়িক ফিট',
        isNew: ov.isNew,
        isBestseller: ov.isBestseller,
        styleTag: 'minimal',
        stockCount: ov.stockCount,
        status: ov.status,
        sourceCatalog: 'custom',
        hasOverride: true,
      }));

    return [...customRows, ...threePieceRows, ...graphicRows];
  }, [catalogOverrides]);

  const liveEssentialsProducts = useMemo(
    () =>
      unifiedCatalog.filter(
        (p) =>
          (p.sourceCatalog === 'custom' || CURATED_SIGNATURE_IDS.has(p.id)) &&
          p.status !== 'hidden'
      ),
    [unifiedCatalog]
  );

  const liveThreePieceItems = useMemo<LiveThreePieceItem[]>(
    () =>
      THREE_PIECE_CATALOG.map((tp) => {
        const ov = catalogOverrides[tp.id];
        return {
          ...tp,
          brand: ov?.brand || tp.brand || "Fariza's Territory",
          nameEn: ov?.nameEn || tp.nameEn,
          nameBn: ov?.nameBn || tp.nameBn,
          flatLayImage: ov?.image || tp.flatLayImage,
          fabric: ov?.fabricEn || tp.fabric,
          priceBDT: ov ? ov.priceBDT : tp.priceBDT,
          stockCount: ov ? ov.stockCount : 14,
          status: ov ? ov.status : 'active',
        };
      }).filter((item) => item.status !== 'hidden'),
    [catalogOverrides]
  );

  const liveGraphicArchiveProducts = useMemo<LiveGraphicArchiveProduct[]>(
    () =>
      GRAPHIC_ARCHIVE_PRODUCTS.map((ga) => {
        const ov = catalogOverrides[ga.id];
        return {
          ...ga,
          brand: ov?.brand || ga.brand || 'StarKiT',
          name: ov?.nameEn ? ov.nameEn.replace(/\s+Hoodie$/i, '') : ga.name,
          basePrice: ov ? ov.priceBDT : ga.basePrice,
          variants: ga.variants.map((v, idx) => ({
            ...v,
            priceBdt: ov ? ov.priceBDT : v.priceBdt,
            previewImage: idx === 0 && ov?.image ? ov.image : v.previewImage,
          })),
          stockCount: ov ? ov.stockCount : 24,
          catalogStatus: ov ? ov.status : 'active',
        };
      }).filter((item) => item.catalogStatus !== 'hidden'),
    [catalogOverrides]
  );

  const value: StoreDataContextValue = {
    user,
    authReady,
    isAdmin,
    authNotice,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signOutAdmin,
    storeSettings,
    catalogOverrides,
    unifiedCatalog,
    liveEssentialsProducts,
    liveThreePieceItems,
    liveGraphicArchiveProducts,
    approvedReviews,
  };

  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
};

function formatAuthErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const host = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google Sign-In popup was closed before finishing. Please try again or use Redirect Sign-In.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Allow popups or use Redirect Sign-In.';
    case 'auth/unauthorized-domain':
      return `Domain "${host}" is not listed in Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    case 'auth/operation-not-allowed':
      return 'Google Sign-In provider is disabled in Firebase Console -> Authentication -> Sign-in method.';
    case 'auth/invalid-api-key':
      return 'Invalid Firebase Web API Key. Check firebase-applet-config.json or VITE_FIREBASE_API_KEY.';
    case 'auth/network-request-failed':
      return 'Network error while reaching Google Auth. Check internet connection or ad-blocker settings.';
    default:
      return err instanceof Error
        ? err.message
        : 'Unable to complete Google Sign-In. Please allow popups and try again.';
  }
}

export function useStoreData(): StoreDataContextValue {
  const ctx = useContext(StoreDataContext);
  if (!ctx) {
    throw new Error('useStoreData must be used inside StoreDataProvider');
  }
  return ctx;
}
