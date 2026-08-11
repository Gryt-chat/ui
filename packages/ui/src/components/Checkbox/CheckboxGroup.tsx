import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";

export type CheckboxGroupProps = ComponentPropsWithoutRef<
  typeof BaseCheckboxGroup
>;

/**
 * A set of checkboxes sharing one value array.
 *
 * Worth having over a hand-rolled array of Checkboxes for the parent case: give
 * it `allValues` and a checkbox marked `parent` becomes a working
 * indeterminate tri-state, which is fiddly to get right by hand and is exactly
 * what a permissions list needs.
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup({ className, ...props }, ref) {
    return (
      <BaseCheckboxGroup
        ref={ref}
        className={cn("gryt-checkbox-group flex flex-col gap-2", className)}
        {...props}
      />
    );
  }
);
