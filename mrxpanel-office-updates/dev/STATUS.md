# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.20 DEV — BODY LEFT 90° / HEAD ANCHORED**

Stable channel: **V1.3.0** (unchanged)

## Orientation correction
- Body offset changed from -90° to +90° to match the owner's requested visual left turn.
- Head is no longer counter-rotated as a detached local object.
- Head position is taken from the body/neck anchor after body rotation.
- Head orientation is taken from the original route-facing transform.
- V3.18 upright-walk stabilization remains active.
- Route timing, lighting, grounding and performance work remain preserved.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. Kris visual review in the live Hermes shell.
2. Confirm body now faces the correct left orientation.
3. Confirm head stays visibly attached to the neck during walk and turns.
4. Confirm no foot sliding or doorway clipping is introduced.
5. Final Kris/Maya executive polish after visual feedback.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the 3D shell passes visual review.
