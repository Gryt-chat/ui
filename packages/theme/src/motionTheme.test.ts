import { describe, expect, it } from "vitest";

import { createGrytTheme } from "./createGrytTheme";
import { grytDurations } from "./motion";
import {
  decodeGrytTheme,
  encodeGrytTheme,
  grytFonts,
  grytMotion,
  grytTheme,
  grytThemeToOptions,
  isValidBezier
} from "./theme";

describe("isValidBezier", () => {
  it("takes the shapes CSS takes", () => {
    expect(isValidBezier([0.4, 0, 0.2, 1])).toBe(true);
    // Overshoot: y outside the unit square is how a bezier passes its target.
    expect(isValidBezier([0.3, 1.6, 0.7, 1])).toBe(true);
    expect(isValidBezier([0, -0.4, 1, 1.4])).toBe(true);
  });

  it("refuses x outside the time axis, which CSS refuses too", () => {
    expect(isValidBezier([-0.1, 0, 0.5, 1])).toBe(false);
    expect(isValidBezier([0.5, 0, 1.4, 1])).toBe(false);
  });

  it("refuses anything that is not four finite numbers", () => {
    expect(isValidBezier([0.4, 0, 0.2])).toBe(false);
    expect(isValidBezier(["0.4", 0, 0.2, 1])).toBe(false);
    expect(isValidBezier([0.4, Number.NaN, 0.2, 1])).toBe(false);
    expect(isValidBezier([0.4, 0, 0.2, 1e9])).toBe(false);
    expect(isValidBezier(null)).toBe(false);
  });
});

describe("motion in the link", () => {
  it("says nothing when the theme sets none", () => {
    const params = encodeGrytTheme(grytTheme);
    expect(params.has("m-scale")).toBe(false);
    expect(params.has("m-curve")).toBe(false);
  });

  it("round-trips a named curve and a speed", () => {
    const theme = { ...grytTheme, motion: { scale: 0.6, curve: "smooth" as const } };
    const back = decodeGrytTheme(encodeGrytTheme(theme).toString());
    expect(back?.theme.motion).toEqual({ scale: 0.6, curve: "smooth" });
  });

  it("round-trips a drawn curve", () => {
    const theme = {
      ...grytTheme,
      motion: { scale: 1, curve: [0.3, 1.6, 0.7, 1] as const }
    };
    const back = decodeGrytTheme(encodeGrytTheme(theme).toString());
    expect(back?.theme.motion?.curve).toEqual([0.3, 1.6, 0.7, 1]);
  });

  it("drops a curve CSS would refuse, and keeps the speed", () => {
    const back = decodeGrytTheme("m-scale=0.5&m-curve=2,0,3,1");
    expect(back?.theme.motion?.scale).toBe(0.5);
    expect(back?.theme.motion?.curve).toBe(grytMotion.curve);
  });

  it("drops a speed outside what anybody would choose", () => {
    expect(decodeGrytTheme("m-scale=999")).toBe(null);
    expect(decodeGrytTheme("m-scale=-1")).toBe(null);
  });
});

