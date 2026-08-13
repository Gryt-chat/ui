---
"@gryt/ui": patch
---

Two token corrections, both found by building a theme against the library rather than reading it.

`.light` never set `--gryt-surface-hover`. It is declared once in `@theme` as `#334155`, so in a light subtree it stayed on that dark slate: a neutral Button hovered to a slate block on a white panel, a pressed Toggle was a slate block, and every neutral tone in `styles.ts` did the same. It is now step 4 of whichever neutral ramp is in play — the step that already means "component background, hovered" — in the `.light` block and in `createGrytTheme({ appearance: "light" })`, which had the same gap because `grytLightTokens` names six anchors and this was not one of them.

`--gryt-on-accent` and `--gryt-on-danger` were 6.66:1 and 6.71:1 against the fills they sit on. That clears AA and misses AAA, on the one piece of text in the library that always sits on a saturated colour and is usually a verb somebody is about to press. All three label colours are now the fill's own hue with the lightness dropped until they clear 7:1 — a shade darker on a colour that was already nearly black, so nothing looks different. `theme.test.ts` asserts both, since neither pair was measured before.
