import { describe, expect, it } from "vitest";
import { createGrytTheme } from "./createGrytTheme";
import {
  cloneGrytTheme,
  decodeGrytTheme,
  encodeGrytTheme,
  grytTheme,
  grytThemeToOptions
} from "./theme";

/**
 * The link is a format two apps read: the generator on the docs site writes
 * one, the client imports it. Round-tripping is the property that matters —
 * renaming a parameter silently breaks every link already sent, and nothing
 * else in the build would notice.
 */
describe("the theme document", () => {
  const custom = (() => {
    const theme = cloneGrytTheme(grytTheme);
    theme.hue.accent = "#ff8800";
    theme.dark.bg = "#0b0b0f";
    theme.light.text = "#101010";
    theme.radius.full = 8;
    return theme;
  })();

  it("round-trips through a link", () => {
    const decoded = decodeGrytTheme(`?${encodeGrytTheme(custom).toString()}`);
    expect(decoded?.theme).toEqual(custom);
  });

  it("round-trips through JSON", () => {
    const decoded = decodeGrytTheme(JSON.stringify(custom));
    expect(decoded?.theme).toEqual(custom);
  });

  it("carries a split light hue set whole", () => {
    const split = cloneGrytTheme(custom);
    split.lightHue = { ...split.hue, accent: "#0055cc" };
    const decoded = decodeGrytTheme(encodeGrytTheme(split).toString());
    expect(decoded?.theme.lightHue?.accent).toBe("#0055cc");
    // The rest of the split set has to survive too, not just what differs from
    // the dark hues — that is the whole point of it being split.
    expect(decoded?.theme.lightHue?.secondary).toBe(split.hue.secondary);
  });

  it("carries which half the sender was looking at", () => {
    expect(
      decodeGrytTheme(encodeGrytTheme(custom, "light").toString())?.appearance
    ).toBe("light");
    expect(
      decodeGrytTheme(encodeGrytTheme(custom).toString())?.appearance
    ).toBe("dark");
  });

  it("only carries what differs from Gryt's own", () => {
    expect(encodeGrytTheme(grytTheme).toString()).toBe("");
    expect([...encodeGrytTheme(custom).keys()].sort()).toEqual([
      "accent",
      "d-bg",
      "l-text",
      "r-full"
    ]);
  });

  it("says no rather than half-parsing", () => {
    for (const input of [
      "",
      "   ",
      "https://ui.gryt.chat/theme/generator",
      "{",
      "{}",
      "nonsense"
    ]) {
      expect(decodeGrytTheme(input)).toBeNull();
    }
  });

  it("keeps the rest when one value is unreadable", () => {
    const decoded = decodeGrytTheme("?accent=ff8800&d-bg=nothexatall");
    expect(decoded?.theme.hue.accent).toBe("#ff8800");
    expect(decoded?.theme.dark.bg).toBe(grytTheme.dark.bg);
  });

  it("takes a whole URL, not just its query", () => {
    const decoded = decodeGrytTheme(
      "https://ui.gryt.chat/theme/generator?accent=ff8800&mode=light"
    );
    expect(decoded?.theme.hue.accent).toBe("#ff8800");
    expect(decoded?.appearance).toBe("light");
  });

  it("builds what createGrytTheme would from the same anchors", () => {
    const built = createGrytTheme(grytThemeToOptions(custom, "dark")) as Record<
      string,
      string
    >;
    expect(built["--gryt-accent-9"]).toBe("#ff8800");
    expect(built["--gryt-neutral-1"]).toBe("#0b0b0f");
    expect(built["--gryt-radius-full"]).toBe("8px");
  });

  it("is the library's own palette when nothing is overridden", () => {
    // The document and the defaults are two descriptions of one palette, so
    // the theme built from either has to come out identical.
    for (const appearance of ["dark", "light"] as const) {
      expect(createGrytTheme(grytThemeToOptions(grytTheme, appearance))).toEqual(
        createGrytTheme({ appearance })
      );
    }
  });
});
