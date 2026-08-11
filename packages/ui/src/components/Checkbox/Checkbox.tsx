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
        <BaseCheckbox.Indicator className="flex data-unchecked:hidden">
          <Check size={12} weight="bold" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
    );
  }
);
