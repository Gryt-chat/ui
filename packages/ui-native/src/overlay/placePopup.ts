/**
 * Where to put a popup relative to the thing that opened it.
 *
 * Deliberately free of React and React Native, so it can be tested as
 * arithmetic. React Native's own source is Flow-typed and cannot be parsed by
 * the test runner, so anything importing it is untestable here; keeping the
 * geometry separate is what makes this the part with tests on it.
 *
 * This is also the piece with no React Native equivalent. On the web, Base UI
 * hands positioning to Floating UI: it watches the reference element, flips the
 * popup when it would overflow, shifts it to stay on screen, and keeps doing all
 * of that while the page scrolls. None of that exists here, so this places the
 * popup once against a measurement taken when it opened.
 *
 * It flips and clamps, which is the useful part of Floating UI. It does not
 * follow: if the trigger moves while the popup is open, because a list scrolled
 * underneath it, the popup stays where it was. Both are in the parity
 * exceptions table.
 */

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";

export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PopupPlacement {
  top: number;
  left: number;
  /** The side actually used, which is not the one asked for if it had to flip. */
  side: Side;
  /** How much room the popup has, so it can cap its own height. */
  maxHeight: number;
}

export interface AnchorOptions {
  side?: Side;
  align?: Align;
  /** Gap between trigger and popup, in points. Base UI calls this sideOffset. */
  sideOffset?: number;
  /** Keep this much clear of the screen edge. */
  screenPadding?: number;
}

export function placePopup(
  anchor: AnchorRect,
  popup: { width: number; height: number },
  screen: { width: number; height: number },
  { side = "bottom", align = "center", sideOffset = 8, screenPadding = 8 }: AnchorOptions = {},
): PopupPlacement {
  const spaceBelow = screen.height - (anchor.y + anchor.height) - sideOffset - screenPadding;
  const spaceAbove = anchor.y - sideOffset - screenPadding;

  // Flip only when the preferred side cannot hold it and the other side can do
  // better. Flipping to something equally cramped just moves the problem.
  let resolved = side;
  if (side === "bottom" && popup.height > spaceBelow && spaceAbove > spaceBelow) {
    resolved = "top";
  } else if (side === "top" && popup.height > spaceAbove && spaceBelow > spaceAbove) {
    resolved = "bottom";
  }

  const maxHeight = Math.max(
    0,
    resolved === "top" ? spaceAbove : resolved === "bottom" ? spaceBelow : screen.height - screenPadding * 2,
  );

  let top: number;
  if (resolved === "top") {
    top = anchor.y - Math.min(popup.height, maxHeight) - sideOffset;
  } else if (resolved === "bottom") {
    top = anchor.y + anchor.height + sideOffset;
  } else {
    top = anchor.y + anchor.height / 2 - popup.height / 2;
  }

  let left: number;
  if (resolved === "left") {
    left = anchor.x - popup.width - sideOffset;
  } else if (resolved === "right") {
    left = anchor.x + anchor.width + sideOffset;
  } else if (align === "start") {
    left = anchor.x;
  } else if (align === "end") {
    left = anchor.x + anchor.width - popup.width;
  } else {
    left = anchor.x + anchor.width / 2 - popup.width / 2;
  }

  // Clamp last, so a popup wider than its anchor still stays on screen.
  left = Math.min(
    Math.max(screenPadding, left),
    Math.max(screenPadding, screen.width - popup.width - screenPadding),
  );
  top = Math.min(
    Math.max(screenPadding, top),
    Math.max(screenPadding, screen.height - Math.min(popup.height, maxHeight) - screenPadding),
  );

  return { top, left, side: resolved, maxHeight };
}
