#!/usr/bin/env python3
"""Offline size/format/palette validation for a review-only OG card."""
from PIL import Image
from pathlib import Path
import sys

p=Path(sys.argv[1] if len(sys.argv)>1 else "tmp-review/mrxpanel-og-review-1200x630.png")
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
print("MRXPANEL_OG_IMAGE_REVIEW_QA_PASS|SIZE=1200x630|TYPE=PNG|BRAND_COLORS=PASS")
