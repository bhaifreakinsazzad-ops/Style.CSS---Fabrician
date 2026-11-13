import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
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
import { FEATURED_PRODUCTS } from '../data/mockData';
import { THREE_PIECE_CATALOG } from '../data/threePieceCatalog';
import { GRAPHIC_ARCHIVE_PRODUCTS } from '../data/graphicArchiveCatalog';
import {
  CatalogOverride,
  DEFAULT_STORE_SETTINGS,
  LiveGraphicArchiveProduct,
  LiveProduct,
  LiveThreePieceItem,
  StoreReview,
  StoreSettings,
} from '../types/store';

interface StoreDataContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
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
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [catalogOverrides, setCatalogOverrides] = useState<Record<string, CatalogOverride>>({});
  const [approvedReviews, setApprovedReviews] = useState<StoreReview[]>([]);

  useEffect(() => {
    testFirestoreConnection();

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
            sourceCatalog: d.sourceCatalog || 'essentials',
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
    await signInWithPopup(auth, googleProvider);
  };

  const signOutAdmin = async () => {
    await signOut(auth);
  };

  // Build unified live catalog across Essentials, Three-Piece Edit, Graphic Archive, and Custom Items
  const unifiedCatalog = useMemo<LiveProduct[]>(() => {
    const essentialsRows: LiveProduct[] = FEATURED_PRODUCTS.map((p) => {
      const ov = catalogOverrides[p.id];
      const resolvedCategory = ov?.category || p.category;
      const defaultBrand =
        p.brand ||
        (resolvedCategory === 'Women' ? "Fariza's Territory" : 'StarKiT');
      return {
        ...p,
        brand: ov?.brand || defaultBrand,
        nameEn: ov?.nameEn || p.nameEn,
        nameBn: ov?.nameBn || p.nameBn,
        category: resolvedCategory,
        collection: ov?.collection || p.collection,
        priceBDT: ov ? ov.priceBDT : p.priceBDT,
        compareAtPriceBDT:
          ov?.compareAtPriceBDT !== undefined ? ov.compareAtPriceBDT : p.compareAtPriceBDT,
        image: ov?.image || p.image,
        fabricEn: ov?.fabricEn || p.fabricEn,
        fabricBn: ov?.fabricBn || p.fabricBn,
        fitEn: ov?.fitEn || p.fitEn,
        fitBn: ov?.fitBn || p.fitBn,
        isNew: ov?.isNew !== undefined ? ov.isNew : p.isNew,
        isBestseller: ov?.isBestseller !== undefined ? ov.isBestseller : p.isBestseller,
        stockCount: ov ? ov.stockCount : 18,
        status: ov ? ov.status : 'active',
        sourceCatalog: 'essentials',
        hasOverride: Boolean(ov),
      };
    });

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
        styleTag: 'heritage',
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
        styleTag: 'urban',
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
        image: ov.image || FEATURED_PRODUCTS[0].image,
        colors: [{ name: 'Obsidian', hex: '#09090B' }],
        sizes: ['S', 'M', 'L', 'XL'],
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

    return [...customRows, ...essentialsRows, ...threePieceRows, ...graphicRows];
  }, [catalogOverrides]);

  const liveEssentialsProducts = useMemo(
    () =>
      unifiedCatalog.filter(
        (p) =>
          (p.sourceCatalog === 'essentials' || p.sourceCatalog === 'custom') &&
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
    signInWithGoogle,
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

export function useStoreData(): StoreDataContextValue {
  const ctx = useContext(StoreDataContext);
  if (!ctx) {
    throw new Error('useStoreData must be used inside StoreDataProvider');
  }
  return ctx;
}
