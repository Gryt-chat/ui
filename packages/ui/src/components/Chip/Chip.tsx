import { X } from "@phosphor-icons/react";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { focusRing } from "../utils/styles";

export type ChipTone =
  | "neutral"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

const toneStyles: Record<ChipTone, string> = {
  neutral: "border-gryt-border bg-gryt-surface-raised text-gryt-text",
  primary: "border-gryt-accent/40 bg-gryt-accent/12 text-gryt-accent",
  secondary:
    "border-gryt-secondary/40 bg-gryt-secondary/12 text-gryt-secondary",
  success: "border-gryt-success/40 bg-gryt-success/12 text-gryt-success",
  warning: "border-gryt-warning/40 bg-gryt-warning/12 text-gryt-warning",
  danger: "border-gryt-danger/40 bg-gryt-danger/12 text-gryt-danger"
};

export interface ChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "onDelete"> {
  label?: ReactNode;
  tone?: ChipTone;
  icon?: ReactNode;
  onDelete?: () => void;
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(function Chip(
  { children, className, icon, label, onDelete, tone = "neutral", ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "gryt-chip inline-flex items-center gap-1.5 rounded-(--gryt-radius-full) border px-3 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {icon}
      {label ?? children}
      {onDelete ? (
        <button
          type="button"
          aria-label="Remove"
          onClick={onDelete}
          className={cn(
            "-mr-1 inline-flex h-4 w-4 items-center justify-center rounded-(--gryt-radius-full)",
            "opacity-70 transition-opacity hover:opacity-100",
            focusRing
          )}
        >
          <X size={10} weight="bold" aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
});
