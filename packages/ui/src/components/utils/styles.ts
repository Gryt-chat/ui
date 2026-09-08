// Shared class fragments, so "flat, Gryt palette" is decided once rather than 24 times and
// a change to the focus ring or the popup surface lands everywhere.

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light";

// The same ring, for a control whose focusable element is a child. Base UI's Slider is the
// case: focus lands on a hidden input inside the thumb, so focus-visible never matches.
export const focusRingWithin =
  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gryt-accent-light";

/**
 * What a text input looks like: TextField, and the typeahead inputs. Shared because they
 * had drifted. The border colour is left to the caller, which swaps it for danger.
 */
export const fieldControl = [
  "w-full rounded-(--gryt-radius-field) border bg-gryt-surface-raised",
  "text-gryt-text outline-none placeholder:text-gryt-muted",
  "transition-colors duration-150 motion-reduce:transition-none",
  "hover:border-gryt-accent-light focus:border-gryt-accent",
  "disabled:cursor-not-allowed disabled:opacity-60"
].join(" ");

/** Matching heights and padding for the two sizes a field comes in. */
export const fieldSizes = {
  small: "min-h-9 px-3 py-1.5 text-sm",
  medium: "min-h-11 px-4 py-2.5 text-sm"
} as const;

export type FieldSize = keyof typeof fieldSizes;

// Every floating surface: menu, select list, tooltip, dialog, drawer. Flat, a border
// rather than a shadow. Split from its radius because Menu's rows need a smaller corner.
export const popupSurfaceColors =
  "border border-gryt-border bg-gryt-surface text-gryt-text";

export const popupSurface = `rounded-(--gryt-radius-popup) ${popupSurfaceColors}`;

// Base UI sets data-starting-style and data-ending-style for one frame either
// side of open and close. The element carries the transition itself.
export const popupMotion = [
  // scale and translate are named explicitly because Tailwind v4 sets them as standalone
  // properties rather than folding them into `transform`, which would snap the popup.
  "transition-[opacity,scale,translate] duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
  "data-starting-style:scale-[0.98] data-starting-style:opacity-0",
  "data-ending-style:scale-[0.98] data-ending-style:opacity-0"
].join(" ");

export const disabledState =
  "cursor-pointer data-disabled:cursor-not-allowed data-disabled:opacity-50";

// The tones shared by Checkbox, Radio, Switch and Slider. One union so a component cannot
// invent a sixth colour; Button keeps its own, because "ghost" only makes sense there.
export type Tone =
  | "primary"
  | "secondary"
  | "neutral"
  | "danger"
  | "success"
  | "warning";

// Step 11, the text step, not the flat name. The flat name is step 9 — the solid fill —
// which reads on a dark page and disappears on a white one.
export const toneAccent: Record<Tone, string> = {
  primary: "text-gryt-accent-11",
  secondary: "text-gryt-secondary-11",
  neutral: "text-gryt-muted",
  danger: "text-gryt-danger-11",
  success: "text-gryt-success-11",
  warning: "text-gryt-warning-11"
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

// Written out in full rather than composed from toneFill at runtime. Tailwind scans source
// text for class names, so an interpolated class exists on the element and nowhere else.
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
