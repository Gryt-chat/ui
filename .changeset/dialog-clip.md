---
"@gryt/ui-native": patch
---

Stop Dialog clipping its own footer.

A short dialog rendered its title and description and then cut the footer off partway, leaving the buttons half-drawn and unreachable. `scrollable={false}` was unaffected, which made it read as a layout choice rather than a bug.

The cause was a percentage that never resolved. The popup carried `maxHeight: "80%"`, but its parent was a wrapper with a width and no height — and a percentage maxHeight only resolves against a parent with a definite height. The cap therefore constrained nothing, and the `ScrollView` inside had nothing to measure against either. The cap now sits on that wrapper, whose own parent is `flex: 1`, and the popup shrinks inside it.

Known and not fixed here: a dialog taller than the cap still does not scroll. It caps at the right height and the body stays put. That is tracked separately on GRYT-379 — the clipping fix is a strict improvement either way, since tall dialogs clipped before too.
