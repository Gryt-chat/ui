// Shared class fragments. These exist so that "flat, Gryt palette" is decided
// once rather than 24 times, and so a change to the focus ring or the popup
// surface lands everywhere at once.

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light";

// Every floating surface: menu, select list, tooltip, dialog, drawer. Flat —
// a border rather than a shadow.
export const popupSurface =
  "rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface text-gryt-text";

// Base UI sets data-starting-style and data-ending-style for one frame either
// side of open and close. The element carries the transition itself.
export const popupMotion = [
  // scale and translate are named explicitly because Tailwind v4 sets them as
  // standalone CSS properties rather than folding them into `transform`, so
  // transitioning `transform` would leave the popup snapping into place.
  "transition-[opacity,scale,translate] duration-150 ease-out motion-reduce:transition-none",
  "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
  "data-ending-style:scale-[0.98] data-ending-style:opacity-0"
].join(" ");

export const disabledState =
  "data-disabled:cursor-not-allowed data-disabled:opacity-50";

// The tones shared by Checkbox, Radio, Switch and Slider. One union so a
// component cannot invent its own sixth colour. Button and IconButton keep
// their own lists, because "ghost" only makes sense on a button.
export type Tone =
  | "primary"
  | "secondary"
  | "neutral"
  | "danger"
  | "success"
  | "warning";

export const toneAccent: Record<Tone, string> = {
  primary: "text-gryt-accent",
  secondary: "text-gryt-secondary",
  neutral: "text-gryt-muted",
  danger: "text-gryt-danger",
  success: "text-gryt-success",
  warning: "text-gryt-warning"
};

// Filled backgrounds, for the checked state of a control.
export const toneFill: Record<Tone, string> = {
  primary: "bg-gryt-accent text-gryt-on-accent",
  secondary: "bg-gryt-secondary text-gryt-on-secondary",
  neutral: "bg-gryt-surface-hover text-gryt-text",
  danger: "bg-gryt-danger text-gryt-on-danger",
  success: "bg-gryt-success text-gryt-on-accent",
  warning: "bg-gryt-warning text-gryt-on-accent"
};

export const toneBorder: Record<Tone, string> = {
  primary: "border-gryt-accent",
  secondary: "border-gryt-secondary",
  neutral: "border-gryt-border",
  danger: "border-gryt-danger",
  success: "border-gryt-success",
  warning: "border-gryt-warning"
};

// Written out in full rather than composed from toneFill at runtime. Tailwind
// scans source text for class names, so a class built by interpolation exists
// on the element and nowhere in the stylesheet.
export const toneCheckedFill: Record<Tone, string> = {
  primary: "data-checked:bg-gryt-accent data-checked:text-gryt-on-accent",
  secondary:
    "data-checked:bg-gryt-secondary data-checked:text-gryt-on-secondary",
  neutral: "data-checked:bg-gryt-surface-hover data-checked:text-gryt-text",
  danger: "data-checked:bg-gryt-danger data-checked:text-gryt-on-danger",
  success: "data-checked:bg-gryt-success data-checked:text-gryt-on-accent",
  warning: "data-checked:bg-gryt-warning data-checked:text-gryt-on-accent"
};

// Track fill for Switch, and bar fill for Slider.
export const toneBg: Record<Tone, string> = {
  primary: "bg-gryt-accent",
  secondary: "bg-gryt-secondary",
  neutral: "bg-gryt-surface-hover",
  danger: "bg-gryt-danger",
  success: "bg-gryt-success",
  warning: "bg-gryt-warning"
};

export const toneCheckedBorder: Record<Tone, string> = {
  primary: "data-checked:border-gryt-accent",
  secondary: "data-checked:border-gryt-secondary",
  neutral: "data-checked:border-gryt-muted",
  danger: "data-checked:border-gryt-danger",
  success: "data-checked:border-gryt-success",
  warning: "data-checked:border-gryt-warning"
};

export const toneCheckedBg: Record<Tone, string> = {
  primary: "data-checked:bg-gryt-accent",
  secondary: "data-checked:bg-gryt-secondary",
  neutral: "data-checked:bg-gryt-surface-hover",
  danger: "data-checked:bg-gryt-danger",
  success: "data-checked:bg-gryt-success",
  warning: "data-checked:bg-gryt-warning"
};
