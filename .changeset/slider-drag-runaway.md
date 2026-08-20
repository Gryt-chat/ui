---
"@gryt/ui-native": patch
---

Fix the Slider running away from your finger when dragged.

`gesture.dx` from PanResponder is the distance from where the gesture started, not from the previous event. The drag handler offset the *live* value by it on every move, so each event added the whole travel again and the thumb accelerated away from the finger. On a 200px track from 0–100, dragging to x=50, then 60, then 70 produced 25, then 55, then 90.

Tapping was always correct, because it reads `locationX` directly — which is what made this look like a rendering problem rather than an arithmetic one.

The drag now anchors on where the finger landed. The position-to-value maths moves into `sliderValue.ts` as a pure function with tests, since a closure over a ref could not be tested and this is exactly where the bugs are.
