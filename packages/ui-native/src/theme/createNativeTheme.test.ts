import { describe, expect, it } from "vitest";

import { grytScales, grytTokens } from "@gryt/theme";

import { createNativeTheme } from "./createNativeTheme";

/**
 * The point of these is not that the numbers are right — @gryt/theme already tests
 * the colour maths. It is that the numbers are *the same ones*, reached through
 * an import rather than a copy. A drift here means the two renderers have
 * quietly become two design systems.
 */
describe("createNativeTheme", () => {
  it("takes its ramps from @gryt/theme rather than recomputing them", () => {
    const theme = createNativeTheme();
    expect(theme.scales.neutral).toEqual(grytScales.neutral);
    expect(theme.scales.accent).toEqual(grytScales.accent);
    expect(theme.scales.danger).toEqual(grytScales.danger);
  });

  it("resolves the semantic colours to the shared tokens", () => {
    const theme = createNativeTheme();
    expect(theme.color.bg).toBe(grytTokens.color.bg);
    expect(theme.color.accent).toBe(grytTokens.color.accent);
    expect(theme.color.onAccent).toBe(grytTokens.color.onAccent);
  });

  it("produces twelve steps per ramp, like the web", () => {
    const theme = createNativeTheme();
    for (const ramp of Object.values(theme.scales)) {
      expect(ramp).toHaveLength(12);
    }
  });

  it("gives radius as numbers, because React Native has no units", () => {
    const theme = createNativeTheme();
    expect(theme.radius.md).toBe(grytTokens.radius.md);
    expect(typeof theme.radius.md).toBe("number");
  });

  it("rebuilds the ramps when a colour is overridden", () => {
    const custom = createNativeTheme({ color: { accent: "#ff0000" } });
    expect(custom.color.accent).toBe("#ff0000");
    expect(custom.scales.accent).not.toEqual(grytScales.accent);
    expect(custom.scales.accent).toHaveLength(12);
    // The neutrals are not derived from accent, so they must not move.
    expect(custom.scales.neutral).toEqual(grytScales.neutral);
  });

  it("switches the whole neutral ramp on appearance, not just the background", () => {
    const light = createNativeTheme({ appearance: "light" });
    expect(light.appearance).toBe("light");
    expect(light.scales.neutral).not.toEqual(grytScales.neutral);
    // Light mode never set a hover fill on the web either; step 4 of the ramp
    // is what it should be, not the dark slate.
    expect(light.color.surfaceHover).toBe(light.scales.neutral[3]);
  });

  it("spaces in multiples of four, matching the web scale", () => {
    const theme = createNativeTheme();
    expect(theme.space(2)).toBe(8);
    expect(theme.space(0)).toBe(0);
  });
});
