import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Ruler,
  Sparkles,
  Check,
  HelpCircle,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { Language } from '../../types';
import {
  STARKIT_FABRIC_SPEC,
  STARKIT_SIZE_CHART,
  STARKIT_SIZE_CHART_META,
} from '../../data/starkitBrandData';
import {
  calculateSmartSizeRecommendation,
  cmToFeetInches,
  FitPreference,
  kgToLbs,
} from '../../utils/sizeFinder';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  defaultCategory?: 'streetwear' | 'unstitched' | 'kameez';
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  language,
  defaultCategory = 'streetwear',
}) => {
  const [activeTab, setActiveTab] = useState<'streetwear' | 'unstitched' | 'kameez'>(
    defaultCategory
  );
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  // Smart Size Finder Inputs
  const [heightCm, setHeightCm] = useState<number>(171);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [fitPreference, setFitPreference] = useState<FitPreference>('regular');
  const [useManualChest, setUseManualChest] = useState<boolean>(false);
  const [manualChestInches, setManualChestInches] = useState<number>(39);

  useEffect(() => {
    setActiveTab(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const recommendation = useMemo(
    () =>
      calculateSmartSizeRecommendation({
        heightCm,
        weightKg,
        fitPreference,
        chestInchesOverride: useManualChest ? manualChestInches : null,
      }),
    [heightCm, weightKg, fitPreference, useManualChest, manualChestInches]
  );

  if (!isOpen) return null;

  const val = (inches: number) =>
    unit === 'in' ? `${inches}"` : `${Math.round(inches * 2.54)} cm`;

  const heightImperial = cmToFeetInches(heightCm);
  const weightLbs = kgToLbs(weightKg);

  const kameezSizes = [
    { size: '36 (S)', bustInches: 36, waist: 32, hip: 38, length: 42, shoulder: 14.0, sleeve: 18.5 },
    { size: '38 (M)', bustInches: 38, waist: 34, hip: 40, length: 43, shoulder: 14.5, sleeve: 19.0 },
    { size: '40 (L)', bustInches: 40, waist: 36, hip: 42, length: 44, shoulder: 15.0, sleeve: 19.5 },
    { size: '42 (XL)', bustInches: 42, waist: 38, hip: 44, length: 45, shoulder: 15.5, sleeve: 20.0 },
    { size: '44 (XXL)', bustInches: 44, waist: 40, hip: 46, length: 45, shoulder: 16.0, sleeve: 20.0 },
  ];

  const fitLabels: Record<'M' | 'L' | 'XL' | 'XXL', string> = {
    M: 'Contemporary Relaxed Fit',
    L: 'Drop-Shoulder Standard',
    XL: 'Architectural Oversized',
    XXL: 'Extended Boxy Street',
  };

  const streetwearSizes = STARKIT_SIZE_CHART.map((row) => ({
    size: row.size,
    chestInches: row.chestInches,
    length: row.lengthInches,
    shoulder: row.shoulderInches,
    fit: fitLabels[row.size],
  }));

  const isStarKiTTab = activeTab === 'streetwear';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-3xl bg-[#171719] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-[#B69A60]" />
            <div>
              <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#F5F2EB] font-light">
                {language === 'en'
                  ? 'Sartorial Size Guide & Smart Finder'
                  : 'স্মার্ট সাইজ ফাইন্ডার ও মেজারমেন্ট গাইড'}
              </h3>
              <p className="text-[11px] text-[#9A9892] font-mono mt-0.5">
                {language === 'en'
                  ? "Tailored Fit Matrix for StarKiT & Fariza's Territory (Bangladesh Proportions)"
                  : 'স্টারকিট ও ফারিজাস টেরিটরি — বাংলাদেশি বডি ফিট অনুপাত'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-black/60 border border-white/15 rounded-lg p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  unit === 'in'
                    ? 'bg-[#B69A60] text-[#09090B] font-bold'
                    : 'text-[#D8D3C9] hover:text-white'
                }`}
              >
                IN
              </button>
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-[#B69A60] text-[#09090B] font-bold'
                    : 'text-[#D8D3C9] hover:text-white'
                }`}
              >
                CM
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#D8D3C9] hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close size guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#09090B] px-5 sm:px-6 overflow-x-auto gap-2">
          {[
            { id: 'streetwear', labelEn: 'StarKiT Fleece Hoodies', labelBn: 'স্টারকিট ফ্লিস হুডি' },
            {
              id: 'unstitched',
              labelEn: "Fariza's 3-Piece Yardage",
              labelBn: 'ফারিজাস থ্রি-পিস কাপড়ের মাপ',
            },
            {
              id: 'kameez',
              labelEn: "Fariza's Tailored Kameez",
              labelBn: 'ফারিজাস টেইলর্ড কামিজ',
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'streetwear' | 'unstitched' | 'kameez')}
              className={`py-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#B69A60] text-[#D5BA80] font-semibold'
                  : 'border-transparent text-[#77777D] hover:text-[#F5F2EB]'
              }`}
            >
              {language === 'en' ? tab.labelEn : tab.labelBn}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Smart Size Finder Interactive Helper */}
          <div className="p-4 sm:p-5 rounded-xl bg-black/50 border border-[#B69A60]/35 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#D5BA80] font-bold">
                <Sparkles className="w-4 h-4 text-[#B69A60]" />
                <span>
                  {language === 'en' ? 'Smart Size Finder' : 'স্মার্ট সাইজ ফাইন্ডার'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUseManualChest((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#9A9892] hover:text-[#D5BA80] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>
                  {useManualChest
                    ? language === 'en'
                      ? 'Using manual chest/bust'
                      : 'ম্যানুয়াল বুক/বক্ষ মাপ চালু'
                    : language === 'en'
                    ? 'Fine-tune exact chest?'
                    : 'সঠিক বুকের মাপ দিন (ঐচ্ছিক)'}
                </span>
              </button>
            </div>

            {/* Height, Weight & Fit Preference Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Height Slider */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#9A9892]">
                    {language === 'en' ? 'Height' : 'উচ্চতা'}
                  </span>
                  <span className="text-[#F5F2EB] font-bold tabular-nums">
                    {heightCm} cm ({heightImperial.feet}&apos;{heightImperial.inches}&quot;)
                  </span>
                </div>
                <input
                  type="range"
                  min={145}
                  max={200}
                  step={1}
                  value={heightCm}
                  aria-label={language === 'en' ? 'Height in centimeters' : 'উচ্চতা (সেমি)'}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#B69A60]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#77777D]">
                  <span>145 cm (4&apos;9&quot;)</span>
                  <span>200 cm (6&apos;7&quot;)</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#9A9892]">
                    {language === 'en' ? 'Weight' : 'ওজন'}
                  </span>
                  <span className="text-[#F5F2EB] font-bold tabular-nums">
                    {weightKg} kg ({weightLbs} lbs)
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={125}
                  step={1}
                  value={weightKg}
                  aria-label={language === 'en' ? 'Weight in kilograms' : 'ওজন (কেজি)'}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#B69A60]"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#77777D]">
                  <span>40 kg</span>
                  <span>125 kg</span>
                </div>
              </div>

              {/* Fit Preference */}
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#9A9892]">
                    {language === 'en' ? 'Fit Preference' : 'ফিটিং পছন্দ'}
                  </span>
                  <span className="text-[#D5BA80] text-[10px] uppercase font-semibold">
                    {fitPreference}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'slim', en: 'Slim', bn: 'স্লিম' },
                      { id: 'regular', en: 'Regular', bn: 'রেগুলার' },
                      { id: 'oversized', en: 'Oversized', bn: 'ওভারসাইজ' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFitPreference(f.id)}
                      className={`py-1.5 px-1 text-[11px] font-mono rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        fitPreference === f.id
                          ? 'bg-[#B69A60] text-[#09090B] font-bold'
                          : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10'
                      }`}
                    >
                      {language === 'en' ? f.en : f.bn}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-mono text-[#77777D] tabular-nums">
                  {language === 'en'
                    ? `Est. Frame: ${recommendation.estimatedBodyChestInches}" chest`
                    : `আনুমানিক বুক: ${recommendation.estimatedBodyChestInches}"`}
                </div>
              </div>
            </div>

            {/* Optional Manual Chest Override */}
            {useManualChest && (
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 text-xs">
                <div className="flex items-center justify-between font-mono mb-1.5">
                  <span className="text-[#D8D3C9]">
                    {language === 'en'
                      ? 'Exact Body Chest / Bust Override:'
                      : 'নির্ভুল বুক / বক্ষের মাপ:'}
                  </span>
                  <span className="text-[#D5BA80] font-bold tabular-nums">
                    {val(manualChestInches)}
                  </span>
                </div>
                <input
                  type="range"
                  min={32}
                  max={50}
                  step={0.5}
                  value={manualChestInches}
                  onChange={(e) => setManualChestInches(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#B69A60]"
                />
              </div>
            )}

            {/* Dual Brand Size Recommendation Output */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* StarKiT Recommendation Card */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  isStarKiTTab
                    ? 'bg-[#B69A60]/15 border-[#B69A60]'
                    : 'bg-black/40 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D5BA80] font-bold">
                    StarKiT · Drop 01 Hoodie
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#B69A60] text-[#09090B] font-mono text-xs font-black">
                    <Check className="w-3 h-3" />
                    Size {recommendation.starkit.size}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#F5F2EB] tabular-nums">
                  {val(recommendation.starkit.garmentChestInches)} chest ·{' '}
                  {val(recommendation.starkit.lengthInches)} length ·{' '}
                  {val(recommendation.starkit.shoulderInches)} shoulder
                </div>
                <p className="text-[11px] text-[#9A9892] mt-1">
                  {language === 'en'
                    ? recommendation.starkit.fitProfileEn
                    : recommendation.starkit.fitProfileBn}
                </p>
              </div>

              {/* Fariza's Territory Recommendation Card */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  !isStarKiTTab
                    ? 'bg-[#B69A60]/15 border-[#B69A60]'
                    : 'bg-black/40 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D5BA80] font-bold">
                    Fariza&apos;s Territory · 3-Piece
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#B69A60] text-[#09090B] font-mono text-xs font-black">
                    <Check className="w-3 h-3" />
                    {recommendation.fariza.kameezSize}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#F5F2EB] tabular-nums">
                  {language === 'en'
                    ? `Stitched Chest: ${recommendation.fariza.chestOption} · Unstitched fits up to 48"`
                    : `টেইলর্ড বডি: ${recommendation.fariza.chestOption} · আনস্টিচড ৪৮" পর্যন্ত`}
                </div>
                <p className="text-[11px] text-[#9A9892] mt-1">
                  {language === 'en'
                    ? recommendation.fariza.fitProfileEn
                    : recommendation.fariza.fitProfileBn}
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono text-[#9A9892]">
              {language === 'en' ? recommendation.rationaleEn : recommendation.rationaleBn}
            </div>
          </div>

          {/* Sizing Tables */}
          {activeTab === 'kameez' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/15 text-[#77777D] font-mono uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Bust (বক্ষ)</th>
                      <th className="py-2.5 px-3">Waist (কোমর)</th>
                      <th className="py-2.5 px-3">Hip (হিপ)</th>
                      <th className="py-2.5 px-3">Length (লম্বা)</th>
                      <th className="py-2.5 px-3">Shoulder</th>
                      <th className="py-2.5 px-3">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {kameezSizes.map((row) => {
                      const isHighlighted = recommendation.fariza.kameezSize === row.size;
                      return (
                        <tr
                          key={row.size}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-[#B69A60]/15 font-semibold text-[#D5BA80]'
                              : 'hover:bg-white/5 text-[#D8D3C9]'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold">
                            {row.size}
                            {isHighlighted && (
                              <span className="ml-1.5 text-[10px] uppercase text-[#B69A60]">
                                ★ Match
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums text-white">
                            {val(row.bustInches)}
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums">{val(row.waist)}</td>
                          <td className="py-3 px-3 font-mono tabular-nums">{val(row.hip)}</td>
                          <td className="py-3 px-3 font-mono tabular-nums">{val(row.length)}</td>
                          <td className="py-3 px-3 font-mono tabular-nums">{val(row.shoulder)}</td>
                          <td className="py-3 px-3 font-mono tabular-nums">{val(row.sleeve)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-[#77777D] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#B69A60] shrink-0 mt-0.5" />
                <span>
                  <strong>Contemporary Silhouette:</strong> Clean A-line or straight side-slit cuts
                  proportioned for comfortable movement with solid contrast salwars.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'unstitched' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#B69A60] font-mono text-xs uppercase mb-1">
                    01. Kameez Fabric (কামিজ)
                  </div>
                  <div className="text-xl font-serif-luxury text-[#F5F2EB] mb-1">2.75 Yards</div>
                  <div className="text-xs text-[#77777D] font-mono">২ গজ ১২ গিরা · বহর ৩৬&quot;-৪২&quot;</div>
                  <p className="text-xs text-[#D8D3C9] mt-2 font-light">
                    Sufficient for all sizes up to 48&quot; bust with full sleeves and tailored placket detailing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#B69A60] font-mono text-xs uppercase mb-1">
                    02. Salwar Fabric (সালোয়ার)
                  </div>
                  <div className="text-xl font-serif-luxury text-[#F5F2EB] mb-1">2.50 Yards</div>
                  <div className="text-xs text-[#77777D] font-mono">২ গজ ৮ গিরা · বহর ৪২&quot;</div>
                  <p className="text-xs text-[#D8D3C9] mt-2 font-light">
                    High thread-count cotton suitable for cigarette pants, pleated salwars, or relaxed palazzos.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#B69A60] font-mono text-xs uppercase mb-1">
                    03. Dupatta (ওড়না)
                  </div>
                  <div className="text-xl font-serif-luxury text-[#F5F2EB] mb-1">2.50 Yards (5 Haat)</div>
                  <div className="text-xs text-[#77777D] font-mono">৫ হাত বহর · প্রি-ফিনিশড ট্যাসেল</div>
                  <p className="text-xs text-[#D8D3C9] mt-2 font-light">
                    Standard 5-haat luxury lawn/voile dupatta with finished printed borders and hanging tassels.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#D8D3C9] space-y-2">
                <div className="font-semibold text-white">
                  {language === 'en'
                    ? 'Tailoring Instructions for Unstitched Sets:'
                    : 'আনস্টিচড কাপড়ের সেলাই পরামর্শ:'}
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[#77777D]">
                  <li>
                    Pre-wash cotton fabrics in cold water prior to stitching to account for natural initial shrinkage.
                  </li>
                  <li>
                    Separate sleeve cloths are pre-allocated on the print design for seamless arm pattern alignment.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'streetwear' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/35 text-xs text-amber-200 font-mono">
                <strong className="uppercase">
                  {language === 'en'
                    ? STARKIT_SIZE_CHART_META.badgeEn
                    : STARKIT_SIZE_CHART_META.badgeBn}
                  :
                </strong>{' '}
                {language === 'en'
                  ? STARKIT_SIZE_CHART_META.noticeEn
                  : STARKIT_SIZE_CHART_META.noticeBn}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/15 text-[#77777D] font-mono uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Chest Width</th>
                      <th className="py-2.5 px-3">Body Length</th>
                      <th className="py-2.5 px-3">Drop Shoulder</th>
                      <th className="py-2.5 px-3">Fit Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {streetwearSizes.map((row) => {
                      const isHighlighted = recommendation.starkit.size === row.size;
                      return (
                        <tr
                          key={row.size}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-[#B69A60]/15 font-semibold text-[#D5BA80]'
                              : 'hover:bg-white/5 text-[#D8D3C9]'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold">
                            {row.size}
                            {isHighlighted && (
                              <span className="ml-1.5 text-[10px] uppercase text-[#B69A60]">
                                ★ Match
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums text-white">
                            {val(row.chestInches)}
                          </td>
                          <td className="py-3 px-3 font-mono tabular-nums">{val(row.length)}</td>
                          <td className="py-3 px-3 font-mono tabular-nums">{val(row.shoulder)}</td>
                          <td className="py-3 px-3 text-[#77777D]">{row.fit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-[#77777D] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#B69A60] shrink-0 mt-0.5" />
                <span>
                  <strong>{STARKIT_FABRIC_SPEC.gsmShort}:</strong>{' '}
                  {language === 'en' ? STARKIT_FABRIC_SPEC.fabricEn : STARKIT_FABRIC_SPEC.fabricBn}
                </span>
              </div>
            </div>
          )}

          {/* How to Measure Quick Visual Guide */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs uppercase tracking-wider text-[#D5BA80] font-mono font-semibold mb-3 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>
                {language === 'en'
                  ? 'How to Measure Accurately (বডি মেজারমেন্ট নিয়ম)'
                  : 'সঠিক মাপ নেওয়ার নিয়মাবলী'}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#77777D]">
              <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                <strong className="text-[#F5F2EB] block mb-1">1. Chest / Bust (বুক)</strong>
                Measure around the fullest part of your chest, keeping the tape horizontal and relaxed.
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                <strong className="text-[#F5F2EB] block mb-1">2. Shoulder (কাঁধ)</strong>
                Measure across the back from the tip of one shoulder bone to the opposite shoulder bone.
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                <strong className="text-[#F5F2EB] block mb-1">3. Length (ঝুল / লম্বা)</strong>
                Measure from the highest point of the shoulder near the neck seam straight down to your desired hemline.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-[#77777D]">
          <span>Made for contemporary South Asian &amp; Bangladeshi body proportions</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] font-semibold uppercase tracking-wider rounded text-xs transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Got It' : 'বুঝেছি'}
          </button>
        </div>
      </div>
    </div>
  );
};
