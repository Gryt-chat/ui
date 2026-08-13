/* What a theme is, on this page.
 *
 * The document itself — two sets of neutrals, one or two sets of hues, five
 * radii — belongs to the library now, next to createGrytTheme, because the
 * client reads the same format when somebody pastes a link into it. What is
 * left here is what only an editor needs: the labels beside each field, what
 * each radius step is actually on, and the small helpers this page reaches for.
 *
 * Why the document has that shape is in packages/ui/src/theme/theme.ts. The
 * short version: dark and light neutrals do not derive from each other, and the
 * hues are shared because step 9 is the same colour in both appearances by
 * design.
 */

import {
  GRYT_HUE_KEYS,
  GRYT_NEUTRAL_KEYS,
  GRYT_RADIUS_KEYS,
  createGrytTheme,
  grytTheme,
  grytThemeHues,
  grytThemeToOptions,
  isHexColor,
  normalizeHexColor
} from "@gryt/ui";
import type {
  GrytAppearance,
  GrytHueKey,
  GrytHues,
  GrytNeutralKey,
  GrytNeutrals,
  GrytRadiusKey,
  GrytTheme
} from "@gryt/ui";
import type { CSSProperties } from "react";

export type Appearance = GrytAppearance;
export type HueKey = GrytHueKey;
export type NeutralKey = GrytNeutralKey;
export type RadiusKey = GrytRadiusKey;
export type HueSet = GrytHues;
export type NeutralSet = GrytNeutrals;
export type ThemeDraft = GrytTheme;

export const HUE_KEYS = GRYT_HUE_KEYS;
export const NEUTRAL_KEYS = GRYT_NEUTRAL_KEYS;
export const RADIUS_KEYS = GRYT_RADIUS_KEYS;

export { isHexColor as isHex, normalizeHexColor as normalizeHex };

/** Where this appearance's hues live, which is what an edit has to write to. */
export type DraftPath =
  | `hue.${HueKey}`
  | `lightHue.${HueKey}`
  | `dark.${NeutralKey}`
  | `light.${NeutralKey}`;

export const grytDraft: ThemeDraft = grytTheme;

export function hueSlot(
  draft: ThemeDraft,
  appearance: Appearance
): "hue" | "lightHue" {
  return appearance === "light" && draft.lightHue !== null ? "lightHue" : "hue";
}

export const huesFor = grytThemeHues;

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
  return createGrytTheme(grytThemeToOptions(draft, appearance));
}

/** A generated scale, read back off the built theme rather than regenerated. */
export function scaleFrom(theme: CSSProperties, family: string): string[] {
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
