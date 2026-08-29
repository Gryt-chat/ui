import { describe, expect, it } from "vitest";

import { createGrytTheme } from "./createGrytTheme";
import {
  decodeGrytTheme,
  encodeGrytTheme,
  grytFonts,
  grytTheme,
  grytThemeToOptions,
  isFontStack
} from "./theme";

/* A font stack arrives from a link somebody was sent, and ends up in a CSS
   declaration. That is the whole reason these tests exist: the colours are hex
   and cannot be anything else, and this is the first field in a theme that is
   free text. */

describe("isFontStack", () => {
  it("takes an ordinary stack", () => {
    expect(isFontStack('"Inter", ui-sans-serif, system-ui, sans-serif')).toBe(true);
    expect(isFontStack("ui-monospace, Menlo, monospace")).toBe(true);
  });

  it("refuses anything that could close the declaration", () => {
    // Each of these ends the font-family value and starts something else.
    expect(isFontStack('Inter; background: url(https://evil.test/x)')).toBe(false);
    expect(isFontStack("Inter } body { display: none")).toBe(false);
    expect(isFontStack("Inter /* comment */")).toBe(false);
    expect(isFontStack('url("https://evil.test/f.woff")')).toBe(false);
    expect(isFontStack("@import url(x)")).toBe(false);
  });

  it("refuses nothing and refuses too much", () => {
    expect(isFontStack("")).toBe(false);
    expect(isFontStack("   ")).toBe(false);
    expect(isFontStack("A".repeat(400))).toBe(false);
  });
});

describe("fonts in the link", () => {
  it("says nothing about fonts when the theme sets none", () => {
    const params = encodeGrytTheme(grytTheme);
    expect([...params.keys()].some((key) => key.startsWith("f-"))).toBe(false);
  });

  it("carries only the roles that differ", () => {
    const theme = {
      ...grytTheme,
      fonts: { ...grytFonts, display: '"Archivo", ui-sans-serif, sans-serif' }
    };
    const params = encodeGrytTheme(theme);
    expect(params.get("f-display")).toBe('"Archivo", ui-sans-serif, sans-serif');
    expect(params.has("f-body")).toBe(false);
    expect(params.has("f-mono")).toBe(false);
  });

  it("round-trips", () => {
    const theme = {
      ...grytTheme,
      fonts: {
        body: '"IBM Plex Sans", ui-sans-serif, sans-serif',
        display: '"Archivo", ui-sans-serif, sans-serif',
        mono: '"JetBrains Mono", ui-monospace, monospace'
      }
    };
    const back = decodeGrytTheme(encodeGrytTheme(theme).toString());
    expect(back?.theme.fonts).toEqual(theme.fonts);
  });

  it("drops a role that does not look like a font stack, and keeps the rest", () => {
    const query = 'f-body=%22Inter%22%2C+sans-serif&f-mono=x%3B+color%3A+red';
    const back = decodeGrytTheme(query);
    expect(back?.theme.fonts?.body).toBe('"Inter", sans-serif');
    // Falls back to the library's rather than taking the value.
    expect(back?.theme.fonts?.mono).toBe(grytFonts.mono);
  });
});

describe("fonts as variables", () => {
  it("emits nothing when the theme sets none, so the stylesheet keeps its own", () => {
    const vars = createGrytTheme(grytThemeToOptions(grytTheme, "dark")) as Record<
      string,
      string
    >;
    expect(Object.keys(vars).some((name) => name.startsWith("--gryt-font-"))).toBe(
      false
    );
  });

  it("emits one variable per role a theme sets", () => {
    const theme = {
      ...grytTheme,
      fonts: { ...grytFonts, body: '"Inter", sans-serif' }
    };
    const vars = createGrytTheme(grytThemeToOptions(theme, "dark")) as Record<
      string,
      string
    >;
    expect(vars["--gryt-font-body"]).toBe('"Inter", sans-serif');
    expect(vars["--gryt-font-mono"]).toBe(grytFonts.mono);
  });

  it("does not change with appearance", () => {
    const theme = {
      ...grytTheme,
      fonts: { ...grytFonts, body: '"Inter", sans-serif' }
    };
    const dark = createGrytTheme(grytThemeToOptions(theme, "dark")) as Record<
      string,
      string
    >;
    const light = createGrytTheme(grytThemeToOptions(theme, "light")) as Record<
      string,
      string
    >;
    expect(dark["--gryt-font-body"]).toBe(light["--gryt-font-body"]);
  });
});
