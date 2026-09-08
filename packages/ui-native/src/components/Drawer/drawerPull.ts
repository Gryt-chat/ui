/**
 * Where a drawer's panel sits when a caller is dragging it and a spring is also running.
 * The spring starts from where the finger got to, so the larger of the two cannot shrink.
 */

/** How far out the panel is, 0 shut to 1 open: the larger of the spring and the drag. */
export function reachOf(progress: number, pull: number): number {
  "worklet";
  return Math.max(progress, pull);
}

/**
 * Where the opening spring should start, given a drag that has just committed. The panel
 * is already this far out; springing from 0 would take it back to the edge.
 */
export function seedFor(progress: number, pull: number): number {
  "worklet";
  return Math.max(progress, pull);
}
