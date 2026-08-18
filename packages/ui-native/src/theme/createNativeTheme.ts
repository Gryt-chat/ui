import {
  alphaScale,
  grytLightTokens,
  grytTokens,
  hueScale,
  hueScaleLight,
  neutralScale,
  neutralScaleLight,
} from "@gryt/ui/theme";

/**
 * The same theme, without CSS.
 *
 * `createGrytTheme` in `@gryt/ui` returns `CSSProperties` — a map of
 * `--gryt-accent-9` style custom properties. React Native has no custom
 * properties and no cascade, so it cannot consume that at all.
 *
 * What it can consume is the maths underneath. `neutralScale`, `hueScale` and
 * `alphaScale` are exported from `@gryt/ui/theme` for exactly this, so the two
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
}

const SPACE_UNIT = 4;

export function createNativeTheme(options: NativeThemeOptions = {}): NativeTheme {
  const light = options.appearance === "light";

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
  };
}

export const darkTheme = createNativeTheme();
export const lightTheme = createNativeTheme({ appearance: "light" });
