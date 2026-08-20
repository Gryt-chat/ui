# @gryt/theme

## 0.4.0

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

## 0.3.0

### Minor Changes

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

## 0.2.0

### Minor Changes

- 64cbe56: Share the motion system, and put React Native on the same curve as the web.

  `@gryt/theme` gains the spring curves, durations and press scales that previously existed only as `linear()` sample lists inside `theme.css`. They are arithmetic with no renderer attached, so a second platform can use them instead of hand-copying 54 floats.

  `@gryt/ui-native` gains `easeSpring`, `easeSpringTight`, `springy()`, `travel()`, `fade()` and `usePressScale()`, built by interpolating those same samples. **Not** `withSpring`: the web curve is a spring solved analytically and sampled precisely because a physics engine approximating one was not wanted, and Reanimated's `withSpring` is a physics engine. `withTiming` over the shared samples is identical rather than close.

  `Button` is converted, replacing hand-tuned `speed: 40, bounciness: 6` with the real curve. A test asserts the tokens still equal what `theme.css` emits, so the two cannot drift.

  `react-native-reanimated` is now a peer dependency of `@gryt/ui-native`.
