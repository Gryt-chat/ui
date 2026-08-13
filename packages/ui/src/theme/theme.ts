/* A whole theme, as a thing you can hand to somebody.
 *
 * createGrytTheme takes the colours for one appearance. That is the right shape
 * for the caller who wants one theme, and the wrong shape for a theme that
 * travels: dark and light do not derive from each other, so a theme somebody
 * shares has to carry both.
 *
 * Two sets of neutrals, then, and one set of hues — because step 9 is the same
 * colour in both appearances by design, so a filled button does not change
 * colour when somebody switches. `lightHue` is the exception, for palettes
 * where that is not true. Catppuccin's mauve is #cba6f7 in Mocha and #8839ef in
 * Latte; forcing one on it would make the theme wrong in one half.
 *
 * The encoding is a query string because that is the useful property of a
 * palette this small: a theme is a couple of dozen hex values, which fits in a
 * link, and a link is the thing people actually send each other. Only what
 * differs from Gryt's own values is carried, so a theme that changed one colour
 * is a link with one parameter in it.
 */

import { grytLightSurfaceHover, grytLightTokens, grytTokens } from "./createGrytTheme";
import type { GrytThemeOptions } from "./createGrytTheme";

export type GrytAppearance = "dark" | "light";

export const GRYT_HUE_KEYS = [
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

export const GRYT_NEUTRAL_KEYS = [
  "bg",
  "surface",
  "surfaceRaised",
  "surfaceHover",
  "border",
  "muted",
  "text"
] as const;

export const GRYT_RADIUS_KEYS = ["sm", "md", "lg", "xl", "full"] as const;

export type GrytHueKey = (typeof GRYT_HUE_KEYS)[number];
export type GrytNeutralKey = (typeof GRYT_NEUTRAL_KEYS)[number];
export type GrytRadiusKey = (typeof GRYT_RADIUS_KEYS)[number];

export type GrytHues = Record<GrytHueKey, string>;
export type GrytNeutrals = Record<GrytNeutralKey, string>;

export interface GrytTheme {
  /**
   * What its author called it, if they called it anything.
   *
   * Metadata rather than a colour: nothing about how a theme looks depends on
   * it, and grytThemeToOptions drops it. It exists because a link full of hex
   * values says nothing about what it is, and the person who made it already
   * knew — so the receiving end should not have to ask.
   */
  name?: string;
  hue: GrytHues;
  /** Null when light borrows the hues above, which is the usual case. */
  lightHue: GrytHues | null;
  dark: GrytNeutrals;
  light: GrytNeutrals;
  radius: Record<GrytRadiusKey, number>;
}

/** Long enough for a name, short enough not to be a payload. */
export const GRYT_THEME_NAME_MAX = 60;

export function normalizeThemeName(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, GRYT_THEME_NAME_MAX);
}

/** What the library ships, as a document. */
export const grytTheme: GrytTheme = {
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
    surfaceHover: grytLightSurfaceHover,
    border: grytLightTokens.border,
    muted: grytLightTokens.muted,
    text: grytLightTokens.text
  },
  radius: { ...grytTokens.radius }
};

export function cloneGrytTheme(theme: GrytTheme): GrytTheme {
  return {
    ...(theme.name === undefined ? {} : { name: theme.name }),
    hue: { ...theme.hue },
    lightHue: theme.lightHue === null ? null : { ...theme.lightHue },
    dark: { ...theme.dark },
    light: { ...theme.light },
    radius: { ...theme.radius }
  };
}

/** Which hues this appearance reads. */
export function grytThemeHues(
  theme: GrytTheme,
  appearance: GrytAppearance
): GrytHues {
  return appearance === "light" && theme.lightHue !== null
    ? theme.lightHue
    : theme.hue;
}

/**
 * One appearance of a theme, in the shape createGrytTheme takes.
 *
 * The name does not come along: createGrytTheme returns CSS variables, and a
 * name is not one.
 */
export function grytThemeToOptions(
  theme: GrytTheme,
  appearance: GrytAppearance
): GrytThemeOptions {
  return {
    appearance,
    color: { ...grytThemeHues(theme, appearance), ...theme[appearance] },
    radius: { ...theme.radius }
  };
}

/* ── the link ─────────────────────────────────────────────────────────── */

const HUE_PARAM: Record<GrytHueKey, string> = {
  accent: "accent",
  accentLight: "accent-light",
  secondary: "secondary",
  secondaryLight: "secondary-light",
  success: "success",
  danger: "danger",
  dangerLight: "danger-light",
  warning: "warning",
  onAccent: "on-accent",
  onSecondary: "on-secondary",
  onDanger: "on-danger"
};

const NEUTRAL_PARAM: Record<GrytNeutralKey, string> = {
  bg: "bg",
  surface: "surface",
  surfaceRaised: "raised",
  surfaceHover: "hover",
  border: "border",
  muted: "muted",
  text: "text"
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: string): boolean {
  return HEX.test(value.trim());
}

/** #abc to #aabbcc, lower case, so two of the same colour compare equal. */
export function normalizeHexColor(value: string): string {
  const hex = value.trim().toLowerCase();
  return hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;
}

/**
 * The theme as query parameters, carrying only what differs from Gryt's own.
 *
 * `appearance` is which half the sender was looking at, and it rides along
 * because a shared link that opens on the other one is showing something the
 * sender never saw.
 */
