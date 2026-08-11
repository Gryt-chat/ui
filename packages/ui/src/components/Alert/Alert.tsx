import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export type AlertSeverity = "info" | "success" | "warning" | "error";

// Tinted background at low alpha with a matching border, rather than a solid
// fill — an alert should read as a note on the surface, not a block on top of
// it.
const severityStyles: Record<AlertSeverity, string> = {
  info: "border-gryt-secondary/40 bg-gryt-secondary/10 text-gryt-secondary",
  success: "border-gryt-success/40 bg-gryt-success/10 text-gryt-success",
  warning: "border-gryt-warning/40 bg-gryt-warning/10 text-gryt-warning",
  error: "border-gryt-danger/40 bg-gryt-danger/10 text-gryt-danger"
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
