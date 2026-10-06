# MRXPANEL OFFICE — DEV STATUS

Current dev candidate: **V2.8 RC — PERFORMANCE POLISH**

Stable channel remains: **1.3.0**

## Completed in the private/dev line
- 8 simultaneous rigged 3D characters: Kris, Maya, Team 1, Team 2, Team 3, VPS Operator, Maya Support, Finance.
- Distinct outfit, skin, hair, accessories and MRXPANEL gold accents.
- Full 3D office zoning: Executive, Meeting, Operations, VPS/Tech, Support, Finance, Lounge, Pantry, Lobby.
- Furniture: desks, monitors, chairs, reception, server racks, lounge/pantry elements.
- Environment polish: windows, warm light fixtures, plants, room floor zoning.
- Routed movement with per-character waypoints.
- Smoothed facing/turn interpolation and eased route pacing.
- In-world character name/status HUD.
- In-world room signage.
- Work / review / idle micro-animation.
- Desk/chair interaction with seated typing presentation.
- Adaptive DPR and throttled DOM HUD updates for frame stability.
- V2.8 static cast/room data moved out of the frame loop.
- JavaScript structural smoke-check: PASS.

## Promotion rule
Do **not** replace stable automatically.
Promote dev to stable only after:
1. JavaScript syntax/smoke checks pass.
2. Stable backup remains recoverable.
3. One visual run in Hermes confirms no broken head/face orientation, no severe clipping, acceptable camera framing, and acceptable performance.
4. Kris approves the mature build or Maya judges it ready for final visual review.

## Next dev targets
- Better sit/stand transition instead of only vertical seat settle.
- More convincing hand/keyboard placement.
- Softer turning at waypoint corners.
- Better executive Kris/Maya silhouettes.
- Collision spacing around shared destinations.
- Final lighting/material balance.
- Real MASB data bridge remains OFF until visual shell is stable.

## Safety
Stable updater manifest is intentionally unchanged during dev work.
