import { STARKIT_SIZE_CHART } from '../data/starkitBrandData';
import type { FarizaChestSize } from '../data/farizaBrandData';

export type FitPreference = 'slim' | 'regular' | 'oversized';
export type StarKiTRecommendedSize = 'M' | 'L' | 'XL' | 'XXL';
export type FarizaKameezSizeLabel =
  | '36 (S)'
  | '38 (M)'
  | '40 (L)'
  | '42 (XL)'
  | '44 (XXL)';

export interface SmartSizeInput {
  heightCm: number;
  weightKg: number;
  fitPreference: FitPreference;
  chestInchesOverride?: number | null;
}

export interface SmartSizeRecommendation {
  estimatedBodyChestInches: number;
  effectiveFitChestInches: number;
  bmi: number;
  starkit: {
    size: StarKiTRecommendedSize;
    garmentChestInches: number;
    lengthInches: number;
    shoulderInches: number;
    fitProfileEn: string;
    fitProfileBn: string;
  };
  fariza: {
    kameezSize: FarizaKameezSizeLabel;
    chestOption: FarizaChestSize;
    bustInches: number;
    unstitchedNoteEn: string;
    unstitchedNoteBn: string;
    fitProfileEn: string;
    fitProfileBn: string;
  };
  rationaleEn: string;
  rationaleBn: string;
}

