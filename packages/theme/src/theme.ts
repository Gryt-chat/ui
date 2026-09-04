/* A whole theme, as a thing you can hand to somebody. Dark and light do not
 * derive from each other, so a theme that travels has to carry both.
 *
 * Two sets of neutrals and one set of hues, because step 9 is the same colour
 * in both appearances by design. `lightHue` is the exception, for palettes
 * where it is not — Catppuccin's mauve is #cba6f7 in Mocha and #8839ef in Latte.
 *
 * Encoded as a query string so a theme fits in a link. Only what differs from
 * Gryt's own values is carried.
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

/**
 * The three jobs a typeface does here.
 *
 * Three because that is what the interface actually distinguishes: the text
 * you read, the headings above it, and the places where characters have to
 * line up — code, hex values, timestamps, a fingerprint read aloud. Finer than
 * that is a knob nobody turns, and coarser loses the one distinction that
 * matters, which is that a proportional face cannot do the third job.
 */
export const GRYT_FONT_KEYS = ["body", "display", "mono"] as const;

/**
 * How a theme may change the way Gryt moves: how fast, one number over every
 * tier, and what shape, one curve.
 *
 * **Not per-tier durations.** The tiers are already in proportion — a drawer
 * takes longer than a button because it travels further — and setting them
 * independently re-decides that five sliders at a time.
 *
 * `scale` at 0 means nothing animates, which is a real setting rather than a
 * degenerate one.
 */
export const GRYT_MOTION_CURVES = ["spring", "smooth", "linear"] as const;

export type GrytHueKey = (typeof GRYT_HUE_KEYS)[number];
export type GrytNeutralKey = (typeof GRYT_NEUTRAL_KEYS)[number];
export type GrytRadiusKey = (typeof GRYT_RADIUS_KEYS)[number];
export type GrytFontKey = (typeof GRYT_FONT_KEYS)[number];
export type GrytNamedCurve = (typeof GRYT_MOTION_CURVES)[number];
/** x1, y1, x2, y2 — the two control points of a cubic bezier. */
export type GrytBezier = readonly [number, number, number, number];
export type GrytMotionCurve = GrytNamedCurve | GrytBezier;

export type GrytHues = Record<GrytHueKey, string>;
export type GrytNeutrals = Record<GrytNeutralKey, string>;

/**
 * A whole CSS font stack per role, not a family name.
 *
 * The fallbacks are the point. A theme names a face the machine reading it may
 * not have — that is the ordinary case for anything a shared link asks for —
 * and what it falls back to decides whether the note reads as a different
 * choice or as a broken one. Carrying the stack means the theme's author picks
 * that, rather than every consumer inventing its own tail.
 */
export type GrytFonts = Record<GrytFontKey, string>;

/**
 * What the library is set in.
 *
 * Atkinson Hyperlegible, which is a legibility face rather than a taste one:
 * its letterforms are drawn to be told apart at a glance, and Gryt is read in
 * a sidebar at twelve pixels. `display` is the body face here — the default
 * theme does not set headings in anything else, and a default that quietly
 * differed from what ships would be a second thing to keep in step.
 */
export const grytFonts: GrytFonts = {
  body: '"Atkinson Hyperlegible Next", ui-sans-serif, system-ui, sans-serif',
  display: '"Atkinson Hyperlegible Next", ui-sans-serif, system-ui, sans-serif',
  mono: '"Atkinson Hyperlegible Mono", ui-monospace, Menlo, Consolas, monospace'
};

/**
 * The motion half of a theme. `curve` names a shipped shape or carries a cubic
 * bezier. **A bezier collapses the library's two curves into one** —
 * `--ease-spring` overshoots for things that scale in place, `--ease-spring-tight`
 * does not, for things that travel inside their bounds.
 */
export interface GrytMotion {
  /**
   * Multiplier on every duration. 0 is no animation at all.
   *
   * One number rather than five, so the tiers keep the proportions they were
   * given. The curves are duration-invariant — measured, not assumed: the same
   * `linear()` sampled at 200ms and at 2000ms puts the element in the same
   * place at every fraction of the animation, and peaks at the same 10.6% past
   * its target — so scaling time changes how long it takes and nothing else
   * about how it looks.
   */
  scale: number;
  curve: GrytMotionCurve;
}

export const grytMotion: GrytMotion = { scale: 1, curve: "spring" };

/** Past this and it is somebody testing rather than choosing. */
export const GRYT_MOTION_SCALE_MAX = 3;

export function isBezier(curve: GrytMotionCurve): curve is GrytBezier {
  return Array.isArray(curve);
}

/**
 * A bezier CSS will accept.
 *
 * The x values are the time axis and have to stay inside it; a control point
 * outside 0..1 horizontally is not a slower curve, it is an invalid one and
 * the whole declaration is dropped. The y values may go outside, which is how
 * a bezier overshoots, and that is allowed on purpose.
 */
export function isValidBezier(value: unknown): value is GrytBezier {
  if (!Array.isArray(value) || value.length !== 4) return false;
  const [x1, y1, x2, y2] = value as number[];
  if (![x1, y1, x2, y2].every((n) => typeof n === "number" && Number.isFinite(n))) {
    return false;
  }
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) return false;
  return Math.abs(y1) <= 10 && Math.abs(y2) <= 10;
}

/** Long enough for a real stack, short enough not to be a payload. */
export const GRYT_FONT_STACK_MAX = 200;

