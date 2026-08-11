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
        "gryt-skeleton bg-gryt-surface-raised motion-safe:animate-pulse",
        variantStyles[variant],
        className
      )}
      style={sizing}
      {...props}
    />
  );
}
