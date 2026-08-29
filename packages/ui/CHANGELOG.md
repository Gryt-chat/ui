# @gryt/ui

## 0.22.0

### Minor Changes

- 98cf483: `Avatar` takes an `eggSeed` and draws that seed's eggs, the same way `seed` draws
  a person's owl.

  ```tsx
  <Avatar eggSeed={chat.id} className="rounded-(--gryt-radius-md)" />
  ```

  Named for the drawing rather than for what it stands for, because that has
  already changed once — these were written for server icons and are now the
  generated image for a group chat, with server icons getting their own generator.

  The corner belongs to the caller. `Avatar` clips to whatever radius its class
  sets and the drawing is square, so it gets the theme's radius in pixels rather
  than a fraction of the box baked into the SVG — which would be a different corner
  at every size.

  Separate from `seed` rather than a flag on it: passing the wrong one should give
  you the wrong kind of thing rather than the same thing in another colour. Both at
  once draws the person.

### Patch Changes

- Updated dependencies [0a3c9e3]
  - @gryt/owl@0.6.0

## 0.21.1

### Patch Changes

- Updated dependencies [6c18ef4]
  - @gryt/owl@0.5.0

## 0.21.0

### Minor Changes

- bf345c6: `Tabs.Tab` scales under the cursor and on press, matching `Button` — 1.03 on
  hover, 0.96 pressed, on the spring duration and curve.

  It animated its colour and nothing else, which read as not being a button at
  all next to anything that did move. The owl designer's rail was reported as
  "not using the Gryt UI tabs" for precisely that reason, and it was.

  Colour-only under `prefers-reduced-motion`.

### Patch Changes

- Updated dependencies [d11a52c]
- Updated dependencies [04ac872]
- Updated dependencies [f9b3c21]
  - @gryt/owl@0.4.0
  - @gryt/theme@0.7.0

## 0.20.1

### Patch Changes

- Updated dependencies [93dfe88]
  - @gryt/owl@0.3.0

## 0.20.0

### Minor Changes

- a55dc06: `--font-sans` names Atkinson Hyperlegible Next, and `--font-mono` names Atkinson Hyperlegible Mono.

  Gryt is set in Atkinson Hyperlegible everywhere it renders — the client, the site, the docs, the Keycloak login theme — and it is an accessibility choice rather than a taste one. The Braille Institute drew it for character differentiation: `I`, `l` and `1` are unmistakable, `b`/`d` and `p`/`q` are subtly asymmetric, and `c`, `e` and `s` keep open apertures at small sizes.

  This token named Inter, so the default the library shipped was a face Gryt does not use, and every consumer had to override it. There was no `--font-mono` at all.

  The font files are not shipped here. Naming a family only decides what is asked for first, and a consumer that does not load it falls through to the same `ui-sans-serif, system-ui` stack as before.

### Patch Changes

- Updated dependencies [481dd0f]
- Updated dependencies [a55dc06]
  - @gryt/owl@0.2.0

## 0.19.0

### Minor Changes

- 6a7255d: `Avatar` takes a `seed` and draws that person's owl.

  Without one it behaves as it always has: `src` if there is one, initials if
  there is not. With a seed and no `src` it renders the owl from `@gryt/owl`, and
  with both it keeps the owl underneath, so an uploaded avatar whose URL 404s
  lands back on this person's face rather than on a letter.

  The owl is a plain `<img>` in the fallback rather than a `BaseAvatar.Image`.
  Base UI's Image renders nothing until the browser reports the image loaded,
  which is right for a URL over the network and wrong for a data URI already in
  memory — it would blank the avatar for a frame on every mount.

  `avatarSeed` is re-exported here, because `seed` wants a normalised nickname and
  a caller who passes the raw one gets an owl drawn from a seed nothing else uses.

### Patch Changes

- Updated dependencies [6a7255d]
  - @gryt/owl@0.1.0

## 0.18.1

### Patch Changes

- Updated dependencies [2f7a532]
  - @gryt/theme@0.6.0

## 0.18.0

### Minor Changes

