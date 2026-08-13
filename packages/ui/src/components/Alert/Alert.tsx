import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type AlertSeverity = "info" | "success" | "warning" | "error";

// Tinted background at low alpha with a matching border, rather than a solid
// fill — an alert should read as a note on the surface, not a block on top of
// it.
const severityStyles: Record<AlertSeverity, string> = {
  info: "border-gryt-secondary-6 bg-gryt-secondary-3 text-gryt-secondary-11",
  success: "border-gryt-success-6 bg-gryt-success-3 text-gryt-success-11",
  warning: "border-gryt-warning-6 bg-gryt-warning-3 text-gryt-warning-11",
  error: "border-gryt-danger-6 bg-gryt-danger-3 text-gryt-danger-11"
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  severity?: AlertSeverity;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, severity = "info", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "gryt-alert rounded-(--gryt-radius-lg) border px-4 py-3 text-sm",
        severityStyles[severity],
        className
      )}
      {...props}
    />
  );
});
