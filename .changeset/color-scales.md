---
"@gryt/ui": minor
---

Twelve-step colour scales: `neutral`, `accent`, `secondary`, `success`, `danger` and `warning`, plus alpha scales for neutral and accent.

The library shipped about a dozen flat tokens, which covered backgrounds, borders and text but had no way to say "this component, hovered" or "this border, hovered" — the recent polish pass had to invent an ad-hoc `surface-hover` for exactly that. Each family now has the twelve steps those states need, available both as CSS variables (`--gryt-neutral-4`) and as Tailwind colours (`bg-gryt-neutral-4`, `text-gryt-accent-11`), and readable from `grytTokens.scale`.

Generated in OKLCH from the tokens already shipped rather than picked by hand, so the ramp is perceptually even. **Nothing that ships today moves:** every step an existing token covered is that token unchanged, and the flat names are now aliases onto the scale — `surface` is `neutral-2`, `accent` is `accent-9`.

Contrast is measured rather than assumed: neutral 11 clears 4.5:1 on steps 1, 2 and 3; neutral 12 clears 12:1 on all three; every hue's step 11 clears 11:1 on the app background.
