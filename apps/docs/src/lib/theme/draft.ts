/* What a theme is, on this page.
 *
 * createGrytTheme takes a flat bag of colours and an appearance. That is the
 * right shape for a caller who wants one theme; it is the wrong shape for an
 * editor, because two of its inputs behave differently from the rest:
 *
 * - The neutral six are appearance-specific. Dark and light do not derive from
 *   each other — a light surface is whiter than the page while a dark one is
 *   lighter than it, which is a different arrangement rather than an inverted
 *   one.
 * - The hues are usually shared. Step 9 is the same colour in both appearances
 *   by design, so a filled button does not change colour when somebody
 *   switches.
 *
 * So a draft holds two sets of neutrals and one set of hues, and building a
 * theme is picking the neutrals for the appearance you are rendering. That is
 * also what makes light and dark previews of the same theme meaningful rather
 * than two unrelated themes that happen to sit side by side.
 *
 * `lightHue` is the escape hatch, and it exists because the ported presets need
 * it. Catppuccin's mauve is #cba6f7 in Mocha and #8839ef in Latte; GitHub's
 * blue is #1f6feb dark and #0969da light. Sharing one hue would make those
 * presets wrong in one half, and "wrong in one half" is not a preset of
 * somebody's theme, it is a theme that reminds you of theirs. Null means
 * shared, which is what a theme built here starts as.
 */

import { createGrytTheme, grytLightTokens, grytScalesLight, grytTokens } from "@gryt/ui";
import type { CSSProperties } from "react";

export type Appearance = "dark" | "light";

export const HUE_KEYS = [
  "accent",
  "accentLight",
  "secondary",
  "secondaryLight",
  "success",
  "danger",
  "dangerLight",
  "warning",
  "onAccent",
  "onSecondary",
  "onDanger"
] as const;

export const NEUTRAL_KEYS = [
  "bg",
  "surface",
  "surfaceRaised",
  "surfaceHover",
  "border",
  "muted",
  "text"
] as const;

export const RADIUS_KEYS = ["sm", "md", "lg", "xl", "full"] as const;

export type HueKey = (typeof HUE_KEYS)[number];
export type NeutralKey = (typeof NEUTRAL_KEYS)[number];
export type RadiusKey = (typeof RADIUS_KEYS)[number];

export type HueSet = Record<HueKey, string>;
export type NeutralSet = Record<NeutralKey, string>;

export interface ThemeDraft {
  hue: HueSet;
  /** Null when light borrows the hues above, which is the usual case. */
  lightHue: HueSet | null;
  dark: NeutralSet;
  light: NeutralSet;
  radius: Record<RadiusKey, number>;
}

/** Which field a warning or an edit points at. */
export type DraftPath =
  | `hue.${HueKey}`
  | `lightHue.${HueKey}`
  | `dark.${NeutralKey}`
  | `light.${NeutralKey}`;

/** Where this appearance's hues live, which is what an edit has to write to. */
export function hueSlot(draft: ThemeDraft, appearance: Appearance): "hue" | "lightHue" {
  return appearance === "light" && draft.lightHue !== null ? "lightHue" : "hue";
}

export function huesFor(draft: ThemeDraft, appearance: Appearance): HueSet {
  return appearance === "light" && draft.lightHue !== null
    ? draft.lightHue
    : draft.hue;
}

/**
 * The light surface-hover the library does not ship.
 *
 * grytLightTokens names six anchors and surfaceHover is not one of them, so
 * createGrytTheme({ appearance: "light" }) falls through to the dark #334155 —
 * a slate block where a light hover should be. Step 4 is the step that means
 * "component background, hovered", so that is what it should have been, and
 * setting it here means a theme exported from this page is right in light even
 * on today's release. GRYT-240 fixes it in the library.
 */
const LIGHT_SURFACE_HOVER = grytScalesLight.neutral[3];

