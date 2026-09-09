import { Button as BaseButton } from "@base-ui/react/button";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";

type ButtonTone = "primary" | "secondary" | "neutral" | "danger" | "ghost";
type ButtonSize = "xsmall" | "small" | "medium" | "large";

// Base UI marks a disabled button with data-disabled rather than the native attribute, so
// hover and press hang off not-data-disabled. Disabled drops the fill rather than fading it.
const toneStyles: Record<ButtonTone, string> = {
  primary:
    "bg-gryt-accent text-gryt-on-accent hover:not-data-disabled:bg-gryt-accent-light data-disabled:bg-gryt-surface-raised data-disabled:text-gryt-muted",
  secondary:
    "bg-gryt-secondary text-gryt-on-secondary hover:not-data-disabled:bg-gryt-secondary-light data-disabled:bg-gryt-surface-raised data-disabled:text-gryt-muted",
  neutral:
    "bg-gryt-surface-raised text-gryt-text hover:not-data-disabled:bg-gryt-surface-hover data-disabled:text-gryt-muted",
  danger:
    "bg-gryt-danger text-gryt-on-danger hover:not-data-disabled:bg-gryt-danger-light data-disabled:bg-gryt-surface-raised data-disabled:text-gryt-muted",
  ghost:
    "bg-transparent text-gryt-muted hover:not-data-disabled:bg-white/8 hover:not-data-disabled:text-gryt-text"
};

const sizeStyles: Record<ButtonSize, string> = {
  xsmall: "min-h-8 px-3 text-xs",
  small: "min-h-9 px-4 text-sm",
  medium: "min-h-10 px-5 text-sm",
  large: "min-h-12 px-6 text-base"
};

export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseButton>, "className"> {
  tone?: ButtonTone;
  size?: ButtonSize;
  className?: string;
  // Carried over from the MUI-based Button. Base UI has no equivalent, and dropping them
  // would break every call site for no gain — the flex gap already spaces them.
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      endIcon,
      size = "medium",
      startIcon,
      tone = "primary",
      ...props
    },
    ref
  ) {
    return (
      <BaseButton
        ref={ref}
        className={cn(
          "gryt-button",
          // A consumer that underlines its links renders this as an `a` when it is
          // given an href, and a button is a button wherever it lands (GRYT-1098).
          "no-underline",
          "inline-flex cursor-pointer items-center justify-center gap-2 border-0 shadow-none",
          "rounded-(--gryt-radius-control) font-semibold whitespace-nowrap select-none",
          // scale, not transform: Tailwind v4's scale-* utilities set the standalone
          // `scale` property, so transitioning `transform` alone snaps the hover grow.
          "transition-[scale,background-color,color]",
          "duration-(--gryt-dur-spring) ease-spring",

          // Press travels further than hover, so the button reads as pushed. A trigger
          // that scales on hover drags its own popup sideways, so one that opens does not.
          "motion-safe:not-[[aria-haspopup]]:hover:not-data-disabled:scale-[1.03]",
          "motion-safe:not-[[aria-haspopup]]:active:not-data-disabled:scale-[0.96]",

          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
          // Lighter than it was, since the fill swap does the work now. Kept because the
          // icons are the caller's elements with the caller's colours.
          "data-disabled:cursor-not-allowed data-disabled:opacity-60",
          sizeStyles[size],
          toneStyles[tone],
          className
        )}
        {...props}
      >
        {startIcon}
        {children}
        {endIcon}
      </BaseButton>
    );
  }
);
