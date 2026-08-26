# @gryt/ui-native

## 0.13.4

### Patch Changes

- Updated dependencies [6c18ef4]
  - @gryt/owl@0.5.0

## 0.13.3

### Patch Changes

- Updated dependencies [d11a52c]
- Updated dependencies [04ac872]
- Updated dependencies [f9b3c21]
  - @gryt/owl@0.4.0
  - @gryt/theme@0.7.0

## 0.13.2

### Patch Changes

- Updated dependencies [93dfe88]
  - @gryt/owl@0.3.0

## 0.13.1

### Patch Changes

- Updated dependencies [481dd0f]
- Updated dependencies [a55dc06]
  - @gryt/owl@0.2.0

## 0.13.0

### Minor Changes

- 6a7255d: `Avatar` takes a `seed` and draws that person's owl, from `@gryt/owl`.

  The same generator and the same seed the web uses, so somebody looks the same in
  both apps. Without a seed the component is unchanged: the `source` image if
  there is one, initials if there is not. A `source` that fails to load now falls
  back to the owl when there is a seed for it.

  `react-native-svg` is a new peer dependency. React Native's `Image` cannot decode
  SVG from a data URI, so the markup goes to `SvgXml` rather than through a URI —
  the web hands the same string to an `<img>`.

### Patch Changes

- Updated dependencies [6a7255d]
  - @gryt/owl@0.1.0

## 0.12.1

### Patch Changes

- Updated dependencies [2f7a532]
  - @gryt/theme@0.6.0

## 0.12.0

### Minor Changes

- fbb5237: The theme can carry a font, so an app can set one everywhere.

  There was not one `fontFamily` anywhere in this library, so every `Text` it
  rendered fell back to the platform default — and React Native has no cascade, so
  there was no root rule a consuming app could write to change that from outside.
  An app with its own typeface got a button whose label was in a different font
  from the text beside it.

  `GrytThemeProvider` now takes `fonts`, a map of face names per weight plus a
  mono pair. The library ships no font files and is not going to; an app registers
  its own faces and passes the names in. `theme.font(weight, { mono })` returns a
  style fragment to spread — a `fontFamily` when faces are configured, a
  `fontWeight` when they are not, which is what makes this safe to adopt
  everywhere at once. A theme built without `fonts` produces exactly the styles
  this library produced before.

  `Text` and `TextInput` are now exported. Every component here draws through
  them, and an app's own screens have the same problem the library did.

## 0.11.0

### Minor Changes

- 0554de4: `Sheet.Content` fills the sheet by default.

  It renders a `BottomSheetView`, which measures its children, so `flex: 1` had
  nothing to be all of — anything inside that wanted to be the whole sheet
  collapsed to the height of its own content. Every caller in the mobile app
  passed `height: "100%"` for that reason. It is now the default, before `style`
  in the array, so a caller can still override it.

  A sheet whose content is shorter than the snap point looks the same: the view
  has no background of its own.

## 0.10.0

### Minor Changes

- a3d358e: `Sheet.ScrollView`, for a sheet with more in it than fits.

  React Native's own `ScrollView` does not scroll inside a sheet: the sheet's pan
  and the scroll view's native recogniser both want the touch, and gesture-handler
  settles that by reference, so the two have to know about each other.
  `BottomSheetScrollView` is that introduction — the same reason `Drawer` hands you
  a scrollable rather than taking a prop pointing at one.

  It replaces `Sheet.Content` rather than sitting inside it:

  ```tsx
  <Sheet snapPoints={["88%"]} open={open} onOpenChange={setOpen}>
    <Sheet.ScrollView>{fields}</Sheet.ScrollView>
  </Sheet>
  ```

  That is the part worth having. `Sheet.Content` is a `BottomSheetView`, which
  sizes itself to its children, so even the right scroll view inside one has no
  bounded height to scroll within and simply grows until the sheet clips it. Three
  callers had assembled the workaround by hand and each had to get four separate
  things right: `padding: 0` and `height: "100%"` on the content, the keyboard
  inset, and `keyboardShouldPersistTaps` — without which the first tap on a button
  only dismisses the keyboard.

  It takes every `BottomSheetScrollView` prop, and defaults
  `automaticallyAdjustKeyboardInsets` and `keyboardShouldPersistTaps="handled"` on.
  The padding is `Sheet.Content`'s, moved to the content container where it spaces
  the content instead of clipping it, and the home indicator's inset is still
  added at the bottom.

  What it does not decide is the snap point. A sheet that takes a keyboard wants a
  tall one — at 46% a field and the button under it are both behind the keyboard —
  and how tall depends on what is in it.

  `Sheet.Content` is unchanged for content that fits.

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

