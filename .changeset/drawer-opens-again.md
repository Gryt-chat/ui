---
"@gryt/ui-native": minor
---

A Drawer opened by setting `open` shows up again. Since 0.14.0 the panel and scrim read
the open spring through a helper function, and Reanimated only subscribes an animated
style to shared values it can see directly. So the spring ran and nothing moved: the
Modal came up invisible, and the panel only appeared on the next drag or re-render.

`Drawer.Root` no longer takes `pull`. Nothing passes it since the phone dropped the
drag-open drawer (GRYT-962), and it's what brought the helper in.
