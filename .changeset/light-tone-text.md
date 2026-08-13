---
"@gryt/ui": patch
---

Status colours are readable in light mode.

A success Chip was bright green text on a pale green pill; Alert did the same in all four severities, and so did every tone that draws text in a hue — IconButton, the shared `toneAccent` behind Checkbox, Radio, Switch and Slider, TextField's error helper, the Spinner, and the Select and Combobox indicators.

One substitution, repeated. They all asked for `text-gryt-success`, which is the flat token, which is step 9 — the solid fill, and the same colour in both appearances by design so that a filled button does not change colour when somebody switches. That is exactly what makes it wrong as text: on a dark page it happens to read, and on a white panel it does not. They use step 11 now, the step that means low-contrast text, with step 3 for the tint underneath and step 6 for the hairline.

Light step 11 also moved from L 0.5 to 0.46 in OKLCH. It has to carry text on step 3 as well as on the page — a Chip, an Alert and a Toast are all that pairing — and at 0.5 the secondary hue measured 4.48:1 against its own tint.

Two tests came with it: one that measures every tone's text step against its tint and against both backgrounds in both appearances, and one that reads the component sources and fails if a hue's flat name is ever used as a text colour again. Neither existed, which is why this shipped — the contrast tests were measuring step 11, the step nothing was using.
