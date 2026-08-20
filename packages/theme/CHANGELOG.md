# @gryt/theme

## 0.2.0

### Minor Changes

- 64cbe56: Share the motion system, and put React Native on the same curve as the web.

  `@gryt/theme` gains the spring curves, durations and press scales that previously existed only as `linear()` sample lists inside `theme.css`. They are arithmetic with no renderer attached, so a second platform can use them instead of hand-copying 54 floats.

  `@gryt/ui-native` gains `easeSpring`, `easeSpringTight`, `springy()`, `travel()`, `fade()` and `usePressScale()`, built by interpolating those same samples. **Not** `withSpring`: the web curve is a spring solved analytically and sampled precisely because a physics engine approximating one was not wanted, and Reanimated's `withSpring` is a physics engine. `withTiming` over the shared samples is identical rather than close.

  `Button` is converted, replacing hand-tuned `speed: 40, bounciness: 6` with the real curve. A test asserts the tokens still equal what `theme.css` emits, so the two cannot drift.

  `react-native-reanimated` is now a peer dependency of `@gryt/ui-native`.
