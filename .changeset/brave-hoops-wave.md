---
"@gryt/theme": minor
"@gryt/ui-native": patch
---

The drawer overhang is a shared token, and React Native uses it.

`--gryt-drawer-bleed: 4rem` has been in `theme.css` since the web Drawer was
written, with the reasoning next to it: the spring overshoots and settles from
both directions, so a panel sized exactly to its resting place shows a seam of
backdrop down its edge on the undershoot. The panel is built that much larger
and hangs the difference off-screen.

React Native had none of it — there is no CSS variable to read there — so its
Drawer flashed its own edge every time it opened. `grytDrawerBleed` is that
distance in points, and `bleedTokens.test.ts` keeps it equal to what the
stylesheet says.

`Sheet` uses the same overhang below its bottom edge, for the same reason, now
that it animates on the overshooting curve.
