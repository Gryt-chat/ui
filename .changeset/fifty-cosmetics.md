---
"@gryt/owl": minor
---

Thirteen more cosmetics, and every drawing redrawn in one palette.

New: three top hats, two bow-tie head pieces, a large bucket hat, over-ear
headphones, and five expressions — hollow, small, sleeping, no-sleep and star.

All fifty drawings now use `realPalette` and nothing else, so `artwork/inks.ts`
needs no entry for any of them: every colour is definitionally its own role.
`artwork/_palette.svg` is that swatch, named and importable.

Accessory keys are unchanged and the thirteen new ones append.

The two headsets were the same three paths and rendered identically. They are
meant to differ by where the band sits, and now do: `hat-headset` goes behind
the ear tufts, `hat-headset-overears` over them. Anyone wearing the first one
looks different.