## 0.9.0

### Minor Changes

- fdf749a: Toasts appear at the top, clear of the safe area, and above sheets.

  The bottom is where a tab bar sits, where the home indicator sits, and where
  every sheet rises from — so a toast there was either under the chrome or in the
  way of the gesture. They also had no safe-area inset and no explicit z-order.

  The stacking rule is now written down on `ToastProvider`: mount it **above**
  `SheetProvider` so the viewport, which renders after `children`, paints over a
  sheet's portalled content. What a toast still cannot cover is anything built on
  a native `Modal` — `Dialog`, `AlertDialog`, `Drawer`, `ActionSheetIOS` — because
  those are separate native windows and React Native has no z-index across them.
  That is the trade for a toast that can never block the app, and it is documented
  rather than left to be discovered.

## 0.8.2

### Patch Changes

- 4f833d2: A Sheet swiped away can be opened again.

  `Sheet.Content` keeps a `presented` ref so a sheet that has never been on
  screen does not dismiss a modal the provider has never heard of — that call
  takes it _out_ of the registry, after which `present()` is a no-op forever.

  It only guarded one way in. A flick down dismisses the modal itself and then
  fires `onDismiss`, which sets `open` false; the effect that follows finds
  `presented` still true and calls `dismiss()` on a modal that is already gone
  — the same unregistering call, arriving by the other door. From then on the
  sheet is dead: `open` goes true, `present()` runs, nothing happens.

  Nothing noticed because every sheet so far was opened by a trigger and closed
  for good. It shows up the moment something wants a dismissed sheet back.

## 0.8.1

### Patch Changes

- a67ec39: Sheet no longer overshoots its snap point.

  It animated on `easeSpring`, which `easing.ts` labels "overshoots ~12%, for
  things that scale in place". A sheet sliding up from the bottom edge to a snap
  point is the other case the file names — "critically damped, no overshoot, for
  things that travel inside bounds" — which is `easeSpringTight`, and is what the
  Drawer already uses.

  The overshoot was worse here than on something that scales, because the thing
  overshooting is the sheet's top edge: it travelled past the snap point and came
  back, which reads as failing to land rather than as bounce.

  Duration is unchanged. `springSlow` over the Drawer's `springSoft` is deliberate
  and documented — a sheet travels further than a drawer, and at 700ms it arrived
  quickly enough to read as a snap.

## 0.8.0

### Minor Changes

- 208ea46: `Drawer.ScrollView` and `Drawer.FlatList`, for a drawer with more in it than fits.

  React Native's own scrollables do not scroll inside a `Drawer.Popup`. The
  drawer's pan and the scroll view's native recogniser both want the touch, and
  gesture-handler settles that by reference — so the two have to know about each
  other. A drawer's children are the caller's, so it cannot go looking for them;
  they announce themselves instead. That is why this is a scrollable the drawer
  hands you rather than a prop pointing at one, and it is the same answer
  `@gorhom/bottom-sheet` reaches with `BottomSheetScrollView`.

  ```tsx
  <Drawer.Popup side="left">
    <Drawer.ScrollView>{items}</Drawer.ScrollView>
  </Drawer.Popup>
  ```

  Both take the props their gesture-handler equivalents do. Outside a drawer they
  are ordinary scrollables, so a component that may or may not be in one does not
  have to care.

  Swipe-to-dismiss is unchanged: the pan still claims a clearly sideways drag,
  and a vertical one goes to the list.

## 0.7.0

### Minor Changes

