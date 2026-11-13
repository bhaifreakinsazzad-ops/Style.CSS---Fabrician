# Fariza's Territory — 2026 Flagship Commerce Frontend

## Files

1. `fariza_territory_flagship_launch_ready_frontend.html` — standalone one-page storefront.
2. `fariza_territory_single_custom_code_block.html` — custom HTML block for a **blank, script-enabled** web page.
3. `fariza_territory_catalog_preserved.json` — complete data extracted from the original source HTML; values preserved, not reinterpreted.
4. `fariza_territory_original_media_mapping.json` — image/texture URL slots for all 18 SKUs.

## Verified source integrity

- Three uploaded HTML files were byte-identical by SHA-256.
- Canonical `PRODUCTS` array is byte-for-byte unchanged: SHA-256 `598999136e2c87e57d71bc84e738c890d3868969772e02568ceaaa9dfc3e986b`.
- **18** SKUs across **5** edits: 1 Magenta & Plum, 2 Alfi, 4 Mome, 6 Zam Zam Swiss Lawn, 5 Embroidery & Mirror.
- **4** SKUs carry `priceVerify: true`; their listed prices require seller validation.
- Catalog includes descriptions, product codes, colors, fabric notes, accessory breakdowns, and price flags.
- The XLSX/PDF catalog referenced inside the HTML was **not attached**, so independent PDF-vs-HTML verification is pending.

## Working frontend features

- Product catalogue with search, price sorting/filtering, category filtering, details view, bilingual metadata.
- Fabric and lookbook **illustrations** generated from the product metadata, with override hooks for verified originals.
- Local wishlist, cart, 10% FARIZA10 promo, tailoring choices (+৳450), delivery zones.
- Customer form, local order request receipt with copy/download, optional seller WhatsApp and optional order API.
- Three.js showroom and anime.js/motion.dev dependencies are retained. Browser gracefully renders catalog if 3D is unavailable.

## Configure before launch (required for real orders)

Open the HTML and find `const STORE_CONFIG = { ... }`. Replace placeholders:

```js
const STORE_CONFIG = {
  sellerWhatsappNumber: '8801XXXXXXXXX', // merchant's VERIFIED WhatsApp; keep digits only
  orderApiEndpoint: '', // optional HTTPS backend endpoint with order acceptance and stock/price validation
  productMedia: {
    'CAT-001': {
      flatlay: 'https://YOUR-CDN.example/images/CAT-001-original.webp',
      lookbook: 'https://YOUR-CDN.example/images/CAT-001-model.webp'
    }
    // Repeat for all verified product images.
  }
};
```

**Important:** With both `sellerWhatsappNumber` and `orderApiEndpoint` blank, the checkout produces an **order request only**. It does not notify the seller, collect payments, confirm inventory, or create an order on a backend. This is intentional and prevents false confirmations. A customer can copy or save the request for manual delivery.

If you configure an order API, the endpoint must respond with JSON: `{"accepted": true, "orderId": "SERVER-ORDER-ID"}`, and it must independently recheck catalog prices, discounts, shipping, product availability, and payment status before acceptance. Never trust amounts submitted from a browser.

### Photographs and PDF/image-to-code workflow

The provided sources contain **no uploaded garment photos, PDF, or XLSX**: the source website renders illustrative textile graphics using JavaScript canvas. The original images have not been reproduced or verified. To convert catalog images accurately, provide the original catalog PDF and each product reference photo; extract and map source imagery to SKU, preserve product metadata and confirm discrepancies. Do not relabel existing illustrations as original photographs.

The 3D view is a product-inspired illustration; rendering a photographic 360-degree garment requires genuine product images/textures or 3D models for each SKU.

### Integration limits

- `single_custom_code_block.html` must be inserted into a page where inline JavaScript and script tags are allowed; custom blocks that sanitize/rewrite scripts will not run it. Use on a blank page, because Tailwind CDN and global styles may affect surrounding site content.
- This build references Tailwind CSS CDN, Three.js r128, Anime.js 3.2.2, ThreeUI.js and Motion.dev 11 via public CDNs. Live hosting needs internet connectivity and a script-supporting environment. For high-traffic production deployment, bundle and version-control your dependencies, build static CSS, set CSP/security headers, and test cross-browser devices.
- No payment gateway, inventory management, customer account, server orders, shipment tracking, analytics, CMS, or merchant backend is provisioned.
- Avoid stating delivery charges, promotions or stock are confirmed until commercial terms have been verified by the seller.

## Validation performed

- Exact product data comparison passed.
- Inline JavaScript syntax check passed (`node --check`).
- Offline Chromium browser smoke test passed: 18 cards, search (SKU), add to bag, request checkout, no-JS-library 3D fallback, no misleading order confirmation.
- Live CDN animation and 3D WebGL path were not end-to-end verified in the restricted test environment.
