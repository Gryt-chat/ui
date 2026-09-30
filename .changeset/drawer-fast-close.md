---
"@gryt/ui-native": patch
---

`Drawer` closes in about 200ms with an eased curve instead of the 700ms soft spring. The Modal behind it takes every tap until it's gone, so the screen underneath answers much sooner.
