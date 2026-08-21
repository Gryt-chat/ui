# @gryt/ui-native

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
