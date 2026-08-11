---
"@gryt/ui": minor
---

Add spring motion to the interactive components, as CSS rather than a motion library.

`--ease-spring` and `--ease-spring-soft` are damped-spring solutions sampled into CSS `linear()`. They are the real curve of a spring, not an approximation of one — which is why no JS physics engine is involved. Overshoot is deliberately small: 1.09% for the control curve, 0.30% for the panel curve. Enough to read as spring, well short of bounce.

Two tiers:

- **`--ease-spring` at `--gryt-dur-spring` (260ms)** — Button and IconButton hover/press, Switch thumb, Slider thumb, the Accordion caret, and every popup (Dialog, Menu, Select, Tooltip).
- **`--ease-spring-soft` at `--gryt-dur-spring-soft` (420ms)** — things that travel further: the Accordion panel height, the Drawer slide, the Progress bar.

Colour transitions stay on a plain ease. A spring on a colour overshoots the hue, which means nothing.

Cost: **+0.26 kB** (37.20 kB from 36.94 kB). A motion library would have been 30–40 kB gzip for the same visual result on state transitions.

`linear()` needs Chrome/Edge 113+, Safari 17.2+, Firefox 112+. Below that the declaration is invalid and the browser keeps the preceding timing function, so it degrades to a plain ease rather than breaking. Everything stays behind `motion-safe` / `motion-reduce`.

Gesture-driven work — drag-to-dismiss sheets, swipe, shared-layout transitions — is not covered by this and is where a motion library would genuinely earn its place.
