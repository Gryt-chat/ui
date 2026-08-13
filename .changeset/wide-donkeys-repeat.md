---
"@gryt/ui": minor
---

Dialog and AlertDialog default to 32rem instead of 24rem.

The old default was narrower than anything either component was actually used
for, so every dialog in the client carried a width override to undo it. Radix
Themes, which the client is migrating away from, gives its dialog 600px — a
dialog ported across shrank by a third for no reason anybody chose.

Both components move together, because AlertDialog is meant to be styled
identically to Dialog, and there is a test for that now. An explicit `w-*` in
`className` still wins, so anything already setting its own width is unchanged.