export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(clampNumber(cm, 120, 230) / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = clampNumber(feet, 4, 7) * 12 + clampNumber(inches, 0, 11);
  return Math.round(totalInches * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

const STARKIT_ORDER: readonly StarKiTRecommendedSize[] = ['M', 'L', 'XL', 'XXL'];

export function calculateSmartSizeRecommendation(
  input: SmartSizeInput
): SmartSizeRecommendation {
  const heightCm = clampNumber(input.heightCm, 140, 210);
  const weightKg = clampNumber(input.weightKg, 35, 140);
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  // Estimate body chest/bust circumference calibrated for South Asian body proportions
  const derivedChestInches = Number(
    clampNumber(26.5 + weightKg * 0.165 + (heightCm - 150) * 0.08, 32, 52).toFixed(1)
  );
  const bodyChestInches =
    typeof input.chestInchesOverride === 'number' && Number.isFinite(input.chestInchesOverride)
      ? clampNumber(input.chestInchesOverride, 32, 52)
      : derivedChestInches;

  // 1. StarKiT Drop-Shoulder Hoodie Sizing (M, L, XL, XXL)
  const hoodieFitOffset =
    input.fitPreference === 'slim'
      ? -1.5
      : input.fitPreference === 'oversized'
      ? 2.25
      : 0;
  const hoodieScoreChest = bodyChestInches + hoodieFitOffset;

  let starKiTIndex = 0; // M
  if (hoodieScoreChest > 43.2) {
    starKiTIndex = 3; // XXL
  } else if (hoodieScoreChest > 41.0) {
    starKiTIndex = 2; // XL
  } else if (hoodieScoreChest > 38.6) {
    starKiTIndex = 1; // L
  }

  // Height & weight guardrails so sleeves and body hem remain comfortable
  if (heightCm >= 186 || weightKg >= 104) {
    starKiTIndex = Math.max(starKiTIndex, 3);
  } else if (heightCm >= 179 || weightKg >= 88) {
    starKiTIndex = Math.max(starKiTIndex, 2);
  } else if (heightCm >= 172 && input.fitPreference !== 'slim') {
    starKiTIndex = Math.max(starKiTIndex, 1);
  }

  // Oversized streetwear preference steps up one cut when feasible
  if (input.fitPreference === 'oversized' && starKiTIndex < 3 && weightKg >= 56) {
    starKiTIndex = Math.min(3, starKiTIndex + 1);
  }

  const starKiTSize = STARKIT_ORDER[starKiTIndex];
  const starKiTRow =
    STARKIT_SIZE_CHART.find((r) => r.size === starKiTSize) || STARKIT_SIZE_CHART[1];

  const starkitFitText: Record<FitPreference, { en: string; bn: string }> = {
    slim: {
      en: 'Closer shoulder line with minimal excess drape',
      bn: 'শরীরের সাথে মানানসই স্লিম ড্রপ-শোল্ডার কাট',
    },
    regular: {
      en: 'Balanced drop-shoulder silhouette with breathable fleece room',
      bn: 'সঠিক ড্রপ-শোল্ডার ও আরামদায়ক রেগুলার ফিট',
    },
    oversized: {
      en: 'Boxy archival street drape with extra sleeve & chest ease',
      bn: 'ঢিলেঢালা ওভারসাইজড স্ট্রিটওয়্যার লুক',
    },
  };

  // 2. Fariza's Territory Custom Kameez / 3-Piece Tailoring Sizing (36-44)
  const kameezFitOffset =
    input.fitPreference === 'slim'
      ? -0.75
      : input.fitPreference === 'oversized'
      ? 2.0
      : 0.5;
  const kameezTargetBust = bodyChestInches + kameezFitOffset;

  let kameezSize: FarizaKameezSizeLabel = '36 (S)';
  let chestOption: FarizaChestSize = '36"';
  let bustInches = 36;

  if (kameezTargetBust <= 36.8) {
    kameezSize = '36 (S)';
    chestOption = '36"';
    bustInches = 36;
  } else if (kameezTargetBust <= 38.8) {
    kameezSize = '38 (M)';
    chestOption = '38"';
    bustInches = 38;
  } else if (kameezTargetBust <= 40.8) {
    kameezSize = '40 (L)';
    chestOption = '40"';
    bustInches = 40;
  } else if (kameezTargetBust <= 42.8) {
    kameezSize = '42 (XL)';
    chestOption = '42"';
    bustInches = 42;
  } else {
    kameezSize = '44 (XXL)';
    chestOption = '44"';
    bustInches = 44;
  }

  const farizaFitText: Record<FitPreference, { en: string; bn: string }> = {
    slim: {
      en: 'Contoured side-slit tailoring close to your natural bust & waist',
      bn: 'শরীরের গড়নের সাথে মানানসই স্লিম কামিজ কাটিং',
    },
    regular: {
      en: 'Classic graceful A-line ease suited for all-day Dhaka comfort',
      bn: 'সারাদিন আরামদায়ক পরার উপযোগী রেগুলার কাটিং',
    },
    oversized: {
      en: 'Breezy relaxed kameez ease with generous shoulder and sleeve movement',
      bn: 'খোলামেলা ও আরামদায়ক ওভারসাইজড ড্রেপ',
    },
  };

  const { feet, inches } = cmToFeetInches(heightCm);
  const fitLabelEn =
    input.fitPreference === 'slim'
      ? 'Slim'
      : input.fitPreference === 'oversized'
      ? 'Oversized'
      : 'Regular';
  const fitLabelBn =
    input.fitPreference === 'slim'
      ? 'স্লিম'
      : input.fitPreference === 'oversized'
      ? 'ওভারসাইজড'
      : 'রেগুলার';

  return {
    estimatedBodyChestInches: bodyChestInches,
    effectiveFitChestInches: Number(hoodieScoreChest.toFixed(1)),
    bmi,
    starkit: {
      size: starKiTSize,
      garmentChestInches: starKiTRow.chestInches,
      lengthInches: starKiTRow.lengthInches,
      shoulderInches: starKiTRow.shoulderInches,
      fitProfileEn: starkitFitText[input.fitPreference].en,
      fitProfileBn: starkitFitText[input.fitPreference].bn,
    },
    fariza: {
      kameezSize,
      chestOption,
      bustInches,
      unstitchedNoteEn:
        'Unstitched 2.75 yd Kameez cloth tailors comfortably up to 48" bust.',
      unstitchedNoteBn:
        'আনস্টিচড ২.৭৫ গজ কাপড়ে ৪৮" বক্ষ পর্যন্ত সহজেই তৈরি করা যায়।',
      fitProfileEn: farizaFitText[input.fitPreference].en,
      fitProfileBn: farizaFitText[input.fitPreference].bn,
    },
    rationaleEn: `Calibrated for ${heightCm} cm (${feet}'${inches}"), ${weightKg} kg, and a ${fitLabelEn} fit preference (est. ${bodyChestInches}" frame).`,
    rationaleBn: `${heightCm} সেমি (${feet}'${inches}"), ${weightKg} কেজি ও ${fitLabelBn} ফিট পছন্দ অনুযায়ী নির্ধারিত (আনুমানিক বুক ${bodyChestInches}")।`,
  };
}
