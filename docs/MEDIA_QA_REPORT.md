# StarkiT DROP 01 — Media & Asset QA Report

Generated alongside `/scripts/build-starkit-media.py` and verified against `/public/catalog/starkit_media_integrity.json`.

## Summary
- **Planned Manifest Slots**: `67` views across `15` documented variants (`front`, `back`, `detail_01..03`, `reference_composite`).
- **Converted Local Reference Composites**: `15 / 15` (`<SKU>__90_reference_composite.webp`).
- **Converted Local Studio Previews**: `13 / 15` unique (`<SKU>__91_studio_preview.webp`).
- **Skipped Duplicate-Color Placeholders**: `2` (`STK-H008-MRN`, `STK-H008-BRN`).

## Integrity Findings
1. **Hash & Byte Verification**:
   - SHA-256 comparison across source PNGs revealed `hoodie_preview_FAB-H008-MRN.png` and `hoodie_preview_FAB-H008-BRN.png` shared identical bytes with `hoodie_preview_FAB-H008-BLK.png`.
   - Both SKUs remain flagged `DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO` in TypeScript metadata, Supabase SQL schema, Admin 44-Slot Gate, and automated test suites, with no studio preview WebP emitted for those duplicate colors.
2. **Provisional Slot Discipline (`29` Slots)**:
   - Zero placeholder photos or CSS color filters are rendered for provisional colorways.
   - Storefront PDPs, 3D Studio, and Grid display an authentic `"COLORWAY IN DEVELOPMENT / AWAITING APPROVAL"` monochrome card.
3. **Vercel Static Delivery Rule**:
   - `/vercel.json` excludes `/media/`, `/catalog/`, `/downloads/`, `/robots.txt`, and `/sitemap.xml` from SPA HTML fallbacks and serves `/media/*` with `Cache-Control: public, max-age=31536000, immutable`.
