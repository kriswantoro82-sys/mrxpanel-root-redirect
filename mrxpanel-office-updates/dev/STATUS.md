# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.15 DEV — GROUNDING & LIGHTING**

Stable channel: **V1.3.0** (unchanged)

## Realism baseline now implemented
- 8 rigged 3D characters with distinct roles/outfits.
- Character stature normalized against 0.70m desks; current character scales are closer to plausible adult proportions.
- Standing workstation arm pose is calibrated from the Cesium Man skeleton geometry so terminal hand joints sit near desk/keyboard height.
- Fake seated body-sinking remains disabled; chairs remain withheld until a true sit rig exists.
- Character face/hair/accessory proportions tightened.
- Softer key/fill lighting and restrained material palette.
- Warm wall-mounted practical fixtures replace floating ceiling panels.
- Contact grounding added under major workstations, meeting table, server racks, lounge, pantry and reception.
- Character blob shadows are smaller/lighter.
- Neutral carpet, warmer perimeter walls, darker full-height architectural partitions.
- Human-scale door openings, framed windows, upper glass bands and baseboards.
- Workstations have grounded legs, monitor screen/stand/base, keyboard and mouse.
- Meeting, reception and pantry furniture are structurally grounded.
- All 8 characters use explicit architecture-aware multi-waypoint routes.
- Risky paths were reworked after a conservative body-clearance audit.
- Route traversal is distance weighted; world travel duration is based on route length.
- Skeletal gait phase follows world distance with eased start/stop and frame-rate-independent turns.
- Route geometry and HUD nodes are cached; rendering uses a pixel budget.
- Stationary non-executive HUD is hidden.
- Full-width office presentation with compact controls.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. New Hermes visual review is required.
2. Verify arm/hand position actually reads as natural from the live camera.
3. Verify contact shadows do not read as dark mats.
4. Verify full-height walls and door frames from multiple camera angles.
5. Verify no route clipping missed by the geometric audit.
6. Verify gait cadence/world speed and 8-character performance.
7. Final lighting/material tuning after live visual feedback.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the 3D shell passes the next realism review.
