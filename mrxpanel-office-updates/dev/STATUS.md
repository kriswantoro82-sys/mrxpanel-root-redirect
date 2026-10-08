# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.25 DEV — HEAD + HAIR REBUILD**

Stable channel: **V1.3.0** (unchanged)

## V3.25 head + hair rebuild
- Rebuilt the visible head instead of continuing micro-adjustments to V3.24.
- Cranium is narrower and slightly smaller.
- Mid-face and tapered jaw are separate volumes to avoid the old double-ball silhouette.
- Hair is integrated directly into the skull silhouette instead of being treated as a rotated cap.
- Neck remains on the accepted V3.22 anchor.
- Accepted V3.20 body orientation remains unchanged.
- Formal source is pinned to commit `6b4ea1fa5cac41e99af0cc0f472054e2f7512513`.
- JavaScript commit-pinned preflight: PASS.
- Target SHA256: `3bb97bbb0408df472aa1e95bf9a02ab1800f628caa22c65ebbd214562737086c`.

## Visual review gate
- Runtime load is guarded by the active/local hash and stable hash.
- Final visual acceptance is still required before any stable promotion.
- Stable V1.3.0 must remain untouched.

Stable V1.3.0 remains untouched.
