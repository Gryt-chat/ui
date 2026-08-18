---
"@gryt/ui": minor
---

Export the ramp builders — `neutralScale`, `neutralScaleLight`, `hueScale`, `hueScaleLight`, `alphaScale`, `hexToRgb` and `rgbToHex` — from both the root and the `./theme` entry.

`createGrytTheme` composes these into CSS custom properties, which React Native cannot use. `@gryt/ui-native` composes the same functions into plain values instead, so the two renderers share one implementation of the OKLab maths rather than keeping a copy each.
