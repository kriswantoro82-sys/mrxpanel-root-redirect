# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.22 DEV — HEAD / NECK SEATING**

Stable channel: **V1.3.0** (unchanged)

## Head / neck seating change
- Lowered the complete head assembly by reducing the head-seat offset from 1.338 to 1.248.
- Head position remains anchored to the body-rotated neck position.
- Head facing/orientation from the accepted V3.20 correction is preserved.
- V3.21 hair rotation remains preserved.
- Body orientation, route motion, lighting, grounding and performance work remain unchanged.
- JavaScript syntax preflight: PASS.
- Target SHA256: `519db9c029659c286baadb56af1ab978077feafb1027a18b05c4db04d09581be`.

## Visual review target
1. Head should sit lower and closer to the neck/shoulders.
2. Neck should no longer look stretched or detached.
3. Head must remain correctly oriented while walking.
4. Hair should remain attached and keep the current 180° orientation.

## Still blocked before stable promotion
- Live Hermes visual review.
- No stable promotion without Kris approval.

Stable V1.3.0 remains untouched.
