#!/usr/bin/env python3
"""Offline size/format/palette validation for a review-only OG card."""
from PIL import Image
from pathlib import Path
import hashlib
import json
import sys

p=Path(sys.argv[1] if len(sys.argv)>1 else "tmp-review/mrxpanel-og-review-1200x630.png")
manifest_file = Path(__file__).resolve().parents[1] / "review" / "og-card-20261025" / "preview-asset-manifest.json"
manifest = json.loads(manifest_file.read_text(encoding="utf-8"))
assert manifest["approved_for_production"] is False, "Review QA must never imply production approval"
assert manifest["approval_status"] == "pending_owner_review"
assert manifest["format"] == "PNG"
assert manifest["dimensions"] == {"width": 1200, "height": 630}
actual_hash = hashlib.sha256(p.read_bytes()).hexdigest()
assert actual_hash == manifest["png_sha256"], (
    f"CI asset differs from human-inspected baseline: actual={actual_hash}, reviewed={manifest['png_sha256']}"
)
assert p.exists(), "Image was not generated"
assert p.stat().st_size < 800_000, "Image exceeds review budget"
with Image.open(p) as im:
    assert im.format == "PNG", "Raster must be PNG"
    assert im.size == (1200,630), f"Wrong OG dimensions: {im.size}"
    assert im.mode in ("RGB","RGBA"), "Unsupported image mode"
    assert im.getpixel((2,2))[:3] == (17,19,24), "Brand background mismatch"
    # Gold marker and white type both must remain visible; sample broad crop.
    pixels = im.convert("RGB")
    colors = pixels.getdata()
    gold = sum(1 for rgb in colors if rgb[0]>195 and rgb[1]>120 and rgb[2]<180)
    white = sum(1 for rgb in colors if min(rgb)>220)
    assert gold > 4500, f"Gold design elements missing ({gold})"
    assert white > 3500, f"Primary typographic elements missing ({white})"
print("MRXPANEL_OG_IMAGE_REVIEW_QA_PASS|SIZE=1200x630|TYPE=PNG|BRAND_COLORS=PASS|REVIEW_SHA256="+actual_hash+"|PRODUCTION_APPROVED=NO")
