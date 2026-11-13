import React, { useState, useEffect, Suspense } from 'react';
import { MotionConfig, motion, useScroll, useSpring } from 'motion/react';
import { Language, CartItem, Product } from './types';
import { FASHION_LOOKS } from './data/mockData';
import { ThreePieceItem } from './data/threePieceCatalog';
import { useStoreData } from './context/StoreDataContext';
import { OfflineIndicator, MobilePWAInstallPrompt } from './components/pwa/PWAInstallControls';
import { Navbar } from './components/navigation/Navbar';
import { CinematicHero } from './components/hero/CinematicHero';
import { InteractiveLookbook } from './components/lookbook/InteractiveLookbook';
import { ThreePieceSection } from './components/three-piece/ThreePieceSection';
import { GraphicArchiveSection } from './components/graphic-archive/GraphicArchiveSection';
import { CollectionDiscovery } from './components/collections/CollectionDiscovery';
import { FeaturedEssentials } from './components/products/FeaturedEssentials';
import { CraftsmanshipSection } from './components/craftsmanship/CraftsmanshipSection';
import { StyleIntelligence } from './components/style-intelligence/StyleIntelligence';
import { EditorialStories } from './components/editorial/EditorialStories';
import { Footer } from './components/footer/Footer';
import { CartDrawer } from './components/modals/CartDrawer';
import { WishlistDrawer } from './components/modals/WishlistDrawer';
import { SearchModal } from './components/modals/SearchModal';
import { QuickViewModal } from './components/modals/QuickViewModal';
import { SizeGuideModal } from './components/modals/SizeGuideModal';
import { StyleQuizModal } from './components/style-intelligence/StyleQuizModal';
import { TrackOrderModal } from './components/modals/TrackOrderModal';
import { StarKiTBrandPage } from './components/brands/StarKiTBrandPage';
import { FarizasTerritoryBrandPage } from './components/brands/FarizasTerritoryBrandPage';

const AdminDashboard = React.lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const STORAGE_LANG_KEY = 'fabrician_lang_v1';
const STORAGE_CART_KEY = 'fabrician_cart_v1';
const STORAGE_WISHLIST_KEY = 'fabrician_wishlist_v1';

type AppViewMode = 'store' | 'starkit' | 'farizas-territory' | 'admin';

