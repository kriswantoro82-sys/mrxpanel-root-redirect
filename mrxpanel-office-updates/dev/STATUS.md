# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.18 DEV — UPRIGHT WALK ALIGNMENT**

Stable channel: **V1.3.0** (unchanged)

## Realism baseline now implemented
- 8 rigged 3D characters with distinct roles/outfits.
- Character stature remains normalized against the 0.70m desk baseline.
- Workstation hand/arm pose remains calibrated to keyboard height.
- Lighting, contact grounding, architecture, route clearance and performance work are preserved.
- Forward-axis routing was verified against the embedded Cesium Man transform; no 90-degree route/yaw correction was required.
- Remaining visible lean was traced to animated root/pelvis rotation in Skeleton_torso_joint_1.
- Root/pelvis rotation is now strongly blended back toward the base pose while walking.
- Root lateral sway and vertical bob are reduced at the source.
- Upper torso stabilization is strengthened.
- Neck/head stabilization is strengthened further.
- Arm swing is damped but retained so walking does not become robotic.
- Leg locomotion remains active.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. Kris visual review in the live Hermes shell.
2. Confirm the whole body now stays vertical while walking straight.
3. Confirm turns do not reintroduce sideways lean.
4. Confirm stride cadence does not foot-slide at route transitions.
5. Re-check doorway/workstation clipping with all 8 characters active.
6. Final Kris/Maya executive polish after visual feedback.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the 3D shell passes visual review.
