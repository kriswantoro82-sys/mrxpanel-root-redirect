# MRXPANEL /signup/ UTM bridge — CMO draft review, 28 Oct 2026

**DRAFT / NOT DEPLOYED.** This review changes only the source branch, not the website, Member Web, Cloudflare, or any analytics database.

## Confirmed production-source gap

The main-branch static /signup/ bridge used meta refresh and `window.location.replace("https://member.mrxpanel.com/")` without forwarding landing-page UTM parameters. Its fallback anchor also pointed to the official Member Area. This design discards `utm_source` / `utm_campaign` when a campaign links directly to /signup/.

The proposed change:
- Keeps **the same official destination** `https://member.mrxpanel.com/` and the same requirement for a second click on **Daftar Akun Baru**.
- Passes at most one bounded ASCII value (maximum 128 characters) per approved key: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Unrecognized/duplicate/oversize/malformed values are discarded.
- Does NOT copy `auth`, `next`, `redirect`, `returnUrl`, `token`, `utm_term`, `gclid`, URL fragments, or arbitrary query strings.
- Updates the visible fallback link, then performs a single browser navigation to the allowlisted URL; no request to analytics API and no client storage.
- Leaves a no-JavaScript meta refresh fallback to the fixed official domain. Fallback delay three seconds lets JavaScript preserve UTM first. No-JavaScript visits may take longer; browser behavior must be tested.
- Does **not** use the unsupported `?auth=register` deep link. See [staging PR #6](https://github.com/kriswantoro82-sys/mrxpanel-job-staging/pull/6) and [signup issue #12](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/issues/12).

## Static QA

Run `node qa/signup-utm-bridge-review.test.cjs`. 22 cases exercise fixed destination, UTM allowlist, malformed query rejection, duplicate keys, length limits, fallback link, and absence of the unsupported registration deep link. Tests run entirely in Node VM with no network or production side effects. CI runs same test.

## CTO release and measurement gates

1. Reconcile any current `/signup/` deployment differences against this branch. Never overwrite newer code.
2. Validate arbitrary UTM query on Member Web **does not break login, registration, password recovery, or callback**. This branch does not prove Member Area stores/uses UTM tags.
3. Public campaign links should begin on `https://mrxpanel.com/?utm_source=...` when measuring site pageview. UTM forwarding through `/signup/` **is not** proof of a completed signup or a retained cross-domain session.
4. Before authorized release, test in real browser with and without JavaScript, stale caches, direct `/signup/` navigation, and desktop/mobile. Ensure `https://member.mrxpanel.com/` remains sole destination.
5. Keep analytics DB `cta_click` CHECK fix ([staging PR #13](https://github.com/kriswantoro82-sys/mrxpanel-job-staging/pull/13)) and Member Web deep link release as **independent** changes. Do not apply two conflicting SQL migrations.
6. Respect MASB5 `max_attempts=1`. No automatic retries for ambiguous releases or irreversible actions.

**No deploy, merge, DNS modification, database write, WhatsApp posting, or indexing submission occurs in this review.**
