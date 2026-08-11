---
"@gryt/ui": minor
---

Rebuild the library on Base UI (`@base-ui/react`) styled with Tailwind. `@mui/material`, `@mui/system`, `@emotion/react` and `@emotion/styled` are gone from the dependency tree, and there is no CSS-in-JS runtime left.

`dist/index.js` goes from 200 kB to 37 kB (gzip 47.5 kB to 8.1 kB). Most of that is Base UI and Phosphor now being externalised rather than inlined — the build's `external` list was hand-written and had gone stale.

Several components move from MUI's controlled shape to Base UI's compositional one. The pattern is the same in each case: a namespace with parts, rather than one component plus sibling helpers.

**Dialog** — `DialogTitle` / `DialogContent` / `DialogActions` are replaced by `Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`, `Dialog.Title`, `Dialog.Description`, `Dialog.Footer` and `Dialog.Close`.

**Menu** — `MenuItem` is no longer exported. Use `Menu.Root`, `Menu.Trigger`, `Menu.Portal`, `Menu.Positioner`, `Menu.Popup`, `Menu.Item` and `Menu.Separator`. There is no `anchorEl`; the trigger anchors itself.

**Tabs** — `Tab` with a `label` prop is replaced by `Tabs.List`, `Tabs.Tab` and `Tabs.Panel`, keyed by string `value` rather than a numeric index. `onChange(event, value)` becomes `onValueChange(value)`.

**Accordion** — `AccordionSummary` and `AccordionDetails` are replaced by `Accordion.Item`, `Accordion.Trigger` and `Accordion.Panel`. `defaultExpanded` becomes `defaultValue={["item-id"]}`.

**Drawer** — same parts as Dialog, plus `side` on `Drawer.Popup` for which edge it pins to.

**Radio** — must now live inside a `RadioGroup`, which owns the value. Per-radio `checked` and `onChange` are gone.

**Select** — `onChange(event)` becomes `onValueChange(value)`.

Prop renames, for consistency with Button and IconButton, which already used `tone`:

- `color` becomes `tone` on Checkbox, Radio, Switch, Slider and Chip
- the `error` tone value becomes `danger`
- `Tone` is exported, and now includes `warning`

Smaller changes:

- `TextField` drops `variant` and gains `error`, `helperText` and `multiline` with `minRows`
- `Progress` drops `variant`; omitting `value` gives an indeterminate bar
- `Spinner` takes `size` and is drawn with Phosphor's `CircleNotch`
- `Avatar` gains `size`, `src` and `fallback`
- `Badge` gains `max` and `showZero`
- `Chip` gains `onDelete` and `icon`
- `Surface` no longer renders a shadow, matching the flat treatment everywhere else

`createGrytTheme` no longer returns a MUI theme. It returns CSS custom properties, so it drops into a `style` prop and overriding one token leaves the rest of the palette alone:

```tsx
const theme = createGrytTheme({ color: { accent: "#b4afff" } });

<GrytProvider theme={theme}>...</GrytProvider>;
```

`GrytProvider` loses `disableBaseline` — there is no CssBaseline to disable — and gains `tooltipDelay`, since Base UI shares tooltip hover timing across triggers at the provider rather than per tooltip.