- 8bb1070: The Slider runs on `react-native-gesture-handler`, and `useDragLock` is gone.

  **Breaking:** `useDragLock` and the `DragLock` type are no longer exported.
  Nothing outside this package used them — they existed so a `Slider` could
  reach the `ScrollArea` it was sitting in.

  That whole mechanism was a workaround for something `PanResponder` could not
  do. Dragging a slider inside a scrolling screen scrolled the screen, and
  refusing to hand back the JS responder did not help, because on iOS the
  scrolling is a native recogniser that never asks the JS responder system
  anything. So `ScrollArea` published a lock, `Slider` claimed it for the
  duration of a drag, and the list was switched off.

  `activeOffsetX` says the same thing without switching anything off: the pan
  claims the gesture once the finger has clearly gone sideways, and a vertical
  drag never activates it, so the scroll view keeps it. `ScrollArea` is back to
  being a thin pass over `ScrollView`.

  Also fixed on the way past: the drag reads the finger's position in the track
  rather than anchoring on where the gesture started and adding the total
  translation. The old arithmetic added the whole travel again on every move,
  and was worked around rather than removed.

  Both gestures run on the JS thread. The Drawer's stay worklets because they
  only move a shared value; every callback here reaches React state and the
  consumer's `onValueChange`, so the hop happens either way.

  One behaviour change worth knowing: the value no longer jumps on touch-down.
  A tap still seeks, and a drag seeks once it has moved 4pt sideways — which is
  the threshold that lets a scroll through.

## 0.6.1

### Patch Changes

- 1572209: The Drawer's scrim fades with the panel again.

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

- 3c96894: The Drawer's swipe-to-dismiss runs on `react-native-gesture-handler`.

  It was on `PanResponder` because gesture callbacks from this package's
  prebuilt output were measured doing nothing (GRYT-393) — the babel plugin was
  not reaching `node_modules`, so nothing became a worklet. Measured again with
  a probe built inside this package: both worklet and `runOnJS` callbacks report
  correctly. Whatever it was has been fixed underneath us.

  What changes, in order of how much it matters:

  - **The callbacks are worklets.** The panel tracks the finger on the UI
    thread, rather than through the JS bridge.
  - **The axis rules are declared rather than hand-rolled.** `activeOffsetX` and
    `failOffsetY` replace threshold arithmetic in `onMoveShouldSetPanResponder`,
    and `onPanResponderTerminationRequest: () => false` — a way of keeping the
    drag by never handing it back — is gone.
  - **A dismissed panel no longer returns to open before it leaves.** `drag` was
    cleared when `open` went false, which is the instant a swipe dismisses, so
    the panel jumped back and then slid out. It is cleared once the panel is
    unmounted instead (GRYT-429).

  Velocity is now points per second rather than points per millisecond, so the
  flick threshold moved from `0.5` to `500`. Same gesture, different unit.

  This does **not** make a `ScrollView` inside a Drawer scroll. That does not
  work today either — verified against both builds — and fixing it needs the
  drawer to compose with the scrollable by reference, which is an API decision
  rather than a port. GRYT-431.

## 0.6.0

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

## 0.5.0

### Minor Changes

