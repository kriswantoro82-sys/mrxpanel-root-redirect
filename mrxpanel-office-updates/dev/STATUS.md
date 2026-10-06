# MRXPANEL OFFICE — DEV STATUS

Current dev build: **V3.1 DEV — REALISM RESET**

Stable channel: **V1.3.0** (unchanged)

## Why V3.1 is a reset
The first V3 preview proved the system can run a full office, but the visual review exposed a more important issue: too many features were added before the scene looked believable.

## Visual issues confirmed from the preview
- floating room/status labels made the scene look like debug mode,
- fake seated pose sank standing characters into chairs/desks,
- detached ceiling-light panels looked physically impossible in an open dollhouse scene,
- character heads/faces were still too caricatured,
- too many people moved at once,
- room partitions/material colors looked game-prototype rather than finished office,
- visual clutter hid the office layout.

## V3.1 changes
- floating room labels removed from live render,
- character HUD reduced,
- fake sitting disabled until a real leg/chair pose exists,
- detached ceiling panels removed,
- character head/face proportions reduced,
- traffic cycle slowed from 18s to 32s,
- long work periods / fewer simultaneous walkers,
- floor palette muted,
- partitions made taller/more architectural,
- camera lowered for a less top-down prototype look,
- structural JavaScript smoke/syntax check: PASS.

## Next targets
1. Replace the current fake work pose with a real chair pose or keep characters standing cleanly.
2. Rebuild furniture scale and aisle clearance.
3. Introduce collision-safe corridor nodes, not decorative waypoints.
4. Improve character silhouette/face before adding more accessories.
5. Improve lighting/material response instead of adding more objects.
6. Only then restore restrained labels/status information.
7. MASB live data remains OFF until the visual shell is credible.

Promotion to stable remains blocked until a new visual review passes.
