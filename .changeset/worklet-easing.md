---
"@gryt/ui-native": patch
---

Fix every animation throwing on its first frame.

`0.3.0` shipped an easing whose worklet body called `sampleCurve` from `@gryt/theme`. A worklet runs on the UI runtime and cannot synchronously call a JS-thread function, so `springy()`, `travel()` and `fade()` all threw `[Worklets] Tried to synchronously call a Remote Function` — which is Button press, Switch, Drawer, Toast, Collapsible and the Slider thumb.

The interpolation is now written out inside the worklet, and the pure part moves to `motion/easing.ts` so it imports no Reanimated and can be tested. `easing.test.ts` asserts it matches `sampleCurve` at 200 points across the domain, so the duplication cannot drift from the definition the web renders from.

Nothing caught this: the call typechecked, the unit tests could not import `motion.ts` at all because Reanimated does not resolve under vitest, and the on-device probe used React Native's own easing rather than this one.