- 85fe190: Drawer can be swiped away, which the web's could and this one could not.

  `@gryt/ui` gets swipe-to-dismiss from Base UI's drawer primitive — the panel
  follows the pointer and a flick sends it back. React Native had no gesture code
  in the file at all: it animated open, and the only ways out were the scrim and
  the Android back button. That gap was not in the parity exceptions table either,
  which is the part that mattered — the table is the honest list.

  A drag along the closing axis moves the panel with the finger. Release past half
  the panel, or with any speed behind it, dismisses; anything less springs back on
  the same curve the drawer opens with.

  The gesture is claimed on move rather than on start, so a tap on a button inside
  the drawer still reaches the button.

  Drawer also lands on the calmer curve and stops covering more screen than
  `size` asks for.

  The overshooting spring moved to `ease-spring-tight` on **both** platforms. The
  note in the React Native file said a panel travelling its own width was exactly
  the case the tight curve was added for, and that if it ever felt wrong on a
  device the web was what was wrong. It did. A 12% overshoot on a 20pt switch
  thumb is texture; on a 320pt panel it is a slam.

  The overhang also hung the wrong way — added to the panel's width, so it grew
  _inwards_ and covered 64pt more of the screen while the seam it was meant to
  hide stayed exactly where it was. It hangs off the entering edge now.

  Dismissing a Drawer animates it out, rather than making it vanish.

  Two causes, both needed fixing: the close snapped `progress` straight to 0
  instead of animating it, and React Native's `Modal` unmounts the moment
  `visible` goes false, so there would have been nothing left to animate anyway.
  The panel now stays mounted until the close has actually finished.

  `springy`, `travel` and `fade` forward Reanimated's completion callback, which
  is what makes that possible without reaching past them to `withTiming` — and
  reaching past them is how the sampled curve stops being the thing that runs.

  The scrim fades with the panel and thins as it is dragged, and the panel no
  longer fades at all.

  Native had these the wrong way round from the web. The scrim was a flat colour
  that appeared and vanished with the Modal, so a drawer animating out sat under
  a full-strength scrim for the whole 700ms and then it blinked off. The panel
  meanwhile carried `opacity: progress`, which the web's Popup does not — it
  declares `transition-transform` and nothing else.

  The scrim also tracks the swipe now, in proportion to how far the panel has
  been pushed off. The web's own comment on that rule is not to leave a
  full-strength scrim over a half-gone sheet.

- ee66070: `Sheet` keeps clear of the phone's own furniture.

  At the tall snap point the sheet reaches the top of the screen and its content
  ran under the Dynamic Island; at the other end the home indicator clipped the
  last row, which showed up as a control bar cut off at the bottom.

  `topInset` from the safe area at the top, and the bottom inset added to the
  content padding. Adds `react-native-safe-area-context` as a peer dependency —
  gorhom already requires it in practice, so this declares what was already true.

- 030afcf: `Sheet` can be opened from outside it, and `Drawer` keeps clear of the phone's furniture.

  **`Sheet` takes `open` with `onOpenChange`**, which every other overlay in this
  package already did. It was the exception: `defaultOpen` and a `Trigger`, and
  nothing else.

  What that cost a caller was not obvious until something opened a sheet that was
  not a Pressable. A tab bar item, a notification, a deep link — none of them can
  be a `Sheet.Trigger`, so the only way to open one was to unmount the whole sheet
  and remount it with `defaultOpen`. That throws the body away on every open. The
  mobile app shell did exactly that, twice, and the comment explaining why was
  longer than the component it was in.

  It is `useOpenState` now, the same hook `Drawer`, `Dialog`, `Menu` and the rest
  use, so a call site moving between them does not change shape. A controlled
  Sheet's parent gets the final say — `setOpen` reports rather than decides — and
  a flick down or a tap on the backdrop tells the state, which is how the parent
  finds out its sheet is gone.

  **`Drawer` applies the safe-area insets.** A panel from the side is full height
  by definition, so its first row sat under the Dynamic Island and its last under
  the home indicator. GRYT-402 made this call for `Sheet` and it belongs here for
  the same reason: every caller would otherwise write the same two lines, and the
  one that forgets ships a drawer with its heading under the clock. That is how
  the mobile shell's server switcher first looked.

  The padding goes on before the caller's `style`, so a drawer that wants to run
  under the island still can.

  **Two stale claims in the parity table, while in there.** It said indeterminate
  `Progress` renders an empty track, which stopped being true when GRYT-382 fixed
  it on both platforms and did not touch the README. And `Sheet`'s own doc comment
  said it was listed in that table as an addition, which it never was — there was
  no additions table at all. There is one now, since a component the web does not
  have needs the same justification as one it does.

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

- c91b19d: `Sheet` honours its `snapPoints` again.

  gorhom v5 defaults `enableDynamicSizing` on, which measures the content and
  sizes the sheet to it — overriding the snap points entirely. A sheet asked for
  70% whose content had no intrinsic height collapsed to the height of its own
  footer, which looks like the snap points being ignored, because they were.

- Updated dependencies [c1d7384]
  - @gryt/theme@0.4.0

