import MuiTextField from "@mui/material/TextField";
import type { TextFieldProps as MuiTextFieldProps } from "@mui/material/TextField";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type TextFieldProps = MuiTextFieldProps;

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  function TextField({ className, variant = "outlined", ...props }, ref) {
    return (
      <MuiTextField
        ref={ref}
        variant={variant}
        className={cn("gryt-text-field", className)}
        {...props}
      />
    );
  }
);
