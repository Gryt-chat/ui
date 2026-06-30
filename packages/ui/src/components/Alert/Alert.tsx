import MuiAlert from "@mui/material/Alert";
import type { AlertProps as MuiAlertProps } from "@mui/material/Alert";
import { forwardRef } from "react";
import { cn } from "../utils/cn";

export type AlertProps = MuiAlertProps;

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant = "outlined", ...props },
  ref
) {
  return (
    <MuiAlert
      ref={ref}
      variant={variant}
      className={cn("gryt-alert", className)}
      {...props}
    />
  );
});
