/* Getting a theme out of the page, and back into it.
 *
 * Three ways out, because they answer three different questions. The
 * createGrytTheme call is what you paste into an app. The JSON is what you keep
 * or hand to someone else's tooling. The link is what you send in a message,
 * and it is the one people will actually use — which is the whole reason the
 * theme is a handful of hex values rather than a stylesheet.
 *
 * The link only carries what differs from the library's defaults, so a theme
 * that changed one colour is a link with one parameter in it. Values are hex
 * without the hash, since '#' would end the query string.
 */

import { grytLightTokens, grytTokens } from "@gryt/ui";
import {
  HUE_KEYS,
  NEUTRAL_KEYS,
  RADIUS_KEYS,
  cloneDraft,
  colorsFor,
  grytDraft,
  isHex,
  normalizeHex
} from "./draft";
import type {
  Appearance,
  HueKey,
  NeutralKey,
  RadiusKey,
  ThemeDraft
} from "./draft";

/** token name to the short key it takes in a URL. */
const HUE_PARAM: Record<HueKey, string> = {
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

const NEUTRAL_PARAM: Record<NeutralKey, string> = {
  bg: "bg",
  surface: "surface",
  surfaceRaised: "raised",
  surfaceHover: "hover",
  border: "border",
  muted: "muted",
  text: "text"
};

export function encodeDraft(
  draft: ThemeDraft,
  appearance: Appearance
): URLSearchParams {
  const params = new URLSearchParams();
  const bare = (hex: string) => normalizeHex(hex).slice(1);

  for (const key of HUE_KEYS) {
    if (draft.hue[key] !== grytDraft.hue[key]) {
      params.set(HUE_PARAM[key], bare(draft.hue[key]));
    }
  }
  // A split light set is carried whole rather than diffed. It is only present
  // at all when somebody meant it, and diffing it against the dark hues would
  // drop exactly the values that make it a split.
  if (draft.lightHue !== null) {
    for (const key of HUE_KEYS) {
      params.set(`lh-${HUE_PARAM[key]}`, bare(draft.lightHue[key]));
    }
  }
  for (const appear of ["dark", "light"] as const) {
    const prefix = appear === "dark" ? "d" : "l";
    for (const key of NEUTRAL_KEYS) {
      if (draft[appear][key] !== grytDraft[appear][key]) {
        params.set(`${prefix}-${NEUTRAL_PARAM[key]}`, bare(draft[appear][key]));
      }
    }
  }
  for (const key of RADIUS_KEYS) {
    if (draft.radius[key] !== grytDraft.radius[key]) {
      params.set(`r-${key}`, String(draft.radius[key]));
    }
  }
  // Which half the sender was looking at. A shared link that opens on the other
  // appearance is showing something the sender never saw.
  if (appearance === "light") params.set("mode", "light");

  return params;
}

export interface DecodedShare {
  draft: ThemeDraft;
  appearance: Appearance;
  /** Whether anything at all was carried, so a bare URL does not read as a theme. */
  present: boolean;
}

export function decodeDraft(params: URLSearchParams): DecodedShare {
  const draft = cloneDraft(grytDraft);
  let present = false;

  const read = (name: string): string | null => {
    const raw = params.get(name);
    if (raw === null) return null;
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    if (!isHex(hex)) return null;
    present = true;
    return normalizeHex(hex);
  };

  for (const key of HUE_KEYS) {
    const value = read(HUE_PARAM[key]);
    if (value !== null) draft.hue[key] = value;
  }
  if (params.has(`lh-${HUE_PARAM.accent}`)) {
    const light = { ...draft.hue };
    for (const key of HUE_KEYS) {
      const value = read(`lh-${HUE_PARAM[key]}`);
      if (value !== null) light[key] = value;
    }
    draft.lightHue = light;
  }
  for (const appear of ["dark", "light"] as const) {
    const prefix = appear === "dark" ? "d" : "l";
    for (const key of NEUTRAL_KEYS) {
      const value = read(`${prefix}-${NEUTRAL_PARAM[key]}`);
      if (value !== null) draft[appear][key] = value;
    }
  }
  for (const key of RADIUS_KEYS) {
    const raw = params.get(`r-${key}`);
    if (raw === null) continue;
    const value = Number(raw);
    // Anything outside this is either a typo or somebody having a laugh, and a
    // 40000px radius makes the page look broken rather than themed.
    if (Number.isFinite(value) && value >= 0 && value <= 999) {
      draft.radius[key] = Math.round(value);
      present = true;
    }
  }

  return {
    draft,
    appearance: params.get("mode") === "light" ? "light" : "dark",
    present
  };
}

/** The library's own values for one appearance, which is what "default" means. */
function defaultsFor(appearance: Appearance): Record<string, string> {
  return appearance === "light"
    ? { ...grytTokens.color, ...grytLightTokens }
    : { ...grytTokens.color };
}

/** Only what this theme changes. An export full of unchanged values is noise. */
function changedColors(
  draft: ThemeDraft,
  appearance: Appearance
): Array<[string, string]> {
  const defaults = defaultsFor(appearance);
  return Object.entries(colorsFor(draft, appearance)).filter(
    ([key, value]) => normalizeHex(value) !== normalizeHex(defaults[key] ?? "")
  );
}

function changedRadius(draft: ThemeDraft): Array<[RadiusKey, number]> {
  return RADIUS_KEYS.filter((key) => draft.radius[key] !== grytTokens.radius[key]).map(
    (key) => [key, draft.radius[key]] as [RadiusKey, number]
  );
}

function optionsLiteral(draft: ThemeDraft, appearance: Appearance): string {
  const lines: string[] = [];
  if (appearance === "light") lines.push(`  appearance: "light",`);

  const colors = changedColors(draft, appearance);
  if (colors.length > 0) {
    lines.push("  color: {");
    colors.forEach(([key, value], index) => {
      const comma = index === colors.length - 1 ? "" : ",";
      lines.push(`    ${key}: "${normalizeHex(value)}"${comma}`);
    });
    lines.push("  },");
  }

  const radius = changedRadius(draft);
  if (radius.length > 0) {
    lines.push(
      `  radius: { ${radius.map(([key, value]) => `${key}: ${value}`).join(", ")} }`
    );
  }

  // Trailing comma on the last line, whichever it turned out to be.
  const last = lines.length - 1;
  if (last >= 0) lines[last] = lines[last].replace(/,$/, "");

  return lines.length === 0 ? "" : `{\n${lines.join("\n")}\n}`;
}

export function themeCode(draft: ThemeDraft): string {
  const dark = optionsLiteral(draft, "dark");
  const light = optionsLiteral(draft, "light");

  return `import { createGrytTheme, GrytProvider } from "@gryt/ui";

// One call per appearance. The scales are regenerated from these anchors, so
// every component moves with them — not just the tokens named here.
const dark = createGrytTheme(${dark});

const light = createGrytTheme(${light});

export function App({ appearance }: { appearance: "dark" | "light" }) {
  return (
    <GrytProvider theme={appearance === "light" ? light : dark}>
      {/* your app */}
    </GrytProvider>
  );
}`;
}

/** The whole draft, spelled out. What import reads back. */
export function themeJson(draft: ThemeDraft): string {
  return JSON.stringify(draft, null, 2);
}

export interface ImportResult {
  draft?: ThemeDraft;
  appearance?: Appearance;
  error?: string;
}

/**
 * Takes either of the two things somebody will paste: the JSON this page
 * exports, or a link it produced. Anything it does not recognise is left at the
 * library's value rather than rejected outright — a theme with one mistyped
 * colour should still load.
 */
export function importTheme(input: string): ImportResult {
  const text = input.trim();
  if (text === "") return { error: "Nothing to import." };

  if (text.startsWith("{")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { error: "That is not valid JSON." };
    }
    return { draft: fromUnknown(parsed) };
  }

  // A link, or the query string out of one.
  const query = text.includes("?") ? text.slice(text.indexOf("?") + 1) : text;
  const decoded = decodeDraft(new URLSearchParams(query));
  if (!decoded.present) {
    return { error: "No theme in that link." };
  }
  return { draft: decoded.draft, appearance: decoded.appearance };
}

/** Whatever came out of JSON.parse, mapped onto a draft one key at a time. */
function fromUnknown(input: unknown): ThemeDraft {
  const draft = cloneDraft(grytDraft);
  if (typeof input !== "object" || input === null) return draft;
  const source = input as Record<string, unknown>;

  const colors = (value: unknown, target: Record<string, string>) => {
    if (typeof value !== "object" || value === null) return;
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (typeof raw === "string" && isHex(raw) && key in target) {
        target[key] = normalizeHex(raw);
      }
    }
  };

  colors(source.hue, draft.hue);
  colors(source.dark, draft.dark);
  colors(source.light, draft.light);

  if (typeof source.lightHue === "object" && source.lightHue !== null) {
    const light = { ...draft.hue };
    colors(source.lightHue, light);
    draft.lightHue = light;
  }

  if (typeof source.radius === "object" && source.radius !== null) {
    for (const [key, raw] of Object.entries(
      source.radius as Record<string, unknown>
    )) {
      const value = Number(raw);
      if (
        (RADIUS_KEYS as readonly string[]).includes(key) &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 999
      ) {
        draft.radius[key as RadiusKey] = Math.round(value);
      }
    }
  }

  return draft;
}
