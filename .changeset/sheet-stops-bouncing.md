---
"@gryt/ui-native": patch
---

Sheet no longer overshoots its snap point.

It animated on `easeSpring`, which `easing.ts` labels "overshoots ~12%, for
things that scale in place". A sheet sliding up from the bottom edge to a snap
point is the other case the file names — "critically damped, no overshoot, for
things that travel inside bounds" — which is `easeSpringTight`, and is what the
Drawer already uses.

The overshoot was worse here than on something that scales, because the thing
overshooting is the sheet's top edge: it travelled past the snap point and came
back, which reads as failing to land rather than as bounce.

Duration is unchanged. `springSlow` over the Drawer's `springSoft` is deliberate
and documented — a sheet travels further than a drawer, and at 700ms it arrived
quickly enough to read as a snap.
