# StarkiT DROP 01 — Source Audit Report

**Audit Standard**: Schema `3.0-prelaunch-44-slot` & Official StarkiT Brand Book

## 1. Source Hierarchy & Conflict Resolution

| Priority | Authoritative Source | Scope Covered |
| :--- | :--- | :--- |
| **1** | Official Brand Book (`starkit_brand_book_by_pomelli.pdf`) | Brand voice, `#170000` / `#FFFFFF` palette, `Afacad Flux` font, logo geometry (`ستاركيت` + `S T Λ R K I T`) |
| **2** | `StarkiT_44_Variant_Readiness.json` & `.csv` | Canonical 11 designs × 4 working colorways = 44 slots, hold gates, 67 planned media assets |
| **3** | Verified Catalog JSON / PDF (`Fabrician_Product_Knowledge_Base`) | Source titles, heritage/street copy, proposed selling prices (`৳1,290–৳1,690`) |
| **4** | Audited Local Media (`/public/assets/aistudio/` -> `/public/media/products/`) | 15 reference composites + 13 unique preview PNGs converted to WebP |
| **5** | Existing Storefront Package & Infrastructure | Express (`server.ts`), React/Vite SPA, Firebase rules, Supabase commerce RPC |

## 2. Resolved Discrepancies & Corrections Applied

1. **`STK-H012` ("Kinetic Stage" / Marshmello Edition)**:
   - Present only in supplementary HTML reference; absent from canonical `11`-design / `44`-variant readiness specification. Excluded from `STARKIT_44_DESIGNS_META`, `GRAPHIC_ARCHIVE_PRODUCTS`, sitemap, and Supabase import scripts.
2. **Fabric Weight (`GSM`) Reconciliation**:
   - Legacy UI sliders allowed unverified `280–480 GSM` / `330–480 GSM` ranges. Standardized across UI, 3D Studio, Size Guides, and tests to `330–350 GSM (Claim · Physical Sample Verification Pending)`.
3. **Hotline & WhatsApp Reconciliation**:
   - Store settings and brand data standardized to verified Primary Order Hotline (`+880 1778 307704`) and WhatsApp Order Desk (`+880 1931-803462`).
4. **Physical Garment Size Chart Disclosure**:
   - All `M / L / XL / XXL` measurement tables display explicit `Reference Estimate · Pending Physical Verification` warnings (`isPhysicalVerified: false`).
5. **Duplicate Image Integrity (`STK-H008-MRN` & `STK-H008-BRN`)**:
   - `hoodie_preview_FAB-H008-MRN.png` and `hoodie_preview_FAB-H008-BRN.png` duplicate the Black preview bytes; flagged as `DUPLICATE_BLACK_PLACEHOLDER_NEEDS_COLOR_PHOTO` with `__91_studio_preview.webp` omitted to avoid misleading customers.
6. **Checkout Compatibility**:
   - Added `XXL` size support in `storeService.ts` & `seed-fabrician.ts`, fixed Dhaka division matching (`like '%dhaka%'`) inside `fabrician_checkout(jsonb)`, and added optional `areaUpazila` & `deliveryNotes`.