## 0.4.0

### Minor Changes

- fe584b0: Native controls take a label, press like the web does, and are big enough to hit.

  `Checkbox`, `Radio` and `Switch` accept a `label`, and tapping it works the
  control — what a `<label>` does on the web, which React Native has no equivalent
  of. All three gain the web's press scale at the web's own value, plus 12pt of
  hit slop, which takes a 20pt box to the 44pt Apple and WCAG both ask for without
  moving a drawn pixel.

  `grytScaleSteps` grows the five components it was missing, and a test in
  `@gryt/ui` reads the components' own Tailwind classes and asserts they still
  agree. The values are not interchangeable — a checkbox presses to 0.92 and a
  button to 0.96 — so two hand-copied lists was the wrong number of lists.

  Styling parity fixes found while doing it: an unchecked `Checkbox` was
  transparent where the web is a filled surface with an outline, `Radio`'s border
  was 1.5 against the web's 1, and `Switch`'s track had no border at all. The
  checkbox tick and the radio dot now scale from 0 on the spring rather than
  appearing — scaling from 0 is what makes the overshoot visible, which is the
  reasoning already written down in the web components.

- 29fc4be: Adds `Sheet`, a bottom sheet built on `@gorhom/bottom-sheet`.

  Drag between snap points, flick down to dismiss, a backdrop whose opacity
  tracks the drag. Styled entirely from the theme — surface, top-corner radius,
  handle, border — so the library supplies behaviour and nothing else.

  `@gryt/ui` has no counterpart, and this is in the parity exceptions table as an
  addition rather than a gap. A sheet is what a phone does where the web opens a
  dialog or slides a drawer, and they are not the same interaction: a sheet is
  dragged, settles at heights the user picks, and is dismissed with a flick.
  Shipping the web's Dialog on a phone would be 1:1 and wrong.

  Bought rather than built, which is the opposite of the call made for Slider and
  Tabs, and the difference is the shape of the problem. A press scale is four
  lines and no library will give you the right one. Velocity dismiss, snap points,
  keyboard avoidance and the drag-versus-scroll handoff are deep, generic, and
  nothing to do with Gryt.

  `SheetProvider` has to be mounted at the app root, beside `ToastProvider` and
  `TooltipProvider`. It is `BottomSheetModal` underneath, and the provider is
  what anchors the sheet to the screen rather than to wherever the call site
  happens to sit in the layout.

  Adds `@gorhom/bottom-sheet` and `react-native-gesture-handler` as peer
  dependencies.

- a13fa1b: Tabs is the same component as the web's now, not a different one.

  It was an underline: each tab drew its own 2px bottom border and the active
  label changed colour. The web is a pill rail — a `surfaceRaised` container with
  4px padding and a full radius, and a separate accent-filled indicator that
  _slides_ between tabs on the spring curve while the active label goes
  `onAccent`.

  The indicator is drawn by `List`, which is the only part that sees every tab's
  measured box. `Tabs.Indicator` is still exported and still renders nothing, so a
  call site copied from the web keeps working.

  `orientation="vertical"` exists now too, matching the web: the rail turns ninety
  degrees, rows go full width, the radius drops from full to `lg`, and labels
  left-align.

  Geometry taken by measuring the running docs app rather than reading the classes
  — list 4px padding and 4px gap, tabs 32pt min-height at 6/16 padding, 14px/500
  labels, indicator inset 4 on every side.

  `Tabs.List` gains `scrollable`, off by default. The web has no scroller here, so
  off is the parity answer; it exists because a phone is narrow and clipping a
  five-tab rail silently is worse than scrolling it.

### Patch Changes

- 50a13f5: The drawer overhang is a shared token, and React Native uses it.

  `--gryt-drawer-bleed: 4rem` has been in `theme.css` since the web Drawer was
  written, with the reasoning next to it: the spring overshoots and settles from
  both directions, so a panel sized exactly to its resting place shows a seam of
  backdrop down its edge on the undershoot. The panel is built that much larger
  and hangs the difference off-screen.

  React Native had none of it — there is no CSS variable to read there — so its
  Drawer flashed its own edge every time it opened. `grytDrawerBleed` is that
  distance in points, and `bleedTokens.test.ts` keeps it equal to what the
  stylesheet says.

  `Sheet` uses the same overhang below its bottom edge, for the same reason, now
  that it animates on the overshooting curve.