/**
 * A font stack that is safe to put in a stylesheet.
 *
 * This arrives from a link somebody was sent, so it is a string from a
 * stranger heading for a CSS declaration. Anything that could close the
 * declaration and start another one is refused outright rather than escaped —
 * a font stack has no legitimate use for a brace, a semicolon or a comment
 * marker, so there is nothing to lose by requiring it to look like one.
 */
export function isFontStack(value: string): boolean {
  const text = value.trim();
  if (text === "" || text.length > GRYT_FONT_STACK_MAX) return false;
  return !/[;{}()<>\\]|\/\*|@import|url\s*\(/i.test(text);
}

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
  /**
   * Null when the theme does not care, which is every theme written before
   * this existed and every link already shared. Absent means the library's
   * own, so nothing that predates fonts renders differently for having them.
   */
  fonts?: GrytFonts | null;
  /** Null for the library's own motion, same reasoning as `fonts`. */
  motion?: GrytMotion | null;
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
    radius: { ...theme.radius },
    ...(theme.fonts == null ? {} : { fonts: { ...theme.fonts } }),
    ...(theme.motion == null
      ? {}
      : {
          motion: {
            scale: theme.motion.scale,
            curve: isBezier(theme.motion.curve)
              ? ([...theme.motion.curve] as GrytBezier)
              : theme.motion.curve
          }
        })
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
    radius: { ...theme.radius },
    // Fonts do not vary by appearance — a theme that changed typeface when
    // somebody flipped to light would be two themes. Nor does motion.
    ...(theme.fonts == null ? {} : { fonts: { ...theme.fonts } }),
    ...(theme.motion == null ? {} : { motion: theme.motion })
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
  if (theme.motion != null) {
    if (theme.motion.scale !== grytMotion.scale) {
      params.set("m-scale", String(theme.motion.scale));
    }
    if (theme.motion.curve !== grytMotion.curve) {
      params.set(
        "m-curve",
        isBezier(theme.motion.curve)
          ? theme.motion.curve.join(",")
          : theme.motion.curve
      );
    }
  }
  // Only what differs, same as the colours. A theme that set no fonts is a
  // link with nothing about fonts in it, which is most of them.
  if (theme.fonts != null) {
    for (const key of GRYT_FONT_KEYS) {
      if (theme.fonts[key] !== grytFonts[key]) {
        params.set(`f-${key}`, theme.fonts[key]);
      }
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

  {
    const rawScale = params.get("m-scale");
    if (rawScale !== null) {
      const scale = Number(rawScale);
      if (Number.isFinite(scale) && scale >= 0 && scale <= GRYT_MOTION_SCALE_MAX) {
        theme.motion = { ...(theme.motion ?? grytMotion), scale };
        present = true;
      }
    }
    const rawCurve = params.get("m-curve");
    if (rawCurve !== null) {
      if ((GRYT_MOTION_CURVES as readonly string[]).includes(rawCurve)) {
        theme.motion = {
          ...(theme.motion ?? grytMotion),
          curve: rawCurve as GrytNamedCurve
        };
        present = true;
      } else {
        const parts = rawCurve.split(",").map(Number);
        if (isValidBezier(parts)) {
          theme.motion = { ...(theme.motion ?? grytMotion), curve: parts };
          present = true;
        }
      }
    }
  }

  /* A stack that does not look like a font stack is dropped rather than
     escaped, and the role falls back to the library's. One suspicious value in
     a link should cost that value, not the theme it arrived with. */
  for (const key of GRYT_FONT_KEYS) {
    const raw = params.get(`f-${key}`);
    if (raw === null) continue;
    if (!isFontStack(raw)) continue;
    theme.fonts = { ...(theme.fonts ?? grytFonts), [key]: raw.trim() };
    present = true;
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

  /* Motion, on the JSON path as well as the query-string one.
     
     It was only on the query string, which meant a theme round-tripped
     through a link and lost its motion through JSON — and the client stores
     saved themes as JSON and re-reads them with this function, so every saved
     theme dropped its motion on load. Nothing failed; the app just moved at
     the default speed and the setting looked like it had never been made.

     Caught by watching a 2.5x theme animate at 1x in the running client, with
     the whole test suite green: the link path was tested and this one was
     not. */
  if (typeof source.motion === "object" && source.motion !== null) {
    const raw = source.motion as Record<string, unknown>;
    const scale = Number(raw.scale);
    if (Number.isFinite(scale) && scale >= 0 && scale <= GRYT_MOTION_SCALE_MAX) {
      theme.motion = { ...(theme.motion ?? grytMotion), scale };
      present = true;
    }
    if (typeof raw.curve === "string") {
      if ((GRYT_MOTION_CURVES as readonly string[]).includes(raw.curve)) {
        theme.motion = {
          ...(theme.motion ?? grytMotion),
          curve: raw.curve as GrytNamedCurve
        };
        present = true;
      }
    } else if (isValidBezier(raw.curve)) {
      theme.motion = { ...(theme.motion ?? grytMotion), curve: raw.curve };
      present = true;
    }
  }

  if (typeof source.fonts === "object" && source.fonts !== null) {
    for (const [key, raw] of Object.entries(
      source.fonts as Record<string, unknown>
    )) {
      if (!(GRYT_FONT_KEYS as readonly string[]).includes(key)) continue;
      if (typeof raw !== "string" || !isFontStack(raw)) continue;
      theme.fonts = { ...(theme.fonts ?? grytFonts), [key]: raw.trim() };
      present = true;
    }
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
