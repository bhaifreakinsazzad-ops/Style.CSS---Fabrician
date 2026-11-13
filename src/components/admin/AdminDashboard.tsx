import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  db,
  isFirebaseConfigured,
  handleFirestoreError,
  OperationType,
  PRIMARY_ADMIN_EMAIL,
} from '../../firebase';
import { useStoreData } from '../../context/StoreDataContext';
import {
  deleteCatalogOverride,
  deleteStoreOrder,
  deleteStoreReview,
  deleteSubscriber,
  mapOrderDoc,
  moderateStoreReview,
  saveStoreSettings,
  sanitizeId,
  updateStoreOrderDispatch,
  upsertCatalogOverride,
} from '../../services/storeService';
import {
  CatalogOverride,
  CatalogStatus,
  LiveProduct,
  StoreOrder,
  StoreOrderStatus,
  StoreReview,
  StoreSettings,
  StoreSubscriber,
} from '../../types/store';
import { BrandPartner, Product } from '../../types';
import { AMBASSADOR_PORTRAIT } from '../../data/mockData';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

type AdminTab =
  | 'overview'
  | 'orders'
  | 'catalog'
  | 'reviews'
  | 'subscribers'
  | 'settings';

const ORDER_STATUSES: StoreOrderStatus[] = [
  'Pending',
  'Picked',
  'In_Transit',
  'Out_for_Delivery',
  'Delivered',
  'Returned',
];

const BRAND_PARTNERS: BrandPartner[] = ['StarKiT', "Fariza's Territory", 'FABRICIAN'];

const CATEGORIES: Product['category'][] = [
  'Men',
  'Women',
  'Unisex',
  'Traditional',
  'Streetwear',
];

const PRESET_ATELIER_IMAGES = [
  {
    label: 'StarKiT Ambassador Portrait',
    url: AMBASSADOR_PORTRAIT,
  },
  {
    label: 'StarKiT Cream Hoodie',
    url: '/assets/aistudio/hoodie_preview_FAB-H001-CRM.png',
  },
  {
    label: 'StarKiT Bus Hoodie (FAB-H003)',
    url: '/assets/aistudio/hoodie_preview_FAB-H003-BLK.png',
  },
  {
    label: "Fariza's 3-Piece (CAT-001)",
    url: '/assets/fariza/CAT-001_flat.jpg',
  },
  {
    label: "Fariza's Swiss Lawn (ZSL-01)",
    url: '/assets/fariza/ZSL-01_flat.jpg',
  },
  {
    label: "Fariza's Mirror Set (FS-D01)",
    url: '/assets/fariza/FS-D01_model.jpg',
  },
];

