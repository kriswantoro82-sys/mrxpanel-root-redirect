# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.11 DEV — ARCHITECTURAL SCALE**

Stable channel: **V1.3.0** (unchanged)

## Realism baseline now implemented
- 8 simultaneous rigged 3D characters.
- Fake seated body-sinking removed; chairs remain withheld until a true sit rig exists.
- Character face/hair/accessory proportions tightened.
- Softer key/fill lighting and restrained material palette.
- Neutral carpet, warmer perimeter walls, darker architectural partitions, muted wood/metal/server colors.
- Physical baseboards, framed windows and framed door openings.
- Interior partitions are now full office height instead of waist-high prototype walls.
- Upper glass bands preserve dollhouse visibility without fake low walls.
- All 8 characters use explicit architecture-aware multi-waypoint routes.
- Route traversal is distance weighted.
- World travel duration is based on route length and a consistent office walking speed.
- Skeletal gait phase is synchronized to distance travelled.
- Walk blend eases in/out and turning is frame-rate independent.
- Staff traffic is staggered and work/review motion is restrained.
- Stationary staff face their workstations.
- Workstations have monitor body, stand/base, keyboard and mouse.
- Full-width office presentation with compact controls.
- Route metrics are cached outside the frame loop.
- HUD status nodes are cached and throttled.
- Render density is pixel-budgeted for steadier 8-character performance.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. Visual review of full-height partitions and door openings.
2. Verify no route clipping through wall edges/door frames.
3. Verify gait/world speed match from normal camera angles.
4. Verify character/furniture scale after architectural wall correction.
5. Verify workstation arm posture is acceptable.
6. Verify 8-character performance in Hermes.
7. Final lighting/material balance after visual review.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the 3D shell passes the next realism review.
