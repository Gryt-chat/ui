import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import {
  disabledState,
  focusRing,
  toneBg,
  toneCheckedBorder
} from "../utils/styles";
import type { Tone } from "../utils/styles";

export interface RadioProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseRadio.Root>, "className"> {
  tone?: Tone;
  className?: string;
}

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { className, tone = "primary", ...props },
  ref
) {
  return (
    <BaseRadio.Root
      ref={ref}
      className={cn(
        "gryt-radio flex h-5 w-5 shrink-0 items-center justify-center",
        "rounded-(--gryt-radius-full) border border-gryt-border bg-gryt-surface-raised",
        "transition-colors duration-150",
        focusRing,
        disabledState,
        // Border takes the tone when selected; the dot inside carries the fill.
        toneCheckedBorder[tone],
        className
      )}
      {...props}
    >
      <BaseRadio.Indicator
        className={cn(
          "h-2.5 w-2.5 rounded-(--gryt-radius-full) data-unchecked:hidden",
          toneBg[tone]
        )}
      />
    </BaseRadio.Root>
  );
});

export type RadioGroupProps = ComponentPropsWithoutRef<typeof BaseRadioGroup>;

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup({ className, ...props }, ref) {
    return (
      <BaseRadioGroup
        ref={ref}
        className={cn("gryt-radio-group flex flex-col gap-2", className)}
        {...props}
      />
    );
  }
);