- 388a4db: A Dialog taller than its 80% cap scrolls, and still dismisses on outside press.

  The popup's wrapper was a `Pressable`, there to stop a tap on the panel reaching
  the scrim. A Pressable sets `onResponderTerminationRequest: () => false`, so
  once it had the touch it would not hand it over — the ScrollView inside never
  saw a drag and anything past the cap was unreachable.

  It is a plain `View` with `onStartShouldSetResponder` now.
  `onStartShouldSetResponder` is asked during the bubble phase, so children are
  offered the touch first: a ScrollView claims a drag and scrolls, and a tap on
  empty space that nobody wanted lands on the wrapper and stops there, so the
  scrim never sees it. Nothing is refused, so nothing is starved.

- Updated dependencies [50a13f5]
- Updated dependencies [fe584b0]
  - @gryt/theme@0.3.0

## 0.3.1

### Patch Changes

- ebfb202: Fix every animation throwing on its first frame.

  `0.3.0` shipped an easing whose worklet body called `sampleCurve` from `@gryt/theme`. A worklet runs on the UI runtime and cannot synchronously call a JS-thread function, so `springy()`, `travel()` and `fade()` all threw `[Worklets] Tried to synchronously call a Remote Function` — which is Button press, Switch, Drawer, Toast, Collapsible and the Slider thumb.

  The interpolation is now written out inside the worklet, and the pure part moves to `motion/easing.ts` so it imports no Reanimated and can be tested. `easing.test.ts` asserts it matches `sampleCurve` at 200 points across the domain, so the duplication cannot drift from the definition the web renders from.

  Nothing caught this: the call typechecked, the unit tests could not import `motion.ts` at all because Reanimated does not resolve under vitest, and the on-device probe used React Native's own easing rather than this one.

## 0.3.0

### Minor Changes

- f89f015: Animate Collapsible's height, matching the web.

  The panel was unmounted when closed rather than animated, on the grounds that measuring the content first would cost a frame of it drawn at the wrong size. It is now measured off an absolutely positioned copy that never affects layout, so that objection does not apply — the height animates on the same `ease-spring` at the same 500ms the web uses.

  Children now stay mounted while closed, at height zero with `overflow: hidden`, as they do on the web. That is a behaviour change as well as a visual one: state inside a closed panel survives, where before it was destroyed on close.

  Also corrects a comment on Progress that described its missing indeterminate state as a parity exception. It is not one — `@gryt/ui` has no keyframes, no `data-indeterminate` rule, and no rule at all matching `gryt-progress` in its compiled stylesheet, so an indeterminate Progress renders an empty track on the web too. Tracked as GRYT-382 for both platforms rather than fixed on one.

- 41521ea: Move Switch, Drawer, Toast and the Slider thumb onto the shared spring curve.

  All four ran on React Native's `Animated` with hand-tuned constants — `speed: 40, bounciness: 4`, `speed: 20, bounciness: 0`, a flat 150ms — none of which is the curve the web components use. They now interpolate the same samples from `@gryt/theme`, at the same durations.

  Toast and Slider also gain the press scales the web has: `active:scale-[0.96]` and `active:scale-[0.94]`. The `hover:` halves are deliberately not emulated — a touch screen has no state between not-touching and touching, so inventing one would be a difference from the web rather than a match to it.

  Drawer keeps the web's 700ms and its overshooting curve, even though the panel travels its own width and the critically damped curve exists for exactly that case. Matching the web was the brief; changing it is a separate decision.

