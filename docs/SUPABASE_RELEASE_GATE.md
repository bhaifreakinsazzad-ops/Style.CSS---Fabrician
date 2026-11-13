# FABRICIAN — Supabase commerce release gate

This branch contains **staging-only Supabase migration code**. The current production storefront uses Firebase. Do **not** enable Supabase checkout until a dedicated Fabrician project has been provisioned, products and variants have been imported, and the gates below are verified.

## Required infrastructure
- A dedicated Supabase project for Fabrician (do not reuse PowerPointBD).
- A linked Vercel Git project already exists: `fabrician`.
- Vercel **server-only** environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (never add `VITE_` prefix). Keep secrets out of git.
- Vercel client build-time flag `VITE_COMMERCE_BACKEND=supabase` only after migration is complete.
- Apply `supabase/migrations/20261114000000_secure_commerce.sql` to the dedicated database, then run Supabase security/performance advisors and test RLS from anon.
- Seed all approved product SKUs as `draft`, `rights_cleared=false`, `enabled=false`, `stock_count=0` initially. Publish only after inventory, imagery and rights approval.

## Checkout contract
`POST /api/checkout` body:
```json
{
  "requestId":"unique-random-id-at-least-20-characters",
  "lookupToken":"unguessable-client-token-at-least-32-characters",
  "customer":{"name":"Example","phone":"01700000000","address":"Street, area, city","division":"Dhaka Division"},
  "items":[{"sku":"FAB-H003-BLK-L","quantity":1}]
}
```
The server uses a privileged Supabase RPC that locks SKU rows, validates publication and stock, calculates price/discount/shipping, deducts inventory, and inserts order lines atomically. It refuses browser-supplied prices. COD only; MFS must be added through a verified gateway and webhook before enabling.

`POST /api/order-status` requires both `orderId` and `lookupToken`; returns **only** order status, payment status, totals, and actual courier consignment ID, if issued.

## Stop/go checks (mandatory before main release)
1. Apply migration on isolated Supabase project. Confirm RLS on all public tables; anon cannot read orders, phone/address, subscribers or mutate products.
2. Test available SKU checkout, unavailable/draft/unlicensed SKU rejection, quantity bounds, concurrent oversell, idempotent retry, and discount + shipping calculations.
3. Add real stock and product photos, approve only licensed SKUs, and verify tax/invoice and COD operations.
4. Verify real payment flow separately before making any MFS promise. Never infer payment from a user-entered TrxID.
5. Implement merchant-authenticated admin management and data import/export; remove Firebase production reliance only after cutover and backup.
6. Integrate actual Pathao shipment creation server-side. Never invent a consignment ID or promise courier acceptance before confirmed.
7. Test end-to-end in Vercel preview and staging database; run `npm run lint`, `npm run build`, automated browser tests, security advisors, and live customer-support procedures.
8. Back up all existing Firebase data and validate the mapped Supabase records before DNS/production cutover.

## Operational caution
The source repo cannot create a Supabase project without an explicitly chosen organization and required cost approval. No Supabase project has been created or connected from this branch. The Vercel `fabrician` deployment is currently connected to the GitHub `main` branch. This branch is intentionally isolated to avoid triggering an unverified public release.
