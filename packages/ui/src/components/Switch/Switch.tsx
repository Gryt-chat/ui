import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { disabledState, focusRing, toneCheckedBg } from "../utils/styles";
import type { Tone } from "../utils/styles";

export interface SwitchProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseSwitch.Root>, "className"> {
  tone?: Tone;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch({ className, tone = "primary", ...props }, ref) {
    return (
      <BaseSwitch.Root
        ref={ref}
        className={cn(
          "gryt-switch relative inline-flex h-6 w-10 shrink-0 items-center",
          "rounded-(--gryt-radius-full) border border-gryt-border bg-gryt-surface-raised p-0.5",
          "transition-colors duration-150 data-checked:border-transparent",
          focusRing,
          disabledState,
          toneCheckedBg[tone],
          className
        )}
        {...props}
      >
        <BaseSwitch.Thumb
          className={cn(
            "h-4.5 w-4.5 rounded-(--gryt-radius-full) bg-gryt-text",
            "transition-transform duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
            "data-checked:translate-x-4 data-checked:bg-gryt-bg"
          )}
        />
      </BaseSwitch.Root>
    );
  }
);
