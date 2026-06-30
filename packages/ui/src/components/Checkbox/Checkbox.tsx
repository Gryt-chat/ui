import MuiCheckbox from "@mui/material/Checkbox";
import type { CheckboxProps as MuiCheckboxProps } from "@mui/material/Checkbox";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type CheckboxProps = MuiCheckboxProps;

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <MuiCheckbox
        ref={ref}
        className={cn("gryt-checkbox", className)}
        {...props}
      />
    );
  }
);
