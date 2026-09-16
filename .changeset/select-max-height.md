---
"@gryt/ui": patch
---

`Select` doesn't run off the bottom of the window any more when it has a lot of options. The popup stops at the edge of the window and never grows past 24rem. The list scrolls inside it, and the popup keeps its padding, corners and group labels.

The popup opens below the trigger now, or above it if there's more room there. For mouse and keyboard users it used to open on top of the trigger. Base UI sizes the popup itself in that mode, so there was no way to cap it.

`Menu` and `ContextMenu` popups stop at the edge of the window too, and scroll when they have to. They don't have a fixed ceiling. `Combobox` and `Autocomplete` keep their 16rem ceiling, but on a short screen they stop at the edge of the window first. All of these popups keep 8px clear of the edge, up from Base UI's 5px. Pass `collisionPadding` to a Positioner to change that.
