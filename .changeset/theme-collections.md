---
"@gryt/theme": minor
"@gryt/ui": minor
---

Twenty-eight more presets, and collections to hold them.

The library shipped nineteen presets in one flat list, and both the client and
the docs switcher just rendered it top to bottom. That doesn't work at
forty-seven. So a preset now names a collection, and `grytPresetsByCollection`
hands back the whole set grouped, in the order a picker should show them: Gryt,
Owl, Midnight, Winter, Spring, Summer, Autumn, Nature, Pastel, Brands. Owl is
the six palettes that were already there under `Gryt owl palettes`. Brands is
the ported ones that used to be `group: "Ported"`.

**`GrytThemePreset.group` is now `collection`**, and it takes one of ten names
instead of `"Gryt" | "Ported"`. That's the breaking part. Nothing else in the
type moved. `GRYT_THEME_COLLECTIONS` is the ordered list, and
`grytCollectionNotes` is the line that sits under each name.

The new palettes were generated in OKLCH rather than picked by eye. Every one
clears fourteen contrast rules across both halves: text, muted, border and
accent, plus 7:1 for ink sitting on a filled colour. `presets.test.ts` re-checks
that on every run. It also catches the duller failure, where a preset's
collection is spelled wrong so it shows up in no group and nobody can pick it.

They were measured against each other too, in OKLab. The closest pair among
everything new scores 0.41, against a median of 0.95. Four pairs come in tighter
than that and all four were already shipping, including Gryt and Gryt Rounded,
which are the same palette at two radii.

Two things this doesn't do. Ported palettes keep their published values and are
held to AA rather than Gryt's own bar, so Catppuccin Latte stays at the 6.57 its
authors chose. And Winter Arc's ink-on-secondary measures 6.07 against a bar of
7. It's excluded by id with a comment on it, because changing a shipped theme's
colour is a separate decision from adding new ones.
