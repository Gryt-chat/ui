---
"@gryt/theme": minor
"@gryt/ui": patch
---

`createGrytTheme()` returns `GrytThemeVars` now, which is `CSSProperties` plus every `--gryt-*` and `--color-gryt-*` variable as a string. It still goes straight into a `style` prop. Code that reads the variables back no longer has to cast through `unknown` to do it. `GrytThemeVars` is exported from `@gryt/theme`.
