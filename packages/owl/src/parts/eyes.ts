/**
 * The eyes the bird is drawn with: one shape traced off the artboard, no styles.
 * Expressions are drawings now — see the `expression` slot — and they hide these.
 */

import { closedPath, type Point } from "../geometry";
import type { OwlMetrics } from "../metrics";
import type { OwlPalette } from "../types";

/**
 * A squircle rotated an eighth of a turn: four identical segments with control points
 * reaching past the radius. That overshoot is what keeps the corners from pinching.
 */
const BLOB: readonly Point[] = [
  [-0.36, -1],
  [0.194, -1.2], [0.804, -0.911], [1, -0.354],
  [1.2, 0.194], [0.911, 0.804], [0.354, 1],
  [-0.194, 1.2], [-0.804, 0.911], [-1, 0.354],
  [-1.2, -0.194], [-0.911, -0.804], [-0.36, -1],
];

/** One eye. `-1` sits on the left of the frame, `1` on the right. */
export function renderEye(m: OwlMetrics, palette: OwlPalette, side: 1 | -1): string {
  return `<path d="${closedPath(
    BLOB.map(([x, y]): Point => [
      m.cx + side * (m.eyeGap / 2) + side * x * m.eyeR,
      m.eyeY + y * m.eyeR,
    ]),
  )}" fill="${palette.accent}"/>`;
}

/** Both, for callers that do not care which is which. */
export function renderEyes(m: OwlMetrics, palette: OwlPalette): string {
  return renderEye(m, palette, -1) + renderEye(m, palette, 1);
}
