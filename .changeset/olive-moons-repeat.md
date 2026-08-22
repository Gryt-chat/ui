---
"@gryt/ui": patch
"@gryt/ui-native": patch
---

A disabled button loses its fill instead of fading.

Every tone shared one 50% opacity. On the quiet tones that reads — they are
already low-contrast, so halving them puts them under the surrounding text. On a
filled tone it does not: the accent at half opacity over a dark page is still a
saturated purple button, and there is nothing in it that says it will not
respond.

So `primary`, `secondary` and `danger` now take the surface colour when
disabled, with a muted label. Same size, same word, no longer claiming to be the
action. `neutral` already sat on that surface and only its label changes.
`ghost` has no fill to lose and its label is already muted, so the opacity is
what carries it there.

The opacity stays, lighter at 60%, because `startIcon` and `endIcon` are the
caller's elements with the caller's colours — nothing inside the button can mute
those, and an icon at full strength on a dead button is the same problem in
miniature.

Both packages, so the two do not disagree about what disabled looks like.
