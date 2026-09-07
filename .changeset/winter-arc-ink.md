---
"@gryt/theme": patch
"@gryt/ui": patch
---

Winter Arc's ink now clears the bar it was being held to.

Text sitting on a filled colour is held to 7:1 here rather than 4.5, because it
is the only text in the library that always has a saturated background under it.
Winter Arc missed on four of its six pairs: 6.07 and 4.96 in the dark half, 4.68
and 5.27 in the light one. It was excluded from the check by id when the
collections landed, on the grounds that changing a shipped theme's colour is a
separate decision.

The secondary and the danger moved in both halves. Lightness only — hue and
chroma are untouched — and each is the smallest step that clears 7:1, which is
between 0.04 and 0.09 in OKLCH. The `-Light` partners moved with their bases so
the gap between them is what it was.

**This changes what Winter Arc looks like** for anyone wearing it. The dark
danger is the one you would notice: it had to come up from 0.62 to 0.71
lightness, because nothing below about 0.70 can carry dark ink at 7:1.

A theme with a split `lightHue` was carrying a second set of fills that nothing
ever checked, which is why the light half of this went unnoticed. The test now
holds that set to the same bar, for the generated collections. Ported palettes
stay out of it: every one with a `lightHue` misses this bar, Nord's light accent
measures 3.50 against its own ink, and those are published values.
