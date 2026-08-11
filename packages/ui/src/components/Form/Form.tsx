import { Form as BaseForm } from "@base-ui/react/form";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type FormProps = ComponentPropsWithoutRef<typeof BaseForm>;

/**
 * Wires server-side errors back to the fields that caused them.
 *
 * Pass `errors` keyed by field name and Base UI routes each message to the
 * matching Field, so a rejected form points at the input rather than printing a
 * paragraph at the top that the user has to map back themselves.
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { className, ...props },
  ref
) {
  return (
    <BaseForm
      ref={ref}
      className={cn("gryt-form flex flex-col gap-(--gryt-space-lg)", className)}
      {...props}
    />
  );
});

export type FieldsetProps = ComponentPropsWithoutRef<typeof BaseFieldset.Root>;

const FieldsetRoot = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  function Fieldset({ className, ...props }, ref) {
    return (
      <BaseFieldset.Root
        ref={ref}
        className={cn(
          "gryt-fieldset flex min-w-0 flex-col gap-3 border-0 p-0",
          className
        )}
        {...props}
      />
    );
  }
);

const Legend = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseFieldset.Legend>
>(function FieldsetLegend({ className, ...props }, ref) {
  return (
    <BaseFieldset.Legend
      ref={ref}
      className={cn(
        "gryt-fieldset-legend text-sm font-semibold text-gryt-text",
        className
      )}
      {...props}
    />
  );
});

export const Fieldset = { Root: FieldsetRoot, Legend };