export function encodeGrytTheme(
  theme: GrytTheme,
  appearance?: GrytAppearance
): URLSearchParams {
  const params = new URLSearchParams();
  const bare = (hex: string) => normalizeHexColor(hex).slice(1);

  const name = normalizeThemeName(theme.name ?? "");
  if (name !== "") params.set("name", name);

  for (const key of GRYT_HUE_KEYS) {
    if (theme.hue[key] !== grytTheme.hue[key]) {
      params.set(HUE_PARAM[key], bare(theme.hue[key]));
    }
  }
  // A split light set is carried whole rather than diffed. It is only there
  // when somebody meant it, and diffing it against the dark hues would drop
  // exactly the values that make it a split.
  if (theme.lightHue !== null) {
    for (const key of GRYT_HUE_KEYS) {
      params.set(`lh-${HUE_PARAM[key]}`, bare(theme.lightHue[key]));
    }
  }
  for (const half of ["dark", "light"] as const) {
    const prefix = half === "dark" ? "d" : "l";
    for (const key of GRYT_NEUTRAL_KEYS) {
      if (theme[half][key] !== grytTheme[half][key]) {
        params.set(`${prefix}-${NEUTRAL_PARAM[key]}`, bare(theme[half][key]));
      }
    }
  }
  for (const key of GRYT_RADIUS_KEYS) {
    if (theme.radius[key] !== grytTheme.radius[key]) {
      params.set(`r-${key}`, String(theme.radius[key]));
    }
  }
  if (appearance === "light") params.set("mode", "light");

  return params;
}

export interface DecodedGrytTheme {
  theme: GrytTheme;
  /** Which half the link was sent from. Dark unless it says otherwise. */
  appearance: GrytAppearance;
}

/**
 * Whatever somebody pasted.
 *
 * A whole URL, a bare query string, or the JSON form — one function, because
 * from the outside they are the same act. Null when there is no theme in it at
 * all; a value it cannot parse is left at Gryt's, so one mistyped colour does
 * not throw the rest away.
 */
export function decodeGrytTheme(input: string): DecodedGrytTheme | null {
  const text = input.trim();
  if (text === "") return null;
  if (text.startsWith("{")) return decodeJson(text);

  const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
  return decodeParams(new URLSearchParams(query));
}

function decodeParams(params: URLSearchParams): DecodedGrytTheme | null {
  const theme = cloneGrytTheme(grytTheme);
  let present = false;

  const read = (name: string): string | null => {
    const raw = params.get(name);
    if (raw === null) return null;
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    if (!isHexColor(hex)) return null;
    present = true;
    return normalizeHexColor(hex);
  };

  const name = normalizeThemeName(params.get("name") ?? "");
  if (name !== "") {
    theme.name = name;
    present = true;
  }

  for (const key of GRYT_HUE_KEYS) {
    const value = read(HUE_PARAM[key]);
    if (value !== null) theme.hue[key] = value;
  }
  if (params.has(`lh-${HUE_PARAM.accent}`)) {
    const light = { ...theme.hue };
    for (const key of GRYT_HUE_KEYS) {
      const value = read(`lh-${HUE_PARAM[key]}`);
      if (value !== null) light[key] = value;
    }
    theme.lightHue = light;
  }
  for (const half of ["dark", "light"] as const) {
    const prefix = half === "dark" ? "d" : "l";
    for (const key of GRYT_NEUTRAL_KEYS) {
      const value = read(`${prefix}-${NEUTRAL_PARAM[key]}`);
      if (value !== null) theme[half][key] = value;
    }
  }
  for (const key of GRYT_RADIUS_KEYS) {
    const value = Number(params.get(`r-${key}`));
    // Anything outside this is a typo or somebody having a laugh, and a
    // 40000px radius makes an app look broken rather than themed.
    if (Number.isFinite(value) && value >= 0 && value <= 999 && params.has(`r-${key}`)) {
      theme.radius[key] = Math.round(value);
      present = true;
    }
  }

  if (!present) return null;
  return {
    theme,
    appearance: params.get("mode") === "light" ? "light" : "dark"
  };
}

function decodeJson(text: string): DecodedGrytTheme | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const source = parsed as Record<string, unknown>;

  const theme = cloneGrytTheme(grytTheme);
  let present = false;

  const colors = (value: unknown, target: Record<string, string>) => {
    if (typeof value !== "object" || value === null) return;
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (typeof raw === "string" && isHexColor(raw) && key in target) {
        target[key] = normalizeHexColor(raw);
        present = true;
      }
    }
  };

  if (typeof source.name === "string") {
    const named = normalizeThemeName(source.name);
    if (named !== "") {
      theme.name = named;
      present = true;
    }
  }

  colors(source.hue, theme.hue);
  colors(source.dark, theme.dark);
  colors(source.light, theme.light);

  if (typeof source.lightHue === "object" && source.lightHue !== null) {
    const light = { ...theme.hue };
    colors(source.lightHue, light);
    theme.lightHue = light;
  }

  if (typeof source.radius === "object" && source.radius !== null) {
    for (const [key, raw] of Object.entries(
      source.radius as Record<string, unknown>
    )) {
      const value = Number(raw);
      if (
        (GRYT_RADIUS_KEYS as readonly string[]).includes(key) &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 999
      ) {
        theme.radius[key as GrytRadiusKey] = Math.round(value);
        present = true;
      }
    }
  }

  if (!present) return null;
  return { theme, appearance: "dark" };
}
