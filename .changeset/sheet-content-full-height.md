---
"@gryt/ui-native": minor
---

`Sheet.Content` fills the sheet by default.

It renders a `BottomSheetView`, which measures its children, so `flex: 1` had
nothing to be all of — anything inside that wanted to be the whole sheet
collapsed to the height of its own content. Every caller in the mobile app
passed `height: "100%"` for that reason. It is now the default, before `style`
in the array, so a caller can still override it.

A sheet whose content is shorter than the snap point looks the same: the view
has no background of its own.
