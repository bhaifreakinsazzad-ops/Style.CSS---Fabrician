/**
 * Idempotent StarkiT DROP 01 (44-Variant / 176 Size-SKU / 67 Planned Media) Importer
 *
 * All imported products start in State A:
 *   status = 'draft', rights_cleared = false, stock_count = 0, enabled = false,
 *   publication_status = 'HOLD / NOT FOR PUBLIC SALES'
 * STK-H012 ("Kinetic Stage") is explicitly excluded per source hierarchy rules.
 *
 * Usage:
 *   STARKIT_IMPORT_CONFIRM=YES SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun scripts/import-starkit-44.ts
 */
import {
  STARKIT_44_DESIGNS_META,
  STARKIT_44_VARIANTS,
  STARKIT_MEDIA_MANIFEST,
} from '../src/data/starkit44Catalog';
import { STARKIT_BRAND_BOOK } from '../src/data/starkitBrandData';

const SIZES = ['M', 'L', 'XL', 'XXL'] as const;

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (process.env.STARKIT_IMPORT_CONFIRM !== 'YES' || !url || !key) {
  throw new Error(
    'Import refused: set STARKIT_IMPORT_CONFIRM=YES, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY.'
  );
}
if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
  throw new Error('Invalid SUPABASE_URL');
}

const endpoint = url.replace(/\/$/, '') + '/rest/v1';
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
};

async function upsertRows(table: string, rows: unknown[], conflictCols: string) {
  const response = await fetch(`${endpoint}/${table}?on_conflict=${encodeURIComponent(conflictCols)}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(rows),
  });
  if (!response.ok) {
    throw new Error(`${table} failed: HTTP ${response.status} ${(await response.text()).slice(0, 240)}`);
  }
}

const collectionRow = {
  id: 'starkit-drop-01',
  brand: STARKIT_BRAND_BOOK.brandName,
  slug: 'drop-01-graphic-archive',
  name_en: STARKIT_BRAND_BOOK.collectionName,
  name_bn: 'ড্রপ ০১ / দ্য গ্রাফিক আর্কাইভ',
  tagline: STARKIT_BRAND_BOOK.taglinePrimary,
  is_active: false, // Holds until State B release sign-off
};

const productRows = STARKIT_44_DESIGNS_META.map((d) => {
  const firstColor = d.documentedColors[0];
  const heroImage = (firstColor && d.sheetPages[firstColor]) || '';
  return {
    id: d.legacyId,
    design_id: d.designId,
    slug: d.slug,
    editorial: d.editorial,
    collection_id: 'starkit-drop-01',
    brand: 'StarKiT',
    name_en: `${d.designName} Hoodie`,
    name_bn: d.nameBn,
    category: d.category,
    description_en: d.descriptionEn,
    image_url: heroImage,
    status: 'draft',
    rights_cleared: false,
    publication_status: 'HOLD / NOT FOR PUBLIC SALES',
    sample_verified: false,
    spec_verified: false,
    size_chart_approved: false,
    commercial_terms_approved: false,
    is_licensing_required: d.isLicensingRequired,
    artwork_rights_note: d.artworkRightsNote,
  };
});

const variantRows = STARKIT_44_VARIANTS.flatMap((slot) =>
  SIZES.map((size) => ({
    sku: `${slot.sku}-${size}`,
    legacy_sku: `${slot.legacySku}-${size}`,
    slot_id: slot.slotId,
    product_id: slot.legacyProductId,
    color: slot.color,
    color_code: slot.colorCode,
    color_hex: slot.colorHex,
    size,
    price_bdt: slot.priceBdtProposed,
    stock_count: 0,
    enabled: false,
    is_documented: slot.isDocumented,
    is_provisional: slot.isProvisional,
    asset_status: slot.assetStatus,
    image_integrity: slot.imageIntegrity,
    asset_verified: slot.gates.assetVerified,
    sample_verified: false,
    rights_verified: false,
  }))
);

const imageRows = STARKIT_MEDIA_MANIFEST.map((m, idx) => {
  const matchedDesign = STARKIT_44_DESIGNS_META.find((d) => d.designId === m.designId);
  const productId = matchedDesign?.legacyId || m.designId;
  // Tie FK to the M-size variant of the colorway slot (exists across all 44 slots)
  return {
    product_id: productId,
    variant_sku: `${m.sku}-M`,
    color: m.color,
    view_type: m.view,
    site_asset_path: m.siteAssetPath,
    zip_relative_path: m.zipRelativePath,
    exists_locally: m.existsLocally,
    is_verified: m.existsLocally && m.sku !== 'STK-H008-MRN' && m.sku !== 'STK-H008-BRN',
    sort_order: idx + 1,
  };
});

async function run() {
  if (productRows.length !== 11) {
    throw new Error(`Expected 11 designs (STK-H001..STK-H011), found ${productRows.length}`);
  }
  if (variantRows.length !== 176) {
    throw new Error(`Expected 176 variant-size rows (44 slots x 4 sizes), found ${variantRows.length}`);
  }
  if (imageRows.length !== 67) {
    throw new Error(`Expected 67 planned media manifest rows, found ${imageRows.length}`);
  }

  console.log(
    `Importing StarkiT DROP 01: 1 collection, ${productRows.length} designs, ${variantRows.length} SKUs (44 colorways × 4 sizes), ${imageRows.length} media manifest rows...`
  );
  await upsertRows('fabrician_collections', [collectionRow], 'id');
  await upsertRows('fabrician_products', productRows, 'id');
  await upsertRows('fabrician_variants', variantRows, 'sku');
  await upsertRows('fabrician_product_images', imageRows, 'variant_sku,view_type,site_asset_path');
  console.log('StarkiT 44-variant pre-launch import complete. All items held in State A until owner sign-off.');
}

void run();
