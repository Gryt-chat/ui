/* The sampled-spring easings, with no Reanimated import.
 *
 * Split from motion.ts for the same reason sliderValue.ts is split from
 * Slider.tsx: this is arithmetic, it is where a bug hid, and importing
 * react-native-reanimated drags in react-native-worklets, which cannot resolve
 * under vitest. A file that cannot be imported cannot be tested.
 */
import { springSamples, springTightSamples } from "@gryt/theme";

/** Same shape as Reanimated's `EasingFunction`, without importing it. */
export type Easing = (t: number) => number;

/**
 * Turn a sample list into an easing.
 *
 * The body is a worklet so it runs on the UI thread — an easing evaluated on
 * the JS thread would drop frames under exactly the load this exists to
 * survive. `points` is a plain array, which worklets capture by value.
 *
 * The interpolation is written out rather than calling `sampleCurve` from
 * @gryt/theme, and that is not a style choice. A worklet cannot synchronously
 * call a JS-thread function: doing so throws
 *
 *   [Worklets] Tried to synchronously call a Remote Function
 *
 * on the first frame of every animation. That shipped in 0.3.0, because the
 * only thing exercising the UI thread in testing used React Native's own
 * easing rather than this one.
 *
 * easing.test.ts asserts this stays identical to `sampleCurve`, so the
 * duplication cannot drift from the definition the web renders from.
 */
export function easingFromSamples(samples: readonly number[]): Easing {
  const points = [...samples];

  return (t: number) => {
    "worklet";
    const count = points.length;
    if (count === 0) return t;
    if (t <= 0) return points[0]!;
    if (t >= 1) return points[count - 1]!;

    const span = (count - 1) * t;
    const index = Math.floor(span);
    const rest = span - index;
    const from = points[index]!;
    const to = points[index + 1] ?? from;

    return from + (to - from) * rest;
  };
}

/** Overshoots ~12%. For things that scale in place. */
export const easeSpring = easingFromSamples(springSamples);

/** Critically damped, no overshoot. For things that travel inside bounds. */
export const easeSpringTight = easingFromSamples(springTightSamples);
