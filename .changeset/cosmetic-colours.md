---
"@gryt/owl": minor
---

`OwlOptions.tint` paints one slot's accessory from a different palette, so an
owl's hat need not be the same colours as the owl.

Per slot rather than per part. "The hat" is a thing somebody can point at; "the
second darkest tone in the hat" is not, and letting people set that is how you
get an owl that is all hot pink except the beak. A slot picks one of the ten
palettes and the drawing's accessory roles resolve from it, so every choice is a
ramp somebody drew rather than a colour somebody mixed.

The tint takes the owl's own scheme rather than bringing one. A day owl in a
night hat reads as a hole in the picture rather than as a colour.

The worn string grows five fields, one per slot, **appended**. `decodeWorn` has
always read positionally for exactly this reason: a string written before the
field existed still decodes, and decodes to no tint. An unknown palette key
reads as no tint, the same rule an unknown accessory key already gets.

Nothing existing moves. An untinted owl renders byte-identically and the three
pinned hashes did not change.
