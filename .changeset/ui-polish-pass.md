---
"@gryt/ui": minor
---

A pass over the things that were wrong when you looked closely.

- **Checkbox, Radio and Switch react to their label.** Clicking the label already toggled the control; now hovering the text grows it and pressing anywhere presses it, so the whole hit target looks like the hit target. Nothing to pass — any wrapping label does it, including `Field.Label`.
- **Combobox and Autocomplete look like fields.** Their input asked for `rounded-(--gryt-radius-input)`, a token that has never existed, so it rendered square-cornered next to a fully rounded TextField. All three now share one `fieldControl` constant.
- **Toast takes a `severity`**: `neutral`, `info`, `success`, `warning` or `danger`. The border is a white hairline rather than the full `--gryt-border` line, which was drawing a box around a card that floats over the page with nothing behind it.
- **Progress no longer bounces.** A bar that overshoots 100% says the job finished, then unfinished, then finished. It is `ease-out` now. Meter gained a 120ms move so a polled reading no longer teleports, short enough that a fast feed still lands on every value.
- **Skeleton is visible.** `--gryt-surface-raised` on `--gryt-surface` is four points of luminance; it is a white wash now, and works on any surface rather than only the one it was picked against.
- **Popup triggers no longer grow on hover.** Base UI positions a popup against its trigger's measured box and keeps measuring, so a trigger that scaled dragged its own menu sideways whenever the pointer crossed it. Buttons carrying `aria-haspopup` skip the hover scale.

`focusRingWithin`, `fieldControl` and `fieldSizes` are exported for anything building on the same shapes.
