---
"@gryt/ui": minor
---

Style the remaining Base UI primitives, closing the gap: `AlertDialog`, `Autocomplete`, `CheckboxGroup`, `Collapsible`, `Combobox`, `Fieldset`, `Form`, `Menubar`, `NavigationMenu`, `NumberField`, `OtpField`, `PreviewCard` and `Toolbar`.

`Combobox` and `Autocomplete` share item and input styling, the way `ContextMenu` shares `Menu`'s — two lists that look different for no reason is worse than one that looks the same. The difference between them is what the value may be: Combobox requires a choice from the list, Autocomplete treats the typed text as the answer.

`AlertDialog` is styled identically to `Dialog` on purpose; the difference is behaviour, not looks. Escape and the backdrop do nothing, so answering means picking a button.

Base UI's `input` is deliberately not wrapped: `TextField` already builds on `field`, and `Field.Control` is the input.

`useMediaQuery` is now exported.
