---
"@gryt/ui": patch
---

`GrytProvider` takes `overlayInsetTop`, the height of anything the app draws across the top of the window, like a desktop title bar. Tooltips, menus, popovers, selects, comboboxes and context menus keep that far from the top, and flip below their trigger rather than covering it. An app that doesn't use `GrytProvider` can wrap itself in `OverlayInsetProvider` instead.
