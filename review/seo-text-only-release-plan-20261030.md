# MRXPANEL SEO — independent text-only Draft review (30 October 2026)

**Status: DRAFT / RELEASE HOLD.** [Draft PR #25](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/pull/25) targets **main** directly and is the single proposed text-only integration path. Its source is the review integration [PR #19](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/pull/19), which remains separate, unmerged and must not be merged alongside #25. Production branch and live pages were not changed.

## Proposed content and scope

- Review diff against production base main: 36 files at original head 19b8bdb, including seven public SEO HTML pages, two legacy auth bridges, favicon.ico, read-only QA/workflows and review documents.
- All seven public pages retain canonical, OG title/description, robots and existing article JSON-LD. Missing OG image URLs were removed; Twitter cards use the small summary setting.
- Homepage adds two FAQ entries, email-verification guidance and visible legal operator identity.
- Relevant articles add context and internal links to the reseller calculator without treating simulated prices as real prices.
- Legacy auth/login and auth/register gain noindex,follow while retaining their existing bridge to https://member.mrxpanel.com/.
- No change to wallet, money, orders, payments, Supabase, DNS, hosting, indexing requests, or deployment.

## Publication-date decision matrix (not yet authorized)

D = the actual day on which changed substantive content becomes public. Do not substitute the Draft commit date or Google crawl date.

| Route | Decision for authorized release |
| --- | --- |
| / | Review new FAQ/hero as significant; update sitemap lastmod to D if approved |
| /cara-menggunakan-panel-smm/ | If calculator FAQ significant, align Article dateModified, visible updated time and sitemap lastmod to D; preserve datePublished 2026-10-19 |
| /apa-itu-panel-smm/ | If calculator paragraph significant, align Article dateModified, visible Indonesian date text and sitemap lastmod to D; preserve datePublished 2026-10-22 |
| /api-panel-smm-reseller/ | If new calculator paragraph significant, align Article dateModified and sitemap lastmod to D; preserve datePublished 2026-10-24; do not invent a visible date |
| /panduan-reseller/ | Date label/schema only; preserve historical dates unless reviewer finds a meaningful edit |
| /memilih-provider-smm/ | Historical date alignment only; preserve historical dates unless reviewer finds a meaningful edit |
| /kalkulator-harga-jual-reseller-smm/ | No calculator content edit; preserve historical date |

No date is authorized for publication yet. The date-review script deliberately fails closed in release mode.

## Verification and release safeguards

1. Branch local QA: 11/11 PASS; 7/7 text-only pages and 8/8 negative metadata cases. Verify GitHub Actions on the latest exact commit and base main.
2. Only the designated PR #25 candidate branch runs its specific GitHub Actions. This candidate-specific workflow is not a global production release gate.
3. CTO and owner must separately approve significant edits, actual date D, rollback, and production merge/deploy permission. A general continuation request is not explicit release authorization.
4. Record latest main SHA, inspect the full diff, prevent duplicate merges from PR #9/#11/#14/#15/#19 and run complete QA after any date edits.
5. After a separately authorized deployment, GET-only smoke test all seven HTTPS pages, sitemap, canonical, dates and calculator links, favicon, legacy auth bridge and tracker; record deploy SHA/time and rollback.
6. Open Graph PNG and PR #18 stay separate until design approval and a real image binary. Do not publish broken media URLs or repeat an accepted indexing request solely to accelerate Google.

Evidence: [release gate issue #16](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/16).

## CMO Gen 8 — safe publication-date preview (30 October 2026)

A new read-only helper, qa/seo-publication-date-preview.cjs, computes exact *hypothetical* date change locations for four substantive-content candidates. It does **not** update files and must never stand in for production approval.

Usage after validating the proposed day with CTO/owner:
- node qa/seo-publication-date-preview.cjs --date=YYYY-MM-DD (JSON preview only)
- node qa/seo-publication-date-preview.cjs --self-test (strict negative checks)

Only four sitemap lastmod routes are candidates: homepage, tutorial, apa-itu-panel-smm, and api-panel-smm-reseller. Three corresponding Article dateModified fields are candidates; tutorial visible time and apa-itu-panel-smm visible Indonesian prose are synchronized in memory. Article datePublished is preserved verbatim. Panduan reseller, provider, and calculator dates remain unchanged. Negative tests reject invalid/backdated dates and inconsistent visible date copy.

**Status:** hypothetical mapping ready; no date was published or approved, no file was written, no production change, no permission granted. Owner/CTO decision and exact deployment date D remain required.

## CMO Gen 8 — link graph verification (30 October 2026)

Added a deterministic, read-only QA script, qa/seo-seven-page-link-audit.cjs, to the **Draft PR #25-only** workflow. It parses 101 hyperlinks across the seven SEO pages, checks all nine distinct mrxpanel.com local destinations exist, verifies in-page anchor targets and verifies every SEO route is reachable from the homepage. Results: 7/7 routes reachable, 0 missing local destinations, 0 broken local anchors. Three negative fixtures intentionally inject a nonexistent local route, isolate a sitemap article from the home link graph, and inject a nonexistent anchor; all are correctly rejected.

The only two external website destinations in these page links are https://member.mrxpanel.com/ and https://member.mrxpanel.com/api/. Both were independently verified with unauthenticated GET to respond HTTP 200. The new CI test remains **static only**, with no HTTP dependence and no network mutations.

No live SEO HTML was changed. This does not establish release consent or Google indexing status; Draft and release-date approval remain on hold.
