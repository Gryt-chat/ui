import { Progress as BaseProgress } from "@base-ui/react/progress";
import { CircleNotch } from "@phosphor-icons/react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export interface ProgressProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseProgress.Root>,
    "className" | "value"
  > {
  className?: string;
  // Optional, unlike Base UI's own prop: omitting it gives an indeterminate
  // bar, which is the common case when there is no measurable total.
  value?: number | null;
}

export function Progress({ className, value = null, ...props }: ProgressProps) {
  return (
    <BaseProgress.Root
      // null is Base UI's indeterminate, so the default has to be null rather
      // than undefined — undefined is not assignable to its value prop.
      value={value}
      className={cn("gryt-progress w-full", className)}
      {...props}
    >
      <BaseProgress.Track className="h-1.5 w-full overflow-hidden rounded-(--gryt-radius-full) bg-gryt-surface-raised">
        <BaseProgress.Indicator className="h-full rounded-(--gryt-radius-full) bg-gryt-accent transition-[width] duration-(--gryt-dur-spring-soft) ease-spring-soft motion-reduce:transition-none" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

export interface SpinnerProps {
  size?: number;
  className?: string;
  "aria-label"?: string;
}

// Base UI has no spinner — an indeterminate circular indicator is animation
// rather than behaviour. Phosphor's CircleNotch is the shape, and the spin is
// a Tailwind utility.
export function Spinner({
  className,
  size = 24,
  "aria-label": ariaLabel = "Loading"
}: SpinnerProps) {
  return (
    <CircleNotch
      role="status"
      aria-label={ariaLabel}
      size={size}
      weight="bold"
      className={cn(
        "gryt-spinner text-gryt-accent motion-safe:animate-spin",
        className
      )}
    />
  );
}
