/* The motion system, as numbers.
 *
 * These lived only in `theme.css` as `linear()` sample lists, which meant the
 * React Native port had to hand-copy 54 numbers and hope they stayed in step.
 * They are arithmetic with no renderer attached, so they belong here with the
 * colour maths.
 *
 * The curves are a damped spring solved analytically and sampled, rather than
 * a physics engine's approximation of one. That distinction is load-bearing:
 * anything reproducing this on another platform should interpolate these
 * samples, not reach for a spring simulator and tune constants until it looks
 * close. `theme.css` emits them into `linear()`; React Native interpolates
 * them as a timing easing. Same curve, same duration, same motion.
 */

/**
 * A damped spring at ζ = 0.5591 — peaks 12% past the target and settles
 * without a second visible swing.
 *
 * Duration-invariant: the natural frequency scales with the duration, so one
 * curve serves every tier and only the duration changes.
 *
 * **For things that scale.** Overshoot is a percentage of the *travel*, so on
 * a control that grows in place it is texture you feel rather than see. On
 * something that travels the width of its container it throws the element
 * outside its own bounds — use {@link springTight} there.
 */
export const springSamples: readonly number[] = [
  0, 0.1217, 0.3812, 0.6579, 0.883, 1.0304, 1.1034, 1.12, 1.1025, 1.0705,
  1.0376, 1.0115, 0.9949, 0.987, 0.9857, 0.9881, 0.992, 0.9959, 0.9989, 1.0008,
  1.0016, 1.0017, 1.0014, 1.0009, 1.0004, 1.0001, 1
];

/**
 * The same spring critically damped at ζ = 1 — settles at the target without
 * ever passing it.
 *
 * **For things that travel inside bounds.** Measured on a slider: a full-track
 * jump on {@link springSamples} put the thumb 110% along a 919px track, 96px
 * outside the control it belongs to, before coming back.
 */
export const springTightSamples: readonly number[] = [
  0, 0.0496, 0.1585, 0.2869, 0.4135, 0.5279, 0.6263, 0.7079, 0.7741, 0.8268,
  0.8681, 0.9002, 0.9249, 0.9437, 0.958, 0.9688, 0.9768, 0.9829, 0.9874,
  0.9907, 0.9932, 0.995, 0.9963, 0.9973, 0.9981, 0.9986, 1
];

/**
 * Durations, in milliseconds.
 *
 * Each spring curve is shaped for one length. Changing a duration without
 * changing the curve moves where the overshoot lands.
 */
export const grytDurations = {
  /** Most interactions. */
  spring: 500,
  /** Drawer, where the travel is the width of a panel. */
  springSoft: 700,
  /** Colour changes, which should not feel sprung. */
  fast: 150
} as const;

/**
 * How far interactive controls scale.
 *
 * `hover` has no equivalent on a touch screen and is here for the web only;
 * a native port should implement `press` and leave `hover` alone rather than
 * inventing a substitute.
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
 * Sample a curve at `t` in 0..1, interpolating linearly between points.
 *
 * This is what `linear()` does in CSS, written out so other renderers can do
 * the same thing rather than approximating the curve some other way.
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
