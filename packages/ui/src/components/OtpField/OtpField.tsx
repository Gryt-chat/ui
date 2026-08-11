import { OTPField as BaseOtpField } from "@base-ui/react/otp-field";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/styles";

export interface OtpFieldProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseOtpField.Root>,
    "className" | "length"
  > {
  /** How many characters the code has. Required by Base UI; defaulted here. */
  length?: number;
  className?: string;
}

/**
 * A one-time code, one box per character.
 *
 * Base UI handles the parts that are tedious and easy to get wrong: paste a
 * whole code into any box and it distributes across all of them, backspace
 * steps back a box, and the arrow keys move between them.
 */
export const OtpField = forwardRef<HTMLDivElement, OtpFieldProps>(
  function OtpField({ className, length = 6, ...props }, ref) {
    return (
      <BaseOtpField.Root
        ref={ref}
        length={length}
        className={cn("gryt-otp-field flex gap-2", className)}
        {...props}
      >
        {/* No index prop: Base UI assigns each input its slot by render order
            and exposes the index through state. */}
        {Array.from({ length }, (_unused, index) => (
          <BaseOtpField.Input
            key={index}
            className={cn(
              "gryt-otp-input h-12 w-10 rounded-(--gryt-radius-md) text-center",
              "border border-gryt-border bg-gryt-surface-raised",
              "font-mono text-lg text-gryt-text tabular-nums outline-none",
              "transition-colors duration-(--gryt-dur-fast) motion-reduce:transition-none",
              "data-filled:border-gryt-accent",
              focusRing
            )}
          />
        ))}
      </BaseOtpField.Root>
    );
  }
);
