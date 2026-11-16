# StarkiT Brand System Implementation

Brand Architecture strictly aligned to `starkit_brand_book_by_pomelli.pdf`:

- **Brand Identity**: `StarkiT` (`ستاركيت` / `S T Λ R K I T`)
- **Tagline**: `WEAR YOUR WORLD.`
- **Pillars**: `Community · Style · Authenticity`
- **Primary Color Discipline**:
  - Jet Black: `#170000`
  - Pure White: `#FFFFFF`
  - Working Fabric Swatches (44-Variant System): Black (`#170000`), Cream (`#F3EFE6`), Maroon (`#5B1A24`), Chocolate Brown (`#4B2E24`).
- **Typography**:
  - Primary Latin UI & Display: `Afacad Flux`
  - Structured Numerics & SKUs: `JetBrains Mono` (`tabular-nums`)
  - Bengali Localization: `Noto Sans Bengali`
  - Editorial Headings: `Readex Pro`
- **Logo & Clear-Space Fidelity**:
  - Original vector/image emblem geometry pairing Arabic lettering (`ستاركيت`) and spaced Latin wordmark (`S T Λ R K I T`) preserved with crisp contrast across dark (`#170000`) and light (`#FFFFFF`) panels.
- **Accessible Motion & Reduced-Motion Support**:
  - Wrap root app in `<MotionConfig reducedMotion="user">`.
  - 3D Studio respects `prefers-reduced-motion` on initial `autoOrbit` and defaults gracefully on low-motion preferences.
