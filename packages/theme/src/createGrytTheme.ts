import type { CSSProperties } from "react";
import {
  alphaScale,
  hueScale,
  hueScaleLight,
  neutralScale,
  neutralScaleLight
} from "./oklch";

export const grytTokens = {
  color: {
    bg: "#111318",
    surface: "#1a1d24",
    surfaceRaised: "#1e2028",
    surfaceHover: "#334155",
    border: "#2b303d",
    text: "#e0e0e6",
    muted: "#888888",
    accent: "#968ff8",
    accentLight: "#b4afff",
    secondary: "#7dd3fc",
    secondaryLight: "#bae6fd",
    success: "#4ade80",
    danger: "#f87171",
    dangerLight: "#fca5a5",
    warning: "#fbbf24",
    // The fill's own hue, dark enough to clear 7:1 against it. See the note in
    // theme.css: these are the only text in the library that always sits on a
    // saturated colour, so they are held to AAA rather than AA.
    onAccent: "#0c0a20",
    onSecondary: "#02121a",
    onDanger: "#1f0405"
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    full: 999
  }
} as const;

export type GrytTokens = typeof grytTokens;

// Widened off the `as const` token types on purpose. Partial<GrytTokens> would
// inherit the literal types, so an override could only ever be re-assigned its
// own current value.
export interface GrytThemeOptions {
  color?: Partial<Record<keyof GrytTokens["color"], string>>;
  radius?: Partial<Record<keyof GrytTokens["radius"], number>>;
  /**
   * Which set of ramps to build. Dark is the default because it is what the
   * library ships on :root; an app toggling appearance calls this twice and
   * puts each result behind its own selector.
   */
  appearance?: "dark" | "light";
}

// This used to return a MUI theme object. There is no theme object now — the
// components read CSS custom properties, so a theme is the set of variables to
// put on an element. Returning CSSProperties means it drops straight into a
// style prop, and overriding one token does not require reproducing the rest.
/**
 * The scales, computed rather than written down.
 *
 * There is one generator, and this is it — theme.css is emitted from these same
 * functions by scripts/generate-theme.ts, and a test asserts the stylesheet
 * still matches. Two hand-maintained copies of a twelve-step ramp would drift
 * the first time somebody nudged a colour.
 */
/**
 * The light anchors.
 *
 * Picked for this palette rather than computed from the dark ones. The page is
 * a light grey and panels are white, which is the arrangement the client
 * already used and the one people expect of a light UI.
 */
export const grytLightTokens = {
  bg: "#f1f2f7",
  surface: "#ffffff",
  surfaceRaised: "#f7f8fb",
  border: "#dadde6",
  muted: "#5b5d65",
  text: "#1f2129"
} as const;

export const grytScales = {
  neutral: neutralScale({
    bg: grytTokens.color.bg,
    surface: grytTokens.color.surface,
    surfaceRaised: grytTokens.color.surfaceRaised,
    border: grytTokens.color.border,
    muted: grytTokens.color.muted,
    text: grytTokens.color.text
  }),
  accent: hueScale(grytTokens.color.accent, grytTokens.color.accentLight),
  secondary: hueScale(
    grytTokens.color.secondary,
    grytTokens.color.secondaryLight
  ),
  success: hueScale(grytTokens.color.success, grytTokens.color.success),
  danger: hueScale(grytTokens.color.danger, grytTokens.color.dangerLight),
  warning: hueScale(grytTokens.color.warning, grytTokens.color.warning)
} as const;

/** The same six families, light. */
export const grytScalesLight = {
  neutral: neutralScaleLight(grytLightTokens),
  accent: hueScaleLight(grytTokens.color.accent),
  secondary: hueScaleLight(grytTokens.color.secondary),
  success: hueScaleLight(grytTokens.color.success),
  danger: hueScaleLight(grytTokens.color.danger),
  warning: hueScaleLight(grytTokens.color.warning)
} as const;

/**
 * The light hover fill.
 *
 * Not one of the six anchors, because it is not a colour anybody picks: it is
 * step 4, the step that means "component background, hovered", and writing it
 * down as a literal would be a second definition of a value the ramp already
 * has. It exists at all because `.light` never set surface-hover, so a neutral
 * Button in a light app hovered to the dark slate the @theme block declares —
 * a slate block on a white panel.
 */
export const grytLightSurfaceHover = grytScalesLight.neutral[3];

export const grytAlphaScales = {
  neutral: alphaScale(grytScales.neutral, grytTokens.color.bg),
  accent: alphaScale(grytScales.accent, grytTokens.color.bg)
} as const;

export const grytAlphaScalesLight = {
  neutral: alphaScale(grytScalesLight.neutral, grytLightTokens.bg),
  accent: alphaScale(grytScalesLight.accent, grytLightTokens.bg)
} as const;

