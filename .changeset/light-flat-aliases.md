---
"@gryt/ui": patch
---

Fix the light palette leaving the Tailwind colour names on their dark values.

The `.light` block aliased `--gryt-surface` and friends onto the light scale but not `--color-gryt-surface`, which is what the utilities compile against — so `bg-gryt-surface` stayed on the dark literal from `@theme`. In practice a dialog came out dark on a light page while every scale value around it had switched correctly. Both prefixes are aliased now, and a test asserts it.
