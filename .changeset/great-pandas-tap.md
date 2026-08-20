---
"@gryt/theme": minor
"@gryt/ui-native": minor
---

Native controls take a label, press like the web does, and are big enough to hit.

`Checkbox`, `Radio` and `Switch` accept a `label`, and tapping it works the
control — what a `<label>` does on the web, which React Native has no equivalent
of. All three gain the web's press scale at the web's own value, plus 12pt of
hit slop, which takes a 20pt box to the 44pt Apple and WCAG both ask for without
moving a drawn pixel.

`grytScaleSteps` grows the five components it was missing, and a test in
`@gryt/ui` reads the components' own Tailwind classes and asserts they still
agree. The values are not interchangeable — a checkbox presses to 0.92 and a
button to 0.96 — so two hand-copied lists was the wrong number of lists.

Styling parity fixes found while doing it: an unchecked `Checkbox` was
transparent where the web is a filled surface with an outline, `Radio`'s border
was 1.5 against the web's 1, and `Switch`'s track had no border at all. The
checkbox tick and the radio dot now scale from 0 on the spring rather than
appearing — scaling from 0 is what makes the overshoot visible, which is the
reasoning already written down in the web components.
