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
