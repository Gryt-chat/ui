// Read off disk rather than imported: Vite's CSS plugin claims .css before
// ?raw can, and hands back an empty string.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  createGrytTheme,
  grytAlphaScales,
  grytScales,
  grytScalesLight
} from "./createGrytTheme";
import { contrast } from "./oklch";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "styles", "theme.css"),
  "utf8"
);

function cssValue(name: string): string | undefined {
  return new RegExp(`${name}:\\s*([^;]+);`).exec(css)?.[1].trim();
}

/**
 * theme.css holds literals because a CSS custom property cannot be computed,
 * and dist/styles.css is what a consumer imports. Literals drift, so they are
 * emitted by scripts/generate-theme.ts and checked here — if someone edits a
 * step by hand, or changes a token without regenerating, this fails rather than
 * the two quietly disagreeing.
 */
describe("theme.css", () => {
  it("matches the generator, step for step", () => {
    for (const [name, steps] of Object.entries(grytScales)) {
      steps.forEach((value, index) => {
        expect(cssValue(`--gryt-${name}-${index + 1}`)).toBe(value);
        expect(cssValue(`--color-gryt-${name}-${index + 1}`)).toBe(value);
      });
    }
    for (const [name, steps] of Object.entries(grytAlphaScales)) {
      steps.forEach((value, index) => {
        expect(cssValue(`--gryt-${name}-a${index + 1}`)).toBe(value);
      });
    }
  });

  it("keeps the flat names as aliases rather than a second copy", () => {
    // A literal here would be a colour with two definitions, which is the thing
    // the scales were meant to stop.
    expect(cssValue("--gryt-bg")).toBe("var(--gryt-neutral-1)");
    expect(cssValue("--gryt-surface")).toBe("var(--gryt-neutral-2)");
    expect(cssValue("--gryt-border")).toBe("var(--gryt-neutral-6)");
    expect(cssValue("--gryt-muted")).toBe("var(--gryt-neutral-11)");
    expect(cssValue("--gryt-accent")).toBe("var(--gryt-accent-9)");
    expect(cssValue("--gryt-danger")).toBe("var(--gryt-danger-9)");
  });
});

describe("contrast", () => {
  const n = grytScales.neutral;

  it("carries body text on every background step", () => {
    // AA is 4.5:1. Step 11 is the low-contrast text step, so it is the one that
    // can fail; 3 is the lightest surface it sits on.
    for (const background of [n[0], n[1], n[2]]) {
      expect(contrast(n[10], background)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(n[11], n[2])).toBeGreaterThanOrEqual(7);
  });

  it("carries each hue's text step on the app background", () => {
    for (const name of ["accent", "secondary", "success", "danger", "warning"] as const) {
      expect(contrast(grytScales[name][10], n[0])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("ramps in one direction", () => {
    // 10 is a fill and 11 is the text beside it, so 11 has to be the lighter of
    // the two in every family or the ramp changes direction with the hue.
    for (const [name, steps] of Object.entries(grytScales)) {
      if (name === "neutral") continue;
      expect(contrast(steps[10], n[0])).toBeGreaterThan(contrast(steps[9], n[0]));
    }
  });
});

describe("the light set", () => {
  const l = grytScalesLight;

  it("is in theme.css under .light", () => {
    const block = css.slice(css.indexOf(".light {"));
    for (const [name, steps] of Object.entries(l)) {
      steps.forEach((value, index) => {
        expect(block).toContain(`--gryt-${name}-${index + 1}: ${value};`);
      });
    }
  });

  it("puts white above the page rather than below it", () => {
    // The one place the ramp is deliberately not monotonic: in a light theme a
    // raised surface is whiter than the page, so step 2 is lighter than step 1.
    expect(contrast(l.neutral[1], "#000000")).toBeGreaterThan(
      contrast(l.neutral[0], "#000000")
    );
  });

  it("carries text on the page and on a white panel", () => {
    for (const background of [l.neutral[0], l.neutral[1]]) {
      expect(contrast(l.neutral[10], background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(l.neutral[11], background)).toBeGreaterThanOrEqual(7);
      for (const name of ["accent", "secondary", "success", "danger", "warning"] as const) {
        expect(contrast(l[name][10], background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps the brand colour on step 9 in both appearances", () => {
    // A filled button should be the same colour whichever way the app is set,
    // or Gryt stops looking like Gryt when someone switches.
    for (const name of ["accent", "secondary", "success", "danger", "warning"] as const) {
      expect(l[name][8]).toBe(grytScales[name][8]);
    }
  });

  it("darkens on hover, where the dark set lightens", () => {
    for (const name of ["accent", "danger"] as const) {
      expect(contrast(l[name][9], "#ffffff")).toBeGreaterThan(
        contrast(l[name][8], "#ffffff")
      );
    }
  });

  it("regenerates the light set when asked for it", () => {
    const theme = createGrytTheme({ appearance: "light" }) as Record<string, string>;
    expect(theme["--gryt-neutral-2"]).toBe("#ffffff");
    expect(theme["--gryt-accent-11"]).toBe(l.accent[10]);
  });
});
