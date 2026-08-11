import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../utils/cn";
import { disabledState, focusRing } from "../utils/styles";

type ToggleTone = "primary" | "secondary" | "neutral" | "danger";
type ToggleSize = "xsmall" | "small" | "medium" | "large";

// Unpressed reads like IconButton's tinted target; pressed fills. A mute button
// has to be legible as on or off from across the room, so the two states differ
// in fill rather than only in colour.
const toneStyles: Record<ToggleTone, string> = {
  primary: [
    "text-gryt-muted hover:not-data-disabled:bg-white/8",
    "data-pressed:bg-gryt-accent data-pressed:text-gryt-on-accent",
    "data-pressed:hover:not-data-disabled:bg-gryt-accent"
  ].join(" "),
  secondary: [
    "text-gryt-muted hover:not-data-disabled:bg-white/8",
    "data-pressed:bg-gryt-secondary data-pressed:text-gryt-on-secondary",
    "data-pressed:hover:not-data-disabled:bg-gryt-secondary"
  ].join(" "),
  neutral: [
    "text-gryt-muted hover:not-data-disabled:bg-white/8",
    "data-pressed:bg-gryt-surface-hover data-pressed:text-gryt-text"
  ].join(" "),
  // For destructive-while-active controls: mic muted, camera off.
  danger: [
    "text-gryt-muted hover:not-data-disabled:bg-white/8",
    "data-pressed:bg-gryt-danger data-pressed:text-gryt-on-danger",
    "data-pressed:hover:not-data-disabled:bg-gryt-danger"
  ].join(" ")
};

const sizeStyles: Record<ToggleSize, string> = {
  xsmall: "h-8 min-w-8 px-2 text-xs",
  small: "h-9 min-w-9 px-2.5 text-sm",
  medium: "h-10 min-w-10 px-3 text-sm",
  large: "h-12 min-w-12 px-4 text-base"
};

export interface ToggleProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseToggle>, "className"> {
  tone?: ToggleTone;
  size?: ToggleSize;
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    { className, size = "medium", tone = "primary", ...props },
    ref
  ) {
    return (
      <BaseToggle
        ref={ref}
        className={cn(
          "gryt-toggle",
          "inline-flex shrink-0 items-center justify-center gap-2 border-0 bg-transparent",
          "rounded-(--gryt-radius-full) font-medium select-none",
          // scale rather than transform — see the note in Button.
          "transition-[scale,background-color,color] duration-(--gryt-dur-spring) ease-spring",
          "motion-safe:hover:not-data-disabled:scale-[1.06]",
          "motion-safe:active:not-data-disabled:scale-[0.94]",
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

export interface ToggleGroupProps
  extends Omit<ComponentPropsWithoutRef<typeof BaseToggleGroup>, "className"> {
  className?: string;
}

// A rail around a set of Toggles. Base UI handles roving focus, so arrow keys
// move between items and only one tab stop enters the group.
export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup({ className, ...props }, ref) {
    return (
      <BaseToggleGroup
        ref={ref}
        className={cn(
          "gryt-toggle-group inline-flex items-center gap-1",
          "rounded-(--gryt-radius-full) border border-gryt-border bg-gryt-surface p-1",
          className
        )}
        {...props}
      />
    );
  }
);
