# PR #18 Open Graph reconciliation against integrated SEO PR #19 (30 October 2026)

**Scope: REVIEW ONLY — not merge-ready, not visual approval, not permission to publish.** This note records an actual offline cross-branch test. Historical PR #18 stays Draft and unchanged except for this review document. Source reference [PR #19](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/pull/19): `ce5395266f285c5c4ef705742eeb93dc53001db6`; OG source [PR #18](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/pull/18): `d73bf977a81db1f0ff9d796f3ac03d1df528ad53`.

## Confirmed release blockers

1. PR #18 references `https://mrxpanel.com/assets/mrxpanel-og-1200x630.png` in seven HTML pages, but the binary asset **is not present in PR #18**. Do **not** publish broken OG image links.
2. `review/og-seven-page-release-20261025/release-status.json` still says `approved_for_production=false` and `approval_status=pending_owner_review`. Owner visual approval is still required; changing JSON flags is not equivalent to approval.
3. PR #18 targets `seo/article-structured-dates-20261024`, not `main`. After `git fetch --unshallow`, actual `git merge-tree --write-tree` PR #19 + PR #18 returned **exit 1** with four conflicts: `cara-menggunakan-panel-smm/index.html`, `memilih-provider-smm/index.html`, `panduan-reseller/index.html`, and `scripts/seo_review_check.py` (add/add). The existing PR #18 HTML SHA pins are for a different snapshot and cannot be reused.
4. Four PR #19 content routes still await real-publication-date decisions at [SEO Release Gate #16](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/16). Metadata success must not bypass the separate publication-date or merge authorization gates.

## Local-only reconciliation proof

A **detached worktree** was created from exact PR #19 HEAD and the seven `og:image*`/Twitter metadata sets were copied **only as HTML metadata** from PR #18. Existing content, canonical URLs, Article JSON-LD, internal calculator links, legal footer, and Member Area CTA remain intact. Existing `twitter:card` is preserved rather than duplicated.

For repeatable file identity across Windows and GitHub, PR #19 input bytes were read from the **Git blob**, not from a CRLF-converted checkout. The exact *prototype-only* HTML blob hashes are:

| Page | OG-integrated prototype Git blob SHA |
| --- | --- |
| `index.html` | `c8f6e5d718b9e18fe053bb170bd7ef587da49c26` |
| `panduan-reseller/index.html` | `da3cf3bff16101796a95163887caa1d7fe16601c` |
| `cara-menggunakan-panel-smm/index.html` | `9f28a00d57e892f2a8b2031ac55e454774ee8e85` |
| `memilih-provider-smm/index.html` | `9efde6bda834290f68d741892099f6082eb9ff12` |
| `apa-itu-panel-smm/index.html` | `105cd5b9c5166f1b22a3701ae64a7ef1bad15f7b` |
| `api-panel-smm-reseller/index.html` | `9a702bbe9ad8831eb7510680423e8abe2355ace7` |
| `kalkulator-harga-jual-reseller-smm/index.html` | `cb335271d40f08c305633da7cb4b1660f82cd663` |

Offline output locations (Office, **not published**):
- `C:\Users\user\Documents\MRXPANEL_CMO_GEN7_SEO_REVIEW_20261030\PR19_OG_METADATA_RECONCILIATION_OFFLINE`
- `C:\Users\user\Documents\MRXPANEL_CMO_GEN7_SEO_REVIEW_20261030\PR19_OG_METADATA_RECONCILIATION_20261030.json`
- `C:\Users\user\Documents\MRXPANEL_CMO_GEN7_SEO_REVIEW_20261030\reconcile_pr19_pr18_og_metadata_offline.py`

**Actual offline QA results:** 10/10 independent tests PASS — eight Node SEO/content/date tests, one seven-page Python static SEO check, one re-pinned PR #18 OG review gate. Both intentional release attempts still **fail closed**: OG requires owner visual approval, and SEO publication-date gate requires human approval. `git diff --check` exits 0. **No PNG is present in the prototype.** QA in Draft review mode means tags reconcile, not that any social preview image will render.

## CTO decision and safe next release stages

1. **Release PR #19 content only if authorized**, after real publication date decisions; optionally release independent PR #21 for favicon and legacy-auth `noindex` in its own approved sequence. Confirm live 7-page SEO smoke and 6 calculator inbound links.
2. Keep PR #18 as **HOLD** until a 1200×630 genuine reviewed branded PNG is available and owner has explicitly approved its exact visual. The existing manifest asserts SHA-256 `ea2c611f2c5302561cd93afe15d0679f66926015d4d31c71bdb1b1b68d7ce929`; this SHA must be independently verified against an actual approved binary, not assumed from the manifest.
3. Rebase/rebuild OG work **from actual, most recent `main`** after approved content changes. Reapply image metadata without overwriting FAQ or JSON-LD; never assume these prototype hashes remain valid after date/HTML updates.
4. Re-pin the seven actual production-candidate HTML Git blob hashes in the OG validator, reconcile other QA scripts by test intention (do not blindly take `ours` or `theirs`), add the reviewed binary asset only with approval, and run both OG release gate and SEO/date/content QA on the final candidate.
5. Require separate approval for production merge/deploy; perform postrelease GET smoke for seven pages and PNG 200/image PNG 1200×630, and validate real WhatsApp/Facebook/X previews without creating broken references. Rollback only through authorized release process.

**End status:** `RECONCILIATION_OFFLINE_10_OF_10_PASS | OG_IMAGE_MISSING | OWNER_APPROVAL_MISSING | SEO_PUBLICATION_DATE_APPROVAL_MISSING | PRODUCTION_HOLD`. This document does not modify the seven production or Draft HTML files.
