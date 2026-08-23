import { describe, expect, it } from "vitest";

import { createNativeTheme } from "./createNativeTheme";

const FACES = {
  regular: "Atkinson-Regular",
  medium: "Atkinson-Medium",
  semibold: "Atkinson-SemiBold",
  bold: "Atkinson-Bold",
  extrabold: "Atkinson-ExtraBold",
  mono: "AtkinsonMono-Regular",
  monoSemibold: "AtkinsonMono-SemiBold",
};

describe("theme.font with no faces configured", () => {
  /* The whole compatibility story: a consumer who sets nothing gets exactly the
   * styles this library produced before any of this existed. */
  it("hands back the weight it was given and nothing else", () => {
    const theme = createNativeTheme();

    expect(theme.font("600")).toEqual({ fontWeight: "600" });
    expect(theme.font("bold")).toEqual({ fontWeight: "bold" });
    expect(theme.font()).toEqual({ fontWeight: undefined });
  });

  it("does the same for the code face", () => {
    expect(createNativeTheme().font("600", { mono: true })).toEqual({ fontWeight: "600" });
  });
});

describe("theme.font with faces configured", () => {
  const theme = createNativeTheme({ fonts: FACES });

  it("picks the face for each weight", () => {
    expect(theme.font("400")).toEqual({ fontFamily: "Atkinson-Regular" });
    expect(theme.font("500")).toEqual({ fontFamily: "Atkinson-Medium" });
    expect(theme.font("600")).toEqual({ fontFamily: "Atkinson-SemiBold" });
    expect(theme.font("700")).toEqual({ fontFamily: "Atkinson-Bold" });
    expect(theme.font("800")).toEqual({ fontFamily: "Atkinson-ExtraBold" });
  });

  it("reads the CSS keywords React Native takes", () => {
    expect(theme.font("normal")).toEqual({ fontFamily: "Atkinson-Regular" });
    expect(theme.font("bold")).toEqual({ fontFamily: "Atkinson-Bold" });
  });

  it("treats an unstyled Text as regular", () => {
    expect(theme.font()).toEqual({ fontFamily: "Atkinson-Regular" });
  });

  /* The weight is deliberately absent. The file carries it, and leaving the
   * number on asks the platform to synthesise a bolder version of an
   * already-bold face — on Android a visibly smeared double-bold. */
  it("never returns a weight alongside a family", () => {
    expect(theme.font("700").fontWeight).toBeUndefined();
  });

  it("takes 900 to the heaviest face there is", () => {
    expect(theme.font("900")).toEqual({ fontFamily: "Atkinson-ExtraBold" });
  });

  it("uses the code face when asked", () => {
    expect(theme.font("400", { mono: true })).toEqual({ fontFamily: "AtkinsonMono-Regular" });
    expect(theme.font("700", { mono: true })).toEqual({ fontFamily: "AtkinsonMono-SemiBold" });
  });
});

describe("theme.font with gaps in the faces", () => {
  /* Falls *down* rather than up: an app that ships only regular and bold should
   * draw 600 in bold, because a semibold rendered regular reads as missing
   * emphasis while one rendered bold reads as slightly too much. */
  it("falls to the nearest lighter face that exists", () => {
    const theme = createNativeTheme({
      fonts: { regular: "R", bold: "B" },
    });

    expect(theme.font("800")).toEqual({ fontFamily: "B" });
    expect(theme.font("700")).toEqual({ fontFamily: "B" });
    expect(theme.font("600")).toEqual({ fontFamily: "R" });
    expect(theme.font("400")).toEqual({ fontFamily: "R" });
  });

  it("uses regular for a weight lighter than anything configured", () => {
    const theme = createNativeTheme({ fonts: { regular: "R", bold: "B" } });

    expect(theme.font("200")).toEqual({ fontFamily: "R" });
  });

  /* A theme that configured only a heavy face has nothing sensible to draw 200
   * in, so it says so by handing the weight back rather than drawing 200 in
   * bold. */
  it("falls back to the platform when even regular is missing", () => {
    const theme = createNativeTheme({ fonts: { bold: "B" } });

    expect(theme.font("200")).toEqual({ fontWeight: "200" });
    expect(theme.font("700")).toEqual({ fontFamily: "B" });
  });

  it("uses the text mono face for both mono weights when only one is given", () => {
    const theme = createNativeTheme({ fonts: { mono: "M" } });

    expect(theme.font("700", { mono: true })).toEqual({ fontFamily: "M" });
  });

  it("falls back to the platform for mono when no mono face is given", () => {
    const theme = createNativeTheme({ fonts: FACES.regular ? { regular: "R" } : {} });

    expect(theme.font("400", { mono: true })).toEqual({ fontWeight: "400" });
  });
});

describe("theme.fonts", () => {
  it("carries the faces it was built with", () => {
    expect(createNativeTheme({ fonts: FACES }).fonts.semibold).toBe("Atkinson-SemiBold");
  });

  it("is an empty object rather than undefined when none were given", () => {
    expect(createNativeTheme().fonts).toEqual({});
  });
});
