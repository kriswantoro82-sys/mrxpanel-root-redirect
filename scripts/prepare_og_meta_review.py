#!/usr/bin/env python3
"""Prepare a seven-page OG image review bundle in a separate output directory.

Do NOT point --output at a checkout, public website build directory, or tracked
source tree. This script is for human review of UNAPPROVED visual concepts.
No network calls or production writes.
"""
from __future__ import annotations
from pathlib import Path
import argparse
import re
import shutil
import sys

PAGES = (
    "index.html",
    "panduan-reseller/index.html",
    "cara-menggunakan-panel-smm/index.html",
    "memilih-provider-smm/index.html",
    "apa-itu-panel-smm/index.html",
    "api-panel-smm-reseller/index.html",
    "kalkulator-harga-jual-reseller-smm/index.html",
)
IMAGE_NAME = "mrxpanel-og-1200x630.png"
IMAGE_URL = "https://mrxpanel.com/assets/" + IMAGE_NAME
ALT = "MRXPANEL — Panel SMM Indonesia untuk Reseller dan Bisnis"
OG_URL_TAG = re.compile(r'<meta\s+property="og:url"\s+content="([^"]+)"\s*>')
OG_PROPS = (
    '<meta property="og:image" content="' + IMAGE_URL + '">',
    '<meta property="og:image:secure_url" content="' + IMAGE_URL + '">',
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="' + ALT + '">',
    '<meta name="twitter:image" content="' + IMAGE_URL + '">',
)

def prepare(source: Path, output: Path, png: Path) -> None:
    source = source.resolve()
    output = output.resolve()
    png = png.resolve()
    if not source.is_dir() or not png.is_file():
        raise ValueError("MISSING_SOURCE_OR_PNG")
    if output == source or source in output.parents or output in source.parents:
        raise ValueError("REVIEW_OUTPUT_MUST_BE_SEPARATE_FROM_SOURCE")
    if output.exists():
        raise ValueError("REVIEW_OUTPUT_ALREADY_EXISTS_ABORT")
    originals = {}
    processed = {}
    # Validate every input before writing anything.
    for route in PAGES:
        content = (source / route).read_text(encoding="utf-8")
        tags = list(OG_URL_TAG.finditer(content))
        if len(tags) != 1:
            raise ValueError("MISSING_OR_DUPLICATE_OG_URL: " + route)
        if 'property="og:image"' in content or 'name="twitter:image"' in content:
            raise ValueError("OG_IMAGE_ALREADY_PRESENT_STOP: " + route)
        expected_path = "/" if route == "index.html" else "/" + route.removesuffix("index.html")
        expected = "https://mrxpanel.com" + expected_path
        if tags[0].group(1) != expected:
            raise ValueError("OG_URL_CANONICAL_PATH_MISMATCH: " + route)
        addition = "\n" + "\n".join(OG_PROPS)
        if 'name="twitter:card"' not in content:
            addition += '\n<meta name="twitter:card" content="summary_large_image">'
        # Preserve the exact rest of every source file, including JSON-LD dates.
        processed[route] = content[:tags[0].end()] + addition + content[tags[0].end():]
        originals[route] = content
    output.mkdir(parents=True, exist_ok=False)
    for route in PAGES:
        target = output / route
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(processed[route], encoding="utf-8")
    assets = output / "assets"
    assets.mkdir()
    shutil.copyfile(png, assets / IMAGE_NAME)
    print("MRXPANEL_OG_INTEGRATION_PREVIEW_READY|PAGES=7|LIVE_MUTATION=NONE")

if __name__ == "__main__":
    cli=argparse.ArgumentParser()
    cli.add_argument("--source",type=Path,required=True)
    cli.add_argument("--output",type=Path,required=True)
    cli.add_argument("--png",type=Path,required=True)
    args=cli.parse_args()
    try:
        prepare(args.source,args.output,args.png)
    except (ValueError,OSError) as exc:
        print(f"MRXPANEL_OG_INTEGRATION_PREVIEW_FAIL|{exc}",file=sys.stderr)
        sys.exit(1)
