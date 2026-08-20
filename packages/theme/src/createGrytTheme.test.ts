import { describe, expect, it } from "vitest";
import { createGrytTheme, grytScales, grytTokens } from "./createGrytTheme";
import { hexToOklch } from "./oklch";

type Vars = Record<string, string>;

describe("createGrytTheme", () => {
  it("emits the defaults unchanged", () => {
    const theme = createGrytTheme() as Vars;

    // The generated defaults have to equal the ones theme.css ships, or an app
    // using a theme object would drift from one using the stylesheet.
    expect(theme["--gryt-neutral-1"]).toBe(grytScales.neutral[0]);
    expect(theme["--gryt-neutral-6"]).toBe(grytScales.neutral[5]);
    expect(theme["--gryt-accent-9"]).toBe(grytScales.accent[8]);
    expect(theme["--gryt-danger-12"]).toBe(grytScales.danger[11]);
  });

  /**
   * The one that matters. The components read the scale, so an override that
   * only moved the flat token would leave the app its old colour and look like
   * theming was broken rather than absent.
   */
  it("regenerates a scale when its anchor is overridden", () => {
    const theme = createGrytTheme({ color: { accent: "#ff5c00" } }) as Vars;

    expect(theme["--gryt-accent-9"]).toBe("#ff5c00");

    const hue = hexToOklch("#ff5c00").h;
    for (const step of [1, 4, 8, 11, 12]) {
      const value = theme[`--gryt-accent-${step}`];
      expect(Math.abs(hexToOklch(value).h - hue)).toBeLessThan(12);
    }

    // and nothing else moved
    expect(theme["--gryt-neutral-2"]).toBe(grytScales.neutral[1]);
    expect(theme["--gryt-success-9"]).toBe(grytTokens.color.success);
  });

  it("keeps the Tailwind names in step with the raw ones", () => {
    const theme = createGrytTheme({ color: { accent: "#22d3ee" } }) as Vars;

    // Both sets have to move together: the utilities compile against --color-*,
    // so an override that missed them would change bg-gryt-accent-9 and not
    // var(--gryt-accent-9), or the other way round.
    for (const step of [1, 5, 9, 12]) {
      expect(theme[`--color-gryt-accent-${step}`]).toBe(
        theme[`--gryt-accent-${step}`]
      );
    }
  });

  it("keeps a neutral anchor exactly, rather than interpolating through it", () => {
    const theme = createGrytTheme({
      color: { bg: "#0b0b0f", border: "#242433" }
    }) as Vars;

    expect(theme["--gryt-neutral-1"]).toBe("#0b0b0f");
    expect(theme["--gryt-neutral-6"]).toBe("#242433");
  });

  it("gives every alpha step a value that composites, not a colour", () => {
    const theme = createGrytTheme() as Vars;

    expect(theme["--gryt-neutral-a1"]).toBe("transparent");
    expect(theme["--gryt-neutral-a5"]).toMatch(/^rgb\(\d+ \d+ \d+ \/ [\d.]+%\)$/);
    expect(theme["--gryt-accent-a3"]).toMatch(/^rgb\(\d+ \d+ \d+ \/ [\d.]+%\)$/);
  });
});
