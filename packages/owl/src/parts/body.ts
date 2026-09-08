/**
 * The bird itself: silhouette, ear tufts, wings. All three are the painted reference
 * traced once, with no style to pick; the one choice is whether the tufts are there.
 */

import { closedPath, symmetricPath, type Half, type Point } from "../geometry";
import type { OwlMetrics } from "../metrics";
import type { EarStyle } from "../types";

/**
 * The head and skirt, as a right half in head-height units. Two cubics up the head because
 * one cut the cheek in by forty units; the skirt runs past the bottom of the frame.
 */
const SILHOUETTE: Half = {
  points: [
    [0, 0],
    [0.2942, 0.0074], [0.5235, 0.0494], [0.7352, 0.2231],
    [1.0096, 0.4482], [1.004, 0.7035], [0.9999, 1],
    [1.1858, 1.3539], [1.2238, 1.6749], [1.0547, 2.0473],
  ],
};

export function renderBody(m: OwlMetrics, fill: string): string {
  return symmetricPath(SILHOUETTE, m.cx, m.crown, m.half, m.headHeight, fill);
}

/**
 * Ear tufts, drawn behind the body in the body's own colour, so the seam where a tuft
 * meets the head never shows. The reference tuft is a thin sickle, meant to be small.
 */
export function renderEars(m: OwlMetrics, style: EarStyle, fill: string): string {
  if (style === "none") return "";

  const at = (side: 1 | -1, fx: number, fy: number): Point => [
    m.cx + side * m.half * fx,
    m.crown + m.headHeight * fy,
  ];

  const one = (side: 1 | -1): string =>
    `<path d="${closedPath([
      at(side, 0.7245, 0.2231),
      at(side, 0.691, 0.2023),
      at(side, 0.929, 0.1089),
      at(side, 0.5413, 0.1089),
    ])}" fill="${fill}"/>`;

  return one(-1) + one(1);
}

/**
 * The darker crescent down each side. It shares the body's outer edge exactly, so the two
 * never show a hairline; only the inner edge is the wing's own.
 */

/** One wing. `-1` sits on the left of the frame, `1` on the right. */
export function renderWing(m: OwlMetrics, fill: string, side: 1 | -1): string {
  const at = (side: 1 | -1, fx: number, fy: number): Point => [
    m.cx + side * m.half * fx,
    m.shoulder + m.headHeight * fy,
  ];

  const one = (side: 1 | -1): string =>
    `<path d="${closedPath([
      at(side, 0.9999, 0),
      at(side, 1.1858, 0.3539),
      at(side, 1.2238, 0.6749),
      at(side, 1.0547, 1.0473),
      // Straight across the hem, then the reference's inner edge back up. That
      // edge is the tail half of the drawn one, split where the frame cuts it.
      at(side, 0.6458, 1.0473),
      at(side, 0.6458, 1.0473),
      at(side, 0.6458, 1.0473),
      at(side, 0.5918, 0.7894),
      at(side, 0.6347, 0.4908),
      at(side, 0.7649, 0.3144),
      at(side, 0.845, 0.2059),
      at(side, 0.9324, 0.1124),
      at(side, 0.9999, 0),
    ])}" fill="${fill}"/>`;

  return one(side);
}

/** Both, for callers that do not care which is which. */
export function renderWings(m: OwlMetrics, fill: string): string {
  return renderWing(m, fill, -1) + renderWing(m, fill, 1);
}
