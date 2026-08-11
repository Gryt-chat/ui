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
          "transition-colors duration-150 data-checked:border-transparent",
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
