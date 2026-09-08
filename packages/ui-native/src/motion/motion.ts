/* The web components' motion, on React Native. Deliberately not `withSpring`: the curve in
 * @gryt/theme is solved analytically, and `withTiming` over the samples is identical. */
import { Easing, withTiming, type WithTimingConfig } from "react-native-reanimated";

/**
 * Run when the animation settles, with whether it reached the end. A worklet — hop with
 * `runOnJS` to touch React state. Forwarded by every helper, or callers reach past them.
 */
type Settled = (finished?: boolean) => void;
import { grytDurations } from "@gryt/theme";
import { easeSpring, easeSpringTight } from "./easing";

export { easeSpring, easeSpringTight };

export const durations = grytDurations;

/** `withTiming` on the overshooting spring, at the standard duration. */
export function springy(to: number, config?: WithTimingConfig, settled?: Settled) {
  "worklet";
  return withTiming(
    to,
    { duration: durations.spring, easing: easeSpring, ...config },
    settled
  );
}

/** `withTiming` on the critically damped spring — travel that must stay in bounds. */
export function travel(to: number, config?: WithTimingConfig, settled?: Settled) {
  "worklet";
  return withTiming(
    to,
    { duration: durations.spring, easing: easeSpringTight, ...config },
    settled
  );
}

/** A colour or opacity change, which should not feel sprung. */
export function fade(to: number, config?: WithTimingConfig, settled?: Settled) {
  "worklet";
  return withTiming(
    to,
    { duration: durations.fast, easing: Easing.out(Easing.quad), ...config },
    settled
  );
}
