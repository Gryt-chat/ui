---
"@gryt/ui-native": minor
---

`Sheet` keeps clear of the phone's own furniture.

At the tall snap point the sheet reaches the top of the screen and its content
ran under the Dynamic Island; at the other end the home indicator clipped the
last row, which showed up as a control bar cut off at the bottom.

`topInset` from the safe area at the top, and the bottom inset added to the
content padding. Adds `react-native-safe-area-context` as a peer dependency —
gorhom already requires it in practice, so this declares what was already true.
