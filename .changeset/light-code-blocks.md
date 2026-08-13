---
"@gryt/ui": patch
---

Documentation only: code blocks on the docs site follow the appearance.

They kept the dark half of whatever theme was on, in both appearances, because Shiki writes its colours inline and one theme's worth of them under a light surface puts near-white keywords on near-white paper. There is a light theme now, and every block is highlighted with both — Shiki's dual-theme output puts `--shiki-light` and `--shiki-dark` on each span, and the `.light` block picks. Nothing re-highlights when somebody toggles, because both sets are already in the markup.