export function createGrytTheme(options: GrytThemeOptions = {}): CSSProperties {
  const light = options.appearance === "light";
  const defaults = light
    ? {
        ...grytTokens.color,
        ...grytLightTokens,
        surfaceHover: grytLightSurfaceHover
      }
    : grytTokens.color;
  const color = { ...defaults, ...options.color };
  const radius = { ...grytTokens.radius, ...options.radius };

  /**
   * Overriding a colour regenerates its scale.
   *
   * The components read the scale, not the flat name — bg-gryt-neutral-4 for a
   * hover, text-gryt-accent-11 for a link — so a theme that set --gryt-accent
   * and stopped there would change almost nothing on screen. The same
   * generator that produced the defaults runs here on whatever anchors the
   * caller passed, which is what makes one line of override recolour the app
   * coherently rather than in patches.
   */
  const anchors = {
    bg: color.bg,
    surface: color.surface,
    surfaceRaised: color.surfaceRaised,
    border: color.border,
    muted: color.muted,
    text: color.text
  };
  const scales: Record<string, string[]> = light
    ? {
        neutral: neutralScaleLight(anchors),
        accent: hueScaleLight(color.accent),
        secondary: hueScaleLight(color.secondary),
        success: hueScaleLight(color.success),
        danger: hueScaleLight(color.danger),
        warning: hueScaleLight(color.warning)
      }
    : {
        neutral: neutralScale(anchors),
        accent: hueScale(color.accent, color.accentLight),
        secondary: hueScale(color.secondary, color.secondaryLight),
        success: hueScale(color.success, color.success),
        danger: hueScale(color.danger, color.dangerLight),
        warning: hueScale(color.warning, color.warning)
      };

  const scaleVars: Record<string, string> = {};
  for (const [name, steps] of Object.entries(scales)) {
    steps.forEach((value, index) => {
      scaleVars[`--gryt-${name}-${index + 1}`] = value;
      scaleVars[`--color-gryt-${name}-${index + 1}`] = value;
    });
  }
  for (const name of ["neutral", "accent"] as const) {
    alphaScale(scales[name], color.bg).forEach((value, index) => {
      scaleVars[`--gryt-${name}-a${index + 1}`] = value;
      scaleVars[`--color-gryt-${name}-a${index + 1}`] = value;
    });
  }

  return {
    ...scaleVars,
    "--gryt-bg": color.bg,
    "--gryt-surface": color.surface,
    "--gryt-surface-raised": color.surfaceRaised,
    "--gryt-surface-hover": color.surfaceHover,
    "--gryt-border": color.border,
    "--gryt-text": color.text,
    "--gryt-muted": color.muted,
    "--gryt-accent": color.accent,
    "--gryt-accent-light": color.accentLight,
    "--gryt-secondary": color.secondary,
    "--gryt-secondary-light": color.secondaryLight,
    "--gryt-success": color.success,
    "--gryt-danger": color.danger,
    "--gryt-danger-light": color.dangerLight,
    "--gryt-warning": color.warning,
    "--gryt-on-accent": color.onAccent,
    "--gryt-on-secondary": color.onSecondary,
    "--gryt-on-danger": color.onDanger,

    // Tailwind's @theme emits --color-* names, and the utilities compile
    // against those. Both sets have to move together or an override would
    // change the raw var but not bg-gryt-accent.
    "--color-gryt-bg": color.bg,
    "--color-gryt-surface": color.surface,
    "--color-gryt-surface-raised": color.surfaceRaised,
    "--color-gryt-surface-hover": color.surfaceHover,
    "--color-gryt-border": color.border,
    "--color-gryt-text": color.text,
    "--color-gryt-muted": color.muted,
    "--color-gryt-accent": color.accent,
    "--color-gryt-accent-light": color.accentLight,
    "--color-gryt-secondary": color.secondary,
    "--color-gryt-secondary-light": color.secondaryLight,
    "--color-gryt-success": color.success,
    "--color-gryt-danger": color.danger,
    "--color-gryt-danger-light": color.dangerLight,
    "--color-gryt-warning": color.warning,
    "--color-gryt-on-accent": color.onAccent,
    "--color-gryt-on-secondary": color.onSecondary,
    "--color-gryt-on-danger": color.onDanger,

    "--gryt-radius-sm": `${radius.sm}px`,
    "--gryt-radius-md": `${radius.md}px`,
    "--gryt-radius-lg": `${radius.lg}px`,
    "--gryt-radius-xl": `${radius.xl}px`,
    "--gryt-radius-full": `${radius.full}px`
  } as CSSProperties;
}
