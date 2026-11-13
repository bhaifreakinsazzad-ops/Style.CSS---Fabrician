import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  Layers,
  MessageCircle,
  RefreshCw,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LiveGraphicArchiveProduct } from '../../types/store';
import { CartItem, Language } from '../../types';
import {
  buildStarKiTWhatsAppHref,
  STARKIT_BRAND_BOOK,
  STARKIT_FAQS,
  STARKIT_SIZE_CHART,
  STARKIT_WHATSAPP_DISPLAY,
} from '../../data/starkitBrandData';
import { StarKiTSize } from './StarKiTCatalogGrid';
import { useStoreData } from '../../context/StoreDataContext';

interface StarKiTInteractiveToolsProps {
  products: LiveGraphicArchiveProduct[];
  language: Language;
  onApplyRecommendedSize?: (size: StarKiTSize) => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
  onBuyNow?: (item: Omit<CartItem, 'id'>) => void;
}

export const StarKiTInteractiveTools: React.FC<StarKiTInteractiveToolsProps> = ({
  products,
  language,
  onApplyRecommendedSize,
  onAddToCart,
  onBuyNow,
}) => {
  const { storeSettings } = useStoreData();

  // Fit Calculator state
  const [heightTier, setHeightTier] = useState<'short' | 'mid' | 'tall' | 'xtall'>('mid');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [drapeStyle, setDrapeStyle] = useState<'standard' | 'oversized'>('oversized');
  const [appliedSizeFeedback, setAppliedSizeFeedback] = useState<boolean>(false);

  const recommendedFit = useMemo(() => {
    let score = 1; // 0=M, 1=L, 2=XL, 3=XXL
    if (weightKg < 64) score = 0;
    else if (weightKg < 76) score = 1;
    else if (weightKg < 89) score = 2;
    else score = 3;

    if (heightTier === 'tall' && score < 2) score += 1;
    if (heightTier === 'xtall' && score < 3) score += 1;
    if (drapeStyle === 'oversized' && score < 3) score = Math.min(3, score + 1);

    const sizes: StarKiTSize[] = ['M', 'L', 'XL', 'XXL'];
    const targetSize = sizes[score] || 'L';
    return STARKIT_SIZE_CHART.find((s) => s.size === targetSize) || STARKIT_SIZE_CHART[1];
  }, [heightTier, weightKg, drapeStyle]);

  // 3-Piece Smart Kit Builder state
  const availableKitProducts = useMemo(
    () => products.filter((p) => p.catalogStatus !== 'out_of_stock' && p.stockCount > 0),
    [products]
  );

  const [kitSlotIds, setKitSlotIds] = useState<[string, string, string]>(() => [
    availableKitProducts[0]?.id || products[0]?.id || 'FAB-H001',
    availableKitProducts[1]?.id || products[1]?.id || 'FAB-H002',
    availableKitProducts[2]?.id || products[2]?.id || 'FAB-H003',
  ]);
  const [kitSize, setKitSize] = useState<StarKiTSize>('L');
  const [kitAdded, setKitAdded] = useState<boolean>(false);

  const kitItems = kitSlotIds
    .map((id) => products.find((p) => p.id === id) || products[0])
    .filter(Boolean);
  const kitRawTotal = kitItems.reduce((sum, p) => sum + (p?.variants[0]?.priceBdt || p.basePrice), 0);
  const kitNetTotal = Math.max(0, kitRawTotal - storeSettings.bundle3DiscountBDT);

  const addFullKit = (instantCheckout: boolean) => {
    kitItems.forEach((p) => {
      const v = p.variants[0];
      if (!v) return;
      const payload: Omit<CartItem, 'id'> = {
        productId: p.id,
        nameEn: `StarKiT ${p.name} Hoodie (${p.stkCode || v.sku})`,
        nameBn: `স্টারকিট ${p.name} হুডি (${p.stkCode || v.sku})`,
        priceBDT: v.priceBdt,
        image: v.previewImage,
        color: v.color,
        size: kitSize,
        quantity: 1,
      };
      if (instantCheckout && onBuyNow) {
        onBuyNow(payload);
      } else {
        onAddToCart(payload);
      }
    });
    setKitAdded(true);
    setTimeout(() => setKitAdded(false), 2000);
  };

  // Direct WhatsApp Concierge Query State
  const [waTopic, setWaTopic] = useState('Order & COD Confirmation');
  const [waSku, setWaSku] = useState(products[0]?.stkCode || 'STK-H001');
  const [waNote, setWaNote] = useState('');

  // FAQ accordion
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const customWaLink = buildStarKiTWhatsAppHref(
    `Assalamu Alaikum StarKiT Desk!\nTopic: ${waTopic}\nProduct: ${waSku}\nNote: ${
      waNote.trim() || 'Please share stock & delivery confirmation.'
    }`
  );

  return (
    <div className="space-y-16">
      {/* 1. Find Your Fit Calculator + 48h Exchange Policy */}
      <section
        id="starkit-fit-lab"
        className="scroll-mt-24 rounded-3xl bg-[#170000] text-white border-2 border-white/15 p-6 sm:p-10 shadow-2xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calculator Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF2E2E] mb-2">
                <Ruler className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Find Your Fit Engine' : 'সঠিক সাইজ ক্যালকুলেটর'}</span>
              </div>
              <h3 className="font-starkit text-3xl sm:text-4xl font-black uppercase tracking-tight">
                {language === 'en'
                  ? 'Drop-Shoulder Fit Calculator'
                  : 'ড্রপ-শোল্ডার ফিট ক্যালকুলেটর'}
              </h3>
              <p className="text-xs sm:text-sm text-white/75 mt-1.5 max-w-xl">
                {language === 'en'
                  ? 'Select your height, weight, and desired silhouette to lock in your M–XXL StarKiT chest and length fit.'
                  : 'আপনার উচ্চতা, ওজন এবং পছন্দের ফিট অনুযায়ী M থেকে XXL সঠিক সাইজ নির্ধারণ করুন।'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Height */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/15">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-2">
                  {language === 'en' ? 'Height Range' : 'উচ্চতা'}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'short', label: `5'3"-5'6"` },
                      { id: 'mid', label: `5'7"-5'9"` },
                      { id: 'tall', label: `5'10"-6'0"` },
                      { id: 'xtall', label: `6'1"+` },
                    ] as const
                  ).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHeightTier(h.id)}
                      className={`py-1.5 px-2 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                        heightTier === h.id
                          ? 'bg-[#FF2E2E] text-white font-bold'
                          : 'bg-black/50 text-white/75 hover:bg-white/15'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Slider */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/15 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                    {language === 'en' ? 'Body Weight' : 'ওজন'}
                  </span>
                  <span className="text-sm font-mono font-bold text-[#FF2E2E] tabular-nums">
                    {weightKg} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={48}
                  max={108}
                  step={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  aria-label="Weight in kg"
                  className="w-full h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-[#FF2E2E] my-3"
                />
                <span className="text-[10px] font-mono text-white/50">48 kg — 108 kg</span>
              </div>

              {/* Desired Drape */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/15">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-white/60 mb-2">
                  {language === 'en' ? 'Desired Drape' : 'পছন্দের ফিট'}
                </span>
                <div className="space-y-1.5">
                  {[
                    { id: 'standard', label: language === 'en' ? 'Standard Street' : 'স্ট্যান্ডার্ড ফিট' },
                    { id: 'oversized', label: language === 'en' ? 'Boxy Oversized' : 'বক্সি ওভারসাইজড' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDrapeStyle(d.id as 'standard' | 'oversized')}
                      className={`w-full py-1.5 px-2.5 rounded text-left text-[11px] font-mono cursor-pointer transition-colors ${
                        drapeStyle === d.id
                          ? 'bg-white text-[#170000] font-bold'
                          : 'bg-black/50 text-white/75 hover:bg-white/15'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="p-5 rounded-2xl bg-white text-[#170000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-8 border-[#FF2E2E]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF2E2E] font-bold">
                  {language === 'en' ? 'Calculated StarKiT Fit' : 'আপনার উপযুক্ত সাইজ'}
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-starkit text-4xl font-black">Size {recommendedFit.size}</span>
                  <span className="font-mono text-xs text-[#474040] tabular-nums">
                    Chest {recommendedFit.chestInches}&Prime; × Length {recommendedFit.lengthInches}&Prime; · Shoulder {recommendedFit.shoulderInches}&Prime;
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onApplyRecommendedSize && (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyRecommendedSize(recommendedFit.size);
                      setAppliedSizeFeedback(true);
                      setTimeout(() => setAppliedSizeFeedback(false), 2000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#170000] hover:bg-[#FF2E2E] text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {appliedSizeFeedback ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>
                      {appliedSizeFeedback
                        ? language === 'en'
                          ? `Applied ${recommendedFit.size} to Grid`
                          : 'সিলেক্ট হয়েছে'
                        : language === 'en'
                        ? `Select ${recommendedFit.size} on All Cards`
                        : `${recommendedFit.size} সব কার্ডে দিন`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Complete Size Matrix + 48-Hour Exchange Promise */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-black/50 border border-white/15 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between text-xs font-mono">
                <span className="font-bold uppercase tracking-wider">
                  {language === 'en' ? 'Drop 01 Spec Sheet (Inches)' : 'ড্রপ ০১ সাইজ চার্ট (ইঞ্চি)'}
                </span>
                <span className="text-[#FF2E2E]">330–350 GSM</span>
              </div>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/5 text-white/60 text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-2">Size</th>
                    <th className="px-4 py-2">Chest</th>
                    <th className="px-4 py-2">Length</th>
                    <th className="px-4 py-2">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 tabular-nums">
                  {STARKIT_SIZE_CHART.map((row) => {
                    const isRec = row.size === recommendedFit.size;
                    return (
                      <tr key={row.size} className={isRec ? 'bg-[#FF2E2E]/20 font-bold' : ''}>
                        <td className="px-4 py-2.5 text-white">
                          {row.size} {isRec ? '★' : ''}
                        </td>
                        <td className="px-4 py-2.5 text-white/85">{row.chestInches}&Prime;</td>
                        <td className="px-4 py-2.5 text-white/85">{row.lengthInches}&Prime;</td>
                        <td className="px-4 py-2.5 text-white/85">{row.shoulderInches}&Prime;</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-[#FF2E2E] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white">
                  {language === 'en'
                    ? '48-Hour Size & Print Defect Exchange'
                    : '৪৮ ঘণ্টার সাইজ ও প্রিন্ট এক্সচেঞ্জ গ্যারান্টি'}
                </div>
                <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                  {language === 'en'
                    ? 'Wrong fit or minor stitching issue? Keep tags intact and message our WhatsApp Desk within 48 hours of delivery for instant size swap.'
                    : 'ডেলিভারির ৪৮ ঘণ্টার মধ্যে ট্যাগ অক্ষুণ্ন থাকা অবস্থায় সাইজ বা প্রিন্ট সমস্যা জানালে দ্রুত বদলে দেওয়া হবে।'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive 3-Piece StarKiT Kit Configurator */}
      <section className="rounded-3xl bg-white text-[#170000] border-2 border-[#170000] p-6 sm:p-10 shadow-[8px_8px_0px_#170000]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 mb-8 border-b-2 border-[#170000]/15">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#FF2E2E] font-bold mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Smart Kit Builder' : 'স্মার্ট ৩-পিস কিট বিল্ডার'}</span>
            </div>
            <h3 className="font-starkit text-3xl sm:text-4xl font-black uppercase tracking-tight">
              {language === 'en'
                ? `Build a 3-Hoodie Kit & Save ৳${storeSettings.bundle3DiscountBDT}`
                : `৩টি হুডির কিট বানিয়ে ৳${storeSettings.bundle3DiscountBDT} বাঁচান`}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#524B4B]">Kit Size:</span>
            {(['M', 'L', 'XL', 'XXL'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setKitSize(sz)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                  kitSize === sz
                    ? 'bg-[#170000] text-white'
                    : 'bg-[#F5F2EB] text-[#170000] hover:bg-[#170000]/10'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {([0, 1, 2] as const).map((slotIdx) => {
            const currentId = kitSlotIds[slotIdx];
            const selected = products.find((p) => p.id === currentId) || products[0];
            const variant = selected?.variants[0];
            return (
              <div
                key={slotIdx}
                className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#170000]/15 space-y-3"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#524B4B]">
                  <span>Slot 0{slotIdx + 1}</span>
                  <span className="text-[#170000] font-bold tabular-nums">
                    ৳{(variant?.priceBdt || selected?.basePrice || 0).toLocaleString()}
                  </span>
                </div>
                {variant && (
                  <div className="flex items-center gap-3">
                    <img
                      src={variant.previewImage}
                      alt={selected.name}
                      className="w-16 h-20 object-cover rounded-xl border border-[#170000]/15 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <select
                        value={currentId}
                        aria-label={`Select hoodie for kit slot ${slotIdx + 1}`}
                        onChange={(e) => {
                          const next = [...kitSlotIds] as [string, string, string];
                          next[slotIdx] = e.target.value;
                          setKitSlotIds(next);
                        }}
                        className="w-full bg-white border border-[#170000]/25 rounded-lg px-2.5 py-2 text-xs font-bold text-[#170000] focus:outline-none focus:border-[#FF2E2E] cursor-pointer"
                      >
                        {(availableKitProducts.length ? availableKitProducts : products).map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.stkCode || opt.id} — {opt.name} (৳{opt.basePrice})
                          </option>
                        ))}
                      </select>
                      <div className="text-[11px] font-mono text-[#524B4B] mt-1.5">
                        {variant.color} · {variant.gsm}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t-2 border-[#170000]/15">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-[#170000] tabular-nums">
                ৳{kitNetTotal.toLocaleString()}
              </span>
              <span className="font-mono text-sm text-[#524B4B] line-through tabular-nums">
                ৳{kitRawTotal.toLocaleString()}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#FF2E2E] text-white text-[11px] font-mono font-bold">
                -৳{storeSettings.bundle3DiscountBDT} + Free Delivery
              </span>
            </div>
            <p className="text-xs text-[#474040] mt-1">
              {language === 'en'
                ? 'Unlock another 10% off at checkout with code STARKIT10.'
                : 'চেকআউটে STARKIT10 কোডে আরও ১০% ছাড় পান।'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => addFullKit(false)}
              className="px-5 py-3 rounded-xl bg-[#170000] hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              {kitAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
              <span>{language === 'en' ? 'Add Full 3-Piece Kit' : '৩টি হুডি ব্যাগে যোগ করুন'}</span>
            </button>
            {onBuyNow && (
              <button
                type="button"
                onClick={() => addFullKit(true)}
                className="px-5 py-3 rounded-xl bg-[#FF2E2E] hover:bg-red-700 text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>{language === 'en' ? 'Express Checkout Kit' : 'সরাসরি কিট অর্ডার করুন'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Brand Book Pillars & Direct WhatsApp Query Desk */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: StarKiT Brand Book & Founder Story */}
        <div className="lg:col-span-6 rounded-3xl bg-[#170000] text-white border border-white/15 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#FF2E2E] mb-2">
              {STARKIT_BRAND_BOOK.arabicName} · Brand Book 2026
            </div>
            <h3 className="font-starkit text-3xl font-black uppercase tracking-tight mb-3">
              {STARKIT_BRAND_BOOK.tagline}
            </h3>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-6">
              {language === 'en' ? STARKIT_BRAND_BOOK.philosophyEn : STARKIT_BRAND_BOOK.philosophyBn}
            </p>

            <div className="space-y-3">
              {STARKIT_BRAND_BOOK.pillars.map((pillar) => (
                <div
                  key={pillar.code}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3"
                >
                  <span className="font-mono text-xs font-bold text-[#FF2E2E] mt-0.5">
                    {pillar.code}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {language === 'en' ? pillar.titleEn : pillar.titleBn}
                    </div>
                    <p className="text-xs text-white/70 mt-0.5">
                      {language === 'en' ? pillar.descEn : pillar.descBn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-white/15 flex items-center justify-between text-xs font-mono text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FF2E2E]" />
              Founded by {STARKIT_BRAND_BOOK.founder}
            </span>
            <span>{STARKIT_BRAND_BOOK.city}</span>
          </div>
        </div>

        {/* Right: Direct WhatsApp Query Desk + FAQ Accordion */}
        <div className="lg:col-span-6 space-y-6">
          {/* Direct WhatsApp Desk */}
          <div className="rounded-3xl bg-white text-[#170000] border-2 border-[#170000] p-6 sm:p-7 shadow-lg">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#128C7E] font-bold">
                  StarKiT Direct WhatsApp Desk
                </div>
                <h3 className="font-starkit text-2xl font-black uppercase">
                  {language === 'en' ? 'Ask or Order via WhatsApp' : 'হোয়াটসঅ্যাপে সরাসরি যোগাযোগ'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#128C7E]/10 text-[#0E7266] font-mono text-xs font-bold">
                {STARKIT_WHATSAPP_DISPLAY}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#524B4B] mb-1">
                  Topic
                </label>
                <select
                  value={waTopic}
                  onChange={(e) => setWaTopic(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#170000]/20 rounded-lg px-3 py-2 text-xs text-[#170000] focus:outline-none focus:border-[#170000]"
                >
                  <option>Order &amp; COD Confirmation</option>
                  <option>Sizing &amp; Fit Advice</option>
                  <option>University / Club Bulk Inquiry</option>
                  <option>48-Hour Size Exchange</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#524B4B] mb-1">
                  Design Reference
                </label>
                <select
                  value={waSku}
                  onChange={(e) => setWaSku(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#170000]/20 rounded-lg px-3 py-2 text-xs text-[#170000] focus:outline-none focus:border-[#170000]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.stkCode || p.id}>
                      {p.stkCode || p.id} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              rows={2}
              value={waNote}
              onChange={(e) => setWaNote(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Add delivery area, size, or custom batch quantity...'
                  : 'আপনার ঠিকানা, সাইজ বা প্রশ্ন লিখুন...'
              }
              className="w-full bg-[#FAF8F4] border border-[#170000]/20 rounded-lg px-3 py-2 text-xs text-[#170000] placeholder:text-[#777] focus:outline-none focus:border-[#170000] mb-3"
            />

            <a
              href={customWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#128C7E] hover:bg-[#0E7266] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {language === 'en'
                  ? `Launch WhatsApp Chat (${STARKIT_WHATSAPP_DISPLAY})`
                  : `হোয়াটসঅ্যাপ চ্যাট শুরু করুন (${STARKIT_WHATSAPP_DISPLAY})`}
              </span>
            </a>
          </div>

          {/* FAQ Accordion */}
          <div className="rounded-3xl bg-[#170000] text-white border border-white/15 p-6">
            <h4 className="font-starkit text-xl font-bold uppercase tracking-wide mb-4">
              {language === 'en' ? 'Frequently Asked Questions' : 'সাধারণ জিজ্ঞাসা'}
            </h4>
            <div className="divide-y divide-white/10">
              {STARKIT_FAQS.map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={faq.qEn} className="py-3 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left text-xs sm:text-sm font-semibold text-white hover:text-[#FF2E2E] transition-colors cursor-pointer"
                    >
                      <span>{language === 'en' ? faq.qEn : faq.qBn}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-[#FF2E2E]' : 'text-white/60'
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="text-xs text-white/75 leading-relaxed mt-2 pr-4">
                        {language === 'en' ? faq.aEn : faq.aBn}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