export const grytDraft: ThemeDraft = {
  hue: {
    accent: grytTokens.color.accent,
    accentLight: grytTokens.color.accentLight,
    secondary: grytTokens.color.secondary,
    secondaryLight: grytTokens.color.secondaryLight,
    success: grytTokens.color.success,
    danger: grytTokens.color.danger,
    dangerLight: grytTokens.color.dangerLight,
    warning: grytTokens.color.warning,
    onAccent: grytTokens.color.onAccent,
    onSecondary: grytTokens.color.onSecondary,
    onDanger: grytTokens.color.onDanger
  },
  lightHue: null,
  dark: {
    bg: grytTokens.color.bg,
    surface: grytTokens.color.surface,
    surfaceRaised: grytTokens.color.surfaceRaised,
    surfaceHover: grytTokens.color.surfaceHover,
    border: grytTokens.color.border,
    muted: grytTokens.color.muted,
    text: grytTokens.color.text
  },
  light: {
    bg: grytLightTokens.bg,
    surface: grytLightTokens.surface,
    surfaceRaised: grytLightTokens.surfaceRaised,
    surfaceHover: LIGHT_SURFACE_HOVER,
    border: grytLightTokens.border,
    muted: grytLightTokens.muted,
    text: grytLightTokens.text
  },
  radius: { ...grytTokens.radius }
};

export function cloneDraft(draft: ThemeDraft): ThemeDraft {
  return {
    hue: { ...draft.hue },
    lightHue: draft.lightHue === null ? null : { ...draft.lightHue },
    dark: { ...draft.dark },
    light: { ...draft.light },
    radius: { ...draft.radius }
  };
}

/** The colours createGrytTheme wants, for one appearance. */
export function colorsFor(
  draft: ThemeDraft,
  appearance: Appearance
): Record<string, string> {
  return { ...huesFor(draft, appearance), ...draft[appearance] };
}

/** The theme itself: CSS custom properties, ready for a style prop. */
export function themeStyle(
  draft: ThemeDraft,
  appearance: Appearance
): CSSProperties {
  return createGrytTheme({
    appearance,
    color: colorsFor(draft, appearance),
    radius: draft.radius
  });
}

/** A generated scale, read back off the built theme rather than regenerated. */
export function scaleFrom(
  theme: CSSProperties,
  family: string
): string[] {
  const vars = theme as unknown as Record<string, string>;
  return Array.from(
    { length: 12 },
    (_, index) => vars[`--gryt-${family}-${index + 1}`]
  );
}

export const SCALE_FAMILIES = [
  "neutral",
  "accent",
  "secondary",
  "success",
  "danger",
  "warning"
] as const;

/** Changes anywhere in the draft, as one string. Cheap memo key. */
export function draftSignature(draft: ThemeDraft): string {
  return JSON.stringify(draft);
}

export function draftsEqual(a: ThemeDraft, b: ThemeDraft): boolean {
  return draftSignature(a) === draftSignature(b);
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: string): boolean {
  return HEX.test(value.trim());
}

/** #abc to #aabbcc, and everything lower case, so comparisons work. */
export function normalizeHex(value: string): string {
  const hex = value.trim().toLowerCase();
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

/** Human labels, used by the editor and by the contrast report alike. */
export const HUE_LABELS: Record<HueKey, string> = {
  accent: "Accent",
  accentLight: "Accent, light",
  secondary: "Secondary",
  secondaryLight: "Secondary, light",
  success: "Success",
  danger: "Danger",
  dangerLight: "Danger, light",
  warning: "Warning",
  onAccent: "Text on accent",
  onSecondary: "Text on secondary",
  onDanger: "Text on danger"
};

export const NEUTRAL_LABELS: Record<NeutralKey, string> = {
  bg: "Page",
  surface: "Surface",
  surfaceRaised: "Raised surface",
  surfaceHover: "Surface, hovered",
  border: "Border",
  muted: "Muted text",
  text: "Text"
};

export const RADIUS_LABELS: Record<RadiusKey, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
  full: "Full"
};

/** What each radius step is actually on, so the numbers mean something. */
export const RADIUS_HINTS: Record<RadiusKey, string> = {
  sm: "Chips, swatches, small insets",
  md: "Menu rows, list items",
  lg: "Cards and panels",
  xl: "Dialogs, composers, bubbles",
  full: "Buttons, fields, avatars"
};
