import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { toneFill } from "../utils/styles";
import type { Tone } from "../utils/styles";

/**
 * Badge's own union. `Tone` is closed on purpose so Checkbox, Radio, Switch and
 * Slider cannot invent a colour, and unread is a colour only a badge has.
 */
export type BadgeTone = Tone | "unread";

const badgeFill: Record<BadgeTone, string> = {
  ...toneFill,
  unread: "bg-gryt-unread text-gryt-on-unread"
};

export type BadgePlacement =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

const placements: Record<BadgePlacement, string> = {
  "top-right": "-top-1 -right-1",
  "top-left": "-top-1 -left-1",
  "bottom-right": "-bottom-1 -right-1",
  "bottom-left": "-bottom-1 -left-1"
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  // Anchored to a corner of children. With no children it is the pill on its own, in
  // normal flow — a row that ends in a count rather than an avatar wearing one.
  badgeContent?: ReactNode;
  // Hide when the count is zero, matching how a notification badge is normally
  // wanted. Set false to keep a literal 0 on screen.
  showZero?: boolean;
  max?: number;
  /** Which corner of `children` it sits on. Ignored when there are none. */
  placement?: BadgePlacement;
  /**
   * How loud it is. The channel list uses two: `unread` for anything waiting,
   * primary for a conversation that named you. Neutral is grey on a grey
   * sidebar, which is how people came to miss messages.
   */
  tone?: BadgeTone;
  /**
   * A ring in the page background colour, so the pill reads as sitting on top of what it
   * overlaps. Off when the badge stands alone, where there is nothing to lift it off.
   */
  ring?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    badgeContent,
    children,
    className,
    max = 99,
    placement = "top-right",
    ring,
    showZero = false,
    tone = "primary",
    ...props
  },
  ref
) {
  const numeric = typeof badgeContent === "number" ? badgeContent : null;
  const hidden = numeric !== null && numeric === 0 && !showZero;
  const display = numeric !== null && numeric > max ? `${max}+` : badgeContent;
  const anchored = children !== undefined && children !== null;
  const withRing = ring ?? anchored;

  const pill = (
    <span
      className={cn(
        "gryt-badge-dot inline-flex items-center justify-center",
        "min-w-5 rounded-(--gryt-radius-full) px-1.5 py-0.5",
        "text-[0.65rem] leading-none font-semibold",
        badgeFill[tone],
        // A count is read as a number, so the digits have to hold a column —
        // otherwise a badge counting up flickers wider and narrower on the 1s.
        "tabular-nums",
        withRing && "ring-2 ring-gryt-bg",
        anchored && `absolute z-10 ${placements[placement]}`
      )}
    >
      {display}
    </span>
  );

  if (!anchored) {
    return badgeContent === undefined || hidden ? null : (
      <span
        ref={ref}
        className={cn("gryt-badge inline-flex", className)}
        {...props}
      >
        {pill}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn("gryt-badge relative inline-flex", className)}
      {...props}
    >
      {children}
      {badgeContent !== undefined && !hidden ? pill : null}
    </span>
  );
});
