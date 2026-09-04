/* The web components' motion, on React Native. **Deliberately not
 * `withSpring`**: the curve in @gryt/theme is a damped spring solved
 * analytically, and a physics engine would approximate the thing that curve was
 * chosen over. `withTiming` over the same samples is identical.
 */
import { Easing, withTiming, type WithTimingConfig } from "react-native-reanimated";

/**
 * Run when the animation settles, with whether it reached the end.
 *
 * A worklet, like everything Reanimated calls back into — hop with `runOnJS`
 * to touch React state. Forwarded by every helper below because the alternative
 * is a caller reaching past them to `withTiming`, which is how the sampled
 * curve stops being the thing that runs.
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
