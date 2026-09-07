---
"@gryt/ui": minor
---

Style the menu parts that were being handed through from Base UI unstyled.

`ContextMenu` took `Popup`, `Item` and `Separator` from `Menu` and re-exported
`Group`, `GroupLabel`, `SubmenuRoot` and `SubmenuTrigger` straight from Base UI,
which ship with no class on them at all. In the client's server menu that put
the group heading and the whole Notifications submenu twelve pixels to the left
of every other row, with no highlight and no caret. `Menu` now styles all of
them, plus `CheckboxItem`, `RadioGroup` and `RadioItem`, and `ContextMenu` is
the passthrough it always claimed to be.

A menu popup is also `--gryt-radius-lg` with an 8px inset rather than
`--gryt-radius-xl` with 4px, so its corner is concentric with the rows inside
it. At 28px the corner curved away from the highlighted row and showed a
crescent of surface behind the first and last item. `popupSurface` keeps xl for
dialogs and drawers; its colours are now separately exported as
`popupSurfaceColors` for anything that needs a corner of its own.

`Badge` takes a `placement` for the corner it pins to, a `tone` from the shared
set, and with no children it renders the pill on its own in normal flow — for a
row that ends in a count rather than an avatar wearing one. Two tones is what a
channel list needs: neutral for messages that are merely unread, primary for the
conversation that named you.
