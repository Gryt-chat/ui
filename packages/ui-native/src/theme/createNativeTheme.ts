import type { TextStyle } from "react-native";

import {
  alphaScale,
  grytLightTokens,
  grytTokens,
  hueScale,
  hueScaleLight,
  neutralScale,
  neutralScaleLight,
} from "@gryt/theme";

/**
 * The same theme, without CSS. React Native cannot consume `createGrytTheme`'s output but
 * can consume the maths underneath; a copy here would drift on the next web tune.
 */

export type GrytAppearance = "dark" | "light";

export interface NativeThemeOptions {
  color?: Partial<Record<keyof typeof grytTokens.color, string>>;
  radius?: Partial<Record<keyof typeof grytTokens.radius, number>>;
  appearance?: GrytAppearance;
  fonts?: FontFaces;
}

/**
 * The faces an app has registered. One family per weight rather than one with weights
 * inside: Android wants an XML definition per weight and ignores a `fontWeight` it cannot.
 */
export interface FontFaces {
  /** 400. The one everything else falls back to. */
  regular?: string;
  /** 500. */
  medium?: string;
  /** 600. */
  semibold?: string;
  /** 700. */
  bold?: string;
  /** 800 and up. */
  extrabold?: string;
  /** The code face, 400. */
  mono?: string;
  /** The code face, 600 and up. */
  monoSemibold?: string;
}

/**
 * What a component spreads into a `Text` style to get the right face — a family with no
 * weight, or a weight with no family. The file carries the weight, so keeping it smears.
 */
export interface FontStyle {
  fontFamily?: string;
  fontWeight?: TextStyle["fontWeight"];
}

/** Twelve steps, the same shape `@gryt/ui` uses. Index 0 is the page. */
export type Ramp = readonly string[];

export interface NativeTheme {
  appearance: GrytAppearance;
  /** The semantic colours, resolved. What most components reach for. */
  color: {
    bg: string;
    surface: string;
    surfaceRaised: string;
    surfaceHover: string;
    border: string;
    text: string;
    muted: string;
    accent: string;
    accentLight: string;
    secondary: string;
    secondaryLight: string;
    success: string;
    danger: string;
    dangerLight: string;
    warning: string;
    onAccent: string;
    onSecondary: string;
    onDanger: string;
  };
  /** The full ramps, for anything that needs a step rather than a role. */
  scales: {
    neutral: Ramp;
    accent: Ramp;
    secondary: Ramp;
    success: Ramp;
    danger: Ramp;
    warning: Ramp;
  };
  /**
   * Translucent neutral and accent, already composited over the background. React Native's
   * overlay handling varies enough that a pre-composited opaque colour is predictable.
   */
  alpha: {
    neutral: Ramp;
    accent: Ramp;
  };
  radius: { sm: number; md: number; lg: number; xl: number; full: number };
  /** Multiples of 4, matching the Tailwind spacing the web components use. */
  space: (steps: number) => number;
  /**
   * The face for a weight, as a style fragment to spread. Returns a `fontWeight` and
   * nothing else when the theme has no faces, so a consumer who sets none sees no change.
   */
  font: (weight?: TextStyle["fontWeight"], options?: { mono?: boolean }) => FontStyle;
  /** The faces this theme was built with, for anything that needs the raw name. */
  fonts: FontFaces;
}

const SPACE_UNIT = 4;

export function createNativeTheme(options: NativeThemeOptions = {}): NativeTheme {
  const light = options.appearance === "light";
  const fonts: FontFaces = options.fonts ?? {};

  const color = {
    ...grytTokens.color,
    ...(light
      ? {
          bg: grytLightTokens.bg,
          surface: grytLightTokens.surface,
          surfaceRaised: grytLightTokens.surfaceRaised,
          border: grytLightTokens.border,
          muted: grytLightTokens.muted,
          text: grytLightTokens.text,
        }
      : {}),
    ...options.color,
  };

  const neutral = light
    ? neutralScaleLight({
        bg: color.bg,
        surface: color.surface,
        surfaceRaised: color.surfaceRaised,
        border: color.border,
        muted: color.muted,
        text: color.text,
      })
    : neutralScale({
        bg: color.bg,
        surface: color.surface,
        surfaceRaised: color.surfaceRaised,
        border: color.border,
        muted: color.muted,
        text: color.text,
      });

  const ramp = (solid: string, solidHover: string) =>
    light ? hueScaleLight(solid) : hueScale(solid, solidHover);

  const scales = {
    neutral,
    accent: ramp(color.accent, color.accentLight),
    secondary: ramp(color.secondary, color.secondaryLight),
    success: ramp(color.success, color.success),
    danger: ramp(color.danger, color.dangerLight),
    warning: ramp(color.warning, color.warning),
  };

  return {
    appearance: light ? "light" : "dark",
    color: {
      ...color,
      // `.light` never set a hover fill on the web either, and a neutral component hovering
      // to dark slate came from it. Step 4 means "component background, hovered".
      surfaceHover: light ? scales.neutral[3] : color.surfaceHover,
    },
    scales,
    alpha: {
      neutral: alphaScale(scales.neutral as string[], color.bg),
      accent: alphaScale(scales.accent as string[], color.bg),
    },
    radius: { ...grytTokens.radius, ...options.radius },
    space: (steps: number) => steps * SPACE_UNIT,
    font: (weight, fontOptions) => faceFor(fonts, weight, fontOptions?.mono ?? false),
    fonts,
  };
}

/**
 * A weight as a number. `"bold"` is 700 and `"normal"` is 400, per the CSS values React
 * Native takes; `undefined` is 400 as well, since an unstyled `Text` is regular.
 */
function weightNumber(weight: TextStyle["fontWeight"]): number {
  if (weight === undefined || weight === null || weight === "normal") return 400;
  if (weight === "bold") return 700;
  const parsed = typeof weight === "number" ? weight : Number.parseInt(weight, 10);
  return Number.isFinite(parsed) ? parsed : 400;
}

/**
 * The face for a weight, or the weight itself when there is no face. Falls down rather than
 * up: an app giving only regular and bold should draw 600 in bold.
 */
function faceFor(
  fonts: FontFaces,
  weight: TextStyle["fontWeight"],
  mono: boolean,
): FontStyle {
  const n = weightNumber(weight);

  if (mono) {
    const face = n >= 600 ? (fonts.monoSemibold ?? fonts.mono) : fonts.mono;
    return face ? { fontFamily: face } : { fontWeight: weight };
  }

  /* Heaviest first, so the ladder can be walked from the asked weight down. */
  const ladder: [number, string | undefined][] = [
    [800, fonts.extrabold],
    [700, fonts.bold],
    [600, fonts.semibold],
    [500, fonts.medium],
    [400, fonts.regular],
  ];

  for (const [step, face] of ladder) {
    if (n >= step && face) return { fontFamily: face };
  }

  /* Below every configured rung — a 200 on a theme that only set `bold`. `regular` is the
   * right answer if it exists, and the platform default if it does not. */
  return fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: weight };
}

export const darkTheme = createNativeTheme();
export const lightTheme = createNativeTheme({ appearance: "light" });
