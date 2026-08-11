import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { disabledState, focusRing, toneCheckedFill } from "../utils/styles";
import type { Tone } from "../utils/styles";

export interface CheckboxProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
    "className"
  > {
  tone?: Tone;
  className?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox({ className, tone = "primary", ...props }, ref) {
    return (
      <BaseCheckbox.Root
        ref={ref}
        className={cn(
          "gryt-checkbox flex h-5 w-5 shrink-0 items-center justify-center",
          "rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-surface-raised",
          "transition-[scale,background-color,border-color] duration-(--gryt-dur-spring) ease-spring",
          "data-checked:border-transparent",
          // Same grow-and-press as the buttons, so a control reacts to the
          // cursor before it is clicked rather than only after.
          "hover:not-data-disabled:border-gryt-accent-light",
          "motion-safe:hover:not-data-disabled:scale-[1.08]",
          "motion-safe:active:not-data-disabled:scale-[0.92]",
          focusRing,
          disabledState,
          // Unchecked stays a neutral outline; the tone only paints once checked.
          toneCheckedFill[tone],
          className
        )}
        {...props}
      >
        {/* keepMounted is load-bearing: without it Base UI unmounts the
            indicator whenever the box is unchecked, so data-unchecked never
            applies to anything and there is no element to transition from —
            the tick just appears. Kept in the DOM, it can scale and fade in
            both directions. */}
        <BaseCheckbox.Indicator
          keepMounted
          className={cn(
            "flex origin-center",
            "transition-[scale,opacity] duration-(--gryt-dur-spring) ease-spring",
            // Scaling from 0 rather than from something near 1 is deliberate.
            // The spring's overshoot is a percentage of the travel, so a tick
            // going 0 -> 1 overshoots to 1.12 and visibly springs, while one
            // going 0.95 -> 1 overshoots by 0.006 and does nothing at all.
            "data-unchecked:scale-0 data-unchecked:opacity-0",
            "motion-reduce:transition-none"
          )}
        >
          <Check size={12} weight="bold" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    );
  }
);
