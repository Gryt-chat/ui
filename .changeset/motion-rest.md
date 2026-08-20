---
"@gryt/ui-native": minor
---

Move Switch, Drawer, Toast and the Slider thumb onto the shared spring curve.

All four ran on React Native's `Animated` with hand-tuned constants — `speed: 40, bounciness: 4`, `speed: 20, bounciness: 0`, a flat 150ms — none of which is the curve the web components use. They now interpolate the same samples from `@gryt/theme`, at the same durations.

Toast and Slider also gain the press scales the web has: `active:scale-[0.96]` and `active:scale-[0.94]`. The `hover:` halves are deliberately not emulated — a touch screen has no state between not-touching and touching, so inventing one would be a difference from the web rather than a match to it.

Drawer keeps the web's 700ms and its overshooting curve, even though the panel travels its own width and the critically damped curve exists for exactly that case. Matching the web was the brief; changing it is a separate decision.
