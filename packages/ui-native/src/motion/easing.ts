/* The sampled-spring easings, with no Reanimated import: importing it drags in
 * react-native-worklets, which cannot resolve under vitest, and untestable is untested. */
import { springSamples, springTightSamples } from "@gryt/theme";

/** Same shape as Reanimated's `EasingFunction`, without importing it. */
export type Easing = (t: number) => number;

/**
 * Turn a sample list into an easing. The interpolation is written out rather than calling
 * `sampleCurve`: a worklet cannot synchronously call a JS-thread function.
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
