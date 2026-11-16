#!/usr/bin/env python3
"""
Builds local normalized WebP media derivatives under public/media/products/<SKU>/
from authentic local PNG previews and catalog spec sheets, while auditing SHA-256
hashes to detect duplicate placeholders (e.g. FAB-H008-MRN/BRN matching BLK).
"""

import csv
import hashlib
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
READINESS_JSON = ROOT / "public/assets/aistudio/StarkiT_44_Variant_Readiness_16363110.json"
ASSETS_DIR = ROOT / "public/assets/aistudio"
MEDIA_OUT = ROOT / "public/media/products"
CATALOG_OUT = ROOT / "public/catalog"

# Authentic local PNG -> SKU mapping (15 source-documented variants)
LOCAL_SOURCE_MAP = {
    "STK-H001-CRM": {
        "preview": "hoodie_preview_FAB-H001-CRM.png",
        "sheet": "hoodie_catalog_page-05.png",
    },
    "STK-H001-BLK": {
        "preview": "hoodie_preview_FAB-H001-BLK.png",
        "sheet": "hoodie_catalog_page-06.png",
    },
    "STK-H002-BLK": {
        "preview": "hoodie_preview_FAB-H002-BLK.png",
        "sheet": "hoodie_catalog_page-07.png",
    },
    "STK-H003-BLK": {
        "preview": "hoodie_preview_FAB-H003-BLK.png",
        "sheet": "hoodie_catalog_page-08.png",
    },
    "STK-H004-MRN": {
        "preview": "hoodie_preview_FAB-H004-MRN.png",
        "sheet": "hoodie_catalog_page-09.png",
    },
    "STK-H005-BLK": {
        "preview": "hoodie_preview_FAB-H005-BLK.png",
        "sheet": "hoodie_catalog_page-10.png",
    },
    "STK-H006-BLK": {
        "preview": "hoodie_preview_FAB-H006-BLK.png",
        "sheet": "hoodie_catalog_page-11.png",
    },
    "STK-H007-BRN": {
        "preview": "hoodie_preview_FAB-H007-BRN.png",
        "sheet": "hoodie_catalog_page-12.png",
    },
    "STK-H008-BLK": {
        "preview": "hoodie_preview_FAB-H008-BLK.png",
        "sheet": "hoodie_catalog_page-13.png",
    },
    "STK-H008-CRM": {
        "preview": "hoodie_preview_FAB-H008-CRM.png",
        "sheet": "hoodie_catalog_page-14.png",
    },
    "STK-H008-MRN": {
        "preview": "hoodie_preview_FAB-H008-MRN.png",
        "sheet": "hoodie_catalog_page-13.png",
    },
    "STK-H008-BRN": {
        "preview": "hoodie_preview_FAB-H008-BRN.png",
        "sheet": "hoodie_catalog_page-13.png",
    },
    "STK-H009-BLK": {
        "preview": "hoodie_preview_FAB-H009-BLK.png",
        "sheet": "hoodie_catalog_page-15.png",
    },
    "STK-H010-BLK": {
        "preview": "hoodie_preview_FAB-H010-BLK.png",
        "sheet": "hoodie_catalog_page-16.png",
    },
    "STK-H011-BLK": {
        "preview": "hoodie_preview_FAB-H011-BLK.png",
        "sheet": "hoodie_catalog_page-17.png",
    },
}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def to_webp(src: Path, dst: Path, quality: int = 86):
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["convert", str(src), "-strip", "-quality", str(quality), str(dst)],
        check=True,
    )


def main():
    with open(READINESS_JSON, "r", encoding="utf-8") as f:
        readiness = json.load(f)

    MEDIA_OUT.mkdir(parents=True, exist_ok=True)
    CATALOG_OUT.mkdir(parents=True, exist_ok=True)

    # Track hashes to flag duplicate source files honestly
    seen_preview_hashes = {}
    audit_rows = []

    for sku, files in sorted(LOCAL_SOURCE_MAP.items()):
        preview_src = ASSETS_DIR / files["preview"]
        sheet_src = ASSETS_DIR / files["sheet"]
        if not preview_src.exists() or not sheet_src.exists():
            raise FileNotFoundError(f"Missing local source image for {sku}: {files}")

        preview_hash = sha256_file(preview_src)
        duplicate_of = seen_preview_hashes.get(preview_hash)
        if not duplicate_of:
            seen_preview_hashes[preview_hash] = sku

        sku_dir = MEDIA_OUT / sku
        studio_webp = sku_dir / f"{sku}__91_studio_preview.webp"
        sheet_webp = sku_dir / f"{sku}__90_reference_composite.webp"

        # Convert sheet composite unconditionally (it is the documented spec page)
        to_webp(sheet_src, sheet_webp, quality=84)

        # Only export studio preview WebP cleanly if hash is unique to this SKU;
        # For STK-H008-MRN and STK-H008-BRN (whose source PNG is byte-identical to STK-H008-BLK),
        # keep explicit flag so frontend shows an honest missing-color-photo notice instead of deceptive duplicate!
        preview_exported = False
        if duplicate_of is None:
            to_webp(preview_src, studio_webp, quality=88)
            preview_exported = True
        elif studio_webp.exists():
            studio_webp.unlink()

        audit_rows.append(
            {
                "sku": sku,
                "preview_source": files["preview"],
                "preview_sha256": preview_hash,
                "duplicate_of_sku": duplicate_of,
                "studio_preview_webp": f"/media/products/{sku}/{sku}__91_studio_preview.webp"
                if preview_exported
                else None,
                "reference_composite_webp": f"/media/products/{sku}/{sku}__90_reference_composite.webp",
                "integrity_status": "VERIFIED_LOCAL_PREVIEW"
                if duplicate_of is None
                else f"DUPLICATE_OF_{duplicate_of}_NEEDS_COLOR_PHOTO",
            }
        )

    # Export clean normalized catalog JSON and CSV files
    with open(CATALOG_OUT / "starkit_media_integrity.json", "w", encoding="utf-8") as f:
        json.dump(audit_rows, f, indent=2)

    with open(CATALOG_OUT / "starkit_products.json", "w", encoding="utf-8") as f:
        json.dump(readiness["designs"], f, indent=2, ensure_ascii=False)

    with open(CATALOG_OUT / "starkit_44_variants.json", "w", encoding="utf-8") as f:
        json.dump(readiness["variants"], f, indent=2, ensure_ascii=False)

    variant_fields = list(readiness["variants"][0].keys())
    with open(CATALOG_OUT / "starkit_variants.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=variant_fields)
        writer.writeheader()
        writer.writerows(readiness["variants"])

    media_rows = readiness["media"]
    media_fields = list(media_rows[0].keys()) + ["exists_locally"]
    with open(CATALOG_OUT / "starkit_media_manifest.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=media_fields)
        writer.writeheader()
        for row in media_rows:
            rel = row["site_asset_path"].lstrip("/")
            local_exists = (ROOT / "public" / rel).exists()
            writer.writerow({**row, "exists_locally": "YES" if local_exists else "NO"})

    print(
        f"Media build complete: {len(audit_rows)} documented variants processed "
        f"({sum(1 for r in audit_rows if r['duplicate_of_sku'] is None)} unique local previews, "
        f"{sum(1 for r in audit_rows if r['duplicate_of_sku'] is not None)} duplicate placeholders flagged)."
    )


if __name__ == "__main__":
    main()
