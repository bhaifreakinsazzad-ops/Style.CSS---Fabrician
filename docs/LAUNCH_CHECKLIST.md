# StarkiT DROP 01 — Owner Launch Checklist (State A → State B)

Complete every check before switching any design from **State A (Technical Preview Ready)** to **State B (Commercial Publishing Approved)**:

- [ ] **1. Physical Fabric Sample Audit**: Confirm brushed cotton fleece weight (`330–350 GSM`) on production samples and update `STARKIT_FABRIC_SPEC.sampleVerified = true`.
- [ ] **2. Physical Garment Measurements**: Measure chest, length, and shoulder across finished `M`, `L`, `XL`, and `XXL` garments and set `STARKIT_SIZE_CHART_META.isPhysicalVerified = true`.
- [ ] **3. Artwork & IP Rights Clearance**: Obtain written commercial licensing or confirm originality for third-party designs (`STK-H001`, `STK-H004`, `STK-H005`, `STK-H006`, `STK-H008`, `STK-H010`, `STK-H011`).
- [ ] **4. Replace Duplicate Colorway Photos**: Capture authentic Maroon & Chocolate Brown photographs for `STK-H008-MRN` and `STK-H008-BRN` and rebuild WebP assets via `python3 scripts/build-starkit-media.py`.
- [ ] **5. Full 67-Image Studio Upload**: Verify front, back, and detail angles inside `/public/media/products/<SKU>/` for any design transitioning to State B.
- [ ] **6. Provisional Colorway Decision**: Decide which of the 29 provisional slots proceed to sampling and keep unmanufactured slots locked.
- [ ] **7. Hotline & WhatsApp Readiness**: Confirm staffing on Primary Hotline (`+880 1778 307704`) and WhatsApp (`+880 1931-803462`) for order verification calls.
- [ ] **8. Stock & Courier Activation**: Set actual per-SKU stock counts in `/admin` (`StarkiT 44-Slot Gate`) or Supabase (`fabrician_variants.stock_count > 0`, `enabled = true`), then flip `status = 'active'` and `rights_cleared = true`.
