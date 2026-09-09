import type { CSSProperties } from "react";
/* Type-only, so the cycle with theme.ts is erased at compile time. This file needs the
   font stacks' shape, not their values. */
import type { GrytFonts, GrytMotion } from "./theme";
/* Types only from ./theme. It imports grytTokens from here at module scope, so a value
   imported back is a cycle the loader resolves as undefined, and every test fails. */
import { grytDurations, springSamples, springTightSamples } from "./motion";
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
    // The fill's own hue, dark enough to clear 7:1 against it. These are the only text
    // that always sits on a saturated colour, so they are held to AAA rather than AA.
    onAccent: "#0c0a20",
    onSecondary: "#02121a",
    onDanger: "#1f0405",
    // Its own colour, not a step of a family, and the same under light: danger was
    // doing this and measured 2.56:1 on the light surface, under the 3:1 a fill wants.
    unread: "#ff3b30",
    onUnread: "#1f0405"
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    full: 999
  }
} as const;

/**
 * What the role helpers below read: the five steps, plus the optional roles. A role is
 * derived rather than required, so a theme written before these existed still works.
 */
export type RadiusTokens = Record<"sm" | "md" | "lg" | "xl" | "full", number> & {
  field?: number;
  control?: number;
  surface?: number;
  popup?: number;
};

/**
 * The corner on anything somebody types into. Its own token: a browser clamps a radius
 * to half the shorter side, so one xl gave a pill, a near-pill and a rectangle.
 */
export function fieldRadius(radius: RadiusTokens): number {
  return radius.field ?? radius.md;
}

/**
 * The corner on anything somebody presses: Button, IconButton, Toggle, Chip. All pills
 * today; the name is the point, since overriding `full` also moves handles and avatars.
 */
export function controlRadius(radius: RadiusTokens): number {
  return radius.control ?? radius.full;
}

/**
 * A panel you read: Card, Surface, Alert, Dialog, Accordion. They were split between lg
 * and xl with nothing deciding which, so a card and its dialog had different corners.
 */
export function surfaceRadius(radius: RadiusTokens): number {
  return radius.surface ?? radius.lg;
}

/**
 * Something floating above the page that holds rows: Menu, Select and Combobox lists,
 * Popover, PreviewCard, Toast. lg less the 8px inset is the row's md. A Tooltip is not.
 */
export function popupRadius(radius: RadiusTokens): number {
  return radius.popup ?? radius.lg;
}

export type GrytTokens = typeof grytTokens;

// Widened off the `as const` token types on purpose: Partial<GrytTokens> would inherit
// the literal types, so an override could only be re-assigned its own current value.
export interface GrytThemeOptions {
  color?: Partial<Record<keyof GrytTokens["color"], string>>;
  radius?: Partial<Record<keyof GrytTokens["radius"], number>>;
  /**
   * Which set of ramps to build. Dark is the default because it is what the library
   * ships on :root; an app toggling appearance calls this twice.
   */
  appearance?: "dark" | "light";
  /**
   * The typeface per role, as whole CSS stacks. Emitted as variables the stylesheet's
   * own font tokens fall back through, so naming none leaves the library's in place.
   */
  fonts?: Partial<GrytFonts>;
  /**
   * How fast and in what shape. Emitted as the same duration and easing variables the
   * stylesheet already declares, so nothing downstream needs to know.
   */
  motion?: GrytMotion;
}

/**
 * The scales, computed rather than written down. theme.css is emitted from these same
 * functions by scripts/generate-theme.ts, and a test asserts the stylesheet matches.
 */

/**
 * The light anchors, picked for this palette rather than computed from the dark ones:
 * a light grey page with white panels, which is what the client already used.
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
 * The light hover fill — step 4, "component background, hovered", rather than a seventh
 * anchor. `.light` never set surface-hover, so a neutral Button hovered to dark slate.
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
   * Overriding a colour regenerates its scale. The components read the scale rather than
   * the flat name, so setting --gryt-accent and stopping would change almost nothing.
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

  /* The samples, as a linear() an easing property will take. A custom curve replaces
     both shipped springs rather than one of them — see GrytMotion. */
  const linearFn = (samples: readonly number[]) =>
    `linear(${samples.map((n) => Number(n.toFixed(4))).join(", ")})`;

  const motionVars: Record<string, string> = {};
  if (options.motion !== undefined) {
    const { scale, curve } = options.motion;

    /* Scaled rather than replaced, so the tiers keep their proportions. Rounded to whole
       milliseconds: 449.99999ms is not a number anybody chose. */
    if (scale !== 1) {
      for (const [name, ms] of Object.entries(grytDurations)) {
        const token = name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
        motionVars[`--gryt-dur-${token}`] = `${Math.round(ms * scale)}ms`;
      }
    }

    if (Array.isArray(curve)) {
      const fn = `cubic-bezier(${curve.join(", ")})`;
      motionVars["--ease-spring"] = fn;
      motionVars["--ease-spring-tight"] = fn;
    } else if (curve === "smooth") {
      // Both roles on the critically damped curve: it settles without passing
      // the target, which is the shape somebody picking "smooth" is asking for.
      motionVars["--ease-spring"] = linearFn(springTightSamples);
      motionVars["--ease-spring-tight"] = linearFn(springTightSamples);
    } else if (curve === "linear") {
      motionVars["--ease-spring"] = "linear";
      motionVars["--ease-spring-tight"] = "linear";
    } else {
      // "spring" is what the stylesheet already declares. Emitting it again
      // would be two copies of the same 27 numbers to keep in step.
      motionVars["--ease-spring"] = linearFn(springSamples);
      motionVars["--ease-spring-tight"] = linearFn(springTightSamples);
    }
  }

  const fontVars: Record<string, string> = {};
  for (const [role, stack] of Object.entries(options.fonts ?? {})) {
    if (typeof stack === "string" && stack.trim() !== "") {
      fontVars[`--gryt-font-${role}`] = stack;
    }
  }

  return {
    ...scaleVars,
    ...motionVars,
    ...fontVars,
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
    "--gryt-unread": color.unread,
    "--gryt-on-unread": color.onUnread,

    // Tailwind's @theme emits --color-* names and the utilities compile against those.
    // Both sets have to move together or an override changes the var and not the class.
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
    "--color-gryt-unread": color.unread,
    "--color-gryt-on-unread": color.onUnread,

    "--gryt-radius-sm": `${radius.sm}px`,
    "--gryt-radius-md": `${radius.md}px`,
    "--gryt-radius-lg": `${radius.lg}px`,
    "--gryt-radius-xl": `${radius.xl}px`,
    "--gryt-radius-full": `${radius.full}px`,
    "--gryt-radius-field": `${fieldRadius(radius)}px`,
    "--gryt-radius-control": `${controlRadius(radius)}px`,
    "--gryt-radius-surface": `${surfaceRadius(radius)}px`,
    "--gryt-radius-popup": `${popupRadius(radius)}px`
  } as CSSProperties;
}
