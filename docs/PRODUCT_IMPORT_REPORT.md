# StarkiT DROP 01 — Product & Variant Import Report

## Summary Totals
- **Brand**: StarkiT (`DROP 01 / THE GRAPHIC ARCHIVE`)
- **Authoritative Designs**: **11** (`STK-H001` – `STK-H011`)
- **Canonical Colorway Slots**: **44** (11 designs × 4 working colors: `BLK`, `CRM`, `MRN`, `BRN`)
- **Size Matrix per Slot**: **4 sizes** (`M`, `L`, `XL`, `XXL`) -> **176 sellable SKU records**
- **Media Manifest Rows**: **67 planned asset entries** across 15 documented colorways
- **Excluded Designs**: `STK-H012` (1 excluded)

## Design Catalog Mapping (`STK-H001` – `STK-H011`)

| Design ID | Legacy ID | Canonical Name | Category | Proposed Price (BDT) | Documented Colors | Licensing Gate |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `STK-H001` | `FAB-H001` | SHINOBI SUNSET | Anime Archive | ৳1,590 | Black, Cream | Required |
| `STK-H002` | `FAB-H002` | PEACE BRO CLUB | Playful Street | ৳1,290 | Black | Confirm Orig. |
| `STK-H003` | `FAB-H003` | FOLK ROUTE | Bangla Heritage | ৳1,390 | Black | Confirm Orig. |
| `STK-H004` | `FAB-H004` | THE RIDER CODE | Moto Culture | ৳1,690 | Maroon | Required |
| `STK-H005` | `FAB-H005` | MOONLIT HERO | Anime Archive | ৳1,590 | Black | Required |
| `STK-H006` | `FAB-H006` | CELLULOID NIGHTS | Bangla Heritage | ৳1,490 | Black | Required |
| `STK-H007` | `FAB-H007` | DHAKA AFTERGLOW | City Stories | ৳1,490 | Chocolate Brown | Confirm Orig. |
| `STK-H008` | `FAB-H008` | COLLECTIVE VOICE | Statement Graphics | ৳1,390 | Black, Cream, Maroon*, Brown* | Required |
| `STK-H009` | `FAB-H009` | RICKSHAW BLOOM | Bangla Heritage | ৳1,490 | Black | Confirm Orig. |
| `STK-H010` | `FAB-H010` | CHEESE CHASE | Playful Street | ৳1,390 | Black | Required |
| `STK-H011` | `FAB-H011` | NIGHT CIRCUIT | Moto Culture | ৳1,590 | Black | Required |

`*` `STK-H008-MRN` and `STK-H008-BRN` carry a source duplicate-image flag and require distinct color shoots prior to publication.

## Exported Machine Artifacts (`/public/catalog/`)
- `starkit_products.json` — 11 canonical design definitions + release gate flags
- `starkit_44_variants.json` — Complete 44-slot matrix with SKU, integrity, and media references
- `starkit_variants.csv` — Flat operational CSV for inventory/merchandising teams
- `starkit_media_manifest.csv` — 67-row media verification sheet
- `starkit_media_integrity.json` — Machine-verifiable SHA-256 and file verification summary

## Supabase Idempotent Import
Apply `/supabase/migrations/20261117000000_starkit_44_variant_upgrade.sql` and execute:
```bash
STARKIT_IMPORT_CONFIRM=YES SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun scripts/import-starkit-44.ts
```
All imported rows start cleanly in State A (`status = 'draft'`, `rights_cleared = false`, `stock_count = 0`, `enabled = false`).
