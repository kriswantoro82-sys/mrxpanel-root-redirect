# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.27 DEV — MOTION + ARRIVAL POLISH**

Stable channel: **V1.3.0** (unchanged)

## V3.27 coherent batch polish
- Preserves V3.26 workstation + grounding changes.
- Preserves V3.25 head + hair rebuild and accepted body/head orientation.
- Route heading now samples a short tangent around each waypoint, reducing abrupt direction snaps.
- Travel easing upgraded from cubic smoothstep to quintic smootherstep for gentler starts/stops.
- Office walking speed reduced from 1.10 to 0.96 world units/sec.
- Turn smoothing reduced to avoid sharp body rotation during route changes.
- Gait blend now fades with movement phase so footsteps soften near departure and arrival.
- World-space stride mapping increased from 1.42 to 1.55 units per gait cycle to reduce fast-foot/treadmill impression.
- Commit-pinned syntax/source preflight: PASS.
- Target SHA256: `444969809f60061fe0979a857be5fe9dff4d80fb933f474ce32005b23f4bd633`.

## Visual review gate
- Load only from commit `a8f60661cbd2d1c8ff016095618f4539782d29fe`.
- Stable V1.3.0 and updater must remain untouched.
- Visual acceptance still required before stable promotion.

Stable V1.3.0 remains untouched.
