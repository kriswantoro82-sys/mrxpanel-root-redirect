# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.29 DEV — HEAD PROFILE REBUILD**

Checkpoint state: **PASS / FROZEN FOR 3D SPECIALIST HANDOFF**

Stable channel: **V1.3.0** (unchanged)

## Owner decision — 2026-10-09
- Stop further procedural 3D head/hair polishing in the current lane.
- V3.29 is accepted as a **development checkpoint PASS**, not as final visual approval.
- Do **not** promote V3.29 to stable.
- Automatic MRXPANEL OFFICE batch-polish work is paused.
- Future continuation should move to a Maya / specialist with stronger 3D modeling capability, preferably after Hermes 3D skill acquisition.
- Next major milestone: **V4 — Character Model Replacement**.

## Verified V3.29 checkpoint
- Source commit: `4d0cdc0619564a4decb59b7073386c3cdce079a1`
- Active/dev SHA256: `aacbccc629a737d442c77a25b21e74279fb397610577ff957d51b93d3d3863bc`
- MASB5 load: **PASS**, attempt_count=1.
- Stable V1.3.0 SHA256: `08e1a7f004c450126ae22fd07d0679b2fb044bef052b51bf2c03718c5db263e0`
- Stable updater: **1.3.0**, unchanged.

## Preserve for V4
- MRXPANEL OFFICE desktop-shell/module integration.
- Office architecture, furniture and layout baseline.
- Character cast, labels and role identity.
- Accepted body orientation.
- V3.26 workstation/grounding improvements.
- V3.27 motion/arrival smoothing and gait cadence work.
- V3.28 relaxed REVIEWING/IDLE pose correction.
- Existing routing, camera/orbit controls, shadows, task-light details and performance safeguards.

## Do not continue
- Do not keep micro-adjusting procedural head/hair sphere geometry.
- Do not treat V3.29 head/hair as final-quality character art.
- Do not modify stable V1.3.0.
- Do not auto-retry ambiguous mutations.

## V4 direction
Replace the current procedural head/hair treatment with a properly authored 3D character/head mesh (preferably GLB) that can be bound to the existing skeleton/animation pipeline. The future specialist should focus on mesh quality, proportions, hair topology/silhouette, rig compatibility, skinning, and clean integration with the existing office behavior system.

See: `HANDOFF_V3.29_TO_V4.md`
