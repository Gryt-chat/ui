---
"@gryt/ui-native": patch
---

`Sheet` honours its `snapPoints` again.

gorhom v5 defaults `enableDynamicSizing` on, which measures the content and
sizes the sheet to it — overriding the snap points entirely. A sheet asked for
70% whose content had no intrinsic height collapsed to the height of its own
footer, which looks like the snap points being ignored, because they were.
