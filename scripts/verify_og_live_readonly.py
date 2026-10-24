#!/usr/bin/env python3
"""MRXPANEL OG release smoke test: offline review or explicit public GET only.

Default is *not* a live probe. No auth, credentials, writes, deploys,
DNS edits, SQL, browser sessions, cookies, or auto-retries.
"""
from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://mrxpanel.com"
IMAGE_PATH = "/assets/mrxpanel-og-1200x630.png"
IMAGE_URL = SITE + IMAGE_PATH
PAGES = (
    "/",
    "/panduan-reseller/",
    "/cara-menggunakan-panel-smm/",
    "/memilih-provider-smm/",
    "/apa-itu-panel-smm/",
    "/api-panel-smm-reseller/",
    "/kalkulator-harga-jual-reseller-smm/",
)

class Tags(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.canonicals = []

    def handle_starttag(self, tag, attrs):
        pairs = dict(attrs)
        if tag == "link" and pairs.get("rel") == "canonical":
            self.canonicals.append(pairs.get("href"))
        if tag == "meta":
            key = pairs.get("property") or pairs.get("name")
            if key:
                self.meta.setdefault(key, []).append(pairs.get("content"))

def one(values, key):
    got = values.get(key, [])
    if len(got) != 1:
        raise AssertionError(f"DUPLICATE_OR_MISSING_TAG:{key}")
    return got[0]

def audit_html(data: bytes, route: str):
    page = data.decode("utf-8-sig")
    parser = Tags()
    parser.feed(page)
    expected = SITE + route
    if parser.canonicals != [expected]:
        raise AssertionError(f"CANONICAL_DRIFT:{route}")
    require = {
        "og:url": expected,
        "og:image": IMAGE_URL,
        "og:image:secure_url": IMAGE_URL,
        "og:image:type": "image/png",
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:image:alt": "MRXPANEL — Panel SMM Indonesia untuk Reseller dan Bisnis",
        "twitter:image": IMAGE_URL,
        "twitter:card": "summary_large_image",
        "robots": "index,follow",
    }
    for k,v in require.items():
        if one(parser.meta,k) != v:
            raise AssertionError(f"META_MISMATCH:{route}:{k}")
    return f"PASS {route} og:image, Twitter card, canonical"

def audit_png(data: bytes, required_sha: str, content_type: str):
    if content_type.split(";",1)[0].strip().lower() != "image/png":
        raise AssertionError("WRONG_IMAGE_CONTENT_TYPE")
    actual = hashlib.sha256(data).hexdigest()
    if actual != required_sha:
        raise AssertionError("UNREVIEWED_IMAGE_SHA256")
    with Image.open(io.BytesIO(data)) as img:
        if img.format != "PNG" or img.size != (1200,630):
            raise AssertionError("WRONG_IMAGE_FORMAT_OR_DIMENSIONS")
        img.verify()
    return "PASS image SHA256/PNG/1200x630"

class NoRedirect(HTTPRedirectHandler):
    # Redirect responses should never be followed outside the pinned host.
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def public_get(url: str):
    if url not in (SITE + p for p in PAGES) and url != IMAGE_URL:
        raise AssertionError("UNEXPECTED_EXTERNAL_URL")
    req = Request(url, method="GET",
                  headers={"User-Agent":"MRXPANEL-SEO-Review-Readonly/1.0"})
    # No cookies, no vault, no tokens, no write requests.
    with build_opener(NoRedirect).open(req, timeout=12) as resp:
        if resp.status != 200:
            raise AssertionError("PUBLIC_GET_NOT_200")
        # Limit response size to avoid oversized/untrusted downloads.
        body = resp.read(2_000_001)
        if len(body) > 2_000_000:
            raise AssertionError("PUBLIC_RESPONSE_TOO_LARGE")
        return body, resp.headers.get("Content-Type", "")

def main():
    parser=argparse.ArgumentParser()
    group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--review-root",type=Path,
                       help="Offline preview folder from GitHub Actions, no network")
    group.add_argument("--check-live",action="store_true",
                       help="Explicitly GET only the 7 public HTML routes + 1 PNG")
    args=parser.parse_args()
    manifest=json.loads((ROOT/"review/og-card-20261025/preview-asset-manifest.json").read_text())
    expected_sha=manifest["png_sha256"]
    if manifest["approval_status"] != "pending_owner_review":
        raise AssertionError("MANIFEST_REVIEW_STATUS_DRIFT")
    if args.review_root is not None:
        folder=args.review_root.resolve()
        for route in PAGES:
            file=folder / route.lstrip("/") / "index.html"
            data=file.read_bytes()
            print(audit_html(data,route))
        image=(folder/IMAGE_PATH.lstrip("/")).read_bytes()
        print(audit_png(image,expected_sha,"image/png"))
        print("MRXPANEL_OG_OFFLINE_RELEASE_SMOKE_PASS=7/7|LIVE_REQUESTS=0|PRODUCTION_MUTATIONS=NONE")
    else:
        # Never derive destination from pages: only the literal pinned site above.
        for route in PAGES:
            response,ctype=public_get(SITE+route)
            if ctype.split(";",1)[0].strip().lower() not in ("text/html","application/xhtml+xml"):
                raise AssertionError("WRONG_HTML_CONTENT_TYPE")
            print(audit_html(response,route))
        image,ctype=public_get(IMAGE_URL)
        print(audit_png(image,expected_sha,ctype))
        print("MRXPANEL_OG_LIVE_READONLY_SMOKE_PASS=7/7|PUBLIC_GETS=8|PRODUCTION_MUTATIONS=NONE")

if __name__=="__main__":
    try:
        main()
    except (AssertionError, OSError, UnicodeError, HTTPError, URLError, ValueError) as exc:
        # Public metadata only; avoid logging arbitrary HTML, credentials or response bodies.
        print("MRXPANEL_OG_SMOKE_FAIL|"+type(exc).__name__+"|"+str(exc)[:180],file=sys.stderr)
        sys.exit(1)
