import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export interface StepsProps extends HTMLAttributes<HTMLDivElement> {
  /** 1-based: the step the person is on. Steps up to and including it are lit. */
  current: number;
  total: number;
  /** Read out instead of the default "Step 2 of 4". */
  label?: string;
}

/** Small bars for "step N of M" in a multi-step flow, like a checkout. */
export const Steps = forwardRef<HTMLDivElement, StepsProps>(function Steps(
  { current, total, label, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label ?? `Step ${current} of ${total}`}
      className={cn("gryt-steps flex gap-1.5", className)}
      {...props}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 w-6 rounded-(--gryt-radius-full) transition-colors duration-(--gryt-dur-fast) motion-reduce:transition-none",
            i < current ? "bg-gryt-accent" : "bg-gryt-border"
          )}
        />
      ))}
    </div>
  );
});
