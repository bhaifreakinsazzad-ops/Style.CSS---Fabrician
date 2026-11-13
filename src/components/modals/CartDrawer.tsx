import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Sparkles,
  Plus,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import { CartItem, Language } from '../../types';
import { translations } from '../../data/translations';
import { useStoreData } from '../../context/StoreDataContext';
import { placeStoreOrder } from '../../services/storeService';
import {
  isStarKiTItem,
  isStarKiTRoute,
  MetaPixelContentItem,
  trackStarKiTAddPaymentInfo,
  trackStarKiTInitiateCheckout,
  trackStarKiTPurchase,
} from '../../services/metaPixel';

const CHECKOUT_PROFILE_KEY = 'fabrician_checkout_profile_v1';

interface SavedCheckoutProfile {
  fullName: string;
  phone: string;
  address: string;
  division: string;
}

function readSavedProfile(): SavedCheckoutProfile {
  try {
    const raw = localStorage.getItem(CHECKOUT_PROFILE_KEY);
    if (!raw) {
      return { fullName: '', phone: '', address: '', division: 'Dhaka Division' };
    }
    const parsed = JSON.parse(raw) as Partial<SavedCheckoutProfile>;
    return {
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      address: typeof parsed.address === 'string' ? parsed.address : '',
      division: typeof parsed.division === 'string' ? parsed.division : 'Dhaka Division',
    };
  } catch {
    return { fullName: '', phone: '', address: '', division: 'Dhaka Division' };
  }
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onAddToCart?: (item: Omit<CartItem, 'id'>) => void;
  initialStep?: 'cart' | 'checkout';
  language: Language;
  onOpenTrackOrder?: (orderId: string) => void;
}

