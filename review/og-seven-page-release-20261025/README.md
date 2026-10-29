# MRXPANEL Seven-Page OG Metadata — Draft HOLD (25 October 2026)

This is an **implementation staging branch**, not a deployment. Based on PR #14 at exactly `11ef2f5309019eda0954f550e23521dcd08dc887`, which itself depends on PR #9.

The seven HTML documents contain absolute OG image references to `https://mrxpanel.com/assets/mrxpanel-og-1200x630.png`, together with alt text, pixel dimensions and Twitter image tags. Their Git blob hashes are verified against the offline ZIP provided to CTO and pinned in `qa/verify_og_release_gate.py`. The draft GitHub Action checks the seven HTML files with no browser, network, secrets, account changes or deployment.

**CRITICAL RELEASE HOLD:** The referenced PNG is **NOT COMMITTED** to this branch and **NOT YET LIVE**. Owner approval is also **NOT GRANTED**. A green **draft QA** says the metadata was prepared faithfully; it does **not** mean the site can be deployed. Never merge this PR while those conditions remain.

Before a future merge, a reviewer with real production authority must approve the visual in writing, add the **exact SHA-256 matching** raster PNG to `assets/mrxpanel-og-1200x630.png`, set approval status explicitly through the authorized workflow, run `python3 qa/verify_og_release_gate.py --mode release` successfully, and reassess the diff relative to the latest official PR #9→#14 merges. Confirm existing canonical, JSON-LD dates and registered CTA flows. Record the final release approval, deploy only through an authorized path, then run read-only public smoke against the seven URLs and PNG, plus actual WhatsApp/Facebook/X sharing.

The PNG and all seven pages exist in a downloadable **REVIEW_ONLY_DO_NOT_DEPLOY** ZIP from 25 October 2026, but an artifact ZIP is not a live production asset and no public release has occurred.

No merge, deployment, DNS/Cloudflare/GitHub Pages setting edits, or Supabase SQL mutations are performed by this branch.


## Two-stage CI gate (25 October 2026)

[Workflow](../../.github/workflows/og-seven-page-gate.yml) is explicitly split by pull-request state:

- **Draft:** `draft-review` checks the exact seven HTML blobs and `release-status.json` pending values. It deliberately attempts `--mode release` and must observe the expected `OWNER_VISUAL_APPROVAL_REQUIRED` denial. This negative test proves that an unapproved candidate does **not** accidentally pass the release script. The separate `release-gate` job is skipped while Draft.
- **Ready for review:** `release-gate` requires `approved_for_production=true`, `approval_status=approved`, the committed binary PNG at the exact asset path, its reviewed SHA-256, valid PNG magic and 1200×630 dimensions, plus seven exact HTML hashes. It fails closed when any check is missing. The `ready_for_review` event is explicitly included so the check will execute when a reviewer changes PR state.

**Evidence:** [Actions run #40144390744](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/actions/runs/40144390744) SUCCESS (attempt 1), with `MRXPANEL_OG_DRAFT_METADATA_QA_PASS=7/7|RELEASE_GATE=HOLD|PNG_COMMITTED=NO` and `MRXPANEL_OG_RELEASE_HOLD_PROVEN=PASS|OWNER_APPROVAL_PENDING|PNG_NOT_COMMITTED`. Independent SEO static QA [run #40144390720](https://github.com/kriswantoro82-sys/mrxpanel-root-redirect/actions/runs/40144390720) SUCCESS.

**Release authority caveat:** Changing the JSON approval flags is **not proof** of real owner permission. The owner must explicitly approve the visual and the CTO must retain evidence in the review process. A green CI gate does not itself grant permission to merge, deploy, or modify GitHub Pages settings. Branch protection / required status checks have **not been confirmed** in this audit, so CI cannot be described as an enforced GitHub merge block. Keep the PR Draft until authorized, and recheck parent PR #9→#14 before any merge.
