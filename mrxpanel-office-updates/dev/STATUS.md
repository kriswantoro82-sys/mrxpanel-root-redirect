# MRXPANEL OFFICE — DEV STATUS

Current dev candidate: **V3.0 RC — EXECUTIVE IDENTITY**

Stable channel: **V1.3.0** (intentionally unchanged)

## Current build
- 8 simultaneous rigged 3D characters.
- Distinct roles/outfits/accessories and role-aware in-world HUD.
- Kris and Maya have separate executive visual treatments.
- Full 3D office zoning and furniture.
- Windows, warm light fixtures, plants, server racks, reception, lounge and pantry.
- Routed movement with per-character waypoints.
- Lane offsets to reduce characters overlapping on shared routes.
- Smooth facing interpolation and eased pacing.
- Smooth sit/stand settling at workstations.
- Typing/work/review/idle micro-animation.
- Room signage + character name/status HUD.
- Adaptive DPR + throttled HUD DOM updates.
- Static cast/room data moved outside the frame loop.
- Structural JavaScript smoke/syntax check: PASS.

## Stable promotion gate
Stable must NOT be replaced until a visual run confirms:
1. no broken face/head orientation,
2. no severe clipping into desks/chairs/walls,
3. sit/stand looks acceptable,
4. routes do not visibly cross walls,
5. 8-character performance is acceptable,
6. camera framing and room labels remain readable.

## Next polish
- collision spacing at shared destinations,
- hand/keyboard alignment,
- chair pose silhouette,
- final lighting/material balance,
- executive Kris/Maya character refinement,
- then one controlled visual review before stable promotion.

Real MASB runtime data remains OFF until the 3D shell passes visual review.