function getViewModeFromLocation(): AppViewMode {
  if (typeof window === 'undefined') return 'store';
  const hash = window.location.hash.toLowerCase();
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  if (
    hash === '#admin' ||
    hash.startsWith('#admin/') ||
    path === '/admin' ||
    path.startsWith('/admin/')
  ) {
    return 'admin';
  }
  if (hash === '#starkit' || path === '/starkit') return 'starkit';
  if (hash === '#farizas-territory' || path === '/farizas-territory') return 'farizas-territory';
  return 'store';
}

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const { storeSettings, unifiedCatalog } = useStoreData();
  const useSupabaseCommerce = import.meta.env.VITE_COMMERCE_BACKEND === 'supabase';
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, restDelta: 0.001 });
  const [viewMode, setViewMode] = useState<AppViewMode>(() => getViewModeFromLocation());
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      return saved === 'bn' ? 'bn' : 'en';
    } catch {
      return 'en';
    }
  });
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStoredJson<CartItem[]>(STORAGE_CART_KEY, [])
  );
  const [wishlist, setWishlist] = useState<Product[]>(() =>
    readStoredJson<Product[]>(STORAGE_WISHLIST_KEY, [])
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);
  const [isGlobalSizeGuideOpen, setIsGlobalSizeGuideOpen] = useState(false);
  const [isStyleQuizOpen, setIsStyleQuizOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState('FAB-2026');
  const [external3DItem, setExternal3DItem] = useState<ThreePieceItem | null>(null);

  useEffect(() => {
    const syncFromLocation = () => {
      setViewMode(getViewModeFromLocation());
    };
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setViewMode('admin');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const navigateToBrand = (brand: 'store' | 'starkit' | 'farizas-territory') => {
    if (brand === 'store') {
      window.history.pushState(null, '', '/' + window.location.search);
      setViewMode('store');
    } else if (brand === 'starkit') {
      window.history.pushState(null, '', '/starkit' + window.location.search);
      setViewMode('starkit');
    } else {
      window.history.pushState(null, '', '/farizas-territory' + window.location.search);
      setViewMode('farizas-territory');
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  useEffect(() => {
    if (viewMode === 'starkit') {
      document.title = 'StarKiT (ستاركيت) — Wear Your World | FABRICIAN';
    } else if (viewMode === 'farizas-territory') {
      document.title = "Fariza's Territory — Three-Piece Couture | FABRICIAN";
    } else if (viewMode === 'admin') {
      document.title = 'Store Admin Console | FABRICIAN';
    } else {
      document.title = 'FABRICIAN — The Intelligent Fashion Universe | Made in Bangladesh';
    }
  }, [viewMode]);

  const navigateToStore = () => {
    navigateToBrand('store');
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch {
      // ignore storage errors
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore storage errors
    }
  }, [wishlist]);

  const handleOpenTrackOrder = (orderId?: string) => {
    if (orderId) setTrackOrderId(orderId);
    setIsTrackOrderOpen(true);
  };

  // Cart Handlers
  const upsertCartItem = (item: Omit<CartItem, 'id'>) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
      );
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id: `cart-${Date.now()}-${Math.random()}` }];
    });
  };

  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    if (useSupabaseCommerce) {
      const published = unifiedCatalog.find(p => p.id === item.productId);
      if (!published || published.status !== 'active' || published.stockCount <= 0) return;
    }
    upsertCartItem(item);
    setCartInitialStep('cart');
    setIsCartOpen(true);
  };

  const handleBuyNow = (item: Omit<CartItem, 'id'>) => {
    if (useSupabaseCommerce) {
      const published = unifiedCatalog.find(p => p.id === item.productId);
      if (!published || published.status !== 'active' || published.stockCount <= 0) return;
    }
    upsertCartItem(item);
    setCartInitialStep('checkout');
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Navigation Smooth Scroll Handler (returns to main store if currently on a brand showcase page)
  const handleNavigateSection = (sectionId: string) => {
    if (viewMode !== 'store') {
      navigateToBrand('store');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 90);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCollection = (category: string) => {
    setSelectedFilterCategory(category);
    handleNavigateSection('essentials');
  };

  const totalBagCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const bagSubtotal = cartItems.reduce((acc, i) => acc + i.priceBDT * i.quantity, 0);
  const bagDiscount =
    totalBagCount >= 3
      ? storeSettings.bundle3DiscountBDT
      : totalBagCount >= 2
      ? storeSettings.bundle2DiscountBDT
      : 0;
  const bagNetSubtotal = Math.max(0, bagSubtotal - bagDiscount);

  if (viewMode === 'admin' && useSupabaseCommerce) {
    return (
      <div className="min-h-screen bg-[#09090B] text-[#F5F2EB] flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-5">
          <h1 className="font-serif-luxury text-3xl">Supabase Commerce Administration</h1>
          <p>During database migration, manage products, inventory, and orders from your authenticated Supabase dashboard. The legacy Firebase admin console is disabled for Supabase checkout.</p>
          <button className="px-5 py-3 border border-white/30 rounded" onClick={navigateToStore}>Return to store</button>
        </div>
      </div>
    );
  }
  if (viewMode === 'admin') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0B0D12] text-[#F5F2EB] flex items-center justify-center text-xs font-mono">
            <div className="w-7 h-7 border-2 border-[#B69A60] border-t-transparent rounded-full animate-spin mr-3" />
            <span>Loading Store Admin Console...</span>
          </div>
        }
      >
        <AdminDashboard onExitAdmin={navigateToStore} />
      </Suspense>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`min-h-screen bg-[#09090B] text-[#F5F2EB] ${
          language === 'bn' ? 'font-bengali' : 'font-sans-modern'
        }`}
      >
        {/* Scroll-linked Gold Atelier Thread Indicator */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX }}
          className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#B69A60] via-[#F5E4B7] to-[#B69A60] origin-left z-50 pointer-events-none"
        />

        {/* PWA Offline Notice & Mobile Install Prompt */}
        <OfflineIndicator language={language} />
        <MobilePWAInstallPrompt language={language} />

        {/* Floating Bottom-Left Announcement Pill */}
        {storeSettings.announcementEnabled &&
          (language === 'en'
            ? storeSettings.announcementTextEn
            : storeSettings.announcementTextBn) && (
            <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30 pointer-events-none hidden sm:block">
              <div className="pointer-events-auto px-4 py-2 rounded-lg bg-[#11141C]/95 backdrop-blur-md border border-[#B69A60]/40 text-[11px] font-mono text-[#D5BA80] shadow-xl">
                {language === 'en'
                  ? storeSettings.announcementTextEn
                  : storeSettings.announcementTextBn}
              </div>
            </div>
          )}

        {/* Floating Bottom-Right Express Bag Checkout Pill */}
        {totalBagCount > 0 && !isCartOpen && (
          <div className="fixed bottom-20 md:bottom-4 right-4 z-30">
            <button
              type="button"
              onClick={() => {
                setCartInitialStep('checkout');
                setIsCartOpen(true);
              }}
              className="px-4 py-2.5 rounded-full bg-[#171719]/95 hover:bg-[#1E1E22] backdrop-blur-md border border-[#B69A60] text-[#F5F2EB] shadow-2xl flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span className="px-2 py-0.5 rounded-full bg-[#B69A60] text-[#09090B] font-mono text-xs font-bold tabular-nums">
                {totalBagCount}
              </span>
              <div className="text-left">
                <div className="text-[11px] font-mono font-semibold text-[#D5BA80] tabular-nums">
                  ৳ {bagNetSubtotal.toLocaleString()}
                  {bagDiscount > 0 && (
                    <span className="ml-1.5 text-[10px] text-emerald-400">
                      (-৳{bagDiscount})
                    </span>
                  )}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F5F2EB] text-[#09090B] text-[10px] font-mono font-bold uppercase tracking-wider">
                {language === 'en' ? 'Checkout →' : 'চেকআউট →'}
              </span>
            </button>
          </div>
        )}

      {/* Top Navigation */}
      <Navbar
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'bn' : 'en'))}
        cartCount={totalBagCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => {
          setCartInitialStep('cart');
          setIsCartOpen(true);
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateSection={handleNavigateSection}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenAdmin={navigateToAdmin}
        viewMode={viewMode}
        onSelectBrand={navigateToBrand}
      />

      {viewMode === 'starkit' ? (
        <StarKiTBrandPage
          language={language}
          onBackHome={navigateToStore}
          onSwitchBrand={(b) => navigateToBrand(b)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={isWishlisted}
          onQuickView={(p) => setQuickViewProduct(p)}
          onOpenSizeGuide={() => setIsGlobalSizeGuideOpen(true)}
        />
      ) : viewMode === 'farizas-territory' ? (
        <FarizasTerritoryBrandPage
          language={language}
          onBackHome={navigateToStore}
          onSwitchBrand={(b) => navigateToBrand(b)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={isWishlisted}
          onQuickView={(p) => setQuickViewProduct(p)}
          onOpenSizeGuide={() => setIsGlobalSizeGuideOpen(true)}
        />
      ) : (
        <>
          {/* Cinematic Hero */}
          <CinematicHero
            language={language}
            onExploreCollections={() => handleNavigateSection('collections')}
            onEnterLookbook={() => handleNavigateSection('lookbook')}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setQuickViewProduct(p)}
          />

          {/* Interactive Lookbook */}
          <InteractiveLookbook
            looks={FASHION_LOOKS}
            language={language}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setQuickViewProduct(p)}
          />

          {/* The Three-Piece Edit: 18 Curated Designs with 3D Studio (Fariza's Territory) */}
          <ThreePieceSection
            language={language}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={isWishlisted}
            onQuickView={(p) => setQuickViewProduct(p)}
            external3DItem={external3DItem}
            onClearExternal3D={() => setExternal3DItem(null)}
            onOpenBrandPage={() => navigateToBrand('farizas-territory')}
          />

          {/* The Graphic Archive: Heavyweight Fleece Edit (StarKiT) */}
          <GraphicArchiveSection
            language={language}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={isWishlisted}
            onOpenQuickView={(p) => setQuickViewProduct(p)}
            onOpenBrandPage={() => navigateToBrand('starkit')}
          />

          {/* Collection Discovery */}
          <CollectionDiscovery
            language={language}
            onSelectCategory={handleSelectCollection}
            onSelectBrand={(route) => navigateToBrand(route)}
          />

          {/* Featured Essentials */}
          <FeaturedEssentials
            language={language}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={isWishlisted}
            onQuickView={(p) => setQuickViewProduct(p)}
            selectedFilterCategory={selectedFilterCategory}
            onOpenBrandPage={(route) => navigateToBrand(route)}
          />

          {/* Bangladeshi Craftsmanship & Heritage */}
          <CraftsmanshipSection language={language} />

          {/* Style Intelligence Engine */}
          <StyleIntelligence
            language={language}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setQuickViewProduct(p)}
            onOpenQuiz={() => setIsStyleQuizOpen(true)}
          />

          {/* Editorial Magazine */}
          <EditorialStories language={language} />
        </>
      )}

      {/* Brand Footer */}
      <Footer
        language={language}
        onNavigate={handleNavigateSection}
        onSelectBrand={navigateToBrand}
        onOpenSizeGuide={() => setIsGlobalSizeGuideOpen(true)}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenAdmin={navigateToAdmin}
      />

      {/* Slide-Over Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onAddToCart={handleAddToCart}
        initialStep={cartInitialStep}
        language={language}
        onOpenTrackOrder={handleOpenTrackOrder}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        items={wishlist}
        onRemove={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onAddToCart={handleAddToCart}
        language={language}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onAddToCart={handleAddToCart}
        language={language}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        language={language}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
      />

      {/* Global Size Guide Modal */}
      <SizeGuideModal
        isOpen={isGlobalSizeGuideOpen}
        onClose={() => setIsGlobalSizeGuideOpen(false)}
        language={language}
        defaultCategory={viewMode === 'farizas-territory' ? 'unstitched' : 'streetwear'}
      />

      {/* Style Discovery Quiz Modal */}
      <StyleQuizModal
        isOpen={isStyleQuizOpen}
        onClose={() => setIsStyleQuizOpen(false)}
        language={language}
        onAddToCart={handleAddToCart}
        onOpen3DStudio={(item) => {
          setExternal3DItem(item);
          handleNavigateSection('three-piece-edit');
        }}
      />

      {/* Pathao Courier Delivery Tracking Modal */}
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
        language={language}
        initialOrderId={trackOrderId}
      />
      </div>
    </MotionConfig>
  );
}
