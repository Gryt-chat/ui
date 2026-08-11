---
"@gryt/ui": minor
---

Rebuild `Drawer` on Base UI's `drawer` primitive, so it can be dragged away to dismiss and becomes a bottom sheet on small screens.

It was a `dialog` pinned to an edge, which looks like a drawer and does none of what one is for — it could not be dragged, did not follow the finger, and did not know which edge it belonged to.

**Breaking:** `side` moves from `Drawer.Popup` to `Drawer.Root`, because the swipe direction is Root's business and both Viewport and Popup have to agree with it. A `Drawer.Viewport` is now required between `Portal` and `Popup`.

```diff
- <Drawer.Root>
+ <Drawer.Root side="right">
    <Drawer.Portal>
      <Drawer.Backdrop />
-     <Drawer.Popup side="right">
+     <Drawer.Viewport>
+       <Drawer.Popup>
```

Under 768px the panel becomes a bottom sheet regardless of `side`; pass `sheetOnMobile={false}` to keep the side at every width. Corners are rounded only on the edges away from the origin, so a sheet still reads as attached to the edge it came from. `Drawer.Grabber` renders the drag bar on top and bottom sheets.
