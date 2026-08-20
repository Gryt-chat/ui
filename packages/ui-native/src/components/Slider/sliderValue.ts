/* Track position to value, as a pure function.
 *
 * Split out of Slider.tsx for the same reason placePopup.ts is split out of the
 * overlay: it is arithmetic, it is where the bugs are, and a closure over a ref
 * cannot be tested. GRYT-378 was a one-line error in this maths that shipped,
 * passed every check, and was only caught by a person dragging a real thumb on
 * a real phone.
 */

export interface SliderScale {
  /** Track width in pixels. Zero or less means the layout has not happened. */
  width: number;
  min: number;
  max: number;
  step: number;
}

/**
 * The value at `x` pixels along the track.
 *
 * Clamped at both ends, snapped to `step`, and safe to call before layout —
 * a zero width returns `min`, since there is no position to read yet.
 */
export function valueAt(x: number, scale: SliderScale): number {
  const { width, min, max, step } = scale;

  if (width <= 0) return min;

  const ratio = Math.max(0, Math.min(1, x / width));
  const raw = min + ratio * (max - min);
  const stepped = step > 0 ? Math.round(raw / step) * step : raw;

  return Math.max(min, Math.min(max, stepped));
}
