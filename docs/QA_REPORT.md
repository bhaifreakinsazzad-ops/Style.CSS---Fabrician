# StarkiT DROP 01 — QA & Release Security Report

## Automated & Build Verification Coverage
1. **Catalog & Schema Integrity (`tests/starkit-44-catalog.test.mjs`)**:
   - Confirms exact counts: `11` designs, `44` colorway slots, `15` documented, `29` provisional, `67` planned media entries.
   - Enforces exclusion of `STK-H012` across TypeScript exports and `findStarKiTDesign()`.
   - Verifies zero provisional slots point to real hoodie images or allow State B release.
   - Confirms `STK-H008-MRN` and `STK-H008-BRN` carry duplicate placeholder warnings without converted studio previews.
   - Scans `src/` to verify zero unverified `280–480` / `330–480 GSM` strings remain.
   - Verifies local WebP preview files and `/public/catalog/*` JSON/CSV exports exist on disk.
2. **Serverless API Fail-Closed Security (`tests/commerce-api.test.mjs`)**:
   - Enforces HTTP method guards (`405`), fail-closed `503` without service keys, and schema validation (`400 INVALID_CHECKOUT`) including optional `areaUpazila` and `deliveryNotes` bounds.
3. **TypeScript Compilation & Linting**:
   - Verified via `npm run build` (`vite build`) and `npm run lint` (`tsc --noEmit` / ESLint).
4. **Checkout & Database Hardening**:
   - Both `/api/checkout` -> `public.fabrician_checkout(jsonb)` and Firestore `placeStoreOrder` validate Dhaka vs. outside-Dhaka fees accurately, block provisional SKUs, and honor existing `firestore.rules` key constraints.
5. **Known Pre-Launch Holds (Intentional State A Behavior)**:
   - Public cart/checkout buttons remain locked on StarkiT Drop 01 garments until owner completes State B sample, sizing, photography, and IP sign-off inside `/admin` -> `StarkiT 44-Slot Gate`.
