# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.8 DEV — PRESENTATION REALISM**

Stable channel: **V1.3.0** (unchanged)

## Current realism baseline
- 8 simultaneous rigged 3D characters.
- Floating room labels removed.
- Fake body-sinking sit pose removed; workstation chairs withheld until a real sit rig exists.
- Character face/hair/accessory proportions tightened.
- Softer key/fill lighting.
- Neutral carpet, warmer walls, darker architectural partitions, restrained wood/metal tones.
- Baseboards, framed windows, and framed doorway openings.
- All character routes use explicit architecture-aware multi-waypoint polylines.
- Route traversal is distance weighted, not segment-count weighted.
- Travel duration is based on total route length at a consistent office walking speed.
- Staff traffic is staggered and work/review motion is restrained.
- Staff face their desks while stationary.
- Workstations include monitor body, stand/base, keyboard and mouse.
- Stationary non-executive HUD is hidden.
- Full-width office stage replaces the old debug-heavy split layout.
- Dev controls are now compact overlays.
- JavaScript structural smoke/syntax check: PASS.

## Promotion blockers
1. One new visual review in Hermes is still required.
2. Verify no wall/desk clipping with distance-weighted routes.
3. Verify walk animation speed visually matches world movement.
4. Verify character/furniture scale from normal camera angles.
5. Verify window/door frames do not look oversized.
6. Verify 8-character performance remains acceptable.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the visual shell passes this new realism review.
