---
"@gryt/ui": minor
---

Twelve-step colour scales — `neutral`, `accent`, `secondary`, `success`, `danger`, `warning` — plus alpha scales for neutral and accent.

The library shipped about a dozen flat tokens, which covered backgrounds, borders and text but had no way to say "this component, hovered" or "this border, hovered". Each family now has the twelve steps those states need, as CSS variables (`--gryt-neutral-4`), as Tailwind colours (`bg-gryt-neutral-4`, `text-gryt-accent-11`), and readable from `grytScales`.

Generated in OKLCH from the tokens already shipped, so the ramp is perceptually even. **Nothing that ships today moves:** every step an existing token covered is that token unchanged, and the flat names are aliases onto the scale — `surface` is `neutral-2`, `accent` is `accent-9`.

**`createGrytTheme` regenerates a whole scale from an overridden anchor.** `createGrytTheme({ color: { accent: "#ff5c00" } })` now emits all twelve accent steps and their alphas in the new hue, not just `--gryt-accent`. Without that, a theme would have moved the flat token and left the components — which read the scale — on the old colour.

Contrast is measured, not assumed, and a test fails the build if it regresses: neutral 11 clears 4.5:1 on steps 1, 2 and 3; every hue's text step clears 4.5:1 on the app background; every hue ramps in one direction.
