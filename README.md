# StarkiT · DROP 01 / THE GRAPHIC ARCHIVE — 44-Variant Storefront

Production-ready interactive e-commerce architecture for **StarkiT (`ستاركيت` / `S T Λ R K I T` — "WEAR YOUR WORLD.")** operating alongside the FABRICIAN flagship platform in Bangladesh.

## Key Architecture Highlights

- **Canonical 44-Variant Catalog (`schema 3.0-prelaunch-44-slot`)**:
  - **11 Authoritative Designs** (`STK-H001` – `STK-H011`, legacy `FAB-H001` – `FAB-H011`).
  - **4 Working Colorways per Design**: Jet Black (`BLK` `#170000`), Cream (`CRM` `#F3EFE6`), Maroon (`MRN` `#5B1A24`), and Chocolate Brown (`BRN` `#4B2E24`).
  - **15 Documented Colorways** with 67-asset manifest paths + converted local WebP studio previews and reference composite sheets under `/public/media/products/<SKU>/`.
  - **29 Provisional Colorway Slots** cleanly modeled with canonical SKUs, visually badged `"COLORWAY IN DEVELOPMENT / AWAITING APPROVAL"`, never tinting or duplicating black hoodie imagery, and locked out of public checkout.
  - **`STK-H012` ("Kinetic Stage")** excluded per authoritative source hierarchy.
- **Two-State Release Gate**:
  - **State A (Active Default)**: `HOLD / NOT FOR PUBLIC SALES`, `stockCount = 0`, provisional slots disabled, unverified GSM/sizing disclosures visibly labeled.
  - **State B (Commercial Publishing)**: Unlocks per-design from `/admin` (`StarKiT 44-Slot Gate` tab) or Supabase once samples, physical measurements, media, and IP rights pass owner audit.
- **Commerce & 64-District Fulfillment**:
  - Express checkout with 64-district Pathao shipping fee estimation, Area/Upazila & Delivery Notes fields, COD payment verification, bundle savings, promo codes (`STARKIT10`, `FARIZA10`), server-side API routes (`/api/catalog`, `/api/checkout`, `/api/order-status`, `/api/pathao`, `/api/meta-capi`), and Supabase PostgreSQL + RLS support.

## Local Development & Verification

```bash
npm install
npm run dev        # Runs Express + Vite middleware on http://localhost:3000
bun test           # Executes API + 44-variant catalog integrity test suites
npm run lint       # TypeScript & Vite static verification
npm run build      # Production build to dist/
```

See `/README_BN.md` for Bengali documentation and `/docs/` for complete audit, media QA, deployment, and launch guides.
