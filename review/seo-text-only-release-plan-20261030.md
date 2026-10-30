# MRXPANEL SEO Text-Only Candidate — CMO Gen 8 (30 Oct 2026)

**State: LOCAL REVIEW CANDIDATE ONLY.** This is an isolated working copy based on PR #19 HEAD \`10cf4523f9671e1a91113827e0c0af7ad23a0f34\`. The original PR and production \`main\` are untouched.

## Purpose
Allow a review of already-prepared on-page SEO improvements **without** the unfinished Open Graph PNG. Seven pages retain OG title/description, canonical, structured data and internal links; seven unapproved \`og:image*\`/\`twitter:image\` meta lines are removed per page and the Twitter card falls back to \`summary\`.

## Safeguards
- Remove the old OG-image-specific Draft workflow, its helper scripts, and the image-choice manifest **only in this local candidate**; their original versions remain in PR #19 history.
- Add a new non-image-specific QA guard with negative tests and a read-only GitHub Actions workflow. This is no assertion that the real social-image design was approved.
- Preserve the working favicon.ico, safe legacy login/register bridges and 6 Article JSON-LD declarations.
- The date review deliberately stays fail-closed. The owner/CTO still must confirm actual significant content edits and actual publication date for applicable routes.
- Do not merge PR #9/#11/#14/#15 independently if their content is already incorporated by PR #19; verify the latest base and diff first.
- No automatic GSC re-indexing, DNS changes, Google Pages deploy, money operations or user-account changes.

## To review and prepare for release
1. Verify candidate SHA and full diff against current \`main\`; confirm all changed files are within the known SEO scope and no unexpected wallet/auth/order change.
2. Re-run the local static suites and GitHub Actions on an isolated Draft PR, if authorized. Reject any live OG image URL missing its PNG.
3. Have CTO/owner review the **actual** publication dates and authorize production through MASB5 release gate, keeping \`datePublished\` unchanged and changing only necessary \`dateModified\` / visible dates / sitemap \`lastmod\`.
4. Record pre-deploy main SHA and rollback. Only after production approval, release and re-check 7 HTTPS URLs, sitemap, canonical, login/signup bridges, favicon and link sources.
5. Let Google crawl normally; no repeated indexing request merely because the report is lagged.

## Verification facts
- Baseline PR #19 is Draft and unmerged; source HEAD: \`10cf452\` (30 Oct).
- Locally prepared seven pages, each removing exactly seven missing-image meta tags.
- Initial isolated candidate local test: text-only QA 7/7, negative 3/3; date-integrity review PASS but publication authorization HOLD.
- This candidate is not pushed, merged, or deployed. Image selection and social-image rollout remain separate.

## Addendum CMO Gen 8 — hardened validation, 30 Oct 2026

**Actual GitHub review state:** Draft PR #25, stacked on Draft PR #19 (not a main/release PR). Review branch: `cmo/gen8-seo-text-only-review-20261030`.

A review of the first candidate found a parser gap: checking for `<meta property="og:image"` only at the start of the tag could miss `<meta content="..." property="og:image"` and single-quoted/unquoted forms. The candidate now parses HTML attribute names and values without depending on their order, rejects all `og:image` / `twitter:image` variants, and checks OG URL equality to canonical.

Expected local QA: **7/7 pages plus 8/8 negative fixtures**, followed by the full static suite and GitHub Actions checks. This hardening changes only a QA script and this review record; it does not approve images, modify page content, deploy or relax the separate owner/CTO and publication-date release gate.

**Release dependency remains:** meaningful-content date reconciliation with the actual release date, documented rollback and explicit production release authorization. Do not change `datePublished` historically or auto-resubmit indexing requests.
