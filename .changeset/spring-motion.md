---
"@gryt/ui": minor
---

Add spring motion to the interactive components, as CSS rather than a motion library.

`--ease-spring` is a damped-spring solution sampled into CSS `linear()`. It is the real curve of a spring, not an approximation of one — which is why no JS physics engine is involved. Damping 0.4746, peaking 18% past target and ringing once before it settles.

One curve, two durations — the shape is duration-invariant, so a separate "soft" curve was the same curve written twice:

- **`--gryt-dur-spring` (400ms)** — Button and IconButton hover/press, Switch thumb, Slider thumb, the Accordion caret, and every popup (Dialog, Menu, Select, Tooltip).
- **`--gryt-dur-spring-soft` (600ms)** — things that travel further: the Accordion panel height, the Drawer slide, the Progress bar.

Button hover scales to 1.08 and presses to 0.93; IconButton to 1.12 and 0.90; the Slider thumb to 1.2 and 0.88. Those numbers, not the damping, are what makes the motion legible — overshoot is a percentage of the travel, so on a 93px button even 18% comes to about 1.3px. The ring is texture you feel; the scale is what you see.

Checkbox and Radio indicators scale in rather than toggling `hidden`, so they have motion to spring at all.

`Drawer` now overruns the viewport edge by `--gryt-drawer-bleed` (4rem), with matching padding on that side so content sits exactly where it did. A spring settles onto its target from both directions; without the bleed, the instant the panel sits a fraction short of flush you get a seam of backdrop down the edge. Overrunning means an undershoot reveals more drawer instead. Nothing shifts visually and the page gains no horizontal scroll, since the panel is `fixed`.

Colour transitions stay on a plain ease. A spring on a colour overshoots the hue, which means nothing.

Cost: **+0.26 kB** (37.20 kB from 36.94 kB). A motion library would have been 30–40 kB gzip for the same visual result on state transitions.

`linear()` needs Chrome/Edge 113+, Safari 17.2+, Firefox 112+. Below that the declaration is invalid and the browser keeps the preceding timing function, so it degrades to a plain ease rather than breaking. Everything stays behind `motion-safe` / `motion-reduce`.

Gesture-driven work — drag-to-dismiss sheets, swipe, shared-layout transitions — is not covered by this and is where a motion library would genuinely earn its place.