- c929d2b: GrytProvider gains `containOverlays`, which renders overlays inside the provider's own element rather than in `document.body`.

  Off by default, and it should stay off for an app with one theme — the body is the right place for a popup, and `:root` already carries the variables it needs. Turn it on when a provider is one theme inside a page that has another, where an overlay in the body comes up in the surrounding page's colours instead.

  `Select` and `Tooltip` were the two components that portalled internally with no way through; both now follow the provider. The rest already re-export Base UI's `Portal`, so callers could pass a container themselves.

## 0.17.1

### Patch Changes

- b576d22: A disabled button loses its fill instead of fading.

  Every tone shared one 50% opacity. On the quiet tones that reads — they are
  already low-contrast, so halving them puts them under the surrounding text. On a
  filled tone it does not: the accent at half opacity over a dark page is still a
  saturated purple button, and there is nothing in it that says it will not
  respond.

  So `primary`, `secondary` and `danger` now take the surface colour when
  disabled, with a muted label. Same size, same word, no longer claiming to be the
  action. `neutral` already sat on that surface and only its label changes.
  `ghost` has no fill to lose and its label is already muted, so the opacity is
  what carries it there.

  The opacity stays, lighter at 60%, because `startIcon` and `endIcon` are the
  caller's elements with the caller's colours — nothing inside the button can mute
  those, and an icon at full strength on a dead button is the same problem in
  miniature.

  Both packages, so the two do not disagree about what disabled looks like.

## 0.17.0

### Minor Changes

- 2909e19: A Drawer slides and nothing about it fades, and a Sheet takes longer to arrive.

  **The Drawer's scrim no longer fades in and out.** The panel already only
  translated — that is the whole distinction between a drawer and a dialog — but
  the scrim was still fading up alongside it, which put a second, slower animation
  on top of the one that matters. It is up when the drawer is up.

  The drag term stays, and it is a different thing: pushing the panel off lightens
  the scrim in proportion, so a half-gone drawer does not sit under a
  full-strength one. That is the web's own rule in its own words.

  This is not a return to the bug GRYT-395 fixed. There the scrim was a flat
  colour that vanished with the Modal _before_ the panel had moved, so a drawer
  animating out sat under a full-strength scrim for 700ms and then blinked off.
  The Modal now unmounts once the panel has finished travelling, so the scrim is
  up for exactly as long as the panel is on screen — which is the fix, rather than
  fading it.

  **`grytDurations.springSlow` — 900ms — and `Sheet` uses it.** A drawer crosses
  its own width; a sheet at 82% comes up from off the bottom edge and covers
  nearly all of the screen. The same duration over a longer distance is a faster
  animation, and at `springSoft` the sheet arrived quickly enough to read as a
  snap rather than a slide.

  `--gryt-dur-spring-slow` is declared alongside it, and the motion token test
  derives its names rather than listing them, so it covered the new one without
  being told.

### Patch Changes

- Updated dependencies [2909e19]
  - @gryt/theme@0.5.0

## 0.16.0

### Minor Changes

- c1d7384: An indeterminate Progress actually shows something.

  Both platforms rendered an empty track. The web passed `value={null}` to Base UI,
  which marks the indicator indeterminate and leaves its width unset, and nothing
  styled that — no keyframes anywhere in the package and no rule for
  `data-indeterminate`. React Native had written the same gap down as a parity
  exception, which made a shared hole look like a one-sided one.

  Now a bar 40% of the track sweeps across it on a loop, from the same
  description on both: fully off the left edge to fully off the right, so the loop
  seam is invisible. `grytDurations.sweep` and `--gryt-dur-sweep` are the one
  duration, kept equal by the test that already covers the others.

  Reduce-motion gets a full-width dimmed bar rather than a frozen partial one,
  which would read as a job that stalled 40% in.

### Patch Changes

- Updated dependencies [c1d7384]
  - @gryt/theme@0.4.0

## 0.15.2

### Patch Changes

- cce56cf: `--gryt-dur-fast` is declared, so ScrollArea and OtpField animate at all.

  Both used `duration-(--gryt-dur-fast)` and nothing declared it, so the scrollbar
  fade and the focused-cell tint were instant. `@gryt/theme` has had the value —
  150ms — the whole time; the stylesheet just never got it.

  The duration test now derives its variable names from `grytDurations` instead of
  listing three by hand, which is what let this through: `fast` was simply not
  among the names anyone had thought to check.

