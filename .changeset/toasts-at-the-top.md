---
"@gryt/ui-native": minor
---

Toasts appear at the top, clear of the safe area, and above sheets.

The bottom is where a tab bar sits, where the home indicator sits, and where
every sheet rises from — so a toast there was either under the chrome or in the
way of the gesture. They also had no safe-area inset and no explicit z-order.

The stacking rule is now written down on `ToastProvider`: mount it **above**
`SheetProvider` so the viewport, which renders after `children`, paints over a
sheet's portalled content. What a toast still cannot cover is anything built on
a native `Modal` — `Dialog`, `AlertDialog`, `Drawer`, `ActionSheetIOS` — because
those are separate native windows and React Native has no z-index across them.
That is the trade for a toast that can never block the app, and it is documented
rather than left to be discovered.
