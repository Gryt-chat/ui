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

/**
 * Three steps of one scale, rather than three alphas of the fill.
 *
 * The flat name is step 9, the solid step, and it is the same colour in both
 * appearances on purpose. That makes it right for a filled button and wrong for
 * text: on a white panel a success chip came out bright green on pale green.
 * Step 3 is the component background, 6 the hairline and 11 the text, each
 * defined per appearance and each measured.
 */
const toneStyles: Record<ChipTone, string> = {
  neutral: "border-gryt-border bg-gryt-surface-raised text-gryt-text",
  primary: "border-gryt-accent-6 bg-gryt-accent-3 text-gryt-accent-11",
  secondary:
    "border-gryt-secondary-6 bg-gryt-secondary-3 text-gryt-secondary-11",
  success: "border-gryt-success-6 bg-gryt-success-3 text-gryt-success-11",
  warning: "border-gryt-warning-6 bg-gryt-warning-3 text-gryt-warning-11",
  danger: "border-gryt-danger-6 bg-gryt-danger-3 text-gryt-danger-11"
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
            "-mr-1 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-(--gryt-radius-full)",
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
