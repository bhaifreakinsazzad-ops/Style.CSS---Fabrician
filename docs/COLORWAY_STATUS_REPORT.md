# StarkiT DROP 01 — 44-Colorway Status Report

Working Palette Standards:
- **C01 · Black (`BLK`)**: `#170000`
- **C02 · Cream (`CRM`)**: `#F3EFE6`
- **C03 · Maroon (`MRN`)**: `#5B1A24`
- **C04 · Chocolate Brown (`BRN`)**: `#4B2E24`

## Matrix Status Summary
- **Documented Source Variants (`15/44`)**: `STK-H001-BLK`, `STK-H001-CRM`, `STK-H002-BLK`, `STK-H003-BLK`, `STK-H004-MRN`, `STK-H005-BLK`, `STK-H006-BLK`, `STK-H007-BRN`, `STK-H008-BLK`, `STK-H008-CRM`, `STK-H008-MRN` *(duplicate flag)*, `STK-H008-BRN` *(duplicate flag)*, `STK-H009-BLK`, `STK-H010-BLK`, `STK-H011-BLK`.
- **Provisional Slots (`29/44`)**: All remaining combinations across `BLK`, `CRM`, `MRN`, and `BRN`.
  - **Enforced Storefront Behavior**:
    1. Canonical SKU & swatch button remain visible for complete 44-slot transparency.
    2. Clicking a provisional swatch renders a dedicated monochrome `"COLORWAY IN DEVELOPMENT / AWAITING APPROVAL"` frame instead of reusing black imagery or CSS-tinting pixels.
    3. `Add to Bag` and `Buy Now` actions are strictly disabled on both client UI and backend (`/api/checkout` & `fabrician_checkout`) for every provisional SKU.

| Design | BLK (`#170000`) | CRM (`#F3EFE6`) | MRN (`#5B1A24`) | BRN (`#4B2E24`) |
| :--- | :---: | :---: | :---: | :---: |
| `STK-H001` | Documented | Documented | Provisional | Provisional |
| `STK-H002` | Documented | Provisional | Provisional | Provisional |
| `STK-H003` | Documented | Provisional | Provisional | Provisional |
| `STK-H004` | Provisional | Provisional | Documented | Provisional |
| `STK-H005` | Documented | Provisional | Provisional | Provisional |
| `STK-H006` | Documented | Provisional | Provisional | Provisional |
| `STK-H007` | Provisional | Provisional | Provisional | Documented |
| `STK-H008` | Documented | Documented | Documented (Dup Flag) | Documented (Dup Flag) |
| `STK-H009` | Documented | Provisional | Provisional | Provisional |
| `STK-H010` | Documented | Provisional | Provisional | Provisional |
| `STK-H011` | Documented | Provisional | Provisional | Provisional |
