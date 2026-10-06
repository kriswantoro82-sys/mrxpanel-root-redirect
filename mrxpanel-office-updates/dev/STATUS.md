# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.16 DEV — MOTION & PERFORMANCE POLISH**

Stable channel: **V1.3.0** (unchanged)

## Realism baseline now implemented
- 8 rigged 3D characters with distinct roles/outfits.
- Character stature normalized against 0.70m desks; current character scales are closer to plausible adult proportions.
- Standing workstation arm pose remains calibrated to desk/keyboard height.
- Fake seated body-sinking remains disabled; chairs remain withheld until a true sit rig exists.
- Character face/hair/accessory proportions remain tightened.
- Softer key/fill lighting and restrained material palette are preserved.
- Warm wall-mounted practical fixtures remain in place.
- Furniture contact grounding is preserved, but contact shadows are now lighter/thinner so they read less like dark mats.
- Character ground shadows are lighter and smaller.
- Human-scale walls, door openings, framed windows, upper glass bands and baseboards remain intact.
- Workstations remain structurally grounded with monitor, stand/base, keyboard and mouse.
- All 8 characters keep architecture-aware multi-waypoint routes.
- Risky paths remain clearance-audited.
- Route traversal stays distance weighted.
- Travel now uses eased acceleration/deceleration while gait timing remains synchronized to world distance.
- Turn smoothing remains frame-rate independent.
- Per-character joint buffers are reused instead of allocated every frame.
- Character makeover reads joint matrix slices without creating extra typed-array copies.
- HUD throttling and render pixel budget remain active.
- Full-width office presentation remains unchanged.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. Live Hermes visual review is required.
2. Verify arm/hand position reads naturally from the actual in-app camera.
3. Verify lighter contact shadows now feel grounded without disappearing.
4. Verify full-height walls and door frames from multiple camera angles.
5. Verify no route clipping remains around doorway/workstation corners.
6. Verify gait cadence/world speed and 8-character performance in the shell.
7. Final Kris/Maya executive polish after live visual feedback.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the 3D shell passes visual review.
