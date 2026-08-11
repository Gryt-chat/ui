import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";
import { disabledState, focusRing } from "../utils/styles";

export interface NumberFieldProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseNumberField.Root>,
    "className"
  > {
  label?: ReactNode;
  className?: string;
  /**
   * Drag the label sideways to change the value.
   *
   * Base UI calls this a scrub area, and it is the reason to use this over a
   * plain input for things like volume or bitrate — coarse adjustment by drag,
   * exact entry by typing, without two controls.
   */
  scrubbable?: boolean;
}

const stepButton =
  "flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent text-gryt-muted transition-colors hover:not-data-disabled:bg-white/8 hover:not-data-disabled:text-gryt-text motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50";

export const NumberField = forwardRef<HTMLDivElement, NumberFieldProps>(
  function NumberField(
    { className, label, scrubbable = false, ...props },
    ref
  ) {
    return (
      <BaseNumberField.Root
        ref={ref}
        className={cn("gryt-number-field flex flex-col gap-1.5", className)}
        {...props}
      >
        {label &&
          (scrubbable ? (
            <BaseNumberField.ScrubArea className="cursor-ew-resize text-sm text-gryt-muted select-none">
              {label}
              <BaseNumberField.ScrubAreaCursor />
            </BaseNumberField.ScrubArea>
          ) : (
            <span className="text-sm text-gryt-muted">{label}</span>
          ))}
        <BaseNumberField.Group
          className={cn(
            "flex w-fit items-center overflow-hidden rounded-(--gryt-radius-full)",
            "border border-gryt-border bg-gryt-surface-raised",
            "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gryt-accent-light",
            disabledState
          )}
        >
          <BaseNumberField.Decrement
            aria-label="Decrease"
            className={cn(stepButton, "rounded-l-(--gryt-radius-full)")}
          >
            <Minus size={14} weight="bold" />
          </BaseNumberField.Decrement>
          <BaseNumberField.Input
            className={cn(
              "w-16 border-0 bg-transparent px-1 py-2 text-center",
              "font-mono text-sm text-gryt-text tabular-nums outline-none",
              focusRing
            )}
          />
          <BaseNumberField.Increment
            aria-label="Increase"
            className={cn(stepButton, "rounded-r-(--gryt-radius-full)")}
          >
            <Plus size={14} weight="bold" />
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    );
  }
);
