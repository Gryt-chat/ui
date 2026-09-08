/* Track position to value, as a pure function. Split out because it is arithmetic and it
 * is where the bugs are: GRYT-378 shipped, passed every check, and was caught by hand. */

export interface SliderScale {
  /** Track width in pixels. Zero or less means the layout has not happened. */
  width: number;
  min: number;
  max: number;
  step: number;
}

/**
 * The value at `x` pixels along the track. Clamped at both ends, snapped to `step`, and
 * safe to call before layout — a zero width returns `min`.
 */
export function valueAt(x: number, scale: SliderScale): number {
  const { width, min, max, step } = scale;

  if (width <= 0) return min;

  const ratio = Math.max(0, Math.min(1, x / width));
  const raw = min + ratio * (max - min);
  const stepped = step > 0 ? Math.round(raw / step) * step : raw;

  return Math.max(min, Math.min(max, stepped));
}
