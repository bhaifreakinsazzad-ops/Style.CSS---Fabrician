import React, { useState } from 'react';
import { ShoppingBag, Check, Sparkles, Layers, ShieldCheck, Ruler } from 'lucide-react';
import { FashionLook, Language, CartItem } from '../../types';
import { translations } from '../../data/translations';
import { SizeGuideModal } from '../modals/SizeGuideModal';

interface ActiveLookDetailsProps {
  look: FashionLook;
  language: Language;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onQuickViewProduct?: (productId: string) => void;
}

export const ActiveLookDetails: React.FC<ActiveLookDetailsProps> = ({
  look,
  language,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const t = translations[language];

  const handleAddEnsemble = () => {
    // Add primary featured piece to cart
    onAddToCart({
      productId: look.garments[0]?.id || look.id,
      nameEn: look.titleEn,
      nameBn: look.titleBn,
      priceBDT: look.totalPriceBDT,
      image: look.modelImage,
      color: look.colorway,
      size: selectedSize,
      quantity: 1,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="bg-[#171719]/90 border border-white/10 rounded-xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col justify-between h-full">
      {/* Top Header Information */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B69A60]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'en' ? look.collectionEn : look.collectionBn}</span>
          </div>
          <span className="text-[11px] font-mono tracking-widest text-[#77777D] border border-white/10 px-2 py-0.5 rounded">
            {look.category}
          </span>
        </div>

        <h3 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-light text-[#F5F2EB] mb-2 leading-tight">
          {language === 'en' ? look.titleEn : look.titleBn}
        </h3>

        <p className="text-xs sm:text-sm text-[#D8D3C9] leading-relaxed mb-6 font-light">
          {language === 'en' ? look.storyEn : look.storyBn}
        </p>

        {/* Look Specifications Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/10 mb-6 text-xs">
          <div>
            <span className="block text-[#77777D] uppercase tracking-wider text-[10px] mb-1">
              {t.lookbook.availableColors}
            </span>
            <span className="text-[#F5F2EB] font-medium">{look.colorway}</span>
          </div>
          <div>
            <span className="block text-[#77777D] uppercase tracking-wider text-[10px] mb-1">
              Sartorial Fit
            </span>
            <span className="text-[#F5F2EB] font-medium">
              {language === 'en' ? look.fitEn : look.fitBn}
            </span>
          </div>
        </div>

        {/* Ensemble Itemized Breakdown */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#D8D3C9] font-medium mb-3">
            <Layers className="w-3.5 h-3.5 text-[#B69A60]" />
            <span>{t.lookbook.garmentBreakdown}</span>
          </div>

          <div className="space-y-2.5">
            {look.garments.map((garment) => (
              <div
                key={garment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-white/15 transition-colors text-xs"
              >
                <div>
                  <div className="font-medium text-[#F5F2EB]">
                    {language === 'en' ? garment.nameEn : garment.nameBn}
                  </div>
                  <div className="text-[11px] text-[#77777D] mt-0.5">{garment.fabric}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-[#D5BA80] tabular-nums font-semibold">
                    ৳ {garment.priceBDT.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#77777D]">{garment.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider text-[#D8D3C9] font-medium">
              {t.lookbook.availableSizes}
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-[#D5BA80] hover:text-white underline cursor-pointer transition-colors"
            >
              <Ruler className="w-3.5 h-3.5 text-[#B69A60]" />
              <span>{language === 'en' ? 'Size Guide (Bangladeshi Fit)' : 'সাইজ গাইড'}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['38 / S', '40 / M', '42 / L', '44 / XL'].map((sizeOption) => {
              const sizeKey = sizeOption.split(' / ')[1] || sizeOption;
              const isSelected = selectedSize === sizeKey;
              return (
                <button
                  key={sizeOption}
                  onClick={() => setSelectedSize(sizeKey)}
                  className={`px-3 py-2 text-xs font-mono uppercase tracking-wider rounded transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#B69A60] text-[#09090B] font-bold shadow-md'
                      : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {sizeOption}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Purchase Bar */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[#77777D]">
            {t.lookbook.tailoredPrice}
          </span>
          <span className="font-serif-luxury text-2xl sm:text-3xl text-[#D5BA80] font-normal tabular-nums">
            ৳ {look.totalPriceBDT.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleAddEnsemble}
          disabled={addedAnimation}
          className={`w-full py-3.5 px-6 rounded font-semibold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
            addedAnimation
              ? 'bg-[#B69A60] text-[#09090B]'
              : 'bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80]'
          }`}
        >
          {addedAnimation ? (
            <>
              <Check className="w-4 h-4 text-[#09090B]" />
              <span>{t.essentials.addedToBag}</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>{t.lookbook.addToBag}</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-[#77777D]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B69A60]" />
          <span>Made in Bangladesh · Bespoke Tailoring &amp; Express Delivery</span>
        </div>
      </div>

      {/* Size Guide Modal Overlay */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        language={language}
        defaultCategory={
          look.category === 'Men' ? 'panjabi' : look.category === 'Women' ? 'kameez' : 'streetwear'
        }
      />
    </div>
  );
};
