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
 * The same theme, without CSS.
 *
 * `createGrytTheme` in `@gryt/theme` returns `CSSProperties` — a map of
 * `--gryt-accent-9` style custom properties. React Native has no custom
 * properties and no cascade, so it cannot consume that at all.
 *
 * What it can consume is the maths underneath. `neutralScale`, `hueScale` and
 * `alphaScale` are exported from `@gryt/theme` for exactly this, so the two
 * renderers compute their ramps from one implementation of the OKLab
 * conversions rather than two. A copy here would drift the moment somebody
 * tunes a curve on the web.
 *
 * Same inputs as `createGrytTheme`, so a theme a person built in the web client
 * — and which travels as an encoded document — produces the same colours here.
 */

export type GrytAppearance = "dark" | "light";

export interface NativeThemeOptions {
  color?: Partial<Record<keyof typeof grytTokens.color, string>>;
  radius?: Partial<Record<keyof typeof grytTokens.radius, number>>;
  appearance?: GrytAppearance;
  fonts?: FontFaces;
}

/**
 * The faces an app has registered, by the names React Native knows them as.
 *
 * **The library ships no font files and is not going to.** A font is a
 * megabyte-scale asset with a licence attached, and bundling one would make
 * every consumer carry it whether they use it or not. What the library can do
 * is stop hard-coding the platform default: an app loads its own faces —
 * `expo-font`, `Font.loadAsync`, a native `Info.plist` entry, whichever — and
 * passes the resulting family names in here.
 *
 * **One family per weight rather than one family with weights inside it.**
 * Grouping faces under a single family name and letting `fontWeight` select
 * between them works on iOS, where the OS reads the name table and assembles
 * the family itself. Android does not: a custom family there wants an XML
 * definition per weight, and a `fontWeight` it cannot satisfy is ignored rather
 * than synthesised. Naming each face is the shape that behaves the same on both.
 *
 * Every field is optional. A gap falls back to the nearest lighter face that
 * was given, and a theme with no faces at all behaves exactly as this library
 * did before any of this existed.
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
 * What a component spreads into a `Text` style to get the right face.
 *
 * Both halves, and never both at once. With faces configured it is a
 * `fontFamily` and no weight; with none it is a `fontWeight` and no family.
 *
 * The weight is dropped deliberately once a face is chosen. The file already
 * carries the weight, and leaving the number on asks the platform to
 * synthesise a bolder version of an already-bold face — on Android that is a
 * visibly smeared double-bold, and on iOS it is a subtler one.
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
   * Translucent neutral and accent, already composited over the background.
   *
   * The web gets these as real alpha. React Native's shadow and overlay
   * handling is inconsistent enough across platforms that a pre-composited
   * opaque colour is the predictable choice, which is what `alphaScale` returns.
   */
  alpha: {
    neutral: Ramp;
    accent: Ramp;
  };
  radius: { sm: number; md: number; lg: number; xl: number; full: number };
  /** Multiples of 4, matching the Tailwind spacing the web components use. */
  space: (steps: number) => number;
  /**
   * The face for a weight, as a style fragment to spread.
   *
   * ```tsx
   * <Text style={{ fontSize: 16, ...theme.font("600") }}>
   * ```
   *
   * Returns a `fontWeight` and nothing else when the theme has no faces, which
   * is what makes this safe to adopt everywhere at once: a consumer who sets no
   * fonts sees no change.
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
      // `.light` never set a hover fill on the web either, and a neutral
      // component hovering to the dark slate on a white panel was the bug that
      // came from it. Step 4 is "component background, hovered", so take it
      // from the ramp rather than writing a second literal.
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
 * A weight as a number.
 *
 * `"bold"` is 700 and `"normal"` is 400, per the CSS values React Native takes.
 * `undefined` is 400 as well — an unstyled `Text` is regular.
 */
function weightNumber(weight: TextStyle["fontWeight"]): number {
  if (weight === undefined || weight === null || weight === "normal") return 400;
  if (weight === "bold") return 700;
  const parsed = typeof weight === "number" ? weight : Number.parseInt(weight, 10);
  return Number.isFinite(parsed) ? parsed : 400;
}

/**
 * The face for a weight, or the weight itself when there is no face.
 *
 * Falls **down** through the configured faces rather than up: an app that gives
 * only `regular` and `bold` should draw 600 in bold rather than in regular,
 * because a semibold rendered at regular reads as a missing emphasis while one
 * rendered bold reads as slightly too much. So each rung tries itself and then
 * everything lighter, and the first rung that exists wins going down from the
 * asked weight.
 *
 * Returning the bare `fontWeight` when nothing matches is the whole
 * compatibility story: a theme built without `fonts` yields exactly the styles
 * this library used before it had any of this.
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

  /* Below every configured rung — a 200 on a theme that only set `bold`.
   * `regular` is the right answer if it exists, and the platform default is the
   * right answer if it does not. */
  return fonts.regular ? { fontFamily: fonts.regular } : { fontWeight: weight };
}

export const darkTheme = createNativeTheme();
export const lightTheme = createNativeTheme({ appearance: "light" });
