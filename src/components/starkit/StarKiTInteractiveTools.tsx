import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  FileText,
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
  STARKIT_BRAND_BOOK_PDF,
  STARKIT_FAQS,
  STARKIT_SIZE_CHART,
  STARKIT_WHATSAPP_DISPLAY,
} from '../../data/starkitBrandData';
import { StarKiTSize } from './StarKiTCatalogGrid';
import { StarKiTLogo } from './StarKiTLogo';
import { useStoreData } from '../../context/StoreDataContext';
import {
  trackStarKiTContact,
  trackStarKiTCustomizeProduct,
} from '../../services/metaPixel';

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

  const kitOptionPool = availableKitProducts.length > 0 ? availableKitProducts : products;

  const [kitSlotIds, setKitSlotIds] = useState<[string, string, string]>(() => [
    kitOptionPool[0]?.id || 'FAB-H001',
    kitOptionPool[1]?.id || kitOptionPool[0]?.id || 'FAB-H002',
    kitOptionPool[2]?.id || kitOptionPool[0]?.id || 'FAB-H003',
  ]);
  const [kitSlotVariantSkus, setKitSlotVariantSkus] = useState<[string, string, string]>([
    '',
    '',
    '',
  ]);
  const [kitSize, setKitSize] = useState<StarKiTSize>('L');
  const [kitAdded, setKitAdded] = useState<boolean>(false);
  const [brokenKitImages, setBrokenKitImages] = useState<Record<string, boolean>>({});

  const resolvedKitEntries = useMemo(() => {
    return ([0, 1, 2] as const).map((slotIdx) => {
      const requestedId = kitSlotIds[slotIdx];
      const matched =
        kitOptionPool.find((p) => p.id === requestedId) ||
        kitOptionPool[slotIdx] ||
        kitOptionPool[0];
      if (!matched) return null;
      const requestedSku = kitSlotVariantSkus[slotIdx];
      const variant =
        matched.variants.find((v) => v.sku === requestedSku) || matched.variants[0];
      if (!variant) return null;
      return { product: matched, variant };
    });
  }, [kitOptionPool, kitSlotIds, kitSlotVariantSkus]);

  const kitItems = resolvedKitEntries.filter(
    (entry): entry is NonNullable<typeof entry> => entry !== null
  );
  const kitHasStock = availableKitProducts.length > 0 && kitItems.length > 0;
  const kitRawTotal = kitItems.reduce((sum, entry) => sum + entry.variant.priceBdt, 0);
  const kitNetTotal = Math.max(0, kitRawTotal - storeSettings.bundle3DiscountBDT);

  const addFullKit = (instantCheckout: boolean) => {
    if (!kitHasStock) return;
    trackStarKiTCustomizeProduct(
      `3-Piece Smart Kit (${kitItems.map((i) => i.variant.sku).join('+')}) Size ${kitSize}`
    );
    kitItems.forEach(({ product: p, variant: v }) => {
      const payload: Omit<CartItem, 'id'> = {
        productId: p.id,
        nameEn: `StarkiT ${p.name} Hoodie (${p.stkCode || v.sku})`,
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
    `Assalamu Alaikum StarkiT Desk!\nTopic: ${waTopic}\nProduct: ${waSku}\nNote: ${
      waNote.trim() || 'Please share stock & delivery confirmation.'
    }`
  );

  return (
    <div className="space-y-16">
      {/* 1. Find Your Fit Calculator + 48h Exchange Policy */}
      <section
        id="starkit-fit-lab"
        className="scroll-mt-24 rounded-3xl bg-[#170000] text-white border-2 border-[#170000] p-6 sm:p-10 shadow-[10px_10px_0px_#C7C1BF]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calculator Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#C7C1BF] mb-2">
                <Ruler className="w-3.5 h-3.5 text-white" />
                <span>{language === 'en' ? 'Find Your Fit Engine' : 'সঠিক সাইজ ক্যালকুলেটর'}</span>
              </div>
              <h3 className="font-starkit text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                {language === 'en'
                  ? 'Drop-Shoulder Fit Calculator'
                  : 'ড্রপ-শোল্ডার ফিট ক্যালকুলেটর'}
              </h3>
              <p className="text-xs sm:text-sm text-white/75 mt-1.5 max-w-xl">
                {language === 'en'
                  ? 'Select your height, weight, and desired silhouette to lock in your M–XXL StarkiT chest and length fit.'
                  : 'আপনার উচ্চতা, ওজন এবং পছন্দের ফিট অনুযায়ী M থেকে XXL সঠিক সাইজ নির্ধারণ করুন।'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Height */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/15">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#C7C1BF] mb-2">
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
                          ? 'bg-white text-[#170000] font-bold'
                          : 'bg-white/10 text-white/75 hover:bg-white/20'
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
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C7C1BF]">
                    {language === 'en' ? 'Body Weight' : 'ওজন'}
                  </span>
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
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
                  className="w-full h-1.5 bg-white/25 rounded appearance-none cursor-pointer accent-white my-3"
                />
                <span className="text-[10px] font-mono text-white/50">48 kg — 108 kg</span>
              </div>

              {/* Desired Drape */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/15">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-[#C7C1BF] mb-2">
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
                          : 'bg-white/10 text-white/75 hover:bg-white/20'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="p-5 rounded-2xl bg-white text-[#170000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-[#170000] shadow-[4px_4px_0px_#C7C1BF]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#524B4B] font-bold">
                  {language === 'en' ? 'Calculated StarkiT Fit' : 'আপনার উপযুক্ত সাইজ'}
                </div>
                <div className="flex flex-wrap items-baseline gap-3 mt-1">
                  <span className="font-starkit text-4xl font-extrabold">
                    Size {recommendedFit.size}
                  </span>
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
                      trackStarKiTCustomizeProduct(`Fit Calculator: Size ${recommendedFit.size} (${drapeStyle})`);
                      setAppliedSizeFeedback(true);
                      setTimeout(() => setAppliedSizeFeedback(false), 2000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#170000] hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors"
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
            <div className="rounded-2xl bg-white/5 border border-white/15 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/15 flex items-center justify-between text-xs font-mono">
                <span className="font-bold uppercase tracking-wider">
                  {language === 'en' ? 'Drop 01 Spec Sheet (Inches)' : 'ড্রপ ০১ সাইজ চার্ট (ইঞ্চি)'}
                </span>
                <span className="text-white font-semibold">330–350 GSM</span>
              </div>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/5 text-[#C7C1BF] text-[10px] uppercase">
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
                      <tr key={row.size} className={isRec ? 'bg-white text-[#170000] font-bold' : ''}>
                        <td className="px-4 py-2.5">
                          {row.size} {isRec ? '★' : ''}
                        </td>
                        <td className="px-4 py-2.5">{row.chestInches}&Prime;</td>
                        <td className="px-4 py-2.5">{row.lengthInches}&Prime;</td>
                        <td className="px-4 py-2.5">{row.shoulderInches}&Prime;</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white">
                  {language === 'en'
                    ? '48-Hour Size & Print Defect Exchange'
                    : '৪৮ ঘণ্টার সাইজ ও প্রিন্ট এক্সচেঞ্জ গ্যারান্টি'}
                </div>
                <p className="text-[11px] text-white/75 mt-1 leading-relaxed">
                  {language === 'en'
                    ? 'Wrong fit or minor stitching issue? Keep tags intact and message our WhatsApp Desk within 48 hours of delivery for instant size swap.'
                    : 'ডেলিভারির ৪৮ ঘণ্টার মধ্যে ট্যাগ অক্ষুণ্ন থাকা অবস্থায় সাইজ বা প্রিন্ট সমস্যা জানালে দ্রুত বদলে দেওয়া হবে।'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive 3-Piece Smart Kit Configurator */}
      <section className="rounded-3xl bg-white text-[#170000] border-2 border-[#170000] p-6 sm:p-10 shadow-[8px_8px_0px_#170000]">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 mb-8 border-b-2 border-[#170000]/15">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-[#524B4B] font-bold mb-1">
              <Layers className="w-3.5 h-3.5 text-[#170000]" />
              <span>{language === 'en' ? 'Smart Kit Builder' : 'স্মার্ট ৩-পিস কিট বিল্ডার'}</span>
            </div>
            <h3 className="font-starkit text-3xl sm:text-4xl font-bold uppercase tracking-tight">
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
                    : 'bg-[#ECEAEA] text-[#170000] hover:bg-[#C7C1BF]/60'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {([0, 1, 2] as const).map((slotIdx) => {
            const resolved = resolvedKitEntries[slotIdx];
            const selected = resolved?.product;
            const variant = resolved?.variant;
            const imgKey = `${slotIdx}-${variant?.sku || selected?.id || slotIdx}`;
            const isBroken = Boolean(brokenKitImages[imgKey]);
            return (
              <div
                key={slotIdx}
                className="p-4 rounded-2xl bg-[#ECEAEA]/55 border border-[#170000]/15 space-y-3"
              >
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#524B4B]">
                  <span>Slot 0{slotIdx + 1}</span>
                  <span className="text-[#170000] font-bold tabular-nums">
                    ৳{(variant?.priceBdt || selected?.basePrice || 0).toLocaleString()}
                  </span>
                </div>
                {selected && variant ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      {!isBroken ? (
                        <img
                          src={variant.previewImage}
                          alt={selected.name}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenKitImages((prev) => ({ ...prev, [imgKey]: true }))
                          }
                          className="w-16 h-20 object-cover rounded-xl border border-[#170000]/15 shrink-0 bg-[#170000]"
                        />
                      ) : (
                        <div className="w-16 h-20 rounded-xl border border-[#170000]/25 bg-[#170000] text-white flex flex-col items-center justify-center p-1 text-center shrink-0">
                          <span className="font-starkit text-[10px] font-bold uppercase leading-tight">
                            {selected.stkCode || variant.sku}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <select
                          value={selected.id}
                          aria-label={`Select hoodie for kit slot ${slotIdx + 1}`}
                          onChange={(e) => {
                            const nextIds = [...kitSlotIds] as [string, string, string];
                            nextIds[slotIdx] = e.target.value;
                            setKitSlotIds(nextIds);
                            const nextProd = kitOptionPool.find((p) => p.id === e.target.value);
                            const nextSkus = [...kitSlotVariantSkus] as [string, string, string];
                            nextSkus[slotIdx] = nextProd?.variants[0]?.sku || '';
                            setKitSlotVariantSkus(nextSkus);
                          }}
                          className="w-full bg-white border border-[#170000]/25 rounded-lg px-2.5 py-2 text-xs font-bold text-[#170000] focus:outline-none focus:border-[#170000] cursor-pointer"
                        >
                          {kitOptionPool.map((opt) => (
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

                    {selected.variants.length > 1 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {selected.variants.map((v) => {
                          const isActiveVar = v.sku === variant.sku;
                          return (
                            <button
                              key={v.sku}
                              type="button"
                              onClick={() => {
                                const nextSkus = [...kitSlotVariantSkus] as [string, string, string];
                                nextSkus[slotIdx] = v.sku;
                                setKitSlotVariantSkus(nextSkus);
                              }}
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer transition-colors ${
                                isActiveVar
                                  ? 'bg-[#170000] text-white border-[#170000] font-bold'
                                  : 'bg-white text-[#170000] border-[#170000]/20 hover:border-[#170000]'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-current/30 shrink-0"
                                style={{ backgroundColor: v.colorHex }}
                              />
                              <span>{v.color}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs font-mono text-[#524B4B] py-4">
                    {language === 'en' ? 'No hoodies available' : 'কোনো হুডি পাওয়া যায়নি'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t-2 border-[#170000]/15">
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-black text-[#170000] tabular-nums">
                ৳{kitNetTotal.toLocaleString()}
              </span>
              <span className="font-mono text-sm text-[#524B4B] line-through tabular-nums">
                ৳{kitRawTotal.toLocaleString()}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#170000] text-white text-[11px] font-mono font-bold tabular-nums">
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
              disabled={!kitHasStock}
              onClick={() => addFullKit(false)}
              className="px-5 py-3 rounded-xl border-2 border-[#170000] bg-white hover:bg-[#ECEAEA] text-[#170000] text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              {kitAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              <span>
                {kitAdded
                  ? language === 'en'
                    ? 'Added 3-Piece Kit'
                    : 'কিট ব্যাগে যোগ হয়েছে'
                  : language === 'en'
                  ? 'Add Full 3-Piece Kit'
                  : '৩টি হুডি ব্যাগে যোগ করুন'}
              </span>
            </button>
            {onBuyNow && (
              <button
                type="button"
                disabled={!kitHasStock}
                onClick={() => addFullKit(true)}
                className="px-5 py-3 rounded-xl bg-[#170000] hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
              >
                <Zap className="w-4 h-4" />
                <span>{language === 'en' ? 'Express Checkout Kit' : 'সরাসরি কিট অর্ডার করুন'}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Official StarkiT Brand Book Showcase (Pages 1–7) & Direct WhatsApp Query Desk */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Authentic Brand Book Specimen (Slides 2, 4, 5, 6, 7) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#ECEAEA] text-[#170000] border-2 border-[#170000] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_#170000]">
          {/* Header & Official Rectangular Logo Plaque */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#170000]/15">
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#524B4B] font-bold">
                StarkiT Brand Book · Official Identity
              </div>
              <StarKiTLogo variant="light-on-dark" size="sm" />
            </div>

            <a
              href={STARKIT_BRAND_BOOK_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#170000] hover:bg-neutral-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Brand Book PDF</span>
            </a>
          </div>

          {/* Page 2 Overview Quote & Narrative */}
          <div>
            <blockquote className="font-starkit text-2xl sm:text-3xl font-bold leading-snug text-[#170000]">
              {STARKIT_BRAND_BOOK.quoteEn}
            </blockquote>
            <p className="text-xs sm:text-sm text-[#3F3A3A] leading-relaxed mt-2">
              {language === 'en' ? STARKIT_BRAND_BOOK.overviewEn : STARKIT_BRAND_BOOK.overviewBn}
            </p>
          </div>

          {/* Page 4 & 5: Official 2-Color Palette Swatches + Primary Typeface */}
          <div className="rounded-2xl bg-white border border-[#170000]/15 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#524B4B] font-bold">
                Page 05 · Official Color System
              </span>
              <span className="text-[11px] font-starkit font-bold px-2.5 py-0.5 rounded bg-[#ECEAEA] text-[#170000]">
                Typeface: {STARKIT_BRAND_BOOK.primaryTypeface}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Swatch 1: Pure White */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full border-2 border-[#170000] shrink-0"
                  style={{ backgroundColor: STARKIT_BRAND_BOOK.colors.pureWhite.hex }}
                  aria-label="Pure White swatch"
                />
                <div className="text-[11px] font-mono leading-tight">
                  <div className="font-bold text-[#170000]">
                    {STARKIT_BRAND_BOOK.colors.pureWhite.name}
                  </div>
                  <div className="text-[#524B4B]">{STARKIT_BRAND_BOOK.colors.pureWhite.hex}</div>
                  <div className="text-[10px] text-[#777]">
                    RGB {STARKIT_BRAND_BOOK.colors.pureWhite.rgb}
                  </div>
                </div>
              </div>

              {/* Swatch 2: Jet Black */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full border-2 border-[#170000] shrink-0"
                  style={{ backgroundColor: STARKIT_BRAND_BOOK.colors.jetBlack.hex }}
                  aria-label="Jet Black swatch"
                />
                <div className="text-[11px] font-mono leading-tight">
                  <div className="font-bold text-[#170000]">
                    {STARKIT_BRAND_BOOK.colors.jetBlack.name}
                  </div>
                  <div className="text-[#524B4B]">{STARKIT_BRAND_BOOK.colors.jetBlack.hex}</div>
                  <div className="text-[10px] text-[#777]">
                    RGB {STARKIT_BRAND_BOOK.colors.jetBlack.rgb}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 7: Brand Voice — "Community, Style, Authenticity" */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#524B4B] font-bold">
                Page 07 · Values
              </span>
              <span className="font-starkit text-base font-bold text-[#170000]">
                Community, Style, Authenticity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Aesthetic Card (#C7C1BF exact slide fill) */}
              <div className="p-4 rounded-2xl bg-[#C7C1BF] text-[#170000] border border-[#170000]/15">
                <div className="text-[10px] font-mono uppercase tracking-widest font-bold mb-2">
                  Aesthetic
                </div>
                <ul className="space-y-1 font-starkit text-sm font-semibold">
                  {STARKIT_BRAND_BOOK.aestheticTraits.map((trait) => (
                    <li key={trait.en}>· {language === 'en' ? trait.en : trait.bn}</li>
                  ))}
                </ul>
              </div>

              {/* Tone of Voice Card (#FFFFFF exact slide fill) */}
              <div className="p-4 rounded-2xl bg-[#FFFFFF] text-[#170000] border border-[#170000]/15 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#524B4B] mb-2">
                    Tone of Voice
                  </div>
                  <ul className="space-y-1 font-starkit text-sm font-semibold">
                    {STARKIT_BRAND_BOOK.toneOfVoice.map((tone) => (
                      <li key={tone.en}>· {language === 'en' ? tone.en : tone.bn}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 mt-3 border-t border-[#170000]/10 flex items-center gap-1.5 text-[10px] font-mono text-[#524B4B]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#170000]" />
                  <span>{STARKIT_BRAND_BOOK.founder} · {STARKIT_BRAND_BOOK.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Direct WhatsApp Query Desk + FAQ Accordion */}
        <div className="lg:col-span-6 space-y-6">
          {/* Direct WhatsApp Desk */}
          <div className="rounded-3xl bg-white text-[#170000] border-2 border-[#170000] p-6 sm:p-7 shadow-[8px_8px_0px_#170000]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#524B4B] font-bold">
                  StarkiT Direct WhatsApp Desk
                </div>
                <h3 className="font-starkit text-2xl font-bold uppercase">
                  {language === 'en' ? 'Ask or Order via WhatsApp' : 'হোয়াটসঅ্যাপে সরাসরি যোগাযোগ'}
                </h3>
              </div>
              <a
                href={customWaLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackStarKiTContact('WhatsApp', `${waTopic} · ${waSku}`)}
                className="px-3 py-1 rounded-lg border border-[#170000] text-[#170000] hover:bg-[#170000] hover:text-white font-mono text-xs font-bold transition-colors whitespace-nowrap shrink-0"
              >
                {STARKIT_WHATSAPP_DISPLAY}
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label
                  htmlFor="starkit-wa-topic"
                  className="block text-[10px] font-mono uppercase text-[#524B4B] mb-1"
                >
                  Topic
                </label>
                <select
                  id="starkit-wa-topic"
                  value={waTopic}
                  onChange={(e) => setWaTopic(e.target.value)}
                  className="w-full bg-[#ECEAEA]/60 border border-[#170000]/20 rounded-lg px-3 py-2 text-xs text-[#170000] focus:outline-none focus:border-[#170000]"
                >
                  <option>Order &amp; COD Confirmation</option>
                  <option>Sizing &amp; Fit Advice</option>
                  <option>University / Club Bulk Inquiry</option>
                  <option>48-Hour Size Exchange</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="starkit-wa-sku"
                  className="block text-[10px] font-mono uppercase text-[#524B4B] mb-1"
                >
                  Design Reference
                </label>
                <select
                  id="starkit-wa-sku"
                  value={waSku}
                  onChange={(e) => setWaSku(e.target.value)}
                  className="w-full bg-[#ECEAEA]/60 border border-[#170000]/20 rounded-lg px-3 py-2 text-xs text-[#170000] focus:outline-none focus:border-[#170000]"
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
              className="w-full bg-[#ECEAEA]/60 border border-[#170000]/20 rounded-lg px-3 py-2 text-xs text-[#170000] placeholder:text-[#777] focus:outline-none focus:border-[#170000] mb-3"
            />

            <a
              href={customWaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStarKiTContact('WhatsApp', `${waTopic} · ${waSku}`)}
              className="w-full py-3 px-4 rounded-xl bg-[#170000] hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
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
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left text-xs sm:text-sm font-semibold text-white hover:text-[#C7C1BF] transition-colors cursor-pointer"
                    >
                      <span>{language === 'en' ? faq.qEn : faq.qBn}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-white' : 'text-white/60'
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
