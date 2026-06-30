import MuiBadge from "@mui/material/Badge";
import type { BadgeProps as MuiBadgeProps } from "@mui/material/Badge";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type BadgeProps = MuiBadgeProps;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, ...props },
  ref
) {
  return (
    <MuiBadge ref={ref} className={cn("gryt-badge", className)} {...props} />
  );
});