- 64cbe56: Share the motion system, and put React Native on the same curve as the web.

  `@gryt/theme` gains the spring curves, durations and press scales that previously existed only as `linear()` sample lists inside `theme.css`. They are arithmetic with no renderer attached, so a second platform can use them instead of hand-copying 54 floats.

  `@gryt/ui-native` gains `easeSpring`, `easeSpringTight`, `springy()`, `travel()`, `fade()` and `usePressScale()`, built by interpolating those same samples. **Not** `withSpring`: the web curve is a spring solved analytically and sampled precisely because a physics engine approximating one was not wanted, and Reanimated's `withSpring` is a physics engine. `withTiming` over the shared samples is identical rather than close.

  `Button` is converted, replacing hand-tuned `speed: 40, bounciness: 6` with the real curve. A test asserts the tokens still equal what `theme.css` emits, so the two cannot drift.

  `react-native-reanimated` is now a peer dependency of `@gryt/ui-native`.

### Patch Changes

- 6fafc2c: Stop Dialog clipping its own footer.

  A short dialog rendered its title and description and then cut the footer off partway, leaving the buttons half-drawn and unreachable. `scrollable={false}` was unaffected, which made it read as a layout choice rather than a bug.

  The cause was a percentage that never resolved. The popup carried `maxHeight: "80%"`, but its parent was a wrapper with a width and no height — and a percentage maxHeight only resolves against a parent with a definite height. The cap therefore constrained nothing, and the `ScrollView` inside had nothing to measure against either. The cap now sits on that wrapper, whose own parent is `flex: 1`, and the popup shrinks inside it.

  Known and not fixed here: a dialog taller than the cap still does not scroll. It caps at the right height and the body stays put. That is tracked separately on GRYT-379 — the clipping fix is a strict improvement either way, since tall dialogs clipped before too.

- d8a61ee: Fix the Slider running away from your finger when dragged.

  `gesture.dx` from PanResponder is the distance from where the gesture started, not from the previous event. The drag handler offset the _live_ value by it on every move, so each event added the whole travel again and the thumb accelerated away from the finger. On a 200px track from 0–100, dragging to x=50, then 60, then 70 produced 25, then 55, then 90.

  Tapping was always correct, because it reads `locationX` directly — which is what made this look like a rendering problem rather than an arithmetic one.

  The drag now anchors on where the finger landed. The position-to-value maths moves into `sliderValue.ts` as a pure function with tests, since a closure over a ref could not be tested and this is exactly where the bugs are.

- Updated dependencies [64cbe56]
  - @gryt/theme@0.2.0

## 0.2.0

### Minor Changes

- 73d1712: Move the design tokens into `@gryt/theme`, so React Native stops installing a web renderer.

  `@gryt/ui-native` needed the tokens and nothing else, but the only way to get them was `@gryt/ui/theme` — which meant depending on `@gryt/ui`, which depends on Base UI and Phosphor, both of which require `react-dom`. A React Native app was installing about 85 MB of DOM code to read some colours. It is now 824 kB, with no `react-dom`, Base UI, Phosphor or Floating UI anywhere in the tree.

  Nothing about the API changed. `@gryt/ui` re-exports the whole layer from both its root entry and `@gryt/ui/theme`, so every existing import keeps resolving and web code needs no edits. `@gryt/ui-native` exports the same things it did.

  New code without a DOM should depend on `@gryt/theme` directly.

## 0.1.1

### Patch Changes

- ba60da9: Declare `@gryt/ui` as a version range rather than `workspace:*`.

  `0.1.0` published with the workspace protocol intact, so `npm install @gryt/ui-native` failed with `EUNSUPPORTEDPROTOCOL` before it got as far as downloading anything. The first release was not installable outside this repository.

## 0.1.0

### Minor Changes

- 36b4b3b: First published release. Thirty-three components on React Native, built on the same tokens as `@gryt/ui`: the five overlays, the form controls, and the layout and feedback set.

  The Gryt-specific components are deliberately absent — Composer, ConversationItem, MessageBubble, PreviewCard, Form, NavigationMenu, ContextMenu, Autocomplete and Combobox all need a screen to design against rather than a web component to copy.

  Read the parity exceptions in the README before assuming a component behaves the way its web counterpart does. Fifteen of them are real differences, and `Tooltip` is a different interaction wearing the same name.

## 0.0.1

### Patch Changes

- Updated dependencies [96b5c90]
  - @gryt/ui@0.14.0