- Updated dependencies [50a13f5]
- Updated dependencies [fe584b0]
  - @gryt/theme@0.3.0

## 0.15.1

### Patch Changes

- Updated dependencies [64cbe56]
  - @gryt/theme@0.2.0

## 0.15.0

### Minor Changes

- 73d1712: Move the design tokens into `@gryt/theme`, so React Native stops installing a web renderer.

  `@gryt/ui-native` needed the tokens and nothing else, but the only way to get them was `@gryt/ui/theme` — which meant depending on `@gryt/ui`, which depends on Base UI and Phosphor, both of which require `react-dom`. A React Native app was installing about 85 MB of DOM code to read some colours. It is now 824 kB, with no `react-dom`, Base UI, Phosphor or Floating UI anywhere in the tree.

  Nothing about the API changed. `@gryt/ui` re-exports the whole layer from both its root entry and `@gryt/ui/theme`, so every existing import keeps resolving and web code needs no edits. `@gryt/ui-native` exports the same things it did.

  New code without a DOM should depend on `@gryt/theme` directly.

## 0.14.0

### Minor Changes

- 96b5c90: Export the ramp builders — `neutralScale`, `neutralScaleLight`, `hueScale`, `hueScaleLight`, `alphaScale`, `hexToRgb` and `rgbToHex` — from both the root and the `./theme` entry.

  `createGrytTheme` composes these into CSS custom properties, which React Native cannot use. `@gryt/ui-native` composes the same functions into plain values instead, so the two renderers share one implementation of the OKLab maths rather than keeping a copy each.

## 0.13.1

### Patch Changes

- a8e9250: Give every popup positioner a class an app can select.

  `Select`, `Tooltip` and `NavigationMenu` rendered their positioner with no
  `gryt-` class, so an app had no way to reach the element that Base UI positions.
  The other six popups already carried one. `NavigationMenu.Positioner` was a raw
  re-export and is now wrapped like the rest, forwarding its ref and merging any
  className it is given.

  This matters for stacking. An app that puts its dialogs on a z-index scale has
  to be able to put the popups somewhere too, and a popup opened from inside a
  dialog has to sit above it. Without a class there was nothing to write the rule
  against, so the popups stayed at `z-index: auto` and dialogs covered them.

## 0.13.0

### Minor Changes

- 9855be3: Remove `Select`'s `portalContainer` prop. It made the popup render inside a dialog, where Base UI's positioning resolves against the dialog and counts its offset twice, so the list opened away from its trigger. Portalling to the document body positions correctly and already renders above the dialog.

### Patch Changes

- 13822ef: Ship the MIT license text with the package. The manifest has said MIT since the first release, but no LICENSE file was included in the tarball.

## 0.12.2

### Patch Changes

- bbbdeae: Fix Select dropdowns inside modal dialogs by supporting a custom portal container.

## 0.12.1

### Patch Changes

- 8596215: Use pointer cursors for interactive controls, menu and select items, tabs, and
  other ARIA-backed controls. Disabled controls now use the not-allowed cursor.

## 0.12.0

### Minor Changes

- b48c944: Dialog and AlertDialog default to 32rem instead of 24rem.

  The old default was narrower than anything either component was actually used
  for, so every dialog in the client carried a width override to undo it. Radix
  Themes, which the client is migrating away from, gives its dialog 600px — a
  dialog ported across shrank by a third for no reason anybody chose.

  Both components move together, because AlertDialog is meant to be styled
  identically to Dialog, and there is a test for that now. An explicit `w-*` in
  `className` still wins, so anything already setting its own width is unchanged.

## 0.11.1

### Patch Changes

- b8bad69: Documentation only: code blocks on the docs site follow the appearance.

  They kept the dark half of whatever theme was on, in both appearances, because Shiki writes its colours inline and one theme's worth of them under a light surface puts near-white keywords on near-white paper. There is a light theme now, and every block is highlighted with both — Shiki's dual-theme output puts `--shiki-light` and `--shiki-dark` on each span, and the `.light` block picks. Nothing re-highlights when somebody toggles, because both sets are already in the markup.

