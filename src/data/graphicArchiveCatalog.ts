/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrandPartner } from '../types';
import {
  ImageIntegrityStatus,
  ReleaseReadinessGates,
  STARKIT_44_DESIGNS_META,
  STARKIT_44_VARIANTS,
  StarKiT44Variant,
  WorkingColorName,
} from './starkit44Catalog';
import { STARKIT_FABRIC_SPEC, STARKIT_PRIMARY_HOTLINE_DISPLAY, STARKIT_PRIMARY_HOTLINE_TEL } from './starkitBrandData';

export interface GraphicArchiveVariant {
  sku: string;
  stkSku: string;
  color: WorkingColorName;
  colorHex: string;
  priceBdt: number;
  imageFile: string;
  catalogPageImage: string;
  previewImage: string;
  fabric: string;
  gsm: string;
  fit: string;
  rightsClearance: string;
  adsReview: string;
  isProvisional: boolean;
  imageIntegrity: ImageIntegrityStatus;
  gates: ReleaseReadinessGates;
}

export interface GraphicArchiveProduct {
  id: string;
  stkCode: string;
  slug: string;
  sourceDesignName: string;
  designName: string;
  brand: BrandPartner;
  name: string;
  nameBn: string;
  editorial: string;
  category:
    | 'Anime Archive'
    | 'Playful Street'
    | 'Bangla Heritage'
    | 'Moto Culture'
    | 'City Stories'
    | 'Statement Graphics';
  basePrice: number;
  availableColors: WorkingColorName[];
  descriptionEn: string;
  descriptionBn: string;
  tags: string[];
  feature: string;
  priority: number;
  rightsNote: string;
  isLicensingRequired: boolean;
  commercialReleaseEligible: boolean;
  status: 'HOLD / NOT FOR PUBLIC SALES' | 'APPROVED';
  variants: GraphicArchiveVariant[];
  allColorSlots: StarKiT44Variant[];
}

export const GRAPHIC_ARCHIVE_HOTLINE = STARKIT_PRIMARY_HOTLINE_DISPLAY;
export const GRAPHIC_ARCHIVE_HOTLINE_TEL = STARKIT_PRIMARY_HOTLINE_TEL;

export const BUNDLE_PROMOTIONS = {
  buy2DiscountBdt: 150,
  buy3DiscountBdt: 300,
  freeShippingItemThreshold: 2,
  standardShippingDhakaBdt: 80,
  standardShippingOutsideDhakaBdt: 130,
};

const PRIORITY_BY_DESIGN: Record<string, number> = {
  'STK-H001': 3,
  'STK-H002': 1,
  'STK-H003': 1,
  'STK-H004': 3,
  'STK-H005': 3,
  'STK-H006': 2,
  'STK-H007': 1,
  'STK-H008': 3,
  'STK-H009': 1,
  'STK-H010': 3,
  'STK-H011': 3,
};

export const GRAPHIC_ARCHIVE_PRODUCTS: GraphicArchiveProduct[] = STARKIT_44_DESIGNS_META.map((meta) => {
  const allColorSlots = STARKIT_44_VARIANTS.filter((v) => v.designId === meta.designId);
  const documentedSlots = allColorSlots.filter((v) => v.isDocumented);

  const variants: GraphicArchiveVariant[] = documentedSlots.map((slot) => {
    const safePreview =
      slot.studioPreviewWebp ||
      slot.referenceCompositeWebp ||
      '/assets/aistudio/hoodie_preview_FAB-H001-BLK.png';
    return {
      sku: slot.legacySku,
      stkSku: slot.sku,
      color: slot.color,
      colorHex: slot.colorHex,
      priceBdt: slot.priceBdtProposed,
      imageFile: `${slot.sku}__91_studio_preview.webp`,
      catalogPageImage: slot.referenceCompositeWebp || safePreview,
      previewImage: safePreview,
      fabric: STARKIT_FABRIC_SPEC.fabricEn,
      gsm: STARKIT_FABRIC_SPEC.gsmShort,
      fit: 'Drop-shoulder silhouette (measurements unverified)',
      rightsClearance: meta.artworkRightsNote,
      adsReview: 'Hold until release gates pass',
      isProvisional: slot.isProvisional,
      imageIntegrity: slot.imageIntegrity,
      gates: slot.gates,
    };
  });

  return {
    id: meta.legacyId,
    stkCode: meta.designId,
    slug: meta.slug,
    sourceDesignName: meta.sourceDesignName,
    designName: meta.designName,
    brand: 'StarKiT',
    name: meta.designName,
    nameBn: meta.nameBn,
    editorial: meta.editorial,
    category: meta.category,
    basePrice: meta.priceBdtProposed,
    availableColors: meta.documentedColors,
    descriptionEn: meta.descriptionEn,
    descriptionBn: meta.descriptionBn,
    tags: meta.tags,
    feature: meta.feature,
    priority: PRIORITY_BY_DESIGN[meta.designId] ?? 2,
    rightsNote: meta.artworkRightsNote,
    isLicensingRequired: meta.isLicensingRequired,
    commercialReleaseEligible: !meta.isLicensingRequired,
    status: 'HOLD / NOT FOR PUBLIC SALES',
    variants,
    allColorSlots,
  };
});
