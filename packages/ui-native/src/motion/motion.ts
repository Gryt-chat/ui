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
import { Easing, withTiming, type EasingFunction, type WithTimingConfig } from "react-native-reanimated";
import { grytDurations, sampleCurve, springSamples, springTightSamples } from "@gryt/theme";

/**
 * Turn a sample list into an easing.
 *
 * The body is a worklet so it can run on the UI thread — an easing evaluated
 * on the JS thread would drop frames under exactly the load this system exists
 * to survive. `samples` is captured by value, which worklets allow for plain
 * arrays.
 */
function easingFromSamples(samples: readonly number[]): EasingFunction {
  const points = [...samples];

  return (t: number) => {
    "worklet";
    return sampleCurve(points, t);
  };
}

/** Overshoots ~12%. For things that scale in place. */
export const easeSpring = easingFromSamples(springSamples);

/** Critically damped, no overshoot. For things that travel inside bounds. */
export const easeSpringTight = easingFromSamples(springTightSamples);

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
