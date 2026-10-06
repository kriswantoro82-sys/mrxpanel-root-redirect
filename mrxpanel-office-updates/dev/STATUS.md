# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.19 DEV — BODY LEFT 90°**

Stable channel: **V1.3.0** (unchanged)

## Orientation change
- The skeletal body from the neck downward is rotated 90° left relative to route heading.
- The stylized head is counter-rotated so the current head facing is preserved.
- V3.18 upright-walk stabilization remains active.
- Leg locomotion, route timing, lighting, contact grounding and performance work are preserved.
- JavaScript structural smoke/syntax check: PASS.

## Still blocked before stable promotion
1. Kris visual review in the live Hermes shell.
2. Confirm body orientation is now correct while walking straight.
3. Confirm head/body relationship remains natural in turns.
4. Confirm no foot sliding or doorway clipping is introduced.
5. Final Kris/Maya executive polish after visual feedback.

Stable V1.3.0 remains untouched. Real MASB state integration remains OFF until the 3D shell passes visual review.
