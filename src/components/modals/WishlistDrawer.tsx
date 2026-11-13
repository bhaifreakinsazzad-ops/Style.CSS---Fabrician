import React from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Product, Language, CartItem } from '../../types';
import { translations } from '../../data/translations';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (productId: string) => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  language: Language;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemove,
  onAddToCart,
  language,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  const handleMoveToBag = (product: Product) => {
    onAddToCart({
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      priceBDT: product.priceBDT,
      image: product.image,
      color: product.colors[0]?.name || 'Standard',
      size: product.sizes[0] || 'M',
      quantity: 1,
    });
    onRemove(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#171719] border-l border-white/10 text-[#F5F2EB] shadow-2xl flex flex-col justify-between">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#B69A60]" />
              <h3 className="font-serif-luxury text-xl font-light tracking-wide">
                {t.wishlist.title}
              </h3>
              <span className="text-xs font-mono text-[#77777D]">({items.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#D8D3C9] hover:text-white rounded-full hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-12 h-12 text-[#77777D] mx-auto mb-4 stroke-1" />
                <p className="font-serif-luxury text-lg text-[#F5F2EB] mb-2">{t.wishlist.empty}</p>
                <p className="text-xs text-[#77777D] max-w-xs mx-auto">
                  Click the heart icon on any essential or lookbook item to save it for later.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex gap-4 p-3 rounded-lg bg-black/40 border border-white/5 items-center"
                  >
                    <img
                      src={prod.image}
                      alt={prod.nameEn}
                      className="w-16 h-20 object-cover object-top rounded bg-zinc-900 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-luxury text-sm text-[#F5F2EB] truncate font-medium">
                        {language === 'en' ? prod.nameEn : prod.nameBn}
                      </h4>
                      <div className="font-mono text-xs text-[#D5BA80] font-semibold tabular-nums mt-1">
                        ৳ {prod.priceBDT.toLocaleString()}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleMoveToBag(prod)}
                          className="px-3 py-1 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] text-[11px] font-semibold uppercase tracking-wider rounded flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{t.wishlist.moveToBag}</span>
                        </button>
                        <button
                          onClick={() => onRemove(prod.id)}
                          className="p-1 text-[#77777D] hover:text-red-400 transition-colors ml-auto cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
