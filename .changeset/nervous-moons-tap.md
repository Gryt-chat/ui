---
"@gryt/ui-native": patch
---

The Drawer's scrim fades with the panel again.

GRYT-408 took the fade out on the grounds that "the web's Popup declares
`transition-transform` and nothing else". That is true, and it is about
`Drawer.Popup` — the panel, which still only translates and should. The
backdrop is a different element with its own rules, and the web's say the
opposite:

```
"transition-opacity duration-(--gryt-dur-spring-soft) ease-spring-tight",
"data-starting-style:opacity-0 data-ending-style:opacity-0",
```

It starts and ends at zero, over the same duration and easing as the panel's
slide. Without that on native the scrim was at full strength before the panel
was on screen, stayed there while it slid away, and blinked off with the Modal.

The drag term is unchanged and is a separate rule: pushing the panel away
lightens the scrim in proportion, so a half-gone drawer does not sit under a
full-strength one. Opacity is now `progress * (1 - dragged)` rather than
`1 - dragged`, and `progress` already runs on `travel` — `easeSpringTight` at
`springSoft` — so this is the web's curve rather than a new one.

The Sheet was right already: `BottomSheetBackdrop` interpolates between
`appearsOnIndex` and `disappearsOnIndex`, so it fades with the sheet without
being told.
