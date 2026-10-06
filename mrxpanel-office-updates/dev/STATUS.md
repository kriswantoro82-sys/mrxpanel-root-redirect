# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.4 DEV — WORKSTATION REALISM**

Stable channel: **V1.3.0** (unchanged)

## Visual direction
The project remains in realism-first mode. The earlier V3 preview proved the full-office engine works, but looked too much like a debug/prototype scene. The current dev line is reducing impossible interactions before adding any more spectacle.

## Improvements since the V3 preview
- floating room labels removed,
- detached ceiling panels removed,
- fake body-sinking seated pose removed,
- character head/face proportions reduced,
- hair, glasses, headset and facial details tightened,
- two-direction key/fill lighting replaces harsher single-light shading,
- smaller ground shadows,
- office traffic slowed,
- partitions rebuilt with actual doorway gaps,
- all 8 characters now use explicit multi-waypoint routes,
- lane offset fades at route endpoints to avoid start/stop jumps,
- workstation chairs withheld until a true sit rig exists,
- stationary staff face their actual desks,
- workstations now include monitor body, stand/base, keyboard and mouse,
- executive desk received proper monitor stand/base and input devices,
- JavaScript smoke/syntax check: PASS.

## Still blocked before stable promotion
1. work-arm pose must look natural near keyboards,
2. walking animation must be reviewed against the new routes,
3. furniture and character scale need another visual pass,
4. destination spacing needs visual confirmation,
5. lighting/material balance needs a real Hermes visual review,
6. no severe clipping through desks/walls,
7. performance with all 8 characters must remain acceptable.

Real MASB data integration remains OFF until the visual shell passes a new realism review.
