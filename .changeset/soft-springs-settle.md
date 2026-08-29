---
"@gryt/theme": minor
"@gryt/ui": minor
---

A theme carries how Gryt moves.

`GrytTheme.motion` is a speed and a curve. Optional and null means the
library's own, so every theme written before this renders and moves exactly as
it did.

**Speed is one multiplier over every tier**, not a slider each. The tiers are
already in proportion — a drawer takes longer than a button because it travels
further — and five sliders would be re-deciding that with no way to tell it had
gone wrong except by opening a drawer. `0` means nothing animates, which is a
real setting rather than a degenerate one.

**Curve** is `spring`, `smooth`, `linear`, or a cubic bezier you drag on a
graph. The named ones keep the library's two curves apart: the overshooting
spring for things that grow in place, the critically damped one for things
that travel inside their bounds. A bezier cannot be both, so drawing one
collapses them — the panel says so, because a curve that overshoots is fine on
a button and throws a drawer outside its own container.

The graph draws whichever curve is actually in effect. A spring is not a cubic
bezier, so a named curve renders as its samples with no handles rather than as
a prominent line that is not the curve you have.

`prefers-reduced-motion` beats the theme, and needs `!important` to do it: a
theme's durations arrive as inline style on the root element, and an inline
declaration beats a media query. Without that, opening a link somebody sent
would start a machine moving for a person who had turned movement off.

Also corrects a comment in `theme.css` that said changing a duration moves
where the overshoot lands. It does not — `linear()` samples are positions
against normalised time — and `motion.ts` said the opposite two files away.
Measured in Chrome: the same `--ease-spring` at 200ms and 2000ms puts the
element at the same six positions at the same six fractions, identical to two
decimals, peaking at the same 10.6% past target. That false warning is why a
theme could not offer a speed control before: it said the safe thing was
dangerous.