describe("motion as variables", () => {
  const varsFor = (motion: Parameters<typeof grytThemeToOptions>[0]["motion"]) =>
    createGrytTheme(
      grytThemeToOptions({ ...grytTheme, motion }, "dark")
    ) as Record<string, string>;

  it("emits nothing when the theme sets none", () => {
    const vars = varsFor(null);
    expect(Object.keys(vars).some((n) => n.startsWith("--gryt-dur-"))).toBe(false);
    expect(vars["--ease-spring"]).toBeUndefined();
  });

  it("scales every tier and keeps them in proportion", () => {
    const vars = varsFor({ scale: 0.5, curve: "spring" });
    expect(vars["--gryt-dur-spring"]).toBe(`${grytDurations.spring / 2}ms`);
    expect(vars["--gryt-dur-spring-soft"]).toBe(`${grytDurations.springSoft / 2}ms`);
    // A drawer stays slower than a button, which is the reason it is one
    // multiplier rather than five sliders.
    expect(
      Number.parseInt(vars["--gryt-dur-spring-soft"] ?? "0", 10)
    ).toBeGreaterThan(Number.parseInt(vars["--gryt-dur-spring"] ?? "0", 10));
  });

  it("stops everything at zero", () => {
    const vars = varsFor({ scale: 0, curve: "spring" });
    expect(vars["--gryt-dur-spring"]).toBe("0ms");
    expect(vars["--gryt-dur-fast"]).toBe("0ms");
  });

  it("puts a drawn curve on both roles, since one bezier cannot be two", () => {
    const vars = varsFor({ scale: 1, curve: [0.3, 1.6, 0.7, 1] });
    expect(vars["--ease-spring"]).toBe("cubic-bezier(0.3, 1.6, 0.7, 1)");
    expect(vars["--ease-spring-tight"]).toBe("cubic-bezier(0.3, 1.6, 0.7, 1)");
  });

  it("emits a linear() for a named curve", () => {
    const vars = varsFor({ scale: 1, curve: "smooth" });
    expect(vars["--ease-spring"]?.startsWith("linear(")).toBe(true);
    // Smooth settles without passing its target: no sample above 1.
    const samples = (vars["--ease-spring"] ?? "")
      .replace(/^linear\(|\)$/g, "")
      .split(",")
      .map(Number);
    expect(Math.max(...samples)).toBeLessThanOrEqual(1);
  });

  it("leaves the durations alone at 1x, so the stylesheet's own stand", () => {
    const vars = varsFor({ scale: 1, curve: "spring" });
    expect(Object.keys(vars).some((n) => n.startsWith("--gryt-dur-"))).toBe(false);
  });
});

/* The path the client actually uses: a saved theme is JSON in localStorage, not
 * a query string. Motion was on the link path and not this one, so everything
 * was green while a saved theme lost its motion on every launch.
 */
describe("through JSON, which is how a saved theme comes back", () => {
  const roundTrip = (theme: object) =>
    decodeGrytTheme(JSON.stringify(theme))?.theme;

  it("keeps a speed and a named curve", () => {
    const theme = { ...grytTheme, motion: { scale: 2.5, curve: "smooth" } };
    expect(roundTrip(theme)?.motion).toEqual({ scale: 2.5, curve: "smooth" });
  });

  it("keeps a drawn curve", () => {
    const theme = {
      ...grytTheme,
      motion: { scale: 1, curve: [0.3, 1.7, 0.7, 1] }
    };
    expect(roundTrip(theme)?.motion?.curve).toEqual([0.3, 1.7, 0.7, 1]);
  });

  it("keeps typefaces", () => {
    const theme = {
      ...grytTheme,
      fonts: {
        body: '"Inter", ui-sans-serif, sans-serif',
        display: '"Archivo", ui-sans-serif, sans-serif',
        mono: '"JetBrains Mono", ui-monospace, monospace'
      }
    };
    expect(roundTrip(theme)?.fonts?.body).toBe('"Inter", ui-sans-serif, sans-serif');
  });

  it("keeps both at once, which is what a real saved theme looks like", () => {
    const theme = {
      ...grytTheme,
      fonts: { ...grytFonts, body: '"Inter", ui-sans-serif, sans-serif' },
      motion: { scale: 0.5, curve: "linear" }
    };
    const back = roundTrip(theme);
    expect(back?.fonts?.body).toBe('"Inter", ui-sans-serif, sans-serif');
    expect(back?.motion).toEqual({ scale: 0.5, curve: "linear" });
  });

  it("drops a curve CSS would refuse and keeps the rest", () => {
    const theme = {
      ...grytTheme,
      motion: { scale: 0.8, curve: [2, 0, 3, 1] }
    };
    const back = roundTrip(theme);
    expect(back?.motion?.scale).toBe(0.8);
    expect(back?.motion?.curve).toBe(grytMotion.curve);
  });
});
