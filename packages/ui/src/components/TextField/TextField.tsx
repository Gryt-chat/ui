import { Field } from "@base-ui/react/field";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";
import { fieldControl, fieldSizes } from "../utils/styles";

// The two sizes live in utils/styles, shared with the Combobox and
// Autocomplete inputs so all three keep the same shape.
export type TextFieldSize = "small" | "medium";

export interface TextFieldProps
  extends Omit<
    ComponentPropsWithoutRef<typeof Field.Control>,
    "className" | "size"
  > {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: boolean;
  size?: TextFieldSize;
  multiline?: boolean;
  minRows?: number;
  className?: string;
  fieldClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      className,
      error = false,
      fieldClassName,
      helperText,
      label,
      minRows = 3,
      multiline = false,
      size = "medium",
      ...props
    },
    ref
  ) {
    const control = (
      <Field.Control
        ref={ref}
        // Field.Control renders an input by default; render swaps the element
        // while keeping the field wiring, which is how label association and
        // aria-describedby survive the switch to a textarea.
        render={multiline ? <textarea rows={minRows} /> : undefined}
        className={cn(
          "gryt-text-field-control",
          fieldControl,
          multiline && "resize-y leading-6",
          error ? "border-gryt-danger" : "border-gryt-border",
          fieldSizes[size],
          className
        )}
        {...props}
      />
    );

    return (
      <Field.Root
        className={cn(
          "gryt-text-field flex w-full flex-col gap-1.5",
          fieldClassName
        )}
      >
        {label ? (
          <Field.Label className="text-xs font-medium text-gryt-muted">
            {label}
          </Field.Label>
        ) : null}
        {control}
        {helperText ? (
          <Field.Description
            className={cn(
              "text-xs",
              error ? "text-gryt-danger-11" : "text-gryt-muted"
            )}
          >
            {helperText}
          </Field.Description>
        ) : null}
      </Field.Root>
    );
  }
);
