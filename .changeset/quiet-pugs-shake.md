---
"@gryt/ui-native": minor
---

`Sheet.ScrollView`, for a sheet with more in it than fits.

React Native's own `ScrollView` does not scroll inside a sheet: the sheet's pan
and the scroll view's native recogniser both want the touch, and gesture-handler
settles that by reference, so the two have to know about each other.
`BottomSheetScrollView` is that introduction — the same reason `Drawer` hands you
a scrollable rather than taking a prop pointing at one.

It replaces `Sheet.Content` rather than sitting inside it:

```tsx
<Sheet snapPoints={["88%"]} open={open} onOpenChange={setOpen}>
  <Sheet.ScrollView>{fields}</Sheet.ScrollView>
</Sheet>
```

That is the part worth having. `Sheet.Content` is a `BottomSheetView`, which
sizes itself to its children, so even the right scroll view inside one has no
bounded height to scroll within and simply grows until the sheet clips it. Three
callers had assembled the workaround by hand and each had to get four separate
things right: `padding: 0` and `height: "100%"` on the content, the keyboard
inset, and `keyboardShouldPersistTaps` — without which the first tap on a button
only dismisses the keyboard.

It takes every `BottomSheetScrollView` prop, and defaults
`automaticallyAdjustKeyboardInsets` and `keyboardShouldPersistTaps="handled"` on.
The padding is `Sheet.Content`'s, moved to the content container where it spaces
the content instead of clipping it, and the home indicator's inset is still
added at the bottom.

What it does not decide is the snap point. A sheet that takes a keyboard wants a
tall one — at 46% a field and the button under it are both behind the keyboard —
and how tall depends on what is in it.

`Sheet.Content` is unchanged for content that fits.
