import React, { useState, useEffect } from 'react';
import { X, Ruler, Sparkles, Check, HelpCircle, Info } from 'lucide-react';
import { Language } from '../../types';

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
  const [activeTab, setActiveTab] = useState<'streetwear' | 'unstitched' | 'kameez'>(defaultCategory);
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const [userChest, setUserChest] = useState<number>(39);
  const [fitPreference, setFitPreference] = useState<'slim' | 'regular' | 'relaxed'>('regular');

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

  if (!isOpen) return null;

  // Conversion helper
  const val = (inches: number) => {
    return unit === 'in' ? `${inches}"` : `${Math.round(inches * 2.54)} cm`;
  };

  // Sizing data calibrated for Fariza's Territory & StarKiT Bangladesh fit profiles
  const kameezSizes = [
    { size: '36 (S)', bustInches: 36, waist: 32, hip: 38, length: 42, shoulder: 14.0, sleeve: 18.5 },
    { size: '38 (M)', bustInches: 38, waist: 34, hip: 40, length: 43, shoulder: 14.5, sleeve: 19.0 },
    { size: '40 (L)', bustInches: 40, waist: 36, hip: 42, length: 44, shoulder: 15.0, sleeve: 19.5 },
    { size: '42 (XL)', bustInches: 42, waist: 38, hip: 44, length: 45, shoulder: 15.5, sleeve: 20.0 },
    { size: '44 (XXL)', bustInches: 44, waist: 40, hip: 46, length: 45, shoulder: 16.0, sleeve: 20.0 },
  ];

  const streetwearSizes = [
    { size: 'M', chestInches: 42, length: 27.5, shoulder: 20.5, fit: 'Contemporary Relaxed Fit' },
    { size: 'L', chestInches: 44, length: 28.5, shoulder: 21.5, fit: 'Drop-Shoulder Standard' },
    { size: 'XL', chestInches: 46.5, length: 29.5, shoulder: 22.5, fit: 'Architectural Oversized' },
  ];

  // Dynamic recommendation logic
  const getRecommendedSize = () => {
    let target = userChest;
    if (fitPreference === 'slim') target -= 1;
    if (fitPreference === 'relaxed') target += 1.5;

    if (activeTab === 'kameez') {
      if (target <= 36.5) return '36 (S)';
      if (target <= 38.5) return '38 (M)';
      if (target <= 40.5) return '40 (L)';
      if (target <= 42.5) return '42 (XL)';
      return '44 (XXL)';
    } else if (activeTab === 'streetwear') {
      if (target <= 40) return 'M';
      if (target <= 43) return 'L';
      return 'XL';
    }
    return null;
  };

  const recommendedSize = getRecommendedSize();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-3xl bg-[#171719] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-[#B69A60]" />
            <div>
              <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#F5F2EB] font-light">
                {language === 'en' ? 'Sartorial Size & Measurement Guide' : 'সার্টোরিয়াল সাইজ ও মাপ গাইড'}
              </h3>
              <p className="text-[11px] text-[#77777D] font-mono mt-0.5">
                {language === 'en'
                  ? 'Contemporary Bangladeshi Tailoring & Body Ergonomics'
                  : 'বাংলাদেশি আধুনিক ফিটিংস ও পরিমাপ নির্দেশিকা'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit Toggle (Inches / Centimeters) */}
            <div className="flex items-center bg-black/60 border border-white/15 rounded-lg p-0.5 text-xs font-mono">
              <button
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
            { id: 'unstitched', labelEn: "Fariza's 3-Piece Yardage", labelBn: 'ফারিজাস থ্রি-পিস কাপড়ের মাপ' },
            { id: 'kameez', labelEn: 'Tailored Kameez Reference', labelBn: 'টেইলর্ড কামিজ মাপ' },
          ].map((tab) => (
            <button
              key={tab.id}
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
          {/* Interactive Size Recommender Calculator (For Stitched Garments) */}
          {activeTab !== 'unstitched' && (
            <div className="p-4 rounded-xl bg-black/50 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#F5F2EB]">
                  <Sparkles className="w-3.5 h-3.5 text-[#B69A60]" />
                  <span>
                    {language === 'en'
                      ? 'Interactive Fit Recommender'
                      : 'ইন্টারেক্টিভ সাইজ ক্যালকুলেটর'}
                  </span>
                </div>

                {recommendedSize && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#B69A60]/20 border border-[#B69A60]/50 text-xs text-[#D5BA80] font-mono">
                    <Check className="w-3.5 h-3.5 text-[#B69A60]" />
                    <span>
                      {language === 'en' ? 'Recommended Fit:' : 'আপনার জন্য সেরা সাইজ:'}{' '}
                      <strong className="text-white font-bold">{recommendedSize}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Chest Slider */}
                <div>
                  <div className="flex justify-between text-[#77777D] mb-1.5 font-mono">
                    <span>
                      {language === 'en' ? 'Your Body Chest / Bust:' : 'আপনার বুকের মাপ:'}
                    </span>
                    <span className="text-[#D5BA80] font-bold">{val(userChest)}</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="50"
                    step="0.5"
                    value={userChest}
                    onChange={(e) => setUserChest(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#B69A60]"
                  />
                </div>

                {/* Fit Preference */}
                <div>
                  <div className="text-[#77777D] mb-1.5 font-mono">
                    {language === 'en' ? 'Fit Silhouette:' : 'ফিটিংস পছন্দ:'}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'slim', label: 'Slim' },
                      { id: 'regular', label: 'Regular' },
                      { id: 'relaxed', label: 'Relaxed' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFitPreference(f.id as any)}
                        className={`py-1 text-[11px] rounded transition-colors cursor-pointer ${
                          fitPreference === f.id
                            ? 'bg-[#B69A60] text-[#09090B] font-bold'
                            : 'bg-white/5 text-[#D8D3C9] hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      const isHighlighted = recommendedSize === row.size;
                      return (
                        <tr
                          key={row.size}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-[#B69A60]/15 font-semibold text-[#D5BA80]'
                              : 'hover:bg-white/5 text-[#D8D3C9]'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold">{row.size}</td>
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
                  <div className="text-xs text-[#77777D] font-mono">২ গজ ১২ গিরা · বহর ৩৬"-৪২"</div>
                  <p className="text-xs text-[#D8D3C9] mt-2 font-light">
                    Sufficient for all sizes up to 48" bust with full sleeves and tailored placket detailing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[#B69A60] font-mono text-xs uppercase mb-1">
                    02. Salwar Fabric (সালোয়ার)
                  </div>
                  <div className="text-xl font-serif-luxury text-[#F5F2EB] mb-1">2.50 Yards</div>
                  <div className="text-xs text-[#77777D] font-mono">২ গজ ৮ গিরা · বহর ৪২"</div>
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
            <div>
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
                      const isHighlighted = recommendedSize === row.size;
                      return (
                        <tr
                          key={row.size}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-[#B69A60]/15 font-semibold text-[#D5BA80]'
                              : 'hover:bg-white/5 text-[#D8D3C9]'
                          }`}
                        >
                          <td className="py-3 px-3 font-mono font-bold">{row.size}</td>
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

              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-[#77777D] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#B69A60] shrink-0 mt-0.5" />
                <span>
                  <strong>StarKiT 330–350 GSM One-Side Brushed Fleece:</strong> Generous contemporary block with pre-shrunk fleece construction for structured everyday drape.
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
            onClick={onClose}
            className="px-5 py-2 bg-[#F5F2EB] text-[#09090B] hover:bg-[#D5BA80] font-semibold uppercase tracking-wider rounded text-xs transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
