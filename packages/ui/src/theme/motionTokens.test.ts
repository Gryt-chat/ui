// Read off disk for the same reason theme.test.ts does: this is a check on the
// stylesheet's text, and Vite's plugins are not involved in that.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { grytDurations, springSamples, springTightSamples } from "@gryt/theme";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "styles", "theme.css"),
  "utf8"
);

/** The numbers inside a `linear(...)` declaration for the named variable. */
function linearSamples(name: string): number[] {
  const match = new RegExp(`${name}:\\s*linear\\(([^)]*)\\)`).exec(css);
  if (!match) throw new Error(`${name} is not defined as linear() in theme.css`);

  return match[1]!
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => !Number.isNaN(n));
}

/**
 * The curves exist twice — as `linear()` here, and as sample arrays in
 * @gryt/theme for React Native to interpolate. They are the same spring, so
 * they have to be the same numbers.
 *
 * Two hand-copied lists of 27 floats is exactly the kind of thing that drifts
 * silently: nothing breaks, the two platforms just stop feeling the same.
 */
describe("motion tokens match the stylesheet", () => {
  it("--ease-spring equals springSamples", () => {
    expect(linearSamples("--ease-spring")).toEqual([...springSamples]);
  });

  it("--ease-spring-tight equals springTightSamples", () => {
    expect(linearSamples("--ease-spring-tight")).toEqual([...springTightSamples]);
  });

  it("the duration tokens match", () => {
    const duration = (name: string) => {
      const match = new RegExp(`${name}:\\s*(\\d+)ms`).exec(css);
      if (!match) throw new Error(`${name} is not defined in theme.css`);
      return Number(match[1]);
    };

    expect(duration("--gryt-dur-spring")).toBe(grytDurations.spring);
    expect(duration("--gryt-dur-spring-soft")).toBe(grytDurations.springSoft);
    expect(duration("--gryt-dur-fast")).toBe(grytDurations.fast);
  });
});

/**
 * Every duration in @gryt/theme has a variable, whatever it is called. Derived
 * rather than listed: a hand-written list is how `--gryt-dur-fast` was used by
 * two components while declared nowhere, with both transitions instant and
 * nothing failing (GRYT-381).
 */
describe("every duration in the theme is declared in the stylesheet", () => {
  /** `springSoft` -> `--gryt-dur-spring-soft`. */
  function variableFor(key: string): string {
    return `--gryt-dur-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
  }

  for (const [key, value] of Object.entries(grytDurations)) {
    it(`${key} is ${variableFor(key)}`, () => {
      const name = variableFor(key);
      const match = new RegExp(`${name}:\\s*(\\d+)ms`).exec(css);
      expect(match, `${name} is not declared in theme.css`).not.toBeNull();
      expect(Number(match![1])).toBe(value);
    });
  }
});
