---
"@gryt/ui": patch
---

Give every popup positioner a class an app can select.

`Select`, `Tooltip` and `NavigationMenu` rendered their positioner with no
`gryt-` class, so an app had no way to reach the element that Base UI positions.
The other six popups already carried one. `NavigationMenu.Positioner` was a raw
re-export and is now wrapped like the rest, forwarding its ref and merging any
className it is given.

This matters for stacking. An app that puts its dialogs on a z-index scale has
to be able to put the popups somewhere too, and a popup opened from inside a
dialog has to sit above it. Without a class there was nothing to write the rule
against, so the popups stayed at `z-index: auto` and dialogs covered them.
