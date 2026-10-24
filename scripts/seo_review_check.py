#!/usr/bin/env python3
"""Read-only static SEO regression checks for MRXPANEL Pages draft.

Runs offline against files checked out from the reviewed commit.
No network, credentials, deployment, write, or production state.
"""
from __future__ import annotations

from datetime import date
from html.parser import HTMLParser
import json
from pathlib import Path
import sys
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
HOST = "mrxpanel.com"
ARTICLE_DATES = {
    "/panduan-reseller/": ("2026-10-19", "2026-10-24"),
    "/cara-menggunakan-panel-smm/": ("2026-10-19", "2026-10-24"),
    "/memilih-provider-smm/": ("2026-10-22", "2026-10-24"),
}


class AuditHTML(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.canonicals: list[str] = []
        self.opengraph: dict[str, str] = {}
        self.meta: dict[str, str] = {}
        self.titles: list[str] = []
        self.h1: list[str] = []
        self.times: list[str] = []
        self.lang: str | None = None
        self._capture: str | None = None
        self._buffer: list[str] = []
        self.schemas: list[dict] = []
        self.hrefs: list[str] = []
        self.element_ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        if a.get("id"):
            self.element_ids.add(a["id"])
        if tag == "a" and a.get("href"):
            self.hrefs.append(a["href"])
        if tag == "html":
            self.lang = a.get("lang")
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonicals.append(a.get("href") or "")
        elif tag == "meta":
            if a.get("name"):
                self.meta[a["name"].lower()] = a.get("content") or ""
            if a.get("property"):
                self.opengraph[a["property"].lower()] = a.get("content") or ""
        elif tag == "time" and a.get("datetime"):
            self.times.append(a["datetime"])
        if tag in ("title", "h1"):
            self._capture = tag
            self._buffer = []
        if tag == "script" and a.get("type") == "application/ld+json":
            self._capture = "schema"
            self._buffer = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if self._capture == tag and tag in ("title", "h1"):
            txt = "".join(self._buffer).strip()
            (self.titles if tag == "title" else self.h1).append(txt)
            self._capture = None
        elif self._capture == "schema" and tag == "script":
            try:
                obj = json.loads("".join(self._buffer))
            except ValueError as exc:
                raise AssertionError("Invalid JSON-LD schema") from exc
            if isinstance(obj, dict):
                self.schemas.append(obj)
            self._capture = None


def audit() -> None:
    xml_path = ROOT / "sitemap.xml"
    doc = ET.parse(xml_path).getroot()
    links = [
        (el.text or "").strip()
        for el in doc.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
    ]
    assert len(links) == 7, f"Expected 7 URLs in sitemap, found {len(links)}"
    assert len(set(links)) == len(links), "Duplicate sitemap URLs"
    checked_articles: set[str] = set()
    for url in links:
        parts = urlsplit(url)
        assert parts.scheme == "https" and parts.netloc == HOST, f"Invalid sitemap host: {url}"
        assert not parts.query and not parts.fragment, f"Noncanonical sitemap URL: {url}"
        route = parts.path or "/"
        assert route.startswith("/") and (route == "/" or route.endswith("/")), f"Unexpected route: {route}"
        page_path = ROOT / route.lstrip("/") / "index.html"
        assert page_path.is_file(), f"Missing HTML for {route}"
        parser = AuditHTML()
        html_source = page_path.read_text(encoding="utf-8-sig")
        parser.feed(html_source)
        # Check every internal destination against a local checked-out file.
        # /signin/ and /signup/ are navigable bridges, not sitemap entries.
        for href in parser.hrefs:
            target = urlsplit(href)
            if href.startswith("#"):
                assert target.fragment in parser.element_ids, f"{route}: broken page fragment {href}"
            elif href.startswith("/") and not href.startswith("//"):
                dest = target.path or "/"
                assert dest == "/" or dest.endswith("/"), f"{route}: malformed local href {href}"
                dest_file = ROOT / dest.lstrip("/") / "index.html"
                assert dest_file.is_file(), f"{route}: missing internal destination {href}"
                if target.fragment and dest == route:
                    assert target.fragment in parser.element_ids, f"{route}: broken internal fragment {href}"
            elif href.startswith("//"):
                raise AssertionError(f"{route}: protocol-relative href requires review")
        assert parser.lang == "id", f"{route}: missing Indonesian lang"
        assert parser.titles and all(parser.titles), f"{route}: missing title"
        assert len(parser.h1) == 1 and parser.h1[0], f"{route}: missing/duplicate H1"
        assert len(parser.canonicals) == 1, f"{route}: missing/duplicate canonical"
        assert parser.canonicals[0] == url, f"{route}: canonical mismatch"
        assert len(parser.meta.get("description", "")) >= 70, f"{route}: short/missing description"
        assert parser.meta.get("robots", "").lower() == "index,follow", f"{route}: robots mismatch"
        if "og:url" in parser.opengraph:
            assert parser.opengraph["og:url"] == url, f"{route}: Open Graph URL mismatch"
        if route == "/cara-menggunakan-panel-smm/":
            assert parser.opengraph.get("og:title") == parser.titles[0], "Tutorial Open Graph title drift"
            assert parser.opengraph.get("og:description") == parser.meta["description"], "Tutorial Open Graph description drift"
            assert html_source.count('href="/kalkulator-harga-jual-reseller-smm/"') == 1, "Tutorial calculator link must be unique"
            assert "Hasil simulasi bukan pengganti harga aktual di katalog." in html_source, "Missing reseller pricing simulation disclaimer"
        if route in ARTICLE_DATES:
            matching = [x for x in parser.schemas if x.get("@type") == "Article"]
            assert len(matching) == 1, f"{route}: expected one Article JSON-LD"
            pub, modified = ARTICLE_DATES[route]
            article = matching[0]
            assert article.get("datePublished") == pub, f"{route}: published schema date mismatch"
            assert article.get("dateModified") == modified, f"{route}: modified schema date mismatch"
            assert parser.times == [pub, modified], f"{route}: visible dates != Article JSON-LD"
            assert date.fromisoformat(pub) <= date.fromisoformat(modified)
            checked_articles.add(route)
        print(f"PASS {route}: title/H1, canonical, meta, OG URL and applicable Article dates")
    assert checked_articles == set(ARTICLE_DATES), "Missing expected Article dates in sitemap"
    print(f"SEO_DRAFT_STATIC_QA_PASS|PAGES={len(links)}|DATED_ARTICLES={len(checked_articles)}")


if __name__ == "__main__":
    try:
        audit()
    except (AssertionError, FileNotFoundError, ET.ParseError, ValueError) as exc:
        print(f"SEO_DRAFT_STATIC_QA_FAIL|{exc}", file=sys.stderr)
        sys.exit(1)
