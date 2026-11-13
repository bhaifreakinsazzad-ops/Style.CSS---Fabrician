/**
 * Safe catalog bootstrap: all products are drafted with zero available stock.
 * Usage: FABRICIAN_SEED_CONFIRM=YES SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun scripts/seed-fabrician.ts
 * ONLY run against a dedicated, empty Fabrician project after schema migration.
 */
import { GRAPHIC_ARCHIVE_PRODUCTS } from '../src/data/graphicArchiveCatalog';
import { THREE_PIECE_CATALOG } from '../src/data/threePieceCatalog';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (process.env.FABRICIAN_SEED_CONFIRM !== 'YES' || !url || !key) {
  throw new Error('Seed refused: set FABRICIAN_SEED_CONFIRM=YES and the two server-only Supabase variables.');
}
if (!url.startsWith('https://') || !url.includes('.supabase.co')) throw new Error('Invalid Supabase project URL');
const endpoint = url.replace(/\/$/, '') + '/rest/v1';
const headers = {
  apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
  Prefer: 'resolution=ignore-duplicates,return=minimal',
};
async function insertRows(table: string, rows: unknown[]) {
  const response = await fetch(`${endpoint}/${table}`, {
    method: 'POST', headers, body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(`${table} failed: HTTP ${response.status} ${(await response.text()).slice(0,200)}`);
}
const products = [
  ...GRAPHIC_ARCHIVE_PRODUCTS.map(p => ({
    id: p.id, brand: p.brand, name_en: `${p.name} Hoodie`,
    name_bn: `${p.name} হুডি`, category: p.category,
    description_en: p.descriptionEn, image_url: p.variants[0].previewImage,
    status: 'draft', rights_cleared: false,
  })),
  ...THREE_PIECE_CATALOG.map(p => ({
    id: p.id, brand: p.brand, name_en: p.nameEn, name_bn: p.nameBn,
    category: p.subCollection, description_en: p.descriptionEn,
    image_url: p.flatLayImage, status: 'draft', rights_cleared: false,
  })),
];
const hoodieVariants = GRAPHIC_ARCHIVE_PRODUCTS.flatMap(p =>
  p.variants.flatMap(v => ['M', 'L', 'XL'].map(size => ({
    sku: `${v.sku}-${size}`, product_id: p.id, color: v.color, size,
    price_bdt: v.priceBdt, stock_count: 0, enabled: false,
  }))),
);
const threePieceVariants = THREE_PIECE_CATALOG.map(p => ({
  sku: `${p.code}-SET`, product_id: p.id, color: 'As pictured', size: 'Unstitched Set',
  price_bdt: p.priceBDT, stock_count: 0, enabled: false,
}));
if (new Set(products.map(p => p.id)).size !== products.length ||
    new Set([...hoodieVariants, ...threePieceVariants].map(v => v.sku)).size !== hoodieVariants.length + threePieceVariants.length) {
  throw new Error('Catalog contains duplicate IDs/SKUs');
}
console.log(`Preparing ${products.length} products and ${hoodieVariants.length+threePieceVariants.length} SKUs as DRAFT (zero stock).`);
await insertRows('fabrician_products', products);
await insertRows('fabrician_variants', [...hoodieVariants, ...threePieceVariants]);
console.log('Seed complete. Verify products, rights, pricing, actual stock and publish deliberately in Supabase.');
