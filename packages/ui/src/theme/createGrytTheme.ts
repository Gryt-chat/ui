import type { CSSProperties } from "react";

export const grytTokens = {
  color: {
    bg: "#111318",
    surface: "#1a1d24",
    surfaceRaised: "#1e2028",
    surfaceHover: "#334155",
    border: "#2b303d",
    text: "#e0e0e6",
    muted: "#888888",
    accent: "#968FF8",
    accentLight: "#b4afff",
    secondary: "#7dd3fc",
    secondaryLight: "#bae6fd",
    success: "#4ade80",
    danger: "#f87171",
    dangerLight: "#fca5a5",
    warning: "#fbbf24",
    onAccent: "#141126",
    onSecondary: "#07131c",
    onDanger: "#250b0b"
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
}

// This used to return a MUI theme object. There is no theme object now — the
// components read CSS custom properties, so a theme is the set of variables to
// put on an element. Returning CSSProperties means it drops straight into a
// style prop, and overriding one token does not require reproducing the rest.
export function createGrytTheme(options: GrytThemeOptions = {}): CSSProperties {
  const color = { ...grytTokens.color, ...options.color };
  const radius = { ...grytTokens.radius, ...options.radius };

  return {
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