## 0.11.0

### Minor Changes

- 784768c: The theme presets ship with the library, and `GrytProvider` stops overriding the root.

  `grytPresets` is the eleven the generator has been offering — Gryt, Ember, Paper, Signal, Dracula, Nord, Catppuccin, GitHub, Claude, shadcn and Solarized — as `GrytTheme` documents. They were in the docs site, where only the generator could see them; the client offers the same list, and it should get a new one by taking a newer `@gryt/ui` rather than by somebody copying eleven palettes across by hand.

  `GrytProvider` with no `theme` prop now paints nothing. It used to write the full default palette onto its wrapper div, which looked harmless and was not: the stylesheet already declares those values on `:root`, so the copy added nothing, and it sat below the root in the cascade. An app theming itself the documented way — variables on the root element, where overlays portalled to `document.body` can still read them — found every one of them overridden by a provider restating the defaults. Passing a theme behaves exactly as before.

## 0.10.1

### Patch Changes

- 0b2b26c: Status colours are readable in light mode.

  A success Chip was bright green text on a pale green pill; Alert did the same in all four severities, and so did every tone that draws text in a hue — IconButton, the shared `toneAccent` behind Checkbox, Radio, Switch and Slider, TextField's error helper, the Spinner, and the Select and Combobox indicators.

  One substitution, repeated. They all asked for `text-gryt-success`, which is the flat token, which is step 9 — the solid fill, and the same colour in both appearances by design so that a filled button does not change colour when somebody switches. That is exactly what makes it wrong as text: on a dark page it happens to read, and on a white panel it does not. They use step 11 now, the step that means low-contrast text, with step 3 for the tint underneath and step 6 for the hairline.

  Light step 11 also moved from L 0.5 to 0.46 in OKLCH. It has to carry text on step 3 as well as on the page — a Chip, an Alert and a Toast are all that pairing — and at 0.5 the secondary hue measured 4.48:1 against its own tint.

  Two tests came with it: one that measures every tone's text step against its tint and against both backgrounds in both appearances, and one that reads the component sources and fails if a hue's flat name is ever used as a text colour again. Neither existed, which is why this shipped — the contrast tests were measuring step 11, the step nothing was using.

## 0.10.0

### Minor Changes

- 7790552: A theme can be called something, and the name travels with it.

  `GrytTheme` takes an optional `name`, `encodeGrytTheme` puts it in the link, and `decodeGrytTheme` reads it back — from the JSON form too. It is metadata rather than a colour: `grytThemeToOptions` drops it, so nothing about what a theme looks like depends on whether it has one.

  It exists because a link full of hex values says nothing about what it is, and the person who made it already knew. The generator names a theme where it is built; the client fills in its name field from what arrived instead of asking again.

  Names are trimmed, their whitespace collapsed, and capped at 60 characters on the way in, so a link cannot carry a paragraph.

## 0.9.0

### Minor Changes

- 8eff169: A theme is a document now, and the document has a link.

  `createGrytTheme` takes the colours for one appearance, which is the right shape for a caller who wants one theme and the wrong shape for a theme that travels: dark and light do not derive from each other, so a shared theme has to carry both. `GrytTheme` is that — two sets of neutrals, one set of hues, and `lightHue` for the palettes whose accent genuinely differs between halves — with `grytThemeToOptions(theme, appearance)` to get back to what `createGrytTheme` takes.

  `encodeGrytTheme` and `decodeGrytTheme` are the link. Only what differs from Gryt's own values is carried, so a theme that changed one colour is a link with one parameter in it, and `decodeGrytTheme` takes any of the three things somebody might paste: a whole URL, a bare query string, or the JSON form.

  This moved out of the docs site because it stopped being the only reader. The generator writes these links; the client imports them. A second copy of the format in the client would be the copy that goes stale.

## 0.8.0

### Minor Changes

