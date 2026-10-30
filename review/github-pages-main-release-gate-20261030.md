# MRXPANEL — GitHub Pages source, release gate, and recovery (30 October 2026)

## Verified source-of-truth, authenticated read-only
- GitHub repository: `kriswantoro82-sys/mrxpanel-root-redirect`.
- Repository Settings > Pages explicitly shows **site live at https://mrxpanel.com/**, source **Deploy from a branch**, **main**, **/ (root)**; GitHub labels the publishing workflow **pages build and deployment**. The `CNAME` tracked in `main` contains `mrxpanel.com`.
- Public unauthenticated GET shows `server: GitHub.com` and HTTP 200 for homepage and sitemap; DNS A records 185.199.108.153 through 185.199.111.153. These facts align with GitHub Pages.
- Settings > Branches lists options for adding branch rules without any existing classic protection rule.
- Settings > Rulesets says **"You haven't created any rulesets"**. Therefore main currently has **no GitHub branch/ruleset enforcement** of approvals, status checks or push restrictions. CI success alone cannot protect it.
- All findings are **read-only**. No GitHub Pages configuration or branch protection was changed.

## Current reviewed candidate
- [PR #25](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/pull/25): **Ready for review**, no CTO GitHub approval, not merged, exact HEAD `54f82cd33b1dec114396a7380c0d551cd02f1bf1`.
- Baseline production branch `main` observed at `693f42f8fad9057b46c5c177d33194c926e86b5d`.
- Exact-HEAD local offline merge to main succeeded on 42 files, 15/15 QA passed; local revert restored exact original git **tree hash**. This proves **code-level reversibility only**, not completion of a real GitHub Pages redeployment.
- Google Search Console direct URL Inspection: 6/7 public SEO URLs indexed; calculator crawled but not indexed. Additional contextual links in PR are helpful candidates, not guaranteed indexing.

## Required gates before *any* production merge
1. Owner authorizes GitHub Pages release explicitly. A generic `lanjut` is **not** a release authorization.
2. Assign a real authorized CTO/reviewer identity, obtain substantive code review and acknowledge the 42-file scope. Do not invent an approval from another ChatGPT role.
3. Owner/repo admin considers **enforcing** a main-branch ruleset (pull requests, at least one independent review, stable required `main-safety-baseline` status and any other selected checks, deny force pushes/deletions, documented bypasses). **Changing rules is a separate repo-admin decision**; the review is not protected until rules are actually enabled and confirmed.
4. Confirm actual day `D` for deployment. Reconcile metadata only where changes are genuinely substantial: home sitemap lastmod, and tutorial/apa-itu/API Article `dateModified`, sitemap lastmod, visible updated dates where present. Do **not** rewrite `datePublished` or historical unchanged article dates. Never predate or future-date a release. Run preview first.
5. Create a new exact reviewed commit for date changes; verify full QA and required GitHub Actions on the **new** SHA. Confirm main has not changed, no overlapping PR #19 merge, and check actual merge plan and code diff.
6. Only after the prior gates are documented and there is explicit merge approval, merge exactly the approved PR SHA into `main`. GitHub Pages builds automatically from `main` / root, so merging can be a **production change**, not merely administrative housekeeping.

## Post-release verification and recovery
- Verify GitHub Pages **pages build and deployment** has completed successfully for the approved main SHA before asserting that changes are live.
- Run GET-only live smoke for seven SEO URLs, `sitemap.xml`, canonical, robots, dates, favicon, legacy auth bridges, calculator source links; confirm deployed HTML markers and HTTP response. Record deployed SHA, deployment time, observed HTTP validators, and issue reference.
- If rollback becomes necessary, verify current `main` SHA and whether any unrelated commits arrived after release. **Prefer an authorized revert commit on main** (preserves history); do **not** force-push, hard-reset main, or overwrite concurrent changes. Wait for the resulting GitHub Pages deployment and perform the same live smoke before calling rollback complete.
- Offline `git revert -m 1` tree equality is **not** proof that GitHub Pages reverted; publication and CDN propagation must be independently observed.
- Google can take time to recrawl; no repeated indexing requests or sitemap submission unless independently justified.

**Status: REVIEW_READY | PRODUCTION_RELEASE_HOLD.** No live deployment, branch-policy mutation, review approval, payment, or GSC mutation performed.

## Site publishing boundary found during CTO technical pre-review (30 October 2026)

**Finding:** GitHub Pages is configured to publish the repository root through Jekyll. PR #25 introduces non-website QA scripts and review notes in ordinary top-level folders `qa/`, `review/`, and `scripts/`. Jekyll by default can copy non-underscore, non-dot source folders into the published site, resulting in unnecessary public site artifacts and SEO crawl pollution.

**Candidate-only correction:** Add root `_config.yml` with `exclude` entries for `qa`, `review`, `scripts` plus Jekyll v3 traditional defaults (`Gemfile`, `Gemfile.lock`, `node_modules`, `vendor`). Do not disable Jekyll with `.nojekyll`. Extend universal `qa/main-safety-baseline.cjs` to require the publishing exclusions and deliberately reject missing `review` exclusion. Targeted local test PASS; negative checks 4/4. This correction does not remove files from the public GitHub **repository**, only requests exclusion from the generated **website**.

**Verification limitation:** No local Jekyll runtime was installed on Office. After an authorized release, verify the actual GitHub Pages build and GET that public website paths under `/qa/`, `/review/`, `/scripts/` return 404 while all seven SEO routes, `sitemap.xml`, `CNAME` behavior and `robots.txt` remain intact. Never assert production isolation based solely on static config check.

## Postdeployment Jekyll output exposure detection, review candidate only (30 October 2026)

Updated the manual GET-only `qa/seo-postdeploy-live-smoke.cjs`: when explicitly run with `--mode=postdeploy` **after an authorized deployment**, it now requires strict HTTP 404 at the unredirected URLs `/qa/main-safety-baseline.cjs`, `/review/github-pages-main-release-gate-20261030.md` and `/scripts/seo_review_check.py`. A 200, unexpected redirect, HTTP/network error, or 403 is not accepted as proof of exclusion. No mutation is performed.

Added network-free `--self-test` (3 deliberate negative cases), wired into the universal `main-safety-baseline` CI job. Positive example is accepted. A **separate GET-only live baseline** confirms these three URLs are presently HTTP 404 on production `main`; this does not prove the post-merge Jekyll output, which must be checked after release. The check does **not** assume a GitHub repository is private: excluded source files remain visible in a public repository.

After the separately approved Pages release: `node qa/seo-postdeploy-live-smoke.cjs --mode=postdeploy`; independently confirm GitHub Pages deployment and all three 404 checks. A passing pre-deploy self-test does not grant release authorization.

## CI verification of actual GitHub Pages/Jekyll build artifact (30 October 2026)

The prior _config.yml exclusion tests only examined source configuration. Added GitHub Actions workflow `.github/workflows/seo-pages-artifact-qa.yml` to build a **PR-only local preview** using the official `actions/jekyll-build-pages@v1` Jekyll build action. It has only `contents: read`, **no deploy job**, **no Pages write or OIDC permission**, no artifact upload, and does not change the configured branch publishing source.

The generated `./_site` is independently checked by `qa/seo-pages-artifact.test.cjs`: the seven existing SEO page output files, sitemap.xml, robots.txt, CNAME and both icon assets must exist; folders `qa`, `review`, `scripts`, `.github` and config file `_config.yml` must **not** appear in built output. CNAME must equal `mrxpanel.com`; every SEO page must retain an H1. The standalone network-free self-test rejects six intentionally broken cases (five published-source directories and missing homepage). Local 6/6 self-test PASS.

This is a **real build-artifact CI guard**, stronger than merely matching `exclude` text, but it is not a production deployment or a live CDN inspection. It must pass on the final date-adjusted release SHA and the approved GitHub Pages deploy and GET-only smoke must still be verified separately. Official action reference: https://github.com/actions/jekyll-build-pages .