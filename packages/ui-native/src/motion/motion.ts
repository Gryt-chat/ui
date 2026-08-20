/* The web components' motion, on React Native.
 *
 * Deliberately not `withSpring`. The curve in @gryt/theme is a damped spring
 * solved analytically and sampled — `theme.css` calls it "the real curve of a
 * spring rather than a physics engine approximating one". Reanimated's
 * `withSpring` is a physics engine, so using it would mean approximating an
 * exact curve with the very thing that curve was chosen over, and then tuning
 * damping constants until it looked close.
 *
 * `withTiming` plus an easing that interpolates the same samples at the same
 * duration is both simpler and actually identical.
 */
import { Easing, withTiming, type WithTimingConfig } from "react-native-reanimated";
import { grytDurations } from "@gryt/theme";
import { easeSpring, easeSpringTight } from "./easing";

export { easeSpring, easeSpringTight };

export const durations = grytDurations;

/** `withTiming` on the overshooting spring, at the standard duration. */
export function springy(to: number, config?: WithTimingConfig) {
  "worklet";
  return withTiming(to, { duration: durations.spring, easing: easeSpring, ...config });
}

/** `withTiming` on the critically damped spring — travel that must stay in bounds. */
export function travel(to: number, config?: WithTimingConfig) {
  "worklet";
  return withTiming(to, { duration: durations.spring, easing: easeSpringTight, ...config });
}

/** A colour or opacity change, which should not feel sprung. */
export function fade(to: number, config?: WithTimingConfig) {
  "worklet";
  return withTiming(to, { duration: durations.fast, easing: Easing.out(Easing.quad), ...config });
}
