---
"@gryt/ui": patch
---

The owl designer lays itself out from its own width, not the window's

`OwlDesigner` used `md:` for the switch between its stacked layout and its
three columns. `md:` asks about the viewport, and what decides whether three
columns fit is how wide the dialog is — `w-[64rem]` capped by
`max-w-[calc(100vw-2rem)]`. Those are different questions, and the gap between
them is a 1024px dialog stacking itself in a window a little under 768px:
the category rail across the top, the grid full width beneath it, and Use this
owl below the fold of a panel whose scroll is not where anybody looks.

Now a container query on the panel, at the same 48rem. Nothing changes for a
dialog at its full width; the breakpoint is measured against the thing it
describes.
