# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.13 DEV — CLEARANCE ROUTING**

Stable channel: **V1.3.0** (unchanged)

## Realism baseline now implemented
- 8 rigged 3D characters with distinct roles/outfits.
- Character face/hair/accessory proportions tightened.
- Softer key/fill lighting and restrained material palette.
- Neutral carpet, warmer walls, darker architectural partitions.
- Interior walls are full office height with human-scale door openings.
- Framed windows, upper glass bands and baseboards.
- Workstations now have grounded legs, monitor face, stand/base, keyboard and mouse.
- Meeting table has grounded pedestal/feet.
- Reception and pantry are structurally grounded instead of floating slabs.
- Fake seated body-sinking remains disabled; chairs are withheld until a true sit rig exists.
- All 8 characters use explicit architecture-aware multi-waypoint routes.
- Route traversal is distance-weighted and travel duration is based on route length.
- Skeletal gait phase follows world distance.
- Walk blend eases in/out and turns are frame-rate independent.
- Route geometry and HUD nodes are cached; rendering uses a pixel budget.
- Stationary non-executive HUD is hidden.
- Full-width office presentation with compact controls.
- Risky routes were reworked after a conservative clearance audit against walls and major furniture using ~0.18 world-unit body radius.
- Current route audit: no detected intersections with audited walls, door frames, desks, lounge, plants, reception, pantry or server racks.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. New Hermes visual review is required.
2. Verify full-height walls and door frames visually from several camera angles.
3. Verify gait cadence against world speed.
4. Verify hand/arm posture against keyboard positions.
5. Verify character/furniture scale after furniture rebuild.
6. Verify no visual clipping missed by the geometric audit.
7. Verify 8-character performance and final lighting balance.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the visual shell passes the next realism review.
