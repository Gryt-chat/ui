---
"@gryt/ui": minor
---

Add spring motion to the interactive components, as CSS rather than a motion library.

`--ease-spring` is a damped-spring solution sampled into CSS `linear()`. It is the real curve of a spring, not an approximation of one — which is why no JS physics engine is involved. Damping 0.5591, peaking 12% past target and settling without a second visible swing.

One curve, two durations — the shape is duration-invariant, so a separate "soft" curve was the same curve written twice:

- **`--gryt-dur-spring` (500ms)** — Button and IconButton hover/press, Switch thumb, Slider thumb, the Accordion caret, and every popup (Dialog, Menu, Select, Tooltip).
- **`--gryt-dur-spring-soft` (700ms)** — things that travel further: the Accordion panel height, the Drawer slide, the Progress bar.

Button hover scales to 1.03 and presses to 0.96; IconButton to 1.06 and 0.94; the Slider thumb to 1.12 and 0.94. The press travels further than the hover, so the control reads as being pushed down rather than merely acknowledging the cursor. Those numbers, not the damping, are what makes the motion legible — overshoot is a percentage of the travel, so on a 93px button 12% comes to well under a pixel. The ring is texture you feel; the scale and the duration are what you see.

Checkbox and Radio indicators scale in rather than toggling `hidden`, so they have motion to spring at all. Both set `keepMounted` — without it Base UI unmounts the indicator whenever the control is unchecked, so `data-unchecked` applies to nothing and there is no element to transition from.

The tick and the dot scale from 0, not from something near 1. Overshoot is a percentage of the travel, so a tick going 0 → 1 overshoots to 1.12 and visibly springs, while one going 0.95 → 1 overshoots by 0.006 and does nothing.

Checkbox, Radio and Switch also grow on hover and depress on press, like the buttons, and their borders take the accent on hover — so the control reacts to the cursor before it is clicked rather than only after.

`Tabs` gains `Tabs.Indicator`, a pill that slides between tabs on the spring curve instead of the fill snapping from one to the next. The tab itself now only changes text colour.

`Drawer` now overruns the viewport edge by `--gryt-drawer-bleed` (4rem), with matching padding on that side so content sits exactly where it did. A spring settles onto its target from both directions; without the bleed, the instant the panel sits a fraction short of flush you get a seam of backdrop down the edge. Overrunning means an undershoot reveals more drawer instead. Nothing shifts visually and the page gains no horizontal scroll, since the panel is `fixed`.

Colour transitions stay on a plain ease. A spring on a colour overshoots the hue, which means nothing.

Cost: **+0.26 kB** (37.20 kB from 36.94 kB). A motion library would have been 30–40 kB gzip for the same visual result on state transitions.

`linear()` needs Chrome/Edge 113+, Safari 17.2+, Firefox 112+. Below that the declaration is invalid and the browser keeps the preceding timing function, so it degrades to a plain ease rather than breaking. Everything stays behind `motion-safe` / `motion-reduce`.

Gesture-driven work — drag-to-dismiss sheets, swipe, shared-layout transitions — is not covered by this and is where a motion library would genuinely earn its place.

Dialog and Drawer backdrops gain a 3px `backdrop-blur`, behind `--gryt-backdrop-blur`. Small enough to separate the panel from the page without the scrim becoming an effect of its own.
