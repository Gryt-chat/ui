/**
 * Where a drawer's panel sits when a caller is dragging it and a spring is
 * also running.
 *
 * `Drawer.Root` takes an optional `pull` so a swipe somewhere else on screen
 * can bring the panel out under the finger. `open` cannot express that — it is
 * a boolean, so the panel springs the whole way and the finger is left behind.
 *
 * That leaves two things claiming one position. Taking whichever reaches
 * further is most of the answer and, on its own, is wrong: on release the
 * caller's pull falls while the spring rises, and if the pull falls faster the
 * larger of the two still shrinks — the panel jumps backwards out of the hand
 * that just let go. `drawerPull.test.ts` had that as a failing test before this
 * comment existed.
 *
 * So the spring does not start from nothing. It starts from wherever the finger
 * had got to, which is what `seedFor` is, and from there it only rises while
 * the pull only falls — so the larger of them cannot shrink. That is what makes
 * the caller's job "set open, clear pull" rather than "hold the pull at exactly
 * the right value until the spring overtakes it".
 */

/**
 * How far out the panel is, 0 shut to 1 open.
 *
 * @param progress where the open/close spring has got to
 * @param pull how far the caller has dragged it out
 */
export function reachOf(progress: number, pull: number): number {
  "worklet";
  return Math.max(progress, pull);
}

/**
 * Where the opening spring should start, given a drag that has just committed.
 *
 * The panel is already this far out; springing from 0 would take it back to the
 * edge and bring it in again.
 */
export function seedFor(progress: number, pull: number): number {
  "worklet";
  return Math.max(progress, pull);
}
