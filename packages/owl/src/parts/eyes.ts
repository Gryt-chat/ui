/**
 * The eyes the bird is drawn with.
 *
 * One shape, traced off the artboard, and no styles. Expressions used to live
 * here as ten hand-built variants — arcs for pleased, a wedge for cross — which
 * had to be kept in step with a drawing they were only approximating. They are
 * drawings now: see the `expression` slot in `accessories.ts`. An expression
 * brings its own eyes and hides these.
 */

import { closedPath, type Point } from "../geometry";
import type { OwlMetrics } from "../metrics";
import type { OwlPalette } from "../types";

/**
 * A squircle rotated an eighth of a turn.
 *
 * Four identical segments at ninety degrees to each other, with control points
 * reaching past the radius — that overshoot is what keeps the corners full
 * instead of pinching, and it is why this is not just an ellipse.
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
