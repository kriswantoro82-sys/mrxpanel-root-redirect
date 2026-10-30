#!/usr/bin/env python3
"""Reproduce MRXPANEL A/B OG cards for owner review ONLY. No deployment."""
from __future__ import annotations
import hashlib
from io import BytesIO
import json
from pathlib import Path
import subprocess
import sys

from PIL import Image, ImageDraw
import cairosvg

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ORIGINAL_GENERATOR = HERE / "original-pr17-og-generator.py"
OFFICIAL_FAVICON = ROOT / "favicon-mrx.svg"
EXPECTED = {
    "A": "ea2c611f2c5302561cd93afe15d0679f66926015d4d31c71bdb1b1b68d7ce929",
    "B": "1508d09e5c99850457e5dd05501f7bd22bdc398d21c415592351267bf3ca74c8",
}

def verify(path: Path, label: str) -> None:
    raw = path.read_bytes()
    with Image.open(BytesIO(raw)) as image:
        if image.size != (1200, 630) or image.mode != "RGB":
            raise SystemExit(f"OG_REVIEW_INVALID_{label}_DIMENSIONS_OR_MODE")
    digest = hashlib.sha256(raw).hexdigest()
    if digest != EXPECTED[label]:
        raise SystemExit(f"OG_REVIEW_{label}_CHECKSUM_MISMATCH: {digest}")
    print(f"OG_REVIEW_{label}_REPRODUCIBLE_PASS sha256={digest} bytes={len(raw)}")

def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: generate-review-A-B.py NEW_EMPTY_OUTPUT_DIRECTORY")
    out = Path(sys.argv[1]).resolve()
    if out.exists():
        raise SystemExit("REFUSE_OVERWRITE_EXISTING_OUTPUT")
    manifest = json.loads((HERE / "REVIEW_ONLY_RELEASE_GATE.json").read_text(encoding="utf-8"))
    if (manifest.get("production_authorized") is not False
        or manifest.get("owner_visual_approved") is not False
        or manifest.get("release_blocked") is not True
        or manifest.get("asset_included") is not False):
        raise SystemExit("FAIL_CLOSED_REVIEW_APPROVAL_STATE_CHANGED")
    if (manifest.get("candidate_A_sha256") != EXPECTED["A"]
        or manifest.get("candidate_B_sha256") != EXPECTED["B"]):
        raise SystemExit("FAIL_CLOSED_IMAGE_HASH_MANIFEST_DRIFT")
    if (ROOT / "assets" / "mrxpanel-og-1200x630.png").exists():
        raise SystemExit("FAIL_CLOSED_PRODUCTION_ASSET_PRESENT")
    if not ORIGINAL_GENERATOR.is_file() or not OFFICIAL_FAVICON.is_file():
        raise SystemExit("MISSING_PINNED_ARTWORK_SOURCE")
    out.mkdir(parents=True, exist_ok=False)
    a = out / "A_original-M.png"
    b = out / "B_circular-MRX.png"
    subprocess.run([sys.executable, str(ORIGINAL_GENERATOR), str(a)], check=True)
    verify(a, "A")
    with Image.open(a) as image:
        art = image.copy()
    # Only original 68x68 logo patch is replaced; the rest stays pixel-identical.
    ImageDraw.Draw(art).rectangle((62, 120, 129, 187), fill="#111318")
    overlay = Image.open(BytesIO(cairosvg.svg2png(
        url=str(OFFICIAL_FAVICON), output_width=68, output_height=68
    ))).convert("RGBA")
    art.paste(overlay, (62, 120), overlay)
    art.save(b, format="PNG", optimize=True)
    verify(b, "B")
    (out / "REVIEW_ONLY.txt").write_text(
        "MRXPANEL OG CARD: OWNER DESIGN A/B REVIEW ONLY.\n"
        "A = historical golden M; B = official circular MRX.\n"
        "Neither is approved for production. Never publish without owner permission.\n",
        encoding="utf-8"
    )
    print("OG_AB_ASSETS=REVIEW_ONLY|PRODUCTION_RELEASE=HOLD")

if __name__ == "__main__":
    main()
