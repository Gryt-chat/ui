---
"@gryt/ui": patch
---

Button and IconButton keep no underline when they are rendered as a link.

Neither set `text-decoration`, which went unnoticed while every consumer reset
`a { text-decoration: none }` globally. The site stopped doing that, and a
Button given an `href` — which Base UI renders as an anchor — came out with a
line through it.

Only the control rendered *as* the anchor needs this. One sitting inside a link
is `inline-flex`, and an ancestor's decoration does not propagate into an atomic
inline-level box, so Chip and the rest are already unaffected.
