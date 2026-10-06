# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.17 DEV — WALK / BODY / HEAD ALIGNMENT**

Stable channel: **V1.3.0** (unchanged)

## Realism baseline now implemented
- 8 rigged 3D characters with distinct roles/outfits.
- Character stature remains normalized against the 0.70m desk baseline.
- Workstation hand/arm pose remains calibrated to keyboard height.
- Lighting, contact grounding, architectural scale, clearance-aware routing and V3.16 performance improvements are preserved.
- Walking upper-body motion is now stabilized against the base rig.
- Torso joints are partially returned toward neutral while locomotion continues in the legs.
- Neck/head joints are strongly stabilized so the head no longer inherits exaggerated source-clip tilt.
- Shoulder and forearm swing is damped rather than removed.
- Root vertical bob is reduced.
- Gait cadence is slightly slower relative to world distance.
- Walking head roll is reduced to a tiny natural micro-motion.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. Kris visual review in the live Hermes shell.
2. Confirm body remains upright from front, rear and oblique camera angles.
3. Confirm head position and facing now feel natural during turns.
4. Confirm stride cadence does not foot-slide at route transitions.
5. Re-check doorway/workstation clipping while all 8 characters are active.
6. Final Kris/Maya executive polish after visual feedback.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the 3D shell passes visual review.
