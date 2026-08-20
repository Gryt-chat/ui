---
"@gryt/ui-native": minor
---

Adds `Sheet`, a bottom sheet built on `@gorhom/bottom-sheet`.

Drag between snap points, flick down to dismiss, a backdrop whose opacity
tracks the drag. Styled entirely from the theme — surface, top-corner radius,
handle, border — so the library supplies behaviour and nothing else.

`@gryt/ui` has no counterpart, and this is in the parity exceptions table as an
addition rather than a gap. A sheet is what a phone does where the web opens a
dialog or slides a drawer, and they are not the same interaction: a sheet is
dragged, settles at heights the user picks, and is dismissed with a flick.
Shipping the web's Dialog on a phone would be 1:1 and wrong.

Bought rather than built, which is the opposite of the call made for Slider and
Tabs, and the difference is the shape of the problem. A press scale is four
lines and no library will give you the right one. Velocity dismiss, snap points,
keyboard avoidance and the drag-versus-scroll handoff are deep, generic, and
nothing to do with Gryt.

`SheetProvider` has to be mounted at the app root, beside `ToastProvider` and
`TooltipProvider`. It is `BottomSheetModal` underneath, and the provider is
what anchors the sheet to the screen rather than to wherever the call site
happens to sit in the layout.

Adds `@gorhom/bottom-sheet` and `react-native-gesture-handler` as peer
dependencies.
