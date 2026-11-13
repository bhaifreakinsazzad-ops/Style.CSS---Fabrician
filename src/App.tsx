import React, { useState, useEffect, Suspense } from 'react';
import { Language, CartItem, Product } from './types';
import { FASHION_LOOKS } from './data/mockData';
import { ThreePieceItem } from './data/threePieceCatalog';
import { useStoreData } from './context/StoreDataContext';
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

const AdminDashboard = React.lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

const STORAGE_LANG_KEY = 'fabrician_lang_v1';
const STORAGE_CART_KEY = 'fabrician_cart_v1';
const STORAGE_WISHLIST_KEY = 'fabrician_wishlist_v1';

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const { storeSettings } = useStoreData();
  const [viewMode, setViewMode] = useState<'store' | 'admin'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#admin' ? 'admin' : 'store'
  );
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
    const syncFromHash = () => {
      setViewMode(window.location.hash === '#admin' ? 'admin' : 'store');
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setViewMode('admin');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const navigateToStore = () => {
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setViewMode('store');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
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
  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
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

  // Navigation Smooth Scroll Handler
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCollection = (category: string) => {
    setSelectedFilterCategory(category);
    handleNavigateSection('essentials');
  };

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
    <div
      className={`min-h-screen bg-[#09090B] text-[#F5F2EB] ${
        language === 'bn' ? 'font-bengali' : 'font-sans-modern'
      }`}
    >
      {storeSettings.announcementEnabled &&
        (language === 'en'
          ? storeSettings.announcementTextEn
          : storeSettings.announcementTextBn) && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-30 pointer-events-none">
            <div className="pointer-events-auto px-4 py-2 rounded-lg bg-[#11141C]/95 backdrop-blur-md border border-[#B69A60]/40 text-[11px] font-mono text-[#D5BA80] shadow-xl">
              {language === 'en'
                ? storeSettings.announcementTextEn
                : storeSettings.announcementTextBn}
            </div>
          </div>
        )}
      {/* Top Navigation */}
      <Navbar
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'bn' : 'en'))}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateSection={handleNavigateSection}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
      />

      {/* Cinematic Hero */}
      <CinematicHero
        language={language}
        onExploreCollections={() => handleNavigateSection('collections')}
        onEnterLookbook={() => handleNavigateSection('lookbook')}
      />

      {/* Interactive Lookbook */}
      <InteractiveLookbook
        looks={FASHION_LOOKS}
        language={language}
        onAddToCart={handleAddToCart}
      />

      {/* The Three-Piece Edit: 18 Curated Designs with 3D Studio */}
      <ThreePieceSection
        language={language}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isWishlisted}
        onQuickView={(p) => setQuickViewProduct(p)}
        external3DItem={external3DItem}
        onClearExternal3D={() => setExternal3DItem(null)}
      />

      {/* The Graphic Archive: Heavyweight Fleece Edit */}
      <GraphicArchiveSection
        language={language}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isWishlisted}
        onOpenQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* Collection Discovery */}
      <CollectionDiscovery
        language={language}
        onSelectCategory={handleSelectCollection}
      />

      {/* Featured Essentials */}
      <FeaturedEssentials
        language={language}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isWishlisted}
        onQuickView={(p) => setQuickViewProduct(p)}
        selectedFilterCategory={selectedFilterCategory}
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

      {/* Brand Footer */}
      <Footer
        language={language}
        onNavigate={handleNavigateSection}
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
        language={language}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        language={language}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
      />

      {/* Global Size Guide Modal */}
      <SizeGuideModal
        isOpen={isGlobalSizeGuideOpen}
        onClose={() => setIsGlobalSizeGuideOpen(false)}
        language={language}
        defaultCategory="panjabi"
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
  );
}
