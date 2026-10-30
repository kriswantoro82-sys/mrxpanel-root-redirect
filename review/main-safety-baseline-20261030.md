# Main Safety Baseline — review-only preparation (30 October 2026)

This change is in **Draft PR #25**. Production main is not modified. It adds one stable, universal, read-only GitHub Actions job named **main-safety-baseline**. Unlike the existing PR-specific SEO workflows, it triggers for every pull_request targeting main regardless of changed paths, plus push to main.

## Checks

- Reads the existing SEO sitemap dynamically; requires at least the seven current canonical URLs, unique valid loc and lastmod, and an HTML file for each URL.
- Verifies one canonical and one og:url equal to each sitemap URL, indexable robots, H1, valid Article datePublished/dateModified and sitemap lastmod not earlier than Article modification.
- Checks local HTML links resolve to actual local files, and every URL listed in the sitemap is reachable by links starting from the homepage.
- If same-domain Open Graph or Twitter image metadata is added later, it requires a corresponding local image asset. This intentionally permits future approved image designs; there is **no** hardcoded PR19 image SHA/design.
- Verifies ICO file header if favicon.ico is present.
- Runs in-process negative tests on bad canonical, nonexistent OG image reference and invalid sitemap lastmod.
- No network calls, authentication, deployments, mutations, branch controls, or changes to release dates.

## How to use safely

1. Review Draft PR #25, including unrelated SEO/date changes, and obtain separate CTO/owner production authorization and actual publication date reconciliation. Do not merge just to install this job.
2. Observe **main-safety-baseline** success on the exact authorized release commit and subsequently on default branch.
3. Only once present and observed on main, repository administrator may configure branch protection/rulesets to require pull requests and this stable status check, prevent force push/delete, and set eligible reviewers. Explicit settings authorization is required.
4. Do not require transient PR19/PR25-specific, path-filtered or draft-release-hold checks in repository rulesets, as they can produce missing/skipped contexts and block unrelated PRs.
5. A passing GitHub Action is not an approval. A pending, failed or skipped action is not automatically enforced unless branch protections actually require it.
6. The branch was previously observed as unprotected and with no repository rulesets; verify current live settings before enabling requirements.

This work does not release SEO, approve the OG image, approve a content date, or assert that Google has indexed any URL.
