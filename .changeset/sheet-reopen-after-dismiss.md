---
"@gryt/ui-native": patch
---

A Sheet swiped away can be opened again.

`Sheet.Content` keeps a `presented` ref so a sheet that has never been on
screen does not dismiss a modal the provider has never heard of — that call
takes it *out* of the registry, after which `present()` is a no-op forever.

It only guarded one way in. A flick down dismisses the modal itself and then
fires `onDismiss`, which sets `open` false; the effect that follows finds
`presented` still true and calls `dismiss()` on a modal that is already gone
— the same unregistering call, arriving by the other door. From then on the
sheet is dead: `open` goes true, `present()` runs, nothing happens.

Nothing noticed because every sheet so far was opened by a trigger and closed
for good. It shows up the moment something wants a dismissed sheet back.
