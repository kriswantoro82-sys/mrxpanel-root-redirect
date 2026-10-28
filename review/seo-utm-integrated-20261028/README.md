# CMO / CTO — Integrated SEO plus campaign UTM release candidate, 28 Oct 2026

**REVIEW ONLY, NO PRODUCTION ROLLOUT.** This branch is based exactly on Draft PR #19 at commit e4320a1f6f84d49da6ba7e83765f69782aa7cf43.
It carries the existing FAQ, legal identity, SEO pages and QA from PR #19, plus the signup bridge and homepage UTM propagation reviewed in Draft PR #22 at commit c5bed7fcf8afbeb5310568eb9c94c0252c9389c9.

## What this resolves
- Homepage `index.html` here is an actual stored combined version, not a synthetic fixture: PR #19 copy with one isolated `<script id="signup-utm-link-propagation">` immediately before the existing tracker script.
- `signup/index.html` preserves up to four bounded UTM labels while keeping the official fixed member domain; it does not activate unsupported direct register deep links.
- Four review tests and the isolated-browser workflow are included. They preserve the `max_attempts=1` philosophy; no browser writes reach production.
- PR #19's existing SEO tests/workflows remain inherited, rather than reimplemented.

## Evidence and release gate
- This review branch must pass all GitHub Actions workflows after opening its Draft PR.
- Validate homepage legal identity, FAQ updates, canonical tags, article dates and sitemap against PR #19. Reconcile any source changes after frozen commits above before trying to release.
- Check actual Member Area login, registration, recovery and UTM tolerance in an authorized test browser. Mocked Member Area tests do not prove signup or conversion.
- Database CTA CHECK change (staging PR #13), Member Web direct registration (staging PR #6), WhatsApp publisher and DNS are explicitly out of scope.
- Ensure owner/CTO approval, compare code and expected effective files, choose this integration candidate *instead of* separately merging overlapping PR #19 and PR #22, and deploy at most once with verification. Do not auto-retry an ambiguous mutation.

**No merge into main, deploy, customer data mutation, database write or browser posting is performed by this Draft.**