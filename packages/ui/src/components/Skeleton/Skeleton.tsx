import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type SkeletonVariant = "text" | "rounded" | "circular" | "rectangular";

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 rounded-(--gryt-radius-sm)",
  rounded: "rounded-(--gryt-radius-lg)",
  circular: "rounded-(--gryt-radius-full)",
  rectangular: "rounded-none"
};

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  className,
  height,
  style,
  variant = "text",
  width,
  ...props
}: SkeletonProps) {
  const sizing: CSSProperties = {
    width,
    height,
    ...style
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        // Not bg-gryt-surface-raised. #1e2028 against #1a1d24 is four points of
        // luminance, which is invisible on a laptop screen at an angle — the
        // placeholder that is meant to say "something is coming" said nothing.
        // A white wash instead of a fixed colour, so it stays visible on any of
        // the surfaces it can land on rather than only the one it was picked
        // against, and it dims rather than brightens as it pulses.
        "gryt-skeleton bg-white/9 motion-safe:animate-pulse",
        variantStyles[variant],
        className
      )}
      style={sizing}
      {...props}
    />
  );
}
