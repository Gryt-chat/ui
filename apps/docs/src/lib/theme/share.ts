/* Getting a theme out of the page, and back into it.
 *
 * The link and the JSON are the library's format now — the client reads the
 * same one — so encoding and parsing live there and this file is what the page
 * puts around them: the createGrytTheme call somebody pastes into an app, and
 * the error strings for a paste that did not work out.
 *
 * Three ways out, because they answer three different questions. The
 * createGrytTheme call is what you paste into an app. The JSON is what you keep
 * or hand to someone else's tooling. The link is what you send in a message,
 * and it is the one people will actually use.
 */

import {
  decodeGrytTheme,
  encodeGrytTheme,
  grytLightTokens,
  grytTokens,
  normalizeHexColor
} from "@gryt/ui";
import { RADIUS_KEYS, colorsFor } from "./draft";
import type { Appearance, RadiusKey, ThemeDraft } from "./draft";

export { encodeGrytTheme as encodeDraft, decodeGrytTheme };

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
    ([key, value]) =>
      normalizeHexColor(value) !== normalizeHexColor(defaults[key] ?? "")
  );
}

function changedRadius(draft: ThemeDraft): Array<[RadiusKey, number]> {
  return RADIUS_KEYS.filter(
    (key) => draft.radius[key] !== grytTokens.radius[key]
  ).map((key) => [key, draft.radius[key]] as [RadiusKey, number]);
}

function optionsLiteral(draft: ThemeDraft, appearance: Appearance): string {
  const lines: string[] = [];
  if (appearance === "light") lines.push(`  appearance: "light",`);

  const colors = changedColors(draft, appearance);
  if (colors.length > 0) {
    lines.push("  color: {");
    colors.forEach(([key, value], index) => {
      const comma = index === colors.length - 1 ? "" : ",";
      lines.push(`    ${key}: "${normalizeHexColor(value)}"${comma}`);
    });
    lines.push("  },");
  }

  const radius = changedRadius(draft);
  if (radius.length > 0) {
    lines.push(
      `  radius: { ${radius.map(([key, value]) => `${key}: ${value}`).join(", ")} }`
    );
  }

  // Trailing comma off whichever line turned out to be the last.
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
 * exports, or a link it produced.
 */
export function importTheme(input: string): ImportResult {
  const text = input.trim();
  if (text === "") return { error: "Nothing to import." };

  const decoded = decodeGrytTheme(text);
  if (decoded === null) {
    return {
      error: text.startsWith("{")
        ? "No theme in that JSON."
        : "No theme in that link."
    };
  }
  return { draft: decoded.theme, appearance: decoded.appearance };
}
