---
"@gryt/ui": minor
---

The theme presets ship with the library, and `GrytProvider` stops overriding the root.

`grytPresets` is the eleven the generator has been offering — Gryt, Ember, Paper, Signal, Dracula, Nord, Catppuccin, GitHub, Claude, shadcn and Solarized — as `GrytTheme` documents. They were in the docs site, where only the generator could see them; the client offers the same list, and it should get a new one by taking a newer `@gryt/ui` rather than by somebody copying eleven palettes across by hand.

`GrytProvider` with no `theme` prop now paints nothing. It used to write the full default palette onto its wrapper div, which looked harmless and was not: the stylesheet already declares those values on `:root`, so the copy added nothing, and it sat below the root in the cascade. An app theming itself the documented way — variables on the root element, where overlays portalled to `document.body` can still read them — found every one of them overridden by a provider restating the defaults. Passing a theme behaves exactly as before.