- 33521b8: Export `contrast`, `hexToOklch`, `oklchToHex` and the `Oklch` type.

  Anything that builds a theme rather than consuming one needs the maths the scales are built from. The docs site's theme generator measures contrast against the theme somebody is editing, as they edit it, and picks the label colour for a filled control from the colour underneath it — both of which mean the same OKLab matrices the library already carries. Keeping them internal would have meant a second copy of them somewhere, which is the thing one generator was meant to stop.

### Patch Changes

- 47cced1: Two token corrections, both found by building a theme against the library rather than reading it.

  `.light` never set `--gryt-surface-hover`. It is declared once in `@theme` as `#334155`, so in a light subtree it stayed on that dark slate: a neutral Button hovered to a slate block on a white panel, a pressed Toggle was a slate block, and every neutral tone in `styles.ts` did the same. It is now step 4 of whichever neutral ramp is in play — the step that already means "component background, hovered" — in the `.light` block and in `createGrytTheme({ appearance: "light" })`, which had the same gap because `grytLightTokens` names six anchors and this was not one of them.

  `--gryt-on-accent` and `--gryt-on-danger` were 6.66:1 and 6.71:1 against the fills they sit on. That clears AA and misses AAA, on the one piece of text in the library that always sits on a saturated colour and is usually a verb somebody is about to press. All three label colours are now the fill's own hue with the lightness dropped until they clear 7:1 — a shade darker on a colour that was already nearly black, so nothing looks different. `theme.test.ts` asserts both, since neither pair was measured before.

## 0.7.1

### Patch Changes

- 6a1b6ad: Fix the light palette leaving the Tailwind colour names on their dark values.

  The `.light` block aliased `--gryt-surface` and friends onto the light scale but not `--color-gryt-surface`, which is what the utilities compile against — so `bg-gryt-surface` stayed on the dark literal from `@theme`. In practice a dialog came out dark on a light page while every scale value around it had switched correctly. Both prefixes are aliased now, and a test asserts it.

## 0.7.0

### Minor Changes

- b42eeb6: Twelve-step colour scales — `neutral`, `accent`, `secondary`, `success`, `danger`, `warning` — plus alpha scales for neutral and accent.

  The library shipped about a dozen flat tokens, which covered backgrounds, borders and text but had no way to say "this component, hovered" or "this border, hovered". Each family now has the twelve steps those states need, as CSS variables (`--gryt-neutral-4`), as Tailwind colours (`bg-gryt-neutral-4`, `text-gryt-accent-11`), and readable from `grytScales`.

  Generated in OKLCH from the tokens already shipped, so the ramp is perceptually even. **Nothing that ships today moves:** every step an existing token covered is that token unchanged, and the flat names are aliases onto the scale — `surface` is `neutral-2`, `accent` is `accent-9`.

  **`createGrytTheme` regenerates a whole scale from an overridden anchor.** `createGrytTheme({ color: { accent: "#ff5c00" } })` now emits all twelve accent steps and their alphas in the new hue, not just `--gryt-accent`. Without that, a theme would have moved the flat token and left the components — which read the scale — on the old colour.

  Contrast is measured, not assumed, and a test fails the build if it regresses: neutral 11 clears 4.5:1 on steps 1, 2 and 3; every hue's text step clears 4.5:1 on the app background; every hue ramps in one direction.

- d28e66c: A light palette. `.light` on an ancestor swaps every scale value; `:root` stays dark.

  The library shipped one palette and it was dark, which only became visible when the client dropped Radix Themes and light mode lost its colours entirely — the class landed on the DOM and every surface stayed dark.

  It is not the dark ramp inverted. In dark a surface sits lighter than the page; in light it is white and the page is the grey one, so neutral 1 and 2 run light-grey then white and the ramp is deliberately not monotonic across them. Step 9 is the same brand colour in both appearances, so a filled button does not change colour when somebody switches, and step 10 darkens on hover where the dark set lightens.

  `createGrytTheme({ appearance: "light" })` builds the light set, and an overridden anchor regenerates it the same way the dark one does. `grytScalesLight`, `grytAlphaScalesLight` and `grytLightTokens` are exported for reading.

  Contrast is measured on this set rather than assumed from the other, and tested: neutral 11 clears 4.5:1 on both the page and a white panel, neutral 12 clears 7:1 on both, and every hue's step 11 clears 4.5:1 on both.

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
