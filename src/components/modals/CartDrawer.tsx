import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2, Truck } from 'lucide-react';
import { CartItem, Language } from '../../types';
import { translations } from '../../data/translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  language: Language;
  onOpenTrackOrder?: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  language,
  onOpenTrackOrder,
}) => {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'mock-checkout' | 'success'>('cart');
  const t = translations[language];

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.priceBDT * item.quantity, 0);
  const freeShippingThreshold = 5000;
  const freeShippingUnlocked = subtotal >= freeShippingThreshold;

  const handleStartCheckout = () => {
    setCheckoutStep('mock-checkout');
  };

  const handleConfirmMockOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#171719] border-l border-white/10 text-[#F5F2EB] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#B69A60]" />
              <h3 className="font-serif-luxury text-xl font-light tracking-wide">
                {t.cart.title}
              </h3>
              <span className="text-xs font-mono text-[#77777D]">
                ({items.reduce((sum, item) => sum + item.quantity, 0)})
              </span>
            </div>
            <button
              onClick={onClose}
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
                {/* Free Shipping Meter */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 mb-6 text-xs">
                  <div className="flex justify-between mb-1.5 font-light">
                    <span className="text-[#D8D3C9]">
                      {freeShippingUnlocked
                        ? '✓ Complimentary delivery unlocked'
                        : `Add ৳ ${(freeShippingThreshold - subtotal).toLocaleString()} for free delivery`}
                    </span>
                    <span className="text-[#B69A60] font-mono">
                      {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#B69A60] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>

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
                      onClick={onClose}
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

                          {/* Stepper */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-white/15 rounded bg-black/60">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="px-2 py-0.5 text-xs text-[#D8D3C9] hover:text-white"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-mono tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="px-2 py-0.5 text-xs text-[#D8D3C9] hover:text-white"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1 text-[#77777D] hover:text-red-400 transition-colors ml-auto"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Mock Checkout Step */}
            {checkoutStep === 'mock-checkout' && (
              <form onSubmit={handleConfirmMockOrder} className="space-y-4 text-xs">
                <div className="p-3 bg-[#B69A60]/10 border border-[#B69A60]/30 rounded text-[#D5BA80] mb-4">
                  Phase 01 Prototype: Demonstration checkout for Bangladesh addresses.
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="Sazzad Sharif"
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#B69A60]"
                  />
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    Phone (MFS / Delivery SMS)
                  </label>
                  <input
                    type="tel"
                    required
                    defaultValue="+880 1712 345678"
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#B69A60]"
                  />
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="Road 11, Banani, Dhaka 1213"
                    className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#B69A60]"
                  />
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    Division
                  </label>
                  <select className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-[#F5F2EB] focus:outline-none focus:border-[#B69A60]">
                    <option>Dhaka Division</option>
                    <option>Chittagong Division</option>
                    <option>Sylhet Division</option>
                    <option>Rajshahi Division</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#D8D3C9] uppercase tracking-wider mb-1">
                    Payment Option
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <label className="p-2 border border-[#B69A60] rounded bg-[#B69A60]/10 flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pay" defaultChecked />
                      <span>bKash / Nagad</span>
                    </label>
                    <label className="p-2 border border-white/10 rounded bg-black/40 flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pay" />
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-1/3 py-2.5 border border-white/15 rounded hover:bg-white/5 uppercase tracking-wider font-medium text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-[#B69A60] text-[#09090B] rounded font-semibold uppercase tracking-wider text-xs hover:bg-[#D5BA80] transition-colors cursor-pointer"
                  >
                    Confirm Mock Order
                  </button>
                </div>
              </form>
            )}

            {/* Success State */}
            {checkoutStep === 'success' && (
              <div className="text-center py-12">
                <CheckCircle2 className="w-14 h-14 text-[#B69A60] mx-auto mb-4" />
                <h4 className="font-serif-luxury text-2xl text-[#F5F2EB] mb-2 font-light">
                  Order #FAB-2026 Confirmed
                </h4>
                <p className="text-xs text-[#D8D3C9] leading-relaxed max-w-xs mx-auto mb-6">
                  Thank you for exploring FABRICIAN. Your luxury consignment has been registered with Pathao Courier for priority delivery to Banani, Dhaka.
                </p>

                <div className="flex flex-col gap-2.5 max-w-xs mx-auto mb-4">
                  {onOpenTrackOrder && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTrackOrder('FAB-2026');
                      }}
                      className="w-full py-3 bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Track Delivery with Pathao</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setCheckoutStep('cart');
                      onClose();
                    }}
                    className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-[#D8D3C9] text-xs font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                  >
                    Return to Store
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {checkoutStep === 'cart' && items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/40">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#77777D]">
                  {t.cart.subtotal}
                </span>
                <span className="font-mono text-xl text-[#F5F2EB] font-bold tabular-nums">
                  ৳ {subtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-[#77777D] mb-4">
                {t.cart.shippingNote}
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
