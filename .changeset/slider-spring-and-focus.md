---
"@gryt/ui": minor
---

Slider travel is animated, and the thumb has a focus ring.

The thumb and the fill move on a spring instead of jumping when the value arrives from a click, an arrow key, or elsewhere. Under a dragging pointer they still snap, because a transition there means the thumb lags behind the cursor.

Adds `--ease-spring-tight`, a critically damped version of the existing spring, for anything whose travel is bounded by its own container. The standard spring overshoots 12% of the travel, which is texture on a control that scales in place and a problem on a slider: a full-track jump measured 110% along the track, 96px outside the control. The thumb still scales on the standard spring.

The focus ring is a fix, not a flourish. Base UI puts focus on a visually hidden input inside the thumb, so `focus-visible` on the thumb never matched and the slider was the one control in the library you could not see yourself tab to. Also exported as `focusRingWithin` for any other control with a hidden focusable child.
