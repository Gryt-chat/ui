/**
 * Writes the scale block in src/styles/theme.css from the generator in
 * src/theme/oklch.ts.
 *
 * The stylesheet has to hold literal values — a CSS custom property cannot be
 * computed at parse time, and dist/styles.css is what a consumer imports — but
 * literals are exactly what drifts. So they are emitted rather than typed, and
 * theme.test.ts fails the build if the file stops matching what comes out of
 * here.
 *
 *   bun scripts/generate-theme.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  grytAlphaScales,
  grytAlphaScalesLight,
  grytScales,
  grytScalesLight,
  grytTokens
} from "../src/theme/createGrytTheme";

const here = dirname(fileURLToPath(import.meta.url));
const themeCss = join(here, "..", "src", "styles", "theme.css");

const marker = (prefix: string) =>
  `/* GENERATED: scales — bun scripts/generate-theme.ts ${prefix} */`;
const END = "/* END GENERATED */";

export function renderScales(
  prefix: "--gryt" | "--color-gryt",
  appearance: "dark" | "light" = "dark"
): string {
  const light = appearance === "light";
  const solids = light ? grytScalesLight : grytScales;
  const alphas = light ? grytAlphaScalesLight : grytAlphaScales;
  const indent = light ? "  " : "    ";
  const lines: string[] = [];
  for (const [name, steps] of Object.entries(solids)) {
    lines.push(`${indent}/* ${name} */`);
    steps.forEach((value, index) => {
      lines.push(`${indent}${prefix}-${name}-${index + 1}: ${value};`);
    });
    lines.push("");
  }
  for (const [name, steps] of Object.entries(alphas)) {
    steps.forEach((value, index) => {
      lines.push(`${indent}${prefix}-${name}-a${index + 1}: ${value};`);
    });
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

function main() {
  const css = readFileSync(themeCss, "utf8");
  let out = css;

  {
    const start = marker("--light");
    const from = out.indexOf(start);
    const to = out.indexOf(END, from);
    if (from === -1 || to === -1) {
      throw new Error("generate-theme: no light block in theme.css");
    }
    /* Both prefixes. The utilities compile against --color-gryt-*, so a light
       block that aliased only the raw names left bg-gryt-surface on the dark
       literal from @theme — which is how the settings dialog came out dark on
       a light page. */
    const aliases: Record<string, string> = {
      bg: "neutral-1",
      surface: "neutral-2",
      "surface-raised": "neutral-3",
      // Step 4 is "component background, hovered". Without this line the light
      // block inherits the dark slate from @theme, and a neutral Button hovers
      // to a dark block on a white panel.
      "surface-hover": "neutral-4",
      border: "neutral-6",
      muted: "neutral-11",
      text: "neutral-12",
      accent: "accent-9",
      "accent-light": "accent-10",
      secondary: "secondary-9",
      "secondary-light": "secondary-10",
      success: "success-9",
      danger: "danger-9",
      "danger-light": "danger-10",
      warning: "warning-9"
    };
    const flat = Object.entries(aliases)
      .flatMap(([token, step]) => [
        `  --gryt-${token}: var(--gryt-${step});`,
        `  --color-gryt-${token}: var(--gryt-${step});`
      ])
      .join("\n");
    out =
      out.slice(0, from + start.length) +
      "\n" +
      renderScales("--gryt", "light") +
      "\n\n" +
      renderScales("--color-gryt", "light") +
      "\n\n" +
      flat +
      "\n  " +
      out.slice(to);
  }

  for (const prefix of ["--color-gryt", "--gryt"] as const) {
    const start = marker(prefix);
    const from = out.indexOf(start);
    const to = out.indexOf(END, from);
    if (from === -1 || to === -1) {
      throw new Error(`generate-theme: no ${prefix} block in theme.css`);
    }
    out =
      out.slice(0, from + start.length) +
      "\n" +
      renderScales(prefix) +
      "\n    " +
      out.slice(to);
  }

  writeFileSync(themeCss, out);
  const count =
    Object.values(grytScales).flat().length +
    Object.values(grytAlphaScales).flat().length;
  console.log(`generate-theme: ${count * 2} values written`);
}

if (process.argv[1] && process.argv[1].endsWith("generate-theme.ts")) {
  main();
}

export { grytTokens };
