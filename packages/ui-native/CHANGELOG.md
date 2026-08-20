# @gryt/ui-native

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
