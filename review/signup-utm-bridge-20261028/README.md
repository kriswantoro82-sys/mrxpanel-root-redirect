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


---

## HOME PAGE JOURNEY EXTENSION — CMO 28 OCT 2026

The initial bridge fix only forwarded UTM values that were **already on `/signup/`**. But the live homepage's five account-registration links all used literal `href="/signup/"`. Campaign tags from `/?utm_source=...` were therefore dropped by the very first CTA click, before reaching the bridge. This was a **material gap** in initial Draft scope.

The same Draft PR now proposes a small `<script id="signup-utm-link-propagation">` on `index.html`:
- Read bounded allowlisted campaign values only from current homepage query.
- Rewrite **only** the five anchors whose exact original value is `/signup/`, retaining that exact official path with approved UTM query.
- Never touch sign-in links, external links, navigation fragments, credentials or URL fragments.
- No local or session storage; no extra pageview or event; no private browsing data read.
- If no valid UTM values exist, keep existing links unchanged.
- Added separate Chromium test `qa/homepage-signup-utm-journey.test.cjs` that uses a localhost homepage and signup bridge with an intercepted Member Area response. The simulated journey tests normal JavaScript and no-JavaScript behavior, including attempted redirect overrides.

**Known limits:** JavaScript-disabled homepage navigation uses the existing plain `/signup/` links and cannot preserve campaign tags. Neither this patch nor its tests prove that Member Web stores tags beyond the incoming URL, associates tags with real signup, or that CTA database tracking works. The external tracking Worker needs a separate compatibility review against this modified link query. Article-page navigation can also discard original homepage UTM parameters; this Draft does not add cross-page storage or automatic campaign propagation.

**Release decision:** the staging evidence addresses a known attribution gap but is not permission to publish. CTO needs to reconcile current homepage (PR #19 also changes homepage), mobile accessibility, Member Web login/recovery behavior and actual tracker interception in the authorized release environment. Do not merge either overlapping homepage PR without conflict review. No production mutation or customer event was performed in this extension.
