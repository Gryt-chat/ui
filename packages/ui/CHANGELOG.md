# @gryt/ui

## 0.6.0

### Minor Changes

- 84da4c9: A pass over the things that were wrong when you looked closely.

  - **Checkbox, Radio and Switch react to their label.** Clicking the label already toggled the control; now hovering the text grows it and pressing anywhere presses it, so the whole hit target looks like the hit target. Nothing to pass — any wrapping label does it, including `Field.Label`.
  - **Combobox and Autocomplete look like fields.** Their input asked for `rounded-(--gryt-radius-input)`, a token that has never existed, so it rendered square-cornered next to a fully rounded TextField. All three now share one `fieldControl` constant.
  - **Toast takes a `severity`**: `neutral`, `info`, `success`, `warning` or `danger`. The border is a white hairline rather than the full `--gryt-border` line, which was drawing a box around a card that floats over the page with nothing behind it.
  - **Progress no longer bounces.** A bar that overshoots 100% says the job finished, then unfinished, then finished. It is `ease-out` now. Meter gained a 120ms move so a polled reading no longer teleports, short enough that a fast feed still lands on every value.
  - **Skeleton is visible.** `--gryt-surface-raised` on `--gryt-surface` is four points of luminance; it is a white wash now, and works on any surface rather than only the one it was picked against.
  - **Popup triggers no longer grow on hover.** Base UI positions a popup against its trigger's measured box and keeps measuring, so a trigger that scaled dragged its own menu sideways whenever the pointer crossed it. Buttons carrying `aria-haspopup` skip the hover scale.

  `focusRingWithin`, `fieldControl` and `fieldSizes` are exported for anything building on the same shapes.

## 0.5.0

### Minor Changes

- a21b9aa: Slider travel is animated, and the thumb has a focus ring.

  The thumb and the fill move on a spring instead of jumping when the value arrives from a click, an arrow key, or elsewhere. Under a dragging pointer they still snap, because a transition there means the thumb lags behind the cursor.

  Adds `--ease-spring-tight`, a critically damped version of the existing spring, for anything whose travel is bounded by its own container. The standard spring overshoots 12% of the travel, which is texture on a control that scales in place and a problem on a slider: a full-track jump measured 110% along the track, 96px outside the control. The thumb still scales on the standard spring.

  The focus ring is a fix, not a flourish. Base UI puts focus on a visually hidden input inside the thumb, so `focus-visible` on the thumb never matched and the slider was the one control in the library you could not see yourself tab to. Also exported as `focusRingWithin` for any other control with a hidden focusable child.

- 1f5b601: Tabs takes `orientation="vertical"`, for a rail of destinations rather than a row of them.

  The prop goes on `Tabs.Root` and nowhere else. Every part styles itself from the `data-orientation` Base UI writes to the DOM, so the list stacks, the labels left-align, and the accent pill travels down the rail instead of across the row — and the arrow keys follow it too, up and down rather than left and right. Horizontal is unchanged.

## 0.4.0

### Minor Changes

- abc8104: Add the chat and voice Base UI primitives: `ContextMenu`, `Popover`, `Toast`, `ScrollArea`, `Toggle`, `ToggleGroup` and `Meter`.

  `ContextMenu` reuses `Menu`'s styled popup and items, because Base UI builds it from Menu's own parts — the two cannot drift apart.

  `Meter` is deliberately separate from `Progress`. Progress is task completion heading for 100%; a meter is a reading inside a range, where 100% is often the bad case. They also announce differently to a screen reader. Its indicator has no transition, since the common caller is a mic level updating every frame.

  `useToastManager` is re-exported so raising a toast does not mean importing Base UI directly.

- 68d5fa3: Rebuild `Drawer` on Base UI's `drawer` primitive, so it can be dragged away to dismiss and becomes a bottom sheet on small screens.

  It was a `dialog` pinned to an edge, which looks like a drawer and does none of what one is for — it could not be dragged, did not follow the finger, and did not know which edge it belonged to.

  **Breaking:** `side` moves from `Drawer.Popup` to `Drawer.Root`, because the swipe direction is Root's business and both Viewport and Popup have to agree with it. A `Drawer.Viewport` is now required between `Portal` and `Popup`.

  ```diff
  - <Drawer.Root>
  + <Drawer.Root side="right">
      <Drawer.Portal>
        <Drawer.Backdrop />
  -     <Drawer.Popup side="right">
  +     <Drawer.Viewport>
  +       <Drawer.Popup>
  ```

  Under 768px the panel becomes a bottom sheet regardless of `side`; pass `sheetOnMobile={false}` to keep the side at every width. Corners are rounded only on the edges away from the origin, so a sheet still reads as attached to the edge it came from. `Drawer.Grabber` renders the drag bar on top and bottom sheets.

- f861f10: Style the remaining Base UI primitives, closing the gap: `AlertDialog`, `Autocomplete`, `CheckboxGroup`, `Collapsible`, `Combobox`, `Fieldset`, `Form`, `Menubar`, `NavigationMenu`, `NumberField`, `OtpField`, `PreviewCard` and `Toolbar`.

  `Combobox` and `Autocomplete` share item and input styling, the way `ContextMenu` shares `Menu`'s — two lists that look different for no reason is worse than one that looks the same. The difference between them is what the value may be: Combobox requires a choice from the list, Autocomplete treats the typed text as the answer.

  `AlertDialog` is styled identically to `Dialog` on purpose; the difference is behaviour, not looks. Escape and the backdrop do nothing, so answering means picking a button.

  Base UI's `input` is deliberately not wrapped: `TextField` already builds on `field`, and `Field.Control` is the input.

  `useMediaQuery` is now exported.