interface ConfirmedOrderInfo {
  orderId: string;
  consignmentId: string;
  recipientName: string;
  recipientAddress: string;
  division: string;
  totalBDT: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddToCart,
  initialStep = 'cart',
  language,
  onOpenTrackOrder,
}) => {
  const { storeSettings, unifiedCatalog } = useStoreData();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [fullName, setFullName] = useState(() => readSavedProfile().fullName);
  const [phone, setPhone] = useState(() => readSavedProfile().phone);
  const [address, setAddress] = useState(() => readSavedProfile().address);
  const [division, setDivision] = useState(() => readSavedProfile().division);
  const [paymentMethod, setPaymentMethod] = useState<'mfs' | 'cod'>('cod');
  const [mfsReference, setMfsReference] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderInfo | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<'FARIZA10' | 'STARKIT10' | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const checkoutTrackedRef = React.useRef(false);

  const t = translations[language];

  useEffect(() => {
    if (isOpen && checkoutStep !== 'success') {
      if (initialStep === 'checkout' && items.length > 0) {
        setCheckoutStep('checkout');
      } else if (items.length === 0) {
        setCheckoutStep('cart');
      }
    }
    if (!isOpen) {
      checkoutTrackedRef.current = false;
    }
  }, [isOpen, initialStep, items.length]);

  useEffect(() => {
    if (!isOpen || checkoutStep !== 'checkout' || items.length === 0) {
      if (checkoutStep !== 'checkout') checkoutTrackedRef.current = false;
      return;
    }
    if (checkoutTrackedRef.current) return;

    const starKiTItems: MetaPixelContentItem[] = items
      .filter((i) => isStarKiTItem(i.productId, i.nameEn, unifiedCatalog))
      .map((i) => ({
        id: i.productId,
        name: i.nameEn,
        priceBDT: i.priceBDT,
        quantity: i.quantity,
      }));

    if (starKiTItems.length > 0 || isStarKiTRoute()) {
      checkoutTrackedRef.current = true;
      const targetItems =
        starKiTItems.length > 0
          ? starKiTItems
          : items.map((i) => ({
              id: i.productId,
              name: i.nameEn,
              priceBDT: i.priceBDT,
              quantity: i.quantity,
            }));
      const value = targetItems.reduce((sum, i) => sum + i.priceBDT * i.quantity, 0);
      trackStarKiTInitiateCheckout(targetItems, value);
    }
  }, [isOpen, checkoutStep, items, unifiedCatalog]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CHECKOUT_PROFILE_KEY,
        JSON.stringify({ fullName, phone, address, division })
      );
    } catch {
      // ignore storage errors
    }
  }, [fullName, phone, address, division]);

  const upsellRecommendations = useMemo(() => {
    const inCartIds = new Set(items.map((i) => i.productId));
    return unifiedCatalog
      .filter(
        (p) =>
          p.status !== 'hidden' &&
          p.status !== 'out_of_stock' &&
          p.stockCount > 0 &&
          !inCartIds.has(p.id)
      )
      .slice(0, 2);
  }, [unifiedCatalog, items]);

  const handleClose = () => {
    if (isSubmitting) return;
    setCheckoutStep('cart');
    setConfirmedOrder(null);
    setFormError(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, checkoutStep, isSubmitting]);

  useEffect(() => {
    if (!isOpen || checkoutStep !== 'success' || !confirmedOrder) return;

    const celebrationColors = ['#B69A60', '#D5BA80', '#F5E4B7', '#F5F2EB', '#756BFF'];

    confetti({
      particleCount: 85,
      spread: 72,
      startVelocity: 42,
      ticks: 220,
      origin: { x: 0.72, y: 0.55 },
      colors: celebrationColors,
      zIndex: 100,
      disableForReducedMotion: true,
    });

    const secondaryTimer = window.setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 118,
        spread: 60,
        startVelocity: 36,
        ticks: 200,
        origin: { x: 0.88, y: 0.62 },
        colors: celebrationColors,
        zIndex: 100,
        disableForReducedMotion: true,
      });
    }, 260);

    return () => {
      window.clearTimeout(secondaryTimer);
      confetti.reset();
    };
  }, [isOpen, checkoutStep, confirmedOrder]);

  if (!isOpen) return null;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.priceBDT * item.quantity, 0);
  const bundleDiscount =
    totalQuantity >= 3
      ? storeSettings.bundle3DiscountBDT
      : totalQuantity >= 2
      ? storeSettings.bundle2DiscountBDT
      : 0;
  const afterBundleSubtotal = Math.max(0, subtotal - bundleDiscount);
  const promoDiscount =
    (appliedPromo === 'FARIZA10' || appliedPromo === 'STARKIT10') && afterBundleSubtotal > 0
      ? Math.round(afterBundleSubtotal * 0.1)
      : 0;
  const totalDiscount = Math.min(subtotal, bundleDiscount + promoDiscount);
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);
  const freeShippingThreshold = storeSettings.freeShippingThresholdBDT;
  const freeShippingUnlocked = discountedSubtotal >= freeShippingThreshold && items.length > 0;
  const deliveryFee =
    items.length === 0 || freeShippingUnlocked
      ? 0
      : division === 'Dhaka Division'
      ? storeSettings.dhakaShippingFeeBDT
      : storeSettings.outsideDhakaShippingFeeBDT;
  const orderTotal = discountedSubtotal + deliveryFee;

  const handleApplyPromo = (codeOverride?: string) => {
    const code = (codeOverride ?? promoInput).trim().toUpperCase();
    if (code === 'FARIZA10' || code === 'STARKIT10') {
      setAppliedPromo(code);
      setPromoInput(code);
      setPromoMessage(
        language === 'en' ? `${code}: 10% Extra Off Applied!` : `${code}: অতিরিক্ত ১০% ছাড় কার্যকর হয়েছে!`
      );
    } else if (!code) {
      setAppliedPromo(null);
      setPromoMessage(null);
    } else {
      setPromoMessage(
        language === 'en'
          ? 'Invalid code. Try STARKIT10 or FARIZA10'
          : 'সঠিক কোড দিন (STARKIT10 বা FARIZA10)'
      );
    }
  };

  const handleStartCheckout = () => {
    setFormError(null);
    setCheckoutStep('checkout');
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = fullName.trim();
    const digitsOnlyPhone = phone.replace(/\D/g, '');
    const trimmedAddress = address.trim();

    if (trimmedName.length < 2) {
      setFormError(
        language === 'en'
          ? 'Please enter your full name.'
          : 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।'
      );
      return;
    }
    if (digitsOnlyPhone.length < 10) {
      setFormError(
        language === 'en'
          ? 'Please enter a valid Bangladesh mobile number.'
          : 'অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর দিন।'
      );
      return;
    }
    if (trimmedAddress.length < 5) {
      setFormError(
        language === 'en'
          ? 'Please provide a complete delivery street address.'
          : 'অনুগ্রহ করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।'
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const orderId = `FAB-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(10 + Math.random() * 89)}`;
    const baseItemsSummary = items
      .map((i) => `${i.nameEn} (${i.size}, ${i.color}) x${i.quantity}`)
      .join(' | ');
    const itemsSummary = (
      appliedPromo ? `${baseItemsSummary} [Promo: ${appliedPromo}]` : baseItemsSummary
    ).slice(0, 1200);
    const trimmedRef = mfsReference.trim();
    const combinedAddress =
      paymentMethod === 'mfs' && trimmedRef
        ? `${trimmedAddress} [MFS Ref: ${trimmedRef}]`.slice(0, 300)
        : trimmedAddress.slice(0, 300);

    const starKiTItems: MetaPixelContentItem[] = items
      .filter((i) => isStarKiTItem(i.productId, i.nameEn, unifiedCatalog))
      .map((i) => ({
        id: i.productId,
        name: i.nameEn,
        priceBDT: i.priceBDT,
        quantity: i.quantity,
      }));
    const onStarKiTRoute = isStarKiTRoute();
    const shouldTrackConversion = starKiTItems.length > 0 || onStarKiTRoute;
    const conversionItems: MetaPixelContentItem[] =
      starKiTItems.length > 0
        ? starKiTItems
        : items.map((i) => ({
            id: i.productId,
            name: i.nameEn,
            priceBDT: i.priceBDT,
            quantity: i.quantity,
          }));
    const starKiTRawValue = starKiTItems.reduce((sum, i) => sum + i.priceBDT * i.quantity, 0);
    const starKiTShareRatio = subtotal > 0 ? Math.min(1, starKiTRawValue / subtotal) : 0;
    const conversionTotalBDT =
      starKiTItems.length === items.length || onStarKiTRoute
        ? orderTotal
        : Math.max(0, Math.round(discountedSubtotal * starKiTShareRatio));

    if (shouldTrackConversion) {
      trackStarKiTAddPaymentInfo(paymentMethod, conversionItems, conversionTotalBDT);
    }

    try {
      const result = await placeStoreOrder({
        orderId,
        recipientName: trimmedName,
        recipientPhone: phone.trim(),
        recipientAddress: combinedAddress,
        division,
        paymentMethod,
        subtotalBDT: subtotal,
        discountBDT: totalDiscount,
        deliveryFeeBDT: deliveryFee,
        totalBDT: orderTotal,
        itemsCount: totalQuantity,
        itemsSummary,
      });

      if (shouldTrackConversion) {
        trackStarKiTPurchase({
          orderId: result.orderId,
          items: conversionItems,
          totalValueBDT: conversionTotalBDT,
          customer: {
            fullName: trimmedName,
            phone: phone.trim(),
            division,
          },
        });
      }

      setConfirmedOrder({
        orderId: result.orderId,
        consignmentId: result.consignmentId,
        recipientName: trimmedName,
        recipientAddress: combinedAddress,
        division,
        totalBDT: orderTotal,
      });
      onClearCart();
      setMfsReference('');
      setCheckoutStep('success');
    } catch {
      setFormError(
        language === 'en'
          ? 'Could not submit order to server. Please check connection and try again.'
          : 'অর্ডার জমা দেওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#171719] border-l border-white/10 text-[#F5F2EB] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#B69A60]" />
              <h3 className="font-serif-luxury text-xl font-light tracking-wide">
                {checkoutStep === 'checkout'
                  ? language === 'en'
                    ? 'Express Checkout'
                    : 'এক্সপ্রেস চেকআউট'
                  : t.cart.title}
              </h3>
              <span className="text-xs font-mono text-[#77777D] tabular-nums">
                ({totalQuantity})
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-[#D8D3C9] hover:text-white rounded-full hover:bg-white/5 cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {checkoutStep === 'cart' && (
              <>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 mb-3 text-xs">
                  <div className="flex justify-between mb-1.5 font-light">
                    <span className="text-[#D8D3C9]">
                      {freeShippingUnlocked
                        ? language === 'en'
                          ? '✓ Complimentary delivery unlocked'
                          : '✓ ফ্রি ডেলিভারি আনলক হয়েছে'
                        : language === 'en'
                        ? `Add ৳ ${Math.max(0, freeShippingThreshold - discountedSubtotal).toLocaleString()} for free delivery`
                        : `ফ্রি ডেলিভারির জন্য আরও ৳ ${Math.max(0, freeShippingThreshold - discountedSubtotal).toLocaleString()} যোগ করুন`}
                    </span>
                    <span className="text-[#B69A60] font-mono tabular-nums">
                      {freeShippingThreshold > 0
                        ? Math.min(100, Math.round((discountedSubtotal / freeShippingThreshold) * 100))
                        : 100}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#B69A60] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          freeShippingThreshold > 0
                            ? Math.min(100, (discountedSubtotal / freeShippingThreshold) * 100)
                            : 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Bundle Privilege Progress Banner */}
                {items.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#B69A60]/10 border border-[#B69A60]/30 mb-5 text-[11px] font-mono text-[#D5BA80] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#B69A60] shrink-0" />
                    <span className="tabular-nums">
                      {totalQuantity === 1
                        ? language === 'en'
                          ? `Add 1 more piece to unlock ৳${storeSettings.bundle2DiscountBDT} Bundle Privilege!`
                          : `আরও ১টি পোশাক যোগ করলেই পাচ্ছেন ৳${storeSettings.bundle2DiscountBDT} বান্ডেল ছাড়!`
                        : totalQuantity === 2
                        ? language === 'en'
                          ? `✓ ৳${storeSettings.bundle2DiscountBDT} saved! Add 1 more for ৳${storeSettings.bundle3DiscountBDT} off`
                          : `✓ ৳${storeSettings.bundle2DiscountBDT} ছাড় যুক্ত! আরও ১টিতে ৳${storeSettings.bundle3DiscountBDT} ছাড়`
                        : language === 'en'
                        ? `✓ Maximum ৳${storeSettings.bundle3DiscountBDT} Bundle Privilege applied!`
                        : `✓ সর্বোচ্চ ৳${storeSettings.bundle3DiscountBDT} বান্ডেল ছাড় কার্যকর হয়েছে!`}
                    </span>
                  </div>
                )}

                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-[#77777D] mx-auto mb-4 stroke-1" />
                    <p className="font-serif-luxury text-lg text-[#F5F2EB] mb-2">
                      {t.cart.empty}
                    </p>
                    <p className="text-xs text-[#77777D] max-w-xs mx-auto mb-6">
                      {t.cart.emptySub}
                    </p>
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-[#F5F2EB] rounded transition-colors cursor-pointer"
                    >
                      {t.cart.continueShopping}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 rounded-lg bg-black/40 border border-white/5 items-center"
                      >
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          className="w-16 h-20 object-cover object-top rounded bg-zinc-900 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif-luxury text-sm text-[#F5F2EB] truncate font-medium">
                            {language === 'en' ? item.nameEn : item.nameBn}
                          </h4>
                          <div className="text-[11px] text-[#77777D] mt-0.5">
                            {t.cart.size}: {item.size} · {item.color}
                          </div>
                          <div className="font-mono text-xs text-[#D5BA80] font-semibold tabular-nums mt-1">
                            ৳ {(item.priceBDT * item.quantity).toLocaleString()}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-white/15 rounded bg-black/60">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="px-2 py-0.5 text-xs text-[#D8D3C9] hover:text-white cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-mono tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="px-2 py-0.5 text-xs text-[#D8D3C9] hover:text-white cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1 text-[#77777D] hover:text-red-400 transition-colors ml-auto cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Complete Your Bag 1-Click Upsell Recommendations */}
                    {onAddToCart && upsellRecommendations.length > 0 && (
                      <div className="pt-4 mt-4 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#B69A60]">
                            {language === 'en'
                              ? 'Complete Your Bag · Instant Pairings'
                              : 'সাথে নিতে পারেন · বান্ডেল ছাড়'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {upsellRecommendations.map((rec) => {
                            const defaultSz = rec.sizes.includes('Unstitched Set')
                              ? 'Unstitched Set'
                              : rec.sizes[1] || rec.sizes[0] || 'L';
                            return (
                              <div
                                key={rec.id}
                                className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-black/30 border border-white/5 hover:border-[#B69A60]/30 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={rec.image}
                                    alt={rec.nameEn}
                                    className="w-10 h-12 object-cover object-top rounded bg-zinc-900 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-serif-luxury text-[#F5F2EB] truncate">
                                      {language === 'en' ? rec.nameEn : rec.nameBn}
                                    </div>
                                    <div className="text-[11px] font-mono text-[#D5BA80] tabular-nums">
                                      ৳ {rec.priceBDT.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onAddToCart({
                                      productId: rec.id,
                                      nameEn: rec.nameEn,
                                      nameBn: rec.nameBn,
                                      priceBDT: rec.priceBDT,
                                      image: rec.image,
                                      color: rec.colors[0]?.name || 'Standard',
                                      size: defaultSz,
                                      quantity: 1,
                                    })
                                  }
                                  className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-[#B69A60] text-[#F5F2EB] hover:text-[#09090B] text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>{language === 'en' ? 'Add' : 'নিন'}</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Checkout Form */}
            {checkoutStep === 'checkout' && (
              <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
                <div className="p-3 bg-[#B69A60]/10 border border-[#B69A60]/30 rounded text-[#D5BA80]">
                  {language === 'en'
                    ? 'Express Pathao Courier Dispatch across all 64 districts in Bangladesh.'
                    : 'বাংলাদেশের সকল ৬৪ জেলায় পাঠাও কুরিয়ারের মাধ্যমে এক্সপ্রেস ডেলিভারি।'}
                </div>

                {/* Compact Order Items Summary */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#B69A60]">
                    <span>
                      {language === 'en'
                        ? `Order Summary (${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'})`
                        : `অর্ডার সংক্ষেপ (${totalQuantity}টি পোশাক)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="text-[#D8D3C9] hover:text-white underline cursor-pointer"
                    >
                      {language === 'en' ? 'Edit Bag' : 'পরিবর্তন'}
                    </button>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 text-[11px] text-[#D8D3C9]"
                      >
                        <span className="truncate">
                          {item.quantity}× {language === 'en' ? item.nameEn : item.nameBn} (
                          {item.size})
                        </span>
                        <span className="font-mono text-[#F5F2EB] shrink-0 tabular-nums">
                          ৳ {(item.priceBDT * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="p-2.5 rounded bg-red-500/10 border border-red-500/30 text-red-300">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Full Name' : 'সম্পূর্ণ নাম'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Nusrat Jahan' : 'যেমন: নুসরাত জাহান'}
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                  />
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Mobile Number (SMS & Rider)' : 'মোবাইল নম্বর'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 17XX XXXXXX"
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                  />
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Delivery Address' : 'ডেলিভারি ঠিকানা'}
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      language === 'en'
                        ? 'House, Road, Area (e.g. Road 11, Banani, Dhaka)'
                        : 'বাসা, রোড, এলাকা'
                    }
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                  />
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Division' : 'বিভাগ'}
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#B69A60]"
                  >
                    <option value="Dhaka Division">Dhaka Division</option>
                    <option value="Chattogram Division">Chattogram Division</option>
                    <option value="Sylhet Division">Sylhet Division</option>
                    <option value="Rajshahi Division">Rajshahi Division</option>
                    <option value="Khulna Division">Khulna Division</option>
                    <option value="Barishal Division">Barishal Division</option>
                    <option value="Rangpur Division">Rangpur Division</option>
                    <option value="Mymensingh Division">Mymensingh Division</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    {language === 'en' ? 'Payment Method' : 'পেমেন্ট মাধ্যম'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <label
                      className={`p-2 rounded flex items-center gap-2 cursor-pointer border ${
                        paymentMethod === 'cod'
                          ? 'border-[#B69A60] bg-[#B69A60]/10 text-[#F5F2EB]'
                          : 'border-white/10 bg-black/40 text-[#D8D3C9]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      <span>{language === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}</span>
                    </label>
                    <label
                      className={`p-2 rounded flex items-center gap-2 cursor-pointer border ${
                        paymentMethod === 'mfs'
                          ? 'border-[#B69A60] bg-[#B69A60]/10 text-[#F5F2EB]'
                          : 'border-white/10 bg-black/40 text-[#D8D3C9]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={paymentMethod === 'mfs'}
                        onChange={() => setPaymentMethod('mfs')}
                      />
                      <span>bKash / Nagad</span>
                    </label>
                  </div>
                  {paymentMethod === 'mfs' && (
                    <div className="mt-2.5 p-3 rounded-lg bg-black/60 border border-[#B69A60]/30 space-y-2">
                      <p className="text-[11px] text-[#D5BA80] leading-relaxed">
                        {language === 'en'
                          ? `Send ৳ ${orderTotal.toLocaleString()} via bKash or Nagad (Personal/Send Money) to ${storeSettings.hotlineDisplay} using your Name as reference, or share your TrxID below for priority dispatch.`
                          : `অগ্রাধিকার ডেলিভারির জন্য ${storeSettings.hotlineDisplay} নম্বরে বিকাশ/নগদ সেন্ড মানি (৳ ${orderTotal.toLocaleString()}) করে নিচে TrxID দিন।`}
                      </p>
                      <input
                        type="text"
                        maxLength={48}
                        value={mfsReference}
                        onChange={(e) => setMfsReference(e.target.value)}
                        placeholder={
                          language === 'en'
                            ? 'Optional: bKash / Nagad TrxID or sender number'
                            : 'ঐচ্ছিক: বিকাশ / নগদ TrxID বা সেন্ডার নম্বর'
                        }
                        className="w-full bg-black/50 border border-white/15 rounded px-3 py-1.5 text-[11px] font-mono text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#D5BA80]">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#B69A60]" />
                      {language === 'en' ? 'Promo Code' : 'প্রোমো কোড'}
                    </span>
                    {!appliedPromo && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyPromo('STARKIT10')}
                          className="text-[10px] underline hover:text-white cursor-pointer"
                        >
                          STARKIT10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPromo('FARIZA10')}
                          className="text-[10px] underline hover:text-white cursor-pointer"
                        >
                          FARIZA10
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="STARKIT10 / FARIZA10"
                      className="flex-1 bg-black/50 border border-white/15 rounded px-2.5 py-1.5 text-xs font-mono uppercase text-[#F5F2EB] placeholder:text-[#77777D] focus:outline-none focus:border-[#B69A60]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      className="px-3 py-1.5 rounded bg-white/10 hover:bg-[#B69A60] text-[#F5F2EB] hover:text-[#09090B] text-[11px] font-mono font-semibold uppercase transition-colors cursor-pointer"
                    >
                      {language === 'en' ? 'Apply' : 'প্রয়োগ'}
                    </button>
                  </div>
                  {promoMessage && (
                    <div
                      className={`text-[10px] font-mono ${
                        appliedPromo ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {promoMessage}
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-[#D8D3C9]">
                    <span>{language === 'en' ? 'Subtotal' : 'সাবটোটাল'}</span>
                    <span className="tabular-nums">৳ {subtotal.toLocaleString()}</span>
                  </div>
                  {bundleDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{language === 'en' ? 'Bundle Privilege' : 'বান্ডেল ছাড়'}</span>
                      <span className="tabular-nums">-৳ {bundleDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo ({appliedPromo})</span>
                      <span className="tabular-nums">-৳ {promoDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#D8D3C9]">
                    <span>{language === 'en' ? 'Pathao Courier' : 'পাঠাও ডেলিভারি'}</span>
                    <span className="tabular-nums">
                      {deliveryFee === 0 ? 'Complimentary' : `৳ ${deliveryFee}`}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 flex justify-between text-[#D5BA80] font-bold text-xs">
                    <span>{language === 'en' ? 'Total' : 'সর্বমোট'}</span>
                    <span className="tabular-nums">৳ {orderTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCheckoutStep('cart')}
                    className="w-1/3 py-2.5 border border-white/15 rounded hover:bg-white/5 uppercase tracking-wider font-medium text-xs cursor-pointer disabled:opacity-50"
                  >
                    {language === 'en' ? 'Back' : 'ফিরে যান'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-2.5 bg-[#B69A60] text-[#09090B] rounded font-semibold uppercase tracking-wider text-xs hover:bg-[#D5BA80] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? language === 'en'
                        ? 'Registering Order...'
                        : 'নিবন্ধন হচ্ছে...'
                      : language === 'en'
                      ? 'Place Order'
                      : 'অর্ডার নিশ্চিত করুন'}
                  </button>
                </div>
              </form>
            )}

            {/* Success State */}
            {checkoutStep === 'success' && confirmedOrder && (
              <div className="text-center py-10">
                <CheckCircle2 className="w-14 h-14 text-[#B69A60] mx-auto mb-4" />
                <h4 className="font-serif-luxury text-2xl text-[#F5F2EB] mb-2 font-light">
                  {language === 'en'
                    ? `Order #${confirmedOrder.orderId} Confirmed`
                    : `অর্ডার #${confirmedOrder.orderId} নিশ্চিত হয়েছে`}
                </h4>
                <p className="text-xs text-[#D8D3C9] leading-relaxed max-w-xs mx-auto mb-4">
                  {language === 'en'
                    ? `Thank you, ${confirmedOrder.recipientName}. Your consignment has been registered with Pathao Courier for priority delivery to ${confirmedOrder.recipientAddress}, ${confirmedOrder.division}.`
                    : `ধন্যবাদ, ${confirmedOrder.recipientName}। আপনার পার্সেলটি ${confirmedOrder.recipientAddress}, ${confirmedOrder.division} ঠিকানায় ডেলিভারির জন্য পাঠাও কুরিয়ারে নিবন্ধিত হয়েছে।`}
                </p>

                <div className="max-w-xs mx-auto p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-[#D5BA80] mb-6 space-y-1">
                  <div>Consignment ID: {confirmedOrder.consignmentId}</div>
                  <div className="text-[#77777D] tabular-nums">
                    Total: ৳ {confirmedOrder.totalBDT.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 max-w-xs mx-auto mb-4">
                  {onOpenTrackOrder && (
                    <button
                      onClick={() => {
                        const orderIdToTrack = confirmedOrder.orderId;
                        handleClose();
                        onOpenTrackOrder(orderIdToTrack);
                      }}
                      className="w-full py-3 bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Truck className="w-4 h-4" />
                      <span>
                        {language === 'en'
                          ? 'Track Delivery with Pathao'
                          : 'পাঠাও কুরিয়ারে ট্র্যাক করুন'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const receipt = `FABRICIAN Order #${confirmedOrder.orderId} | Consignment: ${confirmedOrder.consignmentId} | Recipient: ${confirmedOrder.recipientName} | ${confirmedOrder.recipientAddress}, ${confirmedOrder.division} | Total: ৳${confirmedOrder.totalBDT.toLocaleString()}`;
                      try {
                        navigator.clipboard?.writeText(receipt);
                      } catch {
                        // ignore clipboard errors
                      }
                      setCopiedReceipt(true);
                      setTimeout(() => setCopiedReceipt(false), 2200);
                    }}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-[#F5F2EB] text-xs font-mono uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D5BA80]" />}
                    <span>
                      {copiedReceipt
                        ? language === 'en'
                          ? 'Receipt Copied'
                          : 'রসিদ কপি হয়েছে'
                        : language === 'en'
                        ? 'Copy Order Receipt'
                        : 'অর্ডার রসিদ কপি করুন'}
                    </span>
                  </button>

                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-[#D8D3C9] text-xs font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Return to Store' : 'স্টোরে ফিরে যান'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {checkoutStep === 'cart' && items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/40">
              {/* Quick Promo Row in Bag View */}
              <div className="mb-3 pb-3 border-b border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#D5BA80]">
                  <Tag className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span>
                    {appliedPromo
                      ? `✓ ${appliedPromo} (-10%)`
                      : language === 'en'
                      ? 'Have promo code?'
                      : 'প্রোমো কোড?'}
                  </span>
                </div>
                {!appliedPromo ? (
                  <button
                    type="button"
                    onClick={() => handleApplyPromo('FARIZA10')}
                    className="px-2.5 py-1 rounded bg-[#B69A60]/15 hover:bg-[#B69A60] border border-[#B69A60]/40 text-[#D5BA80] hover:text-[#09090B] text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Apply FARIZA10' : 'FARIZA10 নিন'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoInput('');
                      setPromoMessage(null);
                    }}
                    className="text-[10px] font-mono text-[#9A9892] hover:text-white underline cursor-pointer"
                  >
                    {language === 'en' ? 'Remove' : 'সরান'}
                  </button>
                )}
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between items-baseline text-xs font-mono text-emerald-400 mb-1.5">
                  <span>{language === 'en' ? 'Bundle & Promo Savings' : 'মোট ছাড়'}</span>
                  <span className="tabular-nums">-৳ {totalDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#77777D]">
                  {t.cart.subtotal}
                </span>
                <span className="font-mono text-xl text-[#F5F2EB] font-bold tabular-nums">
                  ৳ {discountedSubtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-[#77777D] mb-4">
                {language === 'en'
                  ? `Complimentary nationwide delivery on orders ৳ ${freeShippingThreshold.toLocaleString()}+.`
                  : `৳ ${freeShippingThreshold.toLocaleString()}+ অর্ডারে সারাদেশে ফ্রি ডেলিভারি।`}
              </p>

              <button
                onClick={handleStartCheckout}
                className="w-full py-3.5 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] font-semibold text-xs uppercase tracking-[0.2em] rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>{t.cart.checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-[#77777D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B69A60]" />
                <span>Encrypted · Cash on Delivery &amp; MFS Available in BD</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
