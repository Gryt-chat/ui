/* The motion system as numbers, so the React Native port does not hand-copy 54 of them
 * out of `theme.css`. The curves are a solved damped spring: interpolate the samples. */

/**
 * A damped spring at ζ = 0.5591 — 12% past the target, settling without a second swing.
 * Overshoot is a percentage of travel, so for things that scale use {@link springTight}.
 */
export const springSamples: readonly number[] = [
  0, 0.1217, 0.3812, 0.6579, 0.883, 1.0304, 1.1034, 1.12, 1.1025, 1.0705,
  1.0376, 1.0115, 0.9949, 0.987, 0.9857, 0.9881, 0.992, 0.9959, 0.9989, 1.0008,
  1.0016, 1.0017, 1.0014, 1.0009, 1.0004, 1.0001, 1
];

/**
 * The same spring critically damped at ζ = 1, settling without passing the target. For
 * things that travel inside bounds: a slider thumb went 96px outside its own track.
 */
export const springTightSamples: readonly number[] = [
  0, 0.0496, 0.1585, 0.2869, 0.4135, 0.5279, 0.6263, 0.7079, 0.7741, 0.8268,
  0.8681, 0.9002, 0.9249, 0.9437, 0.958, 0.9688, 0.9768, 0.9829, 0.9874,
  0.9907, 0.9932, 0.995, 0.9963, 0.9973, 0.9981, 0.9986, 1
];

/**
 * Durations, in milliseconds. Each spring curve is shaped for one length, so changing a
 * duration without the curve moves where the overshoot lands.
 */
export const grytDurations = {
  /** Most interactions. */
  spring: 500,
  /** Drawer, where the travel is the width of a panel. */
  springSoft: 700,
  /**
   * For something that travels further than its own width. A bottom sheet is a longer
   * journey than a drawer's; `springSoft` there was the same time over more distance.
   */
  springSlow: 900,
  /** Colour changes, which should not feel sprung. */
  fast: 150,
  /**
   * One pass of an indeterminate Progress bar across its track. Long enough to read as
   * "working", short enough that a second pass starts before you wonder.
   */
  sweep: 1400
} as const;

/**
 * How far interactive controls scale. `hover` has no equivalent on a touch screen and is
 * here for the web only; a native port implements `press` and leaves it alone.
 */
export const grytScaleSteps = {
  button: { hover: 1.03, press: 0.96 },
  iconButton: { hover: 1.06, press: 0.94 },
  checkbox: { hover: 1.08, press: 0.92 },
  radio: { hover: 1.08, press: 0.92 },
  switch: { hover: 1.05, press: 0.95 },
  toggle: { hover: 1.06, press: 0.94 },
  toast: { hover: 1.04, press: 0.96 },
  sliderThumb: { hover: 1.12, press: 0.94 }
} as const;

/**
 * How far a Drawer or Sheet hangs past the edge it comes from, in points. The spring
 * settles from both directions, so a panel sized exactly to rest shows a seam.
 */
export const grytDrawerBleed = 64;

/**
 * Sample a curve at `t` in 0..1, interpolating linearly. This is what `linear()` does in
 * CSS, written out so other renderers do the same rather than approximating.
 */
export function sampleCurve(samples: readonly number[], t: number): number {
  if (samples.length === 0) return t;
  if (t <= 0) return samples[0]!;
  if (t >= 1) return samples[samples.length - 1]!;

  const span = (samples.length - 1) * t;
  const index = Math.floor(span);
  const rest = span - index;
  const from = samples[index]!;
  const to = samples[index + 1] ?? from;

  return from + (to - from) * rest;
}