## 0.3.0

### Minor Changes

- 46a28fe: Ship the design tokens as `@gryt/ui/theme.css`, importable into a consuming app's Tailwind entry.

  `dist/styles.css` cannot serve this purpose. It is compiled output, so by the time it reaches a consumer the `@theme` block has already been resolved into `:root` variables — useful at runtime, useless as theme configuration. An app that wants to write `bg-gryt-accent` in its own components had to restate the whole palette, and two copies of a palette drift.

  `theme.css` is copied verbatim into `dist` rather than built, so the `@theme` block arrives intact:

  ```css
  @import "tailwindcss";
  @import "@gryt/ui/theme.css";
  ```

  It carries the `--color-gryt-*` tokens and the raw `--gryt-*` names together — radius, spring durations, backdrop blur, drawer bleed — because the components reference those directly in arbitrary values (`rounded-(--gryt-radius-lg)`, `duration-(--gryt-dur-spring)`) and an app writing the same needs them too. One file, the whole token surface.

  `styles.css` still carries every component style and utility it did. What it no longer carries is Tailwind's preflight. A component library has no business carrying a CSS reset — that is the consuming app's decision, made once for its whole document, and shipping one means any app importing us silently gets its own reset overwritten. The Gryt client is mid-migration and still resting on Radix Themes' reset, where this would not be a matter of taste but a broken layout. Apps that want preflight import it from their own entry, which is what the docs site does.

## 0.2.0

### Minor Changes

- 5694a81: Rebuild the library on Base UI (`@base-ui/react`) styled with Tailwind. `@mui/material`, `@mui/system`, `@emotion/react` and `@emotion/styled` are gone from the dependency tree, and there is no CSS-in-JS runtime left.

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

- 85b1a66: Add spring motion to the interactive components, as CSS rather than a motion library.

  `--ease-spring` is a damped-spring solution sampled into CSS `linear()`. It is the real curve of a spring, not an approximation of one — which is why no JS physics engine is involved. Damping 0.5591, peaking 12% past target and settling without a second visible swing.

  One curve, two durations — the shape is duration-invariant, so a separate "soft" curve was the same curve written twice:

  - **`--gryt-dur-spring` (500ms)** — Button and IconButton hover/press, Switch thumb, Slider thumb, the Accordion caret, and every popup (Dialog, Menu, Select, Tooltip).
  - **`--gryt-dur-spring-soft` (700ms)** — things that travel further: the Accordion panel height, the Drawer slide, the Progress bar.

  Button hover scales to 1.03 and presses to 0.96; IconButton to 1.06 and 0.94; the Slider thumb to 1.12 and 0.94. The press travels further than the hover, so the control reads as being pushed down rather than merely acknowledging the cursor. Those numbers, not the damping, are what makes the motion legible — overshoot is a percentage of the travel, so on a 93px button 12% comes to well under a pixel. The ring is texture you feel; the scale and the duration are what you see.

  Checkbox and Radio indicators scale in rather than toggling `hidden`, so they have motion to spring at all. Both set `keepMounted` — without it Base UI unmounts the indicator whenever the control is unchecked, so `data-unchecked` applies to nothing and there is no element to transition from.

  The tick and the dot scale from 0, not from something near 1. Overshoot is a percentage of the travel, so a tick going 0 → 1 overshoots to 1.12 and visibly springs, while one going 0.95 → 1 overshoots by 0.006 and does nothing.

  Checkbox, Radio and Switch also grow on hover and depress on press, like the buttons, and their borders take the accent on hover — so the control reacts to the cursor before it is clicked rather than only after.

  `Tabs` gains `Tabs.Indicator`, a pill that slides between tabs on the spring curve instead of the fill snapping from one to the next. The tab itself now only changes text colour.

  `Drawer` now overruns the viewport edge by `--gryt-drawer-bleed` (4rem), with matching padding on that side so content sits exactly where it did. A spring settles onto its target from both directions; without the bleed, the instant the panel sits a fraction short of flush you get a seam of backdrop down the edge. Overrunning means an undershoot reveals more drawer instead. Nothing shifts visually and the page gains no horizontal scroll, since the panel is `fixed`.

  Colour transitions stay on a plain ease. A spring on a colour overshoots the hue, which means nothing.

  Cost: **+0.26 kB** (37.20 kB from 36.94 kB). A motion library would have been 30–40 kB gzip for the same visual result on state transitions.

  `linear()` needs Chrome/Edge 113+, Safari 17.2+, Firefox 112+. Below that the declaration is invalid and the browser keeps the preceding timing function, so it degrades to a plain ease rather than breaking. Everything stays behind `motion-safe` / `motion-reduce`.

  Gesture-driven work — drag-to-dismiss sheets, swipe, shared-layout transitions — is not covered by this and is where a motion library would genuinely earn its place.

  Dialog and Drawer backdrops gain a 3px `backdrop-blur`, behind `--gryt-backdrop-blur`. Small enough to separate the panel from the page without the scrim becoming an effect of its own.

## 0.1.3

### Patch Changes

- 760830f: Improve npm README install and usage documentation.

## 0.1.2

### Patch Changes

- 77201b6: Fix npm package repository metadata.

## 0.1.1

### Patch Changes

- ff61e8b: Fix package test and type validation in CI by declaring test peers and emitting Node16-compatible declaration exports.
