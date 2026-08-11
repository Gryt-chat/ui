---
"@gryt/ui": minor
---

Add the chat and voice Base UI primitives: `ContextMenu`, `Popover`, `Toast`, `ScrollArea`, `Toggle`, `ToggleGroup` and `Meter`.

`ContextMenu` reuses `Menu`'s styled popup and items, because Base UI builds it from Menu's own parts — the two cannot drift apart.

`Meter` is deliberately separate from `Progress`. Progress is task completion heading for 100%; a meter is a reading inside a range, where 100% is often the bad case. They also announce differently to a screen reader. Its indicator has no transition, since the common caller is a mic level updating every frame.

`useToastManager` is re-exported so raising a toast does not mean importing Base UI directly.
