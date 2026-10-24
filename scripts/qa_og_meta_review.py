#!/usr/bin/env python3
"""Verify seven-page raster OG preview has no unintended source edits."""
from __future__ import annotations
from pathlib import Path
import argparse
import hashlib
import re
from PIL import Image
from prepare_og_meta_review import PAGES, IMAGE_NAME, IMAGE_URL, OG_PROPS, prepare

def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def verify(source: Path, review: Path, png: Path) -> None:
    source, review, png = source.resolve(), review.resolve(), png.resolve()
    asset=review/"assets"/IMAGE_NAME
    assert png.read_bytes() == asset.read_bytes(), "Preview raster differs from tested PNG"
    with Image.open(asset) as img:
        assert img.format == "PNG" and img.size == (1200, 630)
    for route in PAGES:
        original=(source/route).read_text(encoding="utf-8")
        candidate=(review/route).read_text(encoding="utf-8")
        assert candidate.count('property="og:image"') == 1, route
        assert candidate.count('name="twitter:image"') == 1, route
        assert candidate.count('property="og:image:alt"') == 1, route
        assert candidate.count('property="og:image:width" content="1200"') == 1, route
        assert candidate.count('property="og:image:height" content="630"') == 1, route
        assert candidate.count('name="twitter:card" content="summary_large_image"') == 1, route
        assert candidate.count(IMAGE_URL) == 3, route  # og:image, secure_url, twitter:image
        insertion="\n"+"\n".join(OG_PROPS)
        if 'name="twitter:card"' not in original:
            insertion += '\n<meta name="twitter:card" content="summary_large_image">'
        assert candidate.count(insertion) == 1, "OG insertion missing/repeated: " + route
        assert candidate.replace(insertion, "", 1) == original, "Unrelated HTML, canonical or JSON-LD changed: " + route
        assert sha(original.encode("utf-8")) != sha(candidate.encode("utf-8"))
        print("PASS " + route + ": OG image/card exact; all previous metadata unchanged")
    # A review preflight must reject writing into the source checkout itself.
    try:
        prepare(source, source, png)
    except ValueError as exc:
        assert str(exc) == "REVIEW_OUTPUT_MUST_BE_SEPARATE_FROM_SOURCE"
    else:
        raise AssertionError("Safety check did not block source mutation")
    try:
        prepare(source, review, png)
    except ValueError as exc:
        assert str(exc) == "REVIEW_OUTPUT_ALREADY_EXISTS_ABORT"
    else:
        raise AssertionError("Safety check allowed overwrite of existing review")
    print("MRXPANEL_OG_PREVIEW_QA_PASS=7/7|PNG=1200x630|PRODUCTION_MUTATIONS=NONE")

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--source", type=Path, required=True)
    p.add_argument("--review", type=Path, required=True)
    p.add_argument("--png",type=Path,required=True)
    args=p.parse_args()
    verify(args.source,args.review,args.png)