function formatDateTime(ms: number): string {
  if (!ms) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

function getOrderStatusBadgeClass(status: StoreOrderStatus): string {
  switch (status) {
    case 'Delivered':
      return 'bg-[#16A34A]/15 text-emerald-400 border-[#16A34A]/40';
    case 'Out_for_Delivery':
    case 'In_Transit':
      return 'bg-[#D97706]/15 text-amber-400 border-[#D97706]/40';
    case 'Picked':
      return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
    case 'Returned':
      return 'bg-[#DC2626]/15 text-red-400 border-[#DC2626]/40';
    default:
      return 'bg-white/10 text-[#D8D3C9] border-white/15';
  }
}

function getCatalogStatusBadgeClass(status: CatalogStatus): string {
  switch (status) {
    case 'active':
      return 'bg-[#16A34A]/15 text-emerald-400 border-[#16A34A]/40';
    case 'out_of_stock':
      return 'bg-[#D97706]/15 text-amber-400 border-[#D97706]/40';
    case 'hidden':
      return 'bg-[#DC2626]/15 text-red-400 border-[#DC2626]/40';
  }
}

function csvEscape(val: unknown): string {
  const str = String(val ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const csv = [
    headers.map(csvEscape).join(','),
    ...rows.map((r) => r.map(csvEscape).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const {
    user,
    authReady,
    isAdmin,
    authNotice,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signOutAdmin,
    storeSettings,
    unifiedCatalog,
    catalogOverrides,
  } = useStoreData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Admin Firestore state
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<StoreSubscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Subscribe to private admin collections once authenticated as owner
  useEffect(() => {
    if (!isAdmin || !db) {
      setOrdersLoading(false);
      setReviewsLoading(false);
      setSubscribersLoading(false);
      return;
    }

    const firestore = db;
    setOrdersLoading(true);
    setReviewsLoading(true);
    setSubscribersLoading(true);
    setDataError(null);

    const unsubOrders = onSnapshot(
      collection(firestore, 'orders'),
      (snap) => {
        const next: StoreOrder[] = [];
        snap.forEach((docSnap) => {
          next.push(mapOrderDoc(docSnap.data() as Record<string, unknown>));
        });
        next.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setOrders(next);
        setOrdersLoading(false);
      },
      (err) => {
        setOrdersLoading(false);
        setDataError('Unable to stream orders from Firestore. Check permissions.');
        try {
          handleFirestoreError(err, OperationType.LIST, 'orders');
        } catch {
          // captured in state & console
        }
      }
    );

    const unsubReviews = onSnapshot(
      collection(firestore, 'reviews'),
      (snap) => {
        const next: StoreReview[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          next.push({
            id: docSnap.id,
            productId: String(d.productId || ''),
            author: String(d.author || ''),
            location: String(d.location || ''),
            rating: Number(d.rating || 5),
            sizePurchased: String(d.sizePurchased || 'M'),
            fitFeedback: d.fitFeedback || 'Runs True to Size',
            title: String(d.title || ''),
            comment: String(d.comment || ''),
            status: d.status === 'hidden' ? 'hidden' : 'approved',
            helpfulCount: Number(d.helpfulCount || 1),
            createdAtMs:
              d.createdAt instanceof Timestamp ? d.createdAt.toMillis() : Date.now(),
          });
        });
        next.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setReviews(next);
        setReviewsLoading(false);
      },
      (err) => {
        setReviewsLoading(false);
        setDataError('Unable to stream reviews from Firestore.');
        try {
          handleFirestoreError(err, OperationType.LIST, 'reviews');
        } catch {
          // captured in state
        }
      }
    );

    const unsubSubscribers = onSnapshot(
      collection(firestore, 'subscribers'),
      (snap) => {
        const next: StoreSubscriber[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          next.push({
            id: docSnap.id,
            email: String(d.email || ''),
            language: d.language === 'bn' ? 'bn' : 'en',
            subscribedAtMs:
              d.subscribedAt instanceof Timestamp ? d.subscribedAt.toMillis() : Date.now(),
          });
        });
        next.sort((a, b) => b.subscribedAtMs - a.subscribedAtMs);
        setSubscribers(next);
        setSubscribersLoading(false);
      },
      (err) => {
        setSubscribersLoading(false);
        setDataError('Unable to stream subscribers from Firestore.');
        try {
          handleFirestoreError(err, OperationType.LIST, 'subscribers');
        } catch {
          // captured in state
        }
      }
    );

    return () => {
      unsubOrders();
      unsubReviews();
      unsubSubscribers();
    };
  }, [isAdmin]);

  // Orders filter & dispatch editor state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | StoreOrderStatus>('ALL');
  const [editingOrder, setEditingOrder] = useState<StoreOrder | null>(null);
  const [dispatchForm, setDispatchForm] = useState({
    status: 'Pending' as StoreOrderStatus,
    hubLocation: '',
    riderName: '',
    riderPhone: '',
    estimatedDelivery: '',
    trackingNote: '',
  });
  const [savingOrder, setSavingOrder] = useState(false);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);

  const openOrderEditor = (order: StoreOrder) => {
    setEditingOrder(order);
    setDispatchForm({
      status: order.status,
      hubLocation: order.hubLocation || 'Tejgaon Central Hub, Dhaka',
      riderName: order.riderName || '',
      riderPhone: order.riderPhone || '',
      estimatedDelivery: order.estimatedDelivery || 'Within 24–48 Hours',
      trackingNote: order.trackingNote || '',
    });
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || savingOrder) return;
    setSavingOrder(true);
    try {
      await updateStoreOrderDispatch({
        orderId: editingOrder.orderId,
        status: dispatchForm.status,
        hubLocation: dispatchForm.hubLocation,
        riderName: dispatchForm.riderName,
        riderPhone: dispatchForm.riderPhone,
        estimatedDelivery: dispatchForm.estimatedDelivery,
        trackingNote: dispatchForm.trackingNote,
      });
      showToast(`Order ${editingOrder.orderId} dispatch updated.`);
      setEditingOrder(null);
    } catch {
      showToast('Failed to update order dispatch.');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteStoreOrder(orderId);
      setConfirmDeleteOrderId(null);
      if (editingOrder?.orderId === orderId) setEditingOrder(null);
      showToast(`Order ${orderId} deleted.`);
    } catch {
      showToast('Failed to delete order.');
    }
  };

  // Catalog filter & modals state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<'all' | BrandPartner>('all');
  const [catalogSourceFilter, setCatalogSourceFilter] = useState<
    'all' | 'three-piece' | 'graphic-archive' | 'custom'
  >('all');
  const [editingProduct, setEditingProduct] = useState<LiveProduct | null>(null);
  const [catalogForm, setCatalogForm] = useState({
    brand: 'StarKiT' as BrandPartner,
    nameEn: '',
    nameBn: '',
    category: 'Men' as Product['category'],
    collection: '',
    priceBDT: 0,
    compareAtPriceBDT: '',
    stockCount: 15,
    status: 'active' as CatalogStatus,
    image: '',
    fabricEn: '',
    fabricBn: '',
    fitEn: '',
    fitBn: '',
    isNew: false,
    isBestseller: false,
  });
  const [savingCatalog, setSavingCatalog] = useState(false);

  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    brand: 'StarKiT' as BrandPartner,
    nameEn: '',
    nameBn: '',
    category: 'Men' as Product['category'],
    collection: 'Dhaka Atelier Drop',
    priceBDT: '2850',
    compareAtPriceBDT: '',
    stockCount: '12',
    status: 'active' as CatalogStatus,
    image: PRESET_ATELIER_IMAGES[0].url,
    fabricEn: '340 GSM Combed Bangladesh Cotton',
    fabricBn: '৩৪০ জিএসএম বাংলাদেশি কম্বড কটন',
    fitEn: 'Contemporary Tailored Fit',
    fitBn: 'সমসাময়িক টেইলরড ফিট',
    isNew: true,
    isBestseller: false,
  });

  const openCatalogEditor = (product: LiveProduct) => {
    setEditingProduct(product);
    setCatalogForm({
      brand: product.brand || 'FABRICIAN',
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      category: product.category,
      collection: product.collection,
      priceBDT: product.priceBDT,
      compareAtPriceBDT: product.compareAtPriceBDT ? String(product.compareAtPriceBDT) : '',
      stockCount: product.stockCount,
      status: product.status,
      image: product.image,
      fabricEn: product.fabricEn,
      fabricBn: product.fabricBn,
      fitEn: product.fitEn,
      fitBn: product.fitBn,
      isNew: Boolean(product.isNew),
      isBestseller: Boolean(product.isBestseller),
    });
  };

  const handleSaveCatalogOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || savingCatalog) return;
    setSavingCatalog(true);
    try {
      const compareVal = Number(catalogForm.compareAtPriceBDT);
      const override: CatalogOverride = {
        id: editingProduct.id,
        sourceCatalog: editingProduct.sourceCatalog,
        brand: catalogForm.brand,
        nameEn: catalogForm.nameEn.trim() || editingProduct.nameEn,
        nameBn: catalogForm.nameBn.trim() || catalogForm.nameEn.trim() || editingProduct.nameEn,
        category: catalogForm.category,
        collection: catalogForm.collection.trim() || 'Signature Collection',
        priceBDT: Math.max(0, Number(catalogForm.priceBDT) || 0),
        compareAtPriceBDT: compareVal > 0 ? compareVal : undefined,
        stockCount: Math.max(0, Number(catalogForm.stockCount) || 0),
        status: catalogForm.status,
        image: catalogForm.image.trim() || editingProduct.image,
        fabricEn: catalogForm.fabricEn.trim() || editingProduct.fabricEn,
        fabricBn: catalogForm.fabricBn.trim() || editingProduct.fabricBn,
        fitEn: catalogForm.fitEn.trim() || editingProduct.fitEn,
        fitBn: catalogForm.fitBn.trim() || editingProduct.fitBn,
        isNew: catalogForm.isNew,
        isBestseller: catalogForm.isBestseller,
      };
      await upsertCatalogOverride(override);
      showToast(`Catalog item "${override.nameEn}" (${override.brand}) synced to storefront.`);
      setEditingProduct(null);
    } catch {
      showToast('Failed to save catalog update.');
    } finally {
      setSavingCatalog(false);
    }
  };

  const handleCreateCustomProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.nameEn.trim() || savingCatalog) return;
    setSavingCatalog(true);
    try {
      const newId = sanitizeId(`custom-${Date.now()}`);
      const compareVal = Number(customForm.compareAtPriceBDT);
      await upsertCatalogOverride({
        id: newId,
        sourceCatalog: 'custom',
        brand: customForm.brand,
        nameEn: customForm.nameEn.trim(),
        nameBn: customForm.nameBn.trim() || customForm.nameEn.trim(),
        category: customForm.category,
        collection: customForm.collection.trim() || 'Dhaka Atelier Drop',
        priceBDT: Math.max(0, Number(customForm.priceBDT) || 0),
        compareAtPriceBDT: compareVal > 0 ? compareVal : undefined,
        stockCount: Math.max(0, Number(customForm.stockCount) || 0),
        status: customForm.status,
        image: customForm.image.trim() || PRESET_ATELIER_IMAGES[0].url,
        fabricEn: customForm.fabricEn.trim() || 'Signature Atelier Textile',
        fabricBn: customForm.fabricBn.trim() || 'আতেলিয়ে ফ্যাব্রিক',
        fitEn: customForm.fitEn.trim() || 'Contemporary Fit',
        fitBn: customForm.fitBn.trim() || 'সমসাময়িক ফিট',
        isNew: customForm.isNew,
        isBestseller: customForm.isBestseller,
      });
      showToast(`Custom product "${customForm.nameEn.trim()}" published under ${customForm.brand}.`);
      setIsAddCustomOpen(false);
      setCustomForm({
        ...customForm,
        nameEn: '',
        nameBn: '',
        compareAtPriceBDT: '',
      });
    } catch {
      showToast('Failed to publish custom product.');
    } finally {
      setSavingCatalog(false);
    }
  };

  const handleResetOrDeleteOverride = async (product: LiveProduct) => {
    try {
      await deleteCatalogOverride(product.id);
      showToast(
        product.sourceCatalog === 'custom'
          ? `Deleted custom product "${product.nameEn}".`
          : `Reset "${product.nameEn}" to catalog defaults.`
      );
    } catch {
      showToast('Unable to remove catalog override.');
    }
  };

  // Reviews filter state
  const [reviewFilter, setReviewFilter] = useState<'all' | 'approved' | 'hidden'>('all');

  // Subscribers search state
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Store Settings form state synced cleanly when Firestore updates
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    setSettingsForm(storeSettings);
  }, [storeSettings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      settingsForm.hotlineDisplay.trim().length < 5 ||
      settingsForm.hotlineTel.trim().length < 5 ||
      settingsForm.atelierAddress.trim().length < 5
    ) {
      setSettingsError('Hotline, Tel link, and Atelier address must each be at least 5 characters.');
      return;
    }
    setSettingsError(null);
    setSavingSettings(true);
    try {
      await saveStoreSettings(settingsForm);
      showToast('Store settings saved and published live.');
    } catch {
      setSettingsError('Failed to save store settings. Check permissions.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Derived metrics & filtered datasets
  const metrics = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'Returned');
    const revenueBDT = validOrders.reduce((acc, o) => acc + o.totalBDT, 0);
    const pendingCount = orders.filter((o) => o.status === 'Pending').length;
    const inTransitCount = orders.filter(
      (o) =>
        o.status === 'Picked' ||
        o.status === 'In_Transit' ||
        o.status === 'Out_for_Delivery'
    ).length;
    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;
    const codOrders = orders.filter((o) => o.paymentMethod === 'cod');
    const mfsOrders = orders.filter((o) => o.paymentMethod === 'mfs');
    const lowOrOutCount = unifiedCatalog.filter(
      (p) => p.status === 'out_of_stock' || p.stockCount <= 3
    ).length;
    const starKitSkus = unifiedCatalog.filter((p) => p.brand === 'StarKiT').length;
    const starKitActive = unifiedCatalog.filter(
      (p) => p.brand === 'StarKiT' && p.status === 'active'
    ).length;
    const farizaSkus = unifiedCatalog.filter((p) => p.brand === "Fariza's Territory").length;
    const farizaActive = unifiedCatalog.filter(
      (p) => p.brand === "Fariza's Territory" && p.status === 'active'
    ).length;

    return {
      revenueBDT,
      totalOrders: orders.length,
      pendingCount,
      inTransitCount,
      deliveredCount,
      codRevenue: codOrders.reduce((a, b) => a + b.totalBDT, 0),
      mfsRevenue: mfsOrders.reduce((a, b) => a + b.totalBDT, 0),
      codCount: codOrders.length,
      mfsCount: mfsOrders.length,
      lowOrOutCount,
      starKitSkus,
      starKitActive,
      farizaSkus,
      farizaActive,
    };
  }, [orders, unifiedCatalog]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
      const matchSearch =
        !q ||
        o.orderId.toLowerCase().includes(q) ||
        o.consignmentId.toLowerCase().includes(q) ||
        o.recipientName.toLowerCase().includes(q) ||
        o.recipientPhone.toLowerCase().includes(q) ||
        o.division.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return unifiedCatalog.filter((p) => {
      const matchBrand =
        catalogBrandFilter === 'all' || p.brand === catalogBrandFilter;
      const matchSource =
        catalogSourceFilter === 'all' || p.sourceCatalog === catalogSourceFilter;
      const matchSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.nameBn.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchBrand && matchSource && matchSearch;
    });
  }, [unifiedCatalog, catalogSearch, catalogBrandFilter, catalogSourceFilter]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === 'all') return reviews;
    return reviews.filter((r) => r.status === reviewFilter);
  }, [reviews, reviewFilter]);

  const filteredSubscribers = useMemo(() => {
    const q = subscriberSearch.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, subscriberSearch]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in was cancelled or blocked. Please allow popups and try again.'
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      await signInWithGoogleRedirect();
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to start redirect sign-in.'
      );
      setAuthSubmitting(false);
    }
  };

  // Auth Loading State
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-[#F5F2EB] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#B69A60] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-[#9A9892]">Verifying store session...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-[#F5F2EB] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#11141C] border border-white/10 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
            <img
              src="/assets/aistudio/Untitled_design_a468bd14.png"
              alt="Fabrician Emblem"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold tracking-wide text-[#F5F2EB]">
                FABRICIAN Store Admin
              </h1>
              <p className="text-xs text-[#9A9892]">Operations &amp; Catalog Console</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-3.5 rounded-lg bg-[#0B0D12] border border-white/10 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#B69A60] shrink-0 mt-0.5" />
              <div className="text-xs text-[#D8D3C9] leading-relaxed">
                <p className="font-medium text-[#F5F2EB] mb-0.5">Authorized Owner Access</p>
                <p className="text-[#9A9892]">
                  Sign in with your verified Google account{' '}
                  <span className="font-mono text-[#D5BA80]">{PRIMARY_ADMIN_EMAIL}</span> to
                  manage orders, Pathao dispatch, inventory, and store settings.
                </p>
              </div>
            </div>

            {!isFirebaseConfigured && (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 leading-relaxed">
                <p className="font-semibold text-amber-100 mb-1">
                  Firebase Web API Key Not Configured
                </p>
                <p>
                  Add{' '}
                  <span className="font-mono text-[#D5BA80]">VITE_FIREBASE_API_KEY</span> in{' '}
                  <span className="font-mono">.env.local</span> or Vercel Environment Variables (with HTTP referrer restrictions in Google Cloud Console) to enable Google Admin sign-in and live Firestore sync.
                </p>
              </div>
            )}

            {(authError || authNotice) && (
              <div className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/40 text-xs text-red-300">
                {authError || authNotice}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authSubmitting || !isFirebaseConfigured}
              className="w-full py-2.5 px-4 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authSubmitting
                ? 'Connecting Google Account...'
                : !isFirebaseConfigured
                ? 'Set VITE_FIREBASE_API_KEY to Sign In'
                : 'Sign in with Google'}
            </button>

            {isFirebaseConfigured && (
              <button
                type="button"
                onClick={handleGoogleRedirectSignIn}
                disabled={authSubmitting}
                className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#D5BA80] text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
              >
                Popup blocked? Sign in via full-page redirect
              </button>
            )}

            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full py-2.5 px-4 rounded-lg bg-transparent border border-white/15 hover:border-white/30 text-[#D8D3C9] hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in as non-admin account
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-[#F5F2EB] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#11141C] border border-[#DC2626]/30 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4 text-red-400">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <h1 className="text-base font-semibold text-[#F5F2EB]">Access Restricted</h1>
          </div>

          <p className="text-xs text-[#9A9892] leading-relaxed mb-4">
            You are signed in as{' '}
            <span className="font-mono text-[#F5F2EB]">{user.email || 'Unknown user'}</span>.
            Only verified store administrator{' '}
            <span className="font-mono text-[#D5BA80]">{PRIMARY_ADMIN_EMAIL}</span> has
            permission to access the FABRICIAN Admin Console.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => signOutAdmin()}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-wider cursor-pointer"
            >
              Sign Out &amp; Switch
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="flex-1 py-2.5 px-4 rounded-lg border border-white/15 text-[#D8D3C9] hover:text-white text-xs font-medium cursor-pointer"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'orders',
      label: 'Orders & Dispatch',
      icon: <Truck className="w-4 h-4" />,
      badge: metrics.pendingCount > 0 ? metrics.pendingCount : undefined,
    },
    {
      id: 'catalog',
      label: 'Catalog & Inventory',
      icon: <Package className="w-4 h-4" />,
      badge: Object.keys(catalogOverrides).length || undefined,
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: reviews.length || undefined,
    },
    {
      id: 'subscribers',
      label: 'Subscribers',
      icon: <Mail className="w-4 h-4" />,
      badge: subscribers.length || undefined,
    },
    { id: 'settings', label: 'Store Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const activeNavLabel = navItems.find((n) => n.id === activeTab)?.label || 'Overview';

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F2EB] flex">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-[80] px-4 py-2.5 rounded-lg bg-[#11141C] border border-[#16A34A]/50 text-xs text-emerald-300 flex items-center gap-2 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 lg:hidden"
        />
      )}

      {/* Left Sidebar (256px) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-[#11141C] border-r border-white/10 flex flex-col justify-between transition-transform duration-200 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/Untitled_design_a468bd14.png"
                alt="Fabrician"
                className="w-7 h-7 object-contain"
              />
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-[#F5F2EB]">
                  FABRICIAN
                </div>
                <div className="text-[10px] font-mono text-[#B69A60] uppercase">
                  Store Console
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden p-1 text-[#9A9892] hover:text-white cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white/10 text-[#F5F2EB] border border-white/10'
                      : 'text-[#9A9892] hover:text-[#F5F2EB] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#B69A60]' : 'text-[#77777D]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-[#D5BA80] tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Account Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-[11px]">
            <div className="text-[#77777D] uppercase font-mono text-[10px] mb-0.5">
              Signed-in Owner
            </div>
            <div className="font-mono text-[#D8D3C9] truncate">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={() => signOutAdmin()}
            className="w-full py-2 px-3 rounded-lg border border-white/10 hover:border-white/25 text-xs text-[#D8D3C9] hover:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#0B0D12]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-1.5 rounded border border-white/10 text-[#D8D3C9] hover:text-white cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono truncate">
              <span className="text-[#77777D]">Admin</span>
              <span className="text-[#77777D]">/</span>
              <span className="text-[#F5F2EB] font-medium truncate">{activeNavLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-[#B69A60]/60 text-xs font-medium text-[#D8D3C9] hover:text-white flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>View Storefront</span>
            </button>
          </div>
        </header>

        {/* Data Error Banner if any */}
        {dataError && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/40 text-xs text-red-300 flex items-center justify-between">
            <span>{dataError}</span>
            <button
              type="button"
              onClick={() => setDataError(null)}
              className="text-red-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Viewport Body */}
        <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* ==================== 1. OVERVIEW TAB ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
                  <div className="text-[11px] font-mono uppercase text-[#9A9892] mb-2">
                    Gross Sales (Active)
                  </div>
                  <div className="text-2xl font-mono font-semibold text-[#F5F2EB] tabular-nums">
                    ৳ {metrics.revenueBDT.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-[#77777D] mt-1 font-mono tabular-nums">
                    {metrics.totalOrders} total orders placed
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
                  <div className="text-[11px] font-mono uppercase text-[#9A9892] mb-2">
                    Fulfillment Queue
                  </div>
                  <div className="text-2xl font-mono font-semibold text-amber-400 tabular-nums">
                    {metrics.pendingCount} Pending
                  </div>
                  <div className="text-[11px] text-[#77777D] mt-1 font-mono tabular-nums">
                    {metrics.inTransitCount} in transit · {metrics.deliveredCount} delivered
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
                  <div className="text-[11px] font-mono uppercase text-[#9A9892] mb-2">
                    Catalog &amp; Inventory
                  </div>
                  <div className="text-2xl font-mono font-semibold text-[#F5F2EB] tabular-nums">
                    {unifiedCatalog.length} SKUs
                  </div>
                  <div className="text-[11px] text-[#77777D] mt-1 font-mono tabular-nums">
                    {metrics.lowOrOutCount} low/out-of-stock alerts
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#11141C] border border-white/10">
                  <div className="text-[11px] font-mono uppercase text-[#9A9892] mb-2">
                    Community &amp; Dispatch
                  </div>
                  <div className="text-2xl font-mono font-semibold text-[#F5F2EB] tabular-nums">
                    {subscribers.length} Subscribers
                  </div>
                  <div className="text-[11px] text-[#77777D] mt-1 font-mono tabular-nums">
                    {reviews.length} customer reviews logged
                  </div>
                </div>
              </div>

              {/* Breakdown Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[#11141C] border border-white/10">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#D5BA80] mb-4">
                    Collab Brand Houses
                  </h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <div>
                        <div className="text-[#F5F2EB] font-medium">StarKiT</div>
                        <div className="text-[11px] font-mono text-[#77777D]">
                          Menswear &amp; 11 Graphic Hoodies
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogBrandFilter('StarKiT');
                          setCatalogSourceFilter('all');
                          setActiveTab('catalog');
                        }}
                        className="font-mono text-[#D5BA80] hover:underline tabular-nums cursor-pointer"
                      >
                        {metrics.starKitActive}/{metrics.starKitSkus} Active →
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-[#F5F2EB] font-medium">Fariza&apos;s Territory</div>
                        <div className="text-[11px] font-mono text-[#77777D]">
                          Women&apos;s Couture &amp; 18 Three-Piece Sets
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogBrandFilter("Fariza's Territory");
                          setCatalogSourceFilter('all');
                          setActiveTab('catalog');
                        }}
                        className="font-mono text-[#D5BA80] hover:underline tabular-nums cursor-pointer"
                      >
                        {metrics.farizaActive}/{metrics.farizaSkus} Active →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#11141C] border border-white/10">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#D5BA80] mb-4">
                    Payment Method Mix
                  </h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-[#D8D3C9]">Cash on Delivery (Pathao COD)</span>
                      <span className="font-mono text-[#F5F2EB] tabular-nums">
                        {metrics.codCount} orders · ৳ {metrics.codRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-[#D8D3C9]">bKash / Nagad / Card (MFS)</span>
                      <span className="font-mono text-[#F5F2EB] tabular-nums">
                        {metrics.mfsCount} orders · ৳ {metrics.mfsRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#11141C] border border-white/10">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-[#D5BA80] mb-4">
                    Active Storefront Rules
                  </h2>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-[#9A9892]">Free Shipping Threshold</span>
                      <span className="font-mono text-[#F5F2EB] tabular-nums">
                        ৳ {storeSettings.freeShippingThresholdBDT.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                      <span className="text-[#9A9892]">Dhaka / Nationwide Fee</span>
                      <span className="font-mono text-[#F5F2EB] tabular-nums">
                        ৳ {storeSettings.dhakaShippingFeeBDT} / ৳ {storeSettings.outsideDhakaShippingFeeBDT}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[#9A9892]">2-Pc / 3-Pc Bundle Discount</span>
                      <span className="font-mono text-[#F5F2EB] tabular-nums">
                        -৳ {storeSettings.bundle2DiscountBDT} / -৳ {storeSettings.bundle3DiscountBDT}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="rounded-xl bg-[#11141C] border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#F5F2EB]">Recent Orders</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-mono text-[#D5BA80] hover:underline cursor-pointer"
                  >
                    Manage all orders →
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-10 rounded bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-10 text-center text-xs text-[#9A9892]">
                    No live orders have been placed yet. Completed storefront checkouts appear here in real time.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[11px] font-mono uppercase text-[#77777D]">
                          <th className="py-2.5 px-4">Order ID</th>
                          <th className="py-2.5 px-4">Customer</th>
                          <th className="py-2.5 px-4">Division</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.slice(0, 6).map((o) => (
                          <tr
                            key={o.orderId}
                            onClick={() => {
                              setActiveTab('orders');
                              openOrderEditor(o);
                            }}
                            className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                          >
                            <td className="py-2.5 px-4 font-mono text-[#D5BA80]">{o.orderId}</td>
                            <td className="py-2.5 px-4 text-[#F5F2EB]">{o.recipientName}</td>
                            <td className="py-2.5 px-4 text-[#9A9892]">{o.division}</td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded border text-[10px] font-mono ${getOrderStatusBadgeClass(
                                  o.status
                                )}`}
                              >
                                {o.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#F5F2EB]">
                              ৳ {o.totalBDT.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 2. ORDERS & DISPATCH TAB ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="p-4 rounded-xl bg-[#11141C] border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', ...ORDER_STATUSES] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setOrderStatusFilter(status)}
                      className={`px-2.5 py-1.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                        orderStatusFilter === status
                          ? 'bg-[#B69A60] text-[#09090B] font-semibold'
                          : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10'
                      }`}
                    >
                      {status === 'ALL' ? `All (${orders.length})` : status.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#77777D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Order ID, name, phone, division..."
                      className="w-full bg-[#0B0D12] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={filteredOrders.length === 0}
                    onClick={() =>
                      downloadCsv(
                        `fabrician-orders-${new Date().toISOString().slice(0, 10)}.csv`,
                        [
                          'Order ID',
                          'Consignment ID',
                          'Recipient',
                          'Phone',
                          'Division',
                          'Address',
                          'Payment',
                          'Items',
                          'Total BDT',
                          'Status',
                          'Hub',
                          'Created',
                        ],
                        filteredOrders.map((o) => [
                          o.orderId,
                          o.consignmentId,
                          o.recipientName,
                          o.recipientPhone,
                          o.division,
                          o.recipientAddress,
                          o.paymentMethod.toUpperCase(),
                          o.itemsSummary,
                          o.totalBDT,
                          o.status,
                          o.hubLocation,
                          formatDateTime(o.createdAtMs),
                        ])
                      )
                    }
                    className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 text-xs font-mono text-[#D8D3C9] hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-40 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              <div className="rounded-xl bg-[#11141C] border border-white/10 overflow-hidden">
                {ordersLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-11 rounded bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingBag className="w-8 h-8 text-[#77777D] mx-auto mb-2" />
                    <p className="text-sm text-[#F5F2EB] mb-1">No matching orders</p>
                    <p className="text-xs text-[#9A9892]">
                      {orders.length === 0
                        ? 'Orders placed in CartDrawer checkout appear here immediately.'
                        : 'Try clearing your search or status filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[11px] font-mono uppercase text-[#77777D]">
                          <th className="py-3 px-4">Order / Pathao</th>
                          <th className="py-3 px-4">Recipient</th>
                          <th className="py-3 px-4">Division &amp; Hub</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Total</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredOrders.map((order) => (
                          <tr
                            key={order.orderId}
                            className="hover:bg-white/[0.025] transition-colors"
                          >
                            <td className="py-3 px-4 align-top">
                              <div className="font-mono font-semibold text-[#D5BA80]">
                                {order.orderId}
                              </div>
                              <div className="font-mono text-[10px] text-[#77777D]">
                                {order.consignmentId}
                              </div>
                              <div className="font-mono text-[10px] text-[#77777D] mt-0.5 tabular-nums">
                                {formatDateTime(order.createdAtMs)}
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <div className="text-[#F5F2EB] font-medium">
                                {order.recipientName}
                              </div>
                              <div className="font-mono text-[11px] text-[#9A9892]">
                                {order.recipientPhone}
                              </div>
                              <div className="text-[11px] text-[#77777D] max-w-[210px] truncate">
                                {order.recipientAddress}
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <div className="text-[#F5F2EB]">{order.division}</div>
                              <div className="text-[11px] text-[#9A9892] max-w-[180px] truncate">
                                {order.hubLocation}
                              </div>
                              {order.riderName && (
                                <div className="text-[10px] font-mono text-amber-300 mt-0.5">
                                  Rider: {order.riderName}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 align-top max-w-[200px]">
                              <div className="text-[#D8D3C9] line-clamp-2">
                                {order.itemsSummary}
                              </div>
                              <div className="text-[10px] font-mono text-[#77777D] mt-0.5">
                                {order.itemsCount} pc · {order.paymentMethod.toUpperCase()}
                              </div>
                            </td>
                            <td className="py-3 px-4 align-top">
                              <span
                                className={`inline-block px-2 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap ${getOrderStatusBadgeClass(
                                  order.status
                                )}`}
                              >
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 align-top text-right font-mono tabular-nums text-[#F5F2EB] font-semibold whitespace-nowrap">
                              ৳ {order.totalBDT.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openOrderEditor(order)}
                                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-[#B69A60] text-[#F5F2EB] hover:text-[#09090B] text-[11px] font-medium cursor-pointer transition-colors"
                                >
                                  Dispatch
                                </button>
                                {confirmDeleteOrderId === order.orderId ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(order.orderId)}
                                    className="px-2 py-1 rounded bg-[#DC2626] text-white text-[11px] font-medium cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteOrderId(order.orderId)}
                                    className="p-1.5 rounded text-[#77777D] hover:text-red-400 hover:bg-white/5 cursor-pointer"
                                    title="Delete order"
                                    aria-label={`Delete order ${order.orderId}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 3. CATALOG & INVENTORY TAB ==================== */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="p-4 rounded-xl bg-[#11141C] border border-white/10 space-y-3">
                {/* Brand Collab Filter Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono uppercase text-[#77777D] mr-1">
                      Brand:
                    </span>
                    {(
                      [
                        { id: 'all', label: `All Brands (${unifiedCatalog.length})` },
                        { id: 'StarKiT', label: `StarKiT (${metrics.starKitSkus})` },
                        { id: "Fariza's Territory", label: `Fariza's Territory (${metrics.farizaSkus})` },
                        { id: 'FABRICIAN', label: 'FABRICIAN' },
                      ] as const
                    ).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setCatalogBrandFilter(b.id)}
                        className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                          catalogBrandFilter === b.id
                            ? 'bg-[#F5F2EB] text-[#09090B] font-semibold'
                            : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] font-mono text-[#9A9892] tabular-nums">
                    Showing {filteredCatalog.length} of {unifiedCatalog.length} items
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'All Catalogs' },
                      { id: 'three-piece', label: "Fariza's 3-Piece (18)" },
                      { id: 'graphic-archive', label: 'StarKiT Hoodies (11)' },
                      { id: 'custom', label: 'Custom Drops' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCatalogSourceFilter(tab.id as typeof catalogSourceFilter)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                          catalogSourceFilter === tab.id
                            ? 'bg-[#B69A60] text-[#09090B] font-semibold'
                            : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-[#77777D] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Search SKU, brand, name..."
                        className="w-full bg-[#0B0D12] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Catalog Grid Table */}
              <div className="rounded-xl bg-[#11141C] border border-white/10 overflow-hidden">
                {filteredCatalog.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-8 h-8 text-[#77777D] mx-auto mb-2" />
                    <p className="text-sm text-[#F5F2EB] mb-1">No products found</p>
                    <p className="text-xs text-[#9A9892]">
                      Adjust your filter or add a new custom atelier garment.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[11px] font-mono uppercase text-[#77777D]">
                          <th className="py-3 px-4">Product</th>
                          <th className="py-3 px-4">Brand &amp; Collection</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Stock</th>
                          <th className="py-3 px-4 text-right">Price</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCatalog.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-white/[0.025] transition-colors"
                          >
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.nameEn}
                                  className="w-10 h-12 rounded object-cover object-top bg-black/50 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0">
                                  <div className="text-[#F5F2EB] font-medium truncate max-w-[240px]">
                                    {item.nameEn}
                                  </div>
                                  <div className="text-[11px] font-mono text-[#77777D] flex items-center gap-2">
                                    <span>{item.id}</span>
                                    <span>·</span>
                                    <span>{item.category}</span>
                                    {item.hasOverride && (
                                      <span className="text-[#D5BA80]">· Synced</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-[#9A9892]">
                              <div className="text-[11px] font-mono text-[#D5BA80] font-medium">
                                {item.brand}
                              </div>
                              <div className="truncate max-w-[180px] text-[#D8D3C9]">{item.collection}</div>
                              <div className="text-[10px] font-mono uppercase text-[#77777D]">
                                {item.sourceCatalog}
                              </div>
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded border text-[10px] font-mono uppercase ${getCatalogStatusBadgeClass(
                                  item.status
                                )}`}
                              >
                                {item.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-[#F5F2EB]">
                              {item.stockCount}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                              <div className="text-[#F5F2EB] font-semibold">
                                ৳ {item.priceBDT.toLocaleString()}
                              </div>
                              {item.compareAtPriceBDT && (
                                <div className="text-[10px] text-[#77777D] line-through">
                                  ৳ {item.compareAtPriceBDT.toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openCatalogEditor(item)}
                                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-[#B69A60] text-[#F5F2EB] hover:text-[#09090B] text-[11px] font-medium cursor-pointer transition-colors inline-flex items-center gap-1"
                                >
                                  <SlidersHorizontal className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                {item.hasOverride && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetOrDeleteOverride(item)}
                                    title={
                                      item.sourceCatalog === 'custom'
                                        ? 'Delete custom product'
                                        : 'Reset to default catalog values'
                                    }
                                    className="p-1.5 rounded text-[#77777D] hover:text-red-400 hover:bg-white/5 cursor-pointer"
                                  >
                                    {item.sourceCatalog === 'custom' ? (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    ) : (
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 4. REVIEWS TAB ==================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#11141C] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {(['all', 'approved', 'hidden'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewFilter(st)}
                      className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase transition-colors cursor-pointer ${
                        reviewFilter === st
                          ? 'bg-[#B69A60] text-[#09090B] font-semibold'
                          : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10'
                      }`}
                    >
                      {st} ({st === 'all' ? reviews.length : reviews.filter((r) => r.status === st).length})
                    </button>
                  ))}
                </div>
                <div className="text-xs font-mono text-[#77777D]">
                  Live Firestore verified customer feedback
                </div>
              </div>

              <div className="rounded-xl bg-[#11141C] border border-white/10 overflow-hidden">
                {reviewsLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-14 rounded bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="p-12 text-center">
                    <MessageSquare className="w-8 h-8 text-[#77777D] mx-auto mb-2" />
                    <p className="text-sm text-[#F5F2EB] mb-1">No customer reviews yet</p>
                    <p className="text-xs text-[#9A9892]">
                      Reviews submitted via Quick View on the storefront appear here for moderation.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 flex flex-col md:flex-row md:items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5 max-w-3xl">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-[#F5F2EB]">{rev.author}</span>
                            <span className="font-mono text-[#77777D]">· {rev.location}</span>
                            <span className="font-mono text-[11px] text-[#D5BA80] px-1.5 py-0.5 rounded bg-white/5">
                              {rev.productId}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase ${
                                rev.status === 'approved'
                                  ? 'bg-[#16A34A]/15 text-emerald-400 border-[#16A34A]/40'
                                  : 'bg-[#DC2626]/15 text-red-400 border-[#DC2626]/40'
                              }`}
                            >
                              {rev.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[#B69A60]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-[#B69A60]' : 'text-white/15'
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-mono text-[#9A9892] ml-2">
                              Size {rev.sizePurchased} · {rev.fitFeedback} · {formatDateTime(rev.createdAtMs)}
                            </span>
                          </div>
                          {rev.title && (
                            <p className="text-xs font-medium text-[#F5F2EB]">{rev.title}</p>
                          )}
                          <p className="text-xs text-[#D8D3C9] leading-relaxed">{rev.comment}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              const nextStatus = rev.status === 'approved' ? 'hidden' : 'approved';
                              try {
                                await moderateStoreReview(rev.id, nextStatus);
                                showToast(`Review marked ${nextStatus}.`);
                              } catch {
                                showToast('Failed to update review visibility.');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-white/15 hover:border-white/30 text-xs text-[#D8D3C9] hover:text-white flex items-center gap-1.5 cursor-pointer"
                          >
                            {rev.status === 'approved' ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await deleteStoreReview(rev.id);
                                showToast('Review deleted permanently.');
                              } catch {
                                showToast('Failed to delete review.');
                              }
                            }}
                            className="p-1.5 rounded-lg border border-white/10 text-[#77777D] hover:text-red-400 hover:border-red-500/40 cursor-pointer"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 5. SUBSCRIBERS TAB ==================== */}
          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#11141C] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 text-[#77777D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    placeholder="Filter subscriber emails..."
                    className="w-full bg-[#0B0D12] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                  />
                </div>

                <button
                  type="button"
                  disabled={filteredSubscribers.length === 0}
                  onClick={() =>
                    downloadCsv(
                      `fabrician-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
                      ['Email', 'Language', 'Subscribed At'],
                      filteredSubscribers.map((s) => [
                        s.email,
                        s.language.toUpperCase(),
                        formatDateTime(s.subscribedAtMs),
                      ])
                    )
                  }
                  className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 text-xs font-mono text-[#D8D3C9] hover:text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Subscribers ({filteredSubscribers.length})</span>
                </button>
              </div>

              <div className="rounded-xl bg-[#11141C] border border-white/10 overflow-hidden">
                {subscribersLoading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-10 rounded bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : filteredSubscribers.length === 0 ? (
                  <div className="p-12 text-center">
                    <Mail className="w-8 h-8 text-[#77777D] mx-auto mb-2" />
                    <p className="text-sm text-[#F5F2EB] mb-1">No newsletter subscribers</p>
                    <p className="text-xs text-[#9A9892]">
                      Signups from the storefront footer Private Client Dispatch appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-[11px] font-mono uppercase text-[#77777D]">
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Preferred Language</th>
                          <th className="py-3 px-4">Subscribed On</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredSubscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-white/[0.025]">
                            <td className="py-2.5 px-4 font-mono text-[#F5F2EB]">{sub.email}</td>
                            <td className="py-2.5 px-4 font-mono uppercase text-[#D5BA80]">
                              {sub.language === 'bn' ? 'Bangla (BN)' : 'English (EN)'}
                            </td>
                            <td className="py-2.5 px-4 font-mono tabular-nums text-[#9A9892]">
                              {formatDateTime(sub.subscribedAtMs)}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await deleteSubscriber(sub.id);
                                    showToast(`Removed ${sub.email}`);
                                  } catch {
                                    showToast('Failed to remove subscriber.');
                                  }
                                }}
                                className="p-1.5 rounded text-[#77777D] hover:text-red-400 hover:bg-white/5 cursor-pointer"
                                aria-label={`Remove ${sub.email}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== 6. STORE SETTINGS TAB ==================== */}
          {activeTab === 'settings' && (
            <form
              onSubmit={handleSaveSettings}
              className="rounded-xl bg-[#11141C] border border-white/10 p-5 sm:p-6 space-y-6 max-w-4xl"
            >
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-semibold text-[#F5F2EB]">
                  Global Storefront &amp; Checkout Configuration
                </h2>
                <p className="text-xs text-[#9A9892] mt-0.5">
                  Updates propagate immediately to Cart Checkout, Pathao fee calculation, Graphic Archive hotline, and Footer Atelier info.
                </p>
              </div>

              {settingsError && (
                <div className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/40 text-xs text-red-300">
                  {settingsError}
                </div>
              )}

              {/* Atelier & Concierge Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    Order Hotline Display
                  </label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={40}
                    value={settingsForm.hotlineDisplay}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hotlineDisplay: e.target.value })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    Hotline URI (tel:)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={48}
                    value={settingsForm.hotlineTel}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, hotlineTel: e.target.value })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    Flagship Atelier Address &amp; Hours
                  </label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={200}
                    value={settingsForm.atelierAddress}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, atelierAddress: e.target.value })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing, Shipping & Bundle Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    Free Delivery Threshold (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000000}
                    value={settingsForm.freeShippingThresholdBDT}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        freeShippingThresholdBDT: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    Dhaka Pathao Fee (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={settingsForm.dhakaShippingFeeBDT}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        dhakaShippingFeeBDT: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    Outside Dhaka Fee (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={settingsForm.outsideDhakaShippingFeeBDT}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        outsideDhakaShippingFeeBDT: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    2-Piece Bundle Discount (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    value={settingsForm.bundle2DiscountBDT}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bundle2DiscountBDT: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                    3+ Piece Bundle Discount (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    value={settingsForm.bundle3DiscountBDT}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bundle3DiscountBDT: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Announcement Strip */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs text-[#F5F2EB]">
                  <input
                    type="checkbox"
                    checked={settingsForm.announcementEnabled}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        announcementEnabled: e.target.checked,
                      })
                    }
                    className="rounded border-white/20 bg-[#0B0D12] accent-[#B69A60]"
                  />
                  <span className="font-medium">Display Storefront Announcement Bar</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                      Announcement (English)
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={settingsForm.announcementTextEn}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          announcementTextEn: e.target.value,
                        })
                      }
                      className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1.5">
                      Announcement (Bangla)
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={settingsForm.announcementTextBn}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          announcementTextBn: e.target.value,
                        })
                      }
                      className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] font-semibold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-60"
                >
                  {savingSettings ? 'Publishing Settings...' : 'Save & Publish Settings'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      {/* ==================== ORDER DISPATCH MODAL ==================== */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#11141C] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F2EB] font-mono">
                  {editingOrder.orderId} · Pathao Dispatch
                </h3>
                <p className="text-[11px] text-[#9A9892] font-mono">
                  Consignment: {editingOrder.consignmentId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="p-1 text-[#9A9892] hover:text-white cursor-pointer"
                aria-label="Close dispatch modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDispatch} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[#0B0D12] border border-white/10 space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#9A9892]">Recipient:</span>
                  <span className="text-[#F5F2EB] font-medium">
                    {editingOrder.recipientName} ({editingOrder.recipientPhone})
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9A9892]">Address:</span>
                  <span className="text-[#D8D3C9] text-right">
                    {editingOrder.recipientAddress}, {editingOrder.division}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#9A9892]">Items:</span>
                  <span className="text-[#D8D3C9] text-right">{editingOrder.itemsSummary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A9892]">Collectible / Payment:</span>
                  <span className="font-mono text-[#D5BA80] tabular-nums">
                    ৳ {editingOrder.totalBDT.toLocaleString()} (
                    {editingOrder.paymentMethod.toUpperCase()})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={dispatchForm.status}
                    onChange={(e) =>
                      setDispatchForm({
                        ...dispatchForm,
                        status: e.target.value as StoreOrderStatus,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Estimated Delivery
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.estimatedDelivery}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, estimatedDelivery: e.target.value })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Current Pathao Hub Location
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.hubLocation}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, hubLocation: e.target.value })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Assigned Rider Name
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.riderName}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, riderName: e.target.value })
                    }
                    placeholder="Optional (e.g. Md. Karim)"
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Rider Phone (Internal Only)
                  </label>
                  <input
                    type="text"
                    value={dispatchForm.riderPhone}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, riderPhone: e.target.value })
                    }
                    placeholder="Optional (+8801...)"
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Customer-Visible Tracking Note
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={dispatchForm.trackingNote}
                    onChange={(e) =>
                      setDispatchForm({ ...dispatchForm, trackingNote: e.target.value })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg p-2.5 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-lg border border-white/15 text-[#D8D3C9] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="px-4 py-2 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-60"
                >
                  {savingOrder ? 'Syncing...' : 'Update Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT CATALOG ITEM MODAL ==================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#11141C] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F2EB]">Edit Catalog Item</h3>
                <p className="text-[11px] font-mono text-[#D5BA80]">
                  {editingProduct.id} · {editingProduct.sourceCatalog}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 text-[#9A9892] hover:text-white cursor-pointer"
                aria-label="Close catalog modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveCatalogOverride}
              className="p-5 overflow-y-auto space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={catalogForm.nameEn}
                    onChange={(e) => setCatalogForm({ ...catalogForm, nameEn: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Name (Bangla)
                  </label>
                  <input
                    type="text"
                    required
                    value={catalogForm.nameBn}
                    onChange={(e) => setCatalogForm({ ...catalogForm, nameBn: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Selling Price (৳ BDT)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={catalogForm.priceBDT}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, priceBDT: Number(e.target.value) || 0 })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Compare-At Price (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={catalogForm.compareAtPriceBDT}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, compareAtPriceBDT: e.target.value })
                    }
                    placeholder="Original MRP"
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={catalogForm.stockCount}
                    onChange={(e) =>
                      setCatalogForm({
                        ...catalogForm,
                        stockCount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Storefront Visibility
                  </label>
                  <select
                    value={catalogForm.status}
                    onChange={(e) =>
                      setCatalogForm({
                        ...catalogForm,
                        status: e.target.value as CatalogStatus,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  >
                    <option value="active">Active (In Stock)</option>
                    <option value="out_of_stock">Out of Stock (Visible, Add Disabled)</option>
                    <option value="hidden">Hidden from Storefront</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Partner Brand
                  </label>
                  <select
                    value={catalogForm.brand}
                    onChange={(e) =>
                      setCatalogForm({
                        ...catalogForm,
                        brand: e.target.value as BrandPartner,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  >
                    {BRAND_PARTNERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Category
                  </label>
                  <select
                    value={catalogForm.category}
                    onChange={(e) =>
                      setCatalogForm({
                        ...catalogForm,
                        category: e.target.value as Product['category'],
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Collection Label
                  </label>
                  <input
                    type="text"
                    required
                    value={catalogForm.collection}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, collection: e.target.value })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Product Image Path / URL
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_ATELIER_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setCatalogForm({ ...catalogForm, image: preset.url })}
                        className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer border ${
                          catalogForm.image === preset.url
                            ? 'bg-[#B69A60] text-[#09090B] border-[#B69A60] font-semibold'
                            : 'bg-[#0B0D12] text-[#D8D3C9] border-white/10 hover:border-white/30'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    value={catalogForm.image}
                    onChange={(e) => setCatalogForm({ ...catalogForm, image: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono text-[#F5F2EB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#D8D3C9]">
                  <input
                    type="checkbox"
                    checked={catalogForm.isNew}
                    onChange={(e) => setCatalogForm({ ...catalogForm, isNew: e.target.checked })}
                    className="accent-[#B69A60]"
                  />
                  <span>New Runway Badge</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#D8D3C9]">
                  <input
                    type="checkbox"
                    checked={catalogForm.isBestseller}
                    onChange={(e) =>
                      setCatalogForm({ ...catalogForm, isBestseller: e.target.checked })
                    }
                    className="accent-[#B69A60]"
                  />
                  <span>Signature Bestseller</span>
                </label>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border border-white/15 text-[#D8D3C9] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCatalog}
                  className="px-4 py-2 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-60"
                >
                  {savingCatalog ? 'Saving...' : 'Publish Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== ADD CUSTOM PRODUCT MODAL ==================== */}
      {isAddCustomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#11141C] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F5F2EB]">Add New Custom Product</h3>
                <p className="text-[11px] text-[#9A9892]">
                  Publishes immediately to Featured Essentials &amp; Store Search.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomOpen(false)}
                className="p-1 text-[#9A9892] hover:text-white cursor-pointer"
                aria-label="Close new product modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateCustomProduct}
              className="p-5 overflow-y-auto space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customForm.nameEn}
                    onChange={(e) => setCustomForm({ ...customForm, nameEn: e.target.value })}
                    placeholder="e.g. Banani Atelier Linen Shirt"
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Product Name (Bangla)
                  </label>
                  <input
                    type="text"
                    value={customForm.nameBn}
                    onChange={(e) => setCustomForm({ ...customForm, nameBn: e.target.value })}
                    placeholder="বনানী আতেলিয়ে লিনেন শার্ট"
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Partner Brand
                  </label>
                  <select
                    value={customForm.brand}
                    onChange={(e) =>
                      setCustomForm({
                        ...customForm,
                        brand: e.target.value as BrandPartner,
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  >
                    {BRAND_PARTNERS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Category
                  </label>
                  <select
                    value={customForm.category}
                    onChange={(e) =>
                      setCustomForm({
                        ...customForm,
                        category: e.target.value as Product['category'],
                      })
                    }
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customForm.collection}
                    onChange={(e) => setCustomForm({ ...customForm, collection: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Price (৳ BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={customForm.priceBDT}
                    onChange={(e) => setCustomForm({ ...customForm, priceBDT: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={customForm.stockCount}
                    onChange={(e) => setCustomForm({ ...customForm, stockCount: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Garment Image (Choose Preset or Paste URL)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_ATELIER_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, image: preset.url })}
                        className={`px-2 py-1 rounded text-[10px] font-mono cursor-pointer border ${
                          customForm.image === preset.url
                            ? 'bg-[#B69A60] text-[#09090B] border-[#B69A60] font-semibold'
                            : 'bg-[#0B0D12] text-[#D8D3C9] border-white/10 hover:border-white/30'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    required
                    value={customForm.image}
                    onChange={(e) => setCustomForm({ ...customForm, image: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs font-mono text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Fabric Specification
                  </label>
                  <input
                    type="text"
                    value={customForm.fabricEn}
                    onChange={(e) => setCustomForm({ ...customForm, fabricEn: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#9A9892] mb-1">
                    Fit Description
                  </label>
                  <input
                    type="text"
                    value={customForm.fitEn}
                    onChange={(e) => setCustomForm({ ...customForm, fitEn: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/15 focus:border-[#B69A60] rounded-lg px-3 py-2 text-xs text-[#F5F2EB] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomOpen(false)}
                  className="px-4 py-2 rounded-lg border border-white/15 text-[#D8D3C9] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCatalog}
                  className="px-4 py-2 rounded-lg bg-[#F5F2EB] hover:bg-[#D5BA80] text-[#09090B] font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-60"
                >
                  {savingCatalog ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
