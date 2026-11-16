import { test, expect } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import {
  EXCLUDED_HTML_DISCREPANCY,
  STARKIT_44_DESIGNS_META,
  STARKIT_44_VARIANTS,
  STARKIT_ARCHIVE_SUMMARY,
  STARKIT_MEDIA_MANIFEST,
  findStarKiTDesign,
} from '../src/data/starkit44Catalog.ts';
import { GRAPHIC_ARCHIVE_PRODUCTS } from '../src/data/graphicArchiveCatalog.ts';
import { STARKIT_FABRIC_SPEC, STARKIT_SIZE_CHART, STARKIT_SIZE_CHART_META } from '../src/data/starkitBrandData.ts';

test('StarkiT DROP 01 contains exactly 11 designs and 44 canonical colorway slots', () => {
  expect(STARKIT_44_DESIGNS_META.length).toBe(11);
  expect(GRAPHIC_ARCHIVE_PRODUCTS.length).toBe(11);
  expect(STARKIT_44_VARIANTS.length).toBe(44);
  expect(STARKIT_ARCHIVE_SUMMARY.documentedVariantCount).toBe(15);
  expect(STARKIT_ARCHIVE_SUMMARY.provisionalVariantCount).toBe(29);
  expect(STARKIT_MEDIA_MANIFEST.length).toBe(67);
});

test('STK-H012 Kinetic Stage discrepancy remains strictly excluded from production catalog', () => {
  expect(EXCLUDED_HTML_DISCREPANCY.htmlExtraDesignId).toBe('STK-H012');
  expect(EXCLUDED_HTML_DISCREPANCY.authoritativeCatalogInclusion).toBe(false);
  expect(STARKIT_44_DESIGNS_META.some((d) => d.designId === 'STK-H012')).toBe(false);
  expect(GRAPHIC_ARCHIVE_PRODUCTS.some((p) => p.stkCode === 'STK-H012')).toBe(false);
  expect(findStarKiTDesign('STK-H012')).toBeUndefined();
});

test('All 29 provisional slots are held, non-orderable, and never reuse black imagery', () => {
  const provisional = STARKIT_44_VARIANTS.filter((v) => v.isProvisional);
  expect(provisional.length).toBe(29);
  for (const slot of provisional) {
    expect(slot.studioPreviewWebp).toBeNull();
    expect(slot.referenceCompositeWebp).toBeNull();
    expect(slot.imageIntegrity).toBe('PROVISIONAL_NO_ASSETS');
    expect(slot.gates.publicationStatus).toBe('HOLD / NOT FOR PUBLIC SALES');
    expect(slot.inventoryQty).toBeNull();
  }
});

test('STK-H008-MRN and STK-H008-BRN are flagged as duplicate black placeholders without studio preview links', () => {
  for (const sku of ['STK-H008-MRN', 'STK-H008-BRN']) {
    const slot = STARKIT_44_VARIANTS.find((v) => v.sku === sku);
    expect(slot).toBeDefined();
    expect(slot?.imageIntegrity).toBe('DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO');
    expect(slot?.studioPreviewWebp).toBeNull();
    expect(slot?.gates.assetVerified).toBe(false);
  }
});

test('Generated local WebP previews and JSON/CSV exports exist on disk', () => {
  const root = process.cwd();
  expect(fs.existsSync(path.join(root, 'public/catalog/starkit_products.json'))).toBe(true);
  expect(fs.existsSync(path.join(root, 'public/catalog/starkit_44_variants.json'))).toBe(true);
  expect(fs.existsSync(path.join(root, 'public/catalog/starkit_variants.csv'))).toBe(true);
  expect(fs.existsSync(path.join(root, 'public/catalog/starkit_media_manifest.csv'))).toBe(true);
  expect(fs.existsSync(path.join(root, 'public/catalog/starkit_media_integrity.json'))).toBe(true);

  const verifiedPreviewSlots = STARKIT_44_VARIANTS.filter(
    (v) => v.imageIntegrity === 'VERIFIED_LOCAL_PREVIEW' && v.studioPreviewWebp
  );
  expect(verifiedPreviewSlots.length).toBe(13);
  for (const slot of verifiedPreviewSlots) {
    const rel = slot.studioPreviewWebp.replace(/^\//, '');
    expect(fs.existsSync(path.join(root, 'public', rel))).toBe(true);
  }
});

test('Zero unverified 280-480 or 330-480 GSM claims appear in src/', () => {
  expect(STARKIT_FABRIC_SPEC.gsmShort).toBe('330–350 GSM (Claim)');
  expect(STARKIT_SIZE_CHART_META.isPhysicalVerified).toBe(false);
  expect(STARKIT_SIZE_CHART.map((s) => s.size)).toEqual(['M', 'L', 'XL', 'XXL']);

  const srcDir = path.join(process.cwd(), 'src');
  const walk = (dir) => {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files = files.concat(walk(full));
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
    }
    return files;
  };
  for (const file of walk(srcDir)) {
    const content = fs.readFileSync(file, 'utf8');
    expect(content).not.toMatch(/280\s*[–-]\s*480\s*GSM/i);
    expect(content).not.toMatch(/330\s*[–-]\s*480\s*GSM/i);
  }
});
