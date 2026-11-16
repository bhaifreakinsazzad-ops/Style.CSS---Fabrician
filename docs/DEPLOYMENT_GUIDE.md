# StarkiT DROP 01 — Production Deployment Guide

## 1. Environment Variables
Set server-side & client-side environment variables securely (never expose `SUPABASE_SERVICE_ROLE_KEY` via `VITE_*`):
- `VITE_COMMERCE_BACKEND`: `'firebase'` (default) or `'supabase'`
- `VITE_FIREBASE_*` (if running Firebase storefront + `/admin` owner console)
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` (server-side `/api/*` only)
- `PATHAO_*` & `META_*_ACCESS_TOKEN` (optional courier & CAPI server-side endpoints)

## 2. Database Setup (Supabase Mode)
1. Apply base migration: `supabase/migrations/20261114000000_secure_commerce.sql`
2. Apply 44-variant upgrade migration: `supabase/migrations/20261117000000_starkit_44_variant_upgrade.sql`
3. Seed & import all 11 designs / 44 slots / 176 size SKUs / 67 media entries in State A:
   ```bash
   STARKIT_IMPORT_CONFIRM=YES SUPABASE_URL=https://<project>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> bun scripts/import-starkit-44.ts
   ```

## 3. Build & Host
- **Local / Express Full-Stack**:
  ```bash
  npm install
  npm run build
  NODE_ENV=production node --import tsx server.ts
  ```
- **Vercel Deployment**:
  - `vercel.json` builds `dist/`, serves `/api/*` serverless functions, excludes `/media/`, `/catalog/`, `/downloads/`, `/robots.txt`, and `/sitemap.xml` from SPA rewrites, and sets security headers.
