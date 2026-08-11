import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  function Surface({ className, elevated = false, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "gryt-surface rounded-(--gryt-radius-lg) border border-gryt-border p-4 text-gryt-text",
          elevated ? "bg-gryt-surface-raised" : "bg-gryt-surface",
          className
        )}
        {...props}
      />
    );
  }
);
