import { Button as BaseButton } from "@base-ui/react/button";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { disabledState, focusRing } from "../utils/styles";

type IconButtonTone = "primary" | "secondary" | "neutral" | "danger" | "ghost";
type IconButtonSize = "xsmall" | "small" | "medium" | "large";

// The hover fills are the tone colour at low alpha, so an icon button reads as
// a tinted target rather than a filled one.
const toneStyles: Record<IconButtonTone, string> = {
  primary: "text-gryt-accent hover:not-data-disabled:bg-gryt-accent/10",
  secondary:
    "text-gryt-secondary hover:not-data-disabled:bg-gryt-secondary/10",
  neutral:
    "text-gryt-muted hover:not-data-disabled:bg-white/8 hover:not-data-disabled:text-gryt-text",
  danger: "text-gryt-danger hover:not-data-disabled:bg-gryt-danger/10",
  ghost:
    "text-gryt-muted hover:not-data-disabled:bg-white/8 hover:not-data-disabled:text-gryt-text"
};

const sizeStyles: Record<IconButtonSize, string> = {
  xsmall: "h-8 w-8",
  small: "h-9 w-9",
  medium: "h-10 w-10",
  large: "h-12 w-12"
};

export interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseButton>, "className"> {
  tone?: IconButtonTone;
  size?: IconButtonSize;
  className?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, size = "medium", tone = "neutral", ...props },
    ref
  ) {
    return (
      <BaseButton
        ref={ref}
        className={cn(
          "gryt-icon-button",
          "inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0",
          "rounded-(--gryt-radius-full) select-none",
          // scale rather than transform — see the note in Button.
          "transition-[scale,background-color,color] duration-(--gryt-dur-spring) ease-spring",
          // A button that opens something does not grow under the cursor.
          // Base UI positions the popup against the trigger's measured box, and
          // it keeps measuring while the popup is open — so a trigger that
          // scales on hover drags its own menu a pixel or two sideways every
          // time the pointer crosses it. aria-haspopup is how the trigger says
          // that is what it is; Base UI puts it there, nothing to pass.
          "motion-safe:not-[[aria-haspopup]]:hover:not-data-disabled:scale-[1.06]",
          "motion-safe:not-[[aria-haspopup]]:active:not-data-disabled:scale-[0.94]",
          focusRing,
          disabledState,
          sizeStyles[size],
          toneStyles[tone],
          className
        )}
        {...props}
      />
    );
  }
);
