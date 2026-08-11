import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  // Anchored to the top-right of children. A count, a dot, or anything else.
  badgeContent?: ReactNode;
  // Hide when the count is zero, matching how a notification badge is normally
  // wanted. Set false to keep a literal 0 on screen.
  showZero?: boolean;
  max?: number;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { badgeContent, children, className, max = 99, showZero = false, ...props },
  ref
) {
  const numeric = typeof badgeContent === "number" ? badgeContent : null;
  const hidden = numeric !== null && numeric === 0 && !showZero;
  const display =
    numeric !== null && numeric > max ? `${max}+` : badgeContent;

  return (
    <span
      ref={ref}
      className={cn("gryt-badge relative inline-flex", className)}
      {...props}
    >
      {children}
      {badgeContent !== undefined && !hidden ? (
        <span
          className={cn(
            "gryt-badge-dot absolute -top-1 -right-1 z-10 inline-flex items-center justify-center",
            "min-w-5 rounded-(--gryt-radius-full) px-1.5 py-0.5",
            "bg-gryt-accent text-[0.65rem] leading-none font-semibold text-gryt-on-accent",
            "ring-2 ring-gryt-bg"
          )}
        >
          {display}
        </span>
      ) : null}
    </span>
  );
});
