import { Button as BaseButton } from "@base-ui/react/button";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "../utils/cn";

type ButtonTone = "primary" | "secondary" | "neutral" | "danger" | "ghost";
type ButtonSize = "xsmall" | "small" | "medium" | "large";

// Base UI marks a disabled button with data-disabled rather than the native
// attribute, because it stays focusable when disabled. Hover and press styles
// hang off not-data-disabled so they don't fire on a dead button.
const toneStyles: Record<ButtonTone, string> = {
  primary:
    "bg-gryt-accent text-gryt-on-accent hover:not-data-disabled:bg-gryt-accent-light",
  secondary:
    "bg-gryt-secondary text-gryt-on-secondary hover:not-data-disabled:bg-gryt-secondary-light",
  neutral:
    "bg-gryt-surface-raised text-gryt-text hover:not-data-disabled:bg-gryt-surface-hover",
  danger:
    "bg-gryt-danger text-gryt-on-danger hover:not-data-disabled:bg-gryt-danger-light",
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
  // Carried over from the MUI-based Button. Base UI has no equivalent, but
  // dropping them would break every existing call site for no gain — the flex
  // gap below already spaces them correctly.
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
          "inline-flex items-center justify-center gap-2 border-0 shadow-none",
          "rounded-(--gryt-radius-full) font-semibold whitespace-nowrap select-none",
          // scale, not transform: Tailwind v4's scale-* utilities set the
          // standalone `scale` property, so transitioning `transform` alone
          // leaves the hover grow snapping instantly.
          "transition-[scale,background-color,color]",
          "duration-(--gryt-dur-spring) ease-spring",

          // Press travels further than hover, so the button reads as being
          // pushed down rather than just acknowledging the cursor.
          // A button that opens something does not grow under the cursor.
          // Base UI positions the popup against the trigger's measured box, and
          // it keeps measuring while the popup is open — so a trigger that
          // scales on hover drags its own menu a pixel or two sideways every
          // time the pointer crosses it. aria-haspopup is how the trigger says
          // that is what it is; Base UI puts it there, nothing to pass.
          "motion-safe:not-[[aria-haspopup]]:hover:not-data-disabled:scale-[1.03]",
          "motion-safe:not-[[aria-haspopup]]:active:not-data-disabled:scale-[0.96]",

          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
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
