/**
 * What this protects is that a server keeps the icon it had.
 *
 * The same reasoning as the owls, one step weaker. An avatar is drawn from a
 * nickname and stored nowhere, so moving the output moves every face at once.
 * A server icon is drawn from the server's name and also stored nowhere — but a
 * server that has set its own icon never reaches this code, so the blast radius
 * is the servers that have not. Still every one of them, still all at once.
 *
 * When a pin fails the question is whether the change was meant, not whether to
 * update the number.
 */

import { describe, expect, it } from "vitest";

import { PALETTE_NAMES, PALETTE_SCHEMES } from "../palette";
import {
  EGG_BASES,
  EGG_COUNTS,
  EGG_PATTERNS,
  eggAvatarColour,
  eggAvatarDataUri,
  eggAvatarSvg,
  eggPalette,
  eggPatternByName,
  resolveEggs
} from "./index";

/** The L of `#rrggbb`, in the percent the palette is written in. */
function lightness(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}

/** The owls' digest, so the two test files fail the same way. */
function digest(value: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < value.length; i += 1) {
    h1 = Math.imul(h1 ^ value.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 + value.charCodeAt(i), 0x85ebca6b) >>> 0;
  }
  return (
    (h1 >>> 0).toString(16).padStart(8, "0") +
    (h2 >>> 0).toString(16).padStart(8, "0")
  );
}

describe("the same name draws the same icon", () => {
  it.each(["gryta krutt", "the basement", "a", "Ævar", "dev.lan"])(
    "%s is stable",
    (seed) => {
      expect(eggAvatarSvg(seed)).toBe(eggAvatarSvg(seed));
    }
  );

  it("draws two names differently", () => {
    expect(eggAvatarSvg("the basement")).not.toBe(
      eggAvatarSvg("the basement 2")
    );
  });

  it("takes a number as readily as a string", () => {
    expect(eggAvatarSvg(42)).toBe(eggAvatarSvg("42"));
  });

  /*
   * The pins. Generated once, on 2026-08-29, when the generator landed.
   *
   * Read the note at the top of this file before changing one. Adding a tile to
   * artwork/egg_patterns.json should not move any of these — the draw is keyed
   * on the tile's own name, so a new tile can only take icons from the other
   * tiles. If a pin moves when all you did was add one, that property has
   * broken and the fix is the draw, not the number.
   */
  it.each([
    ["gryta krutt", "677d8524762749dc"],
    ["the basement", "93ba7808ff20a51c"],
    ["lan party", "57dec63b60967411"]
  ])("%s is unchanged", (seed, expected) => {
    expect(digest(eggAvatarSvg(seed))).toBe(expected);
  });
});

describe("what a seed chooses", () => {
  it("draws as many eggs as the arrangement holds", () => {
    for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
      const c = resolveEggs(seed);
      expect(EGG_COUNTS).toContain(c.count);
      expect(c.eggs).toHaveLength(c.count);
    }
  });

  it("reaches every arrangement", () => {
    const seen = new Set(
      Array.from({ length: 400 }, (_, i) => resolveEggs(`server-${i}`).count)
    );
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it("reaches every palette and scheme", () => {
    const names = new Set<string>();
    const schemes = new Set<string>();
    for (let i = 0; i < 800; i += 1) {
      const c = resolveEggs(`server-${i}`);
      names.add(c.paletteName);
      schemes.add(c.scheme);
    }
    expect(names.size).toBe(PALETTE_NAMES.length);
    expect(schemes.size).toBe(PALETTE_SCHEMES.length);
  });

  it("leaves an egg bare sometimes, and not usually", () => {
    const eggs = Array.from(
      { length: 600 },
      (_, i) => resolveEggs(`server-${i}`).eggs
    ).flat();
    const bare = eggs.filter((e) => !e.pattern).length;
    expect(bare / eggs.length).toBeGreaterThan(0.05);
    expect(bare / eggs.length).toBeLessThan(0.2);
  });

  it("leaves the field bare most of the time", () => {
    const fields = Array.from(
      { length: 600 },
      (_, i) => resolveEggs(`server-${i}`).field
    );
    const bare = fields.filter((f) => !f.pattern).length;
    expect(bare / fields.length).toBeGreaterThan(0.5);
  });

  it("turns tiles in whole steps of 15 degrees", () => {
    for (let i = 0; i < 200; i += 1) {
      for (const egg of resolveEggs(`server-${i}`).eggs) {
        expect(egg.angle % 15).toBe(0);
        expect(egg.angle).toBeLessThan(180);
      }
    }
  });

  it("hands the shell tones out back to front", () => {
    const c = resolveEggs("x", { count: 3, hues: [null, null, null] });
    const p = eggPalette(c.paletteName, c.scheme);
    expect(c.eggs.map((e) => e.shell)).toEqual([...p.shells]);
  });

  it("never moves the back egg off the icon's own hue", () => {
    for (let i = 0; i < 300; i += 1) {
      const c = resolveEggs(`server-${i}`);
      expect(c.eggs[0]!.hue).toBe(c.paletteName);
    }
  });

  it("mixes a hue into some icons and not most", () => {
    const eggs = Array.from({ length: 600 }, (_, i) =>
      resolveEggs(`server-${i}`, { count: 3 })
    );
    const mixed = eggs.filter((c) =>
      c.eggs.some((e) => e.hue !== c.paletteName)
    ).length;
    expect(mixed / eggs.length).toBeGreaterThan(0.2);
    expect(mixed / eggs.length).toBeLessThan(0.6);
  });

  /*
   * A borrowed rung is the same rung, so it carries the lightness the scheme
   * gave it and every gap palette.test.ts asserts still holds. This is that
   * claim, checked rather than trusted.
   */
  it("borrows a rung at the lightness it already had", () => {
    for (let i = 0; i < 300; i += 1) {
      const c = resolveEggs(`server-${i}`);
      const own = eggPalette(c.paletteName, c.scheme);
      for (const [j, egg] of c.eggs.entries()) {
        expect(lightness(egg.shell)).toBeCloseTo(lightness(own.shells[j]!), 0);
      }
    }
  });

  it("takes a hue per egg, and null for the icon's own", () => {
    const c = resolveEggs("x", { count: 2, hues: [null, "gold"] });
    expect(c.eggs[1]!.hue).toBe("gold");
    expect(c.eggs[1]!.shell).toBe(eggPalette("gold", c.scheme).shells[1]);
  });

  it("ignores a hue it does not know", () => {
    const seeded = resolveEggs("x", { count: 2 });
    expect(
      resolveEggs("x", { count: 2, hues: [null, "plum" as never] }).eggs[1]!.hue
    ).toBe(seeded.eggs[1]!.hue);
  });

  it("draws the same back egg whether there are two or three", () => {
    const two = resolveEggs("x", { count: 2 });
    const three = resolveEggs("x", { count: 3 });
    expect(three.eggs[0]!.pattern?.name).toBe(two.eggs[0]!.pattern?.name);
    expect(three.eggs[1]!.pattern?.name).toBe(two.eggs[1]!.pattern?.name);
  });
});

describe("what a caller can ask for", () => {
  it("takes a count", () => {
    for (const count of EGG_COUNTS) {
      expect(resolveEggs("x", { count }).eggs).toHaveLength(count);
    }
  });

  it("takes a pattern per egg, and null for a bare one", () => {
    const c = resolveEggs("x", { count: 2, patterns: ["circles-3", null] });
    expect(c.eggs[0]!.pattern?.name).toBe("circles-3");
    expect(c.eggs[1]!.pattern).toBeNull();
  });

  it("leaves the eggs a short list does not cover to the seed", () => {
    const seeded = resolveEggs("x", { count: 3 });
    const asked = resolveEggs("x", { count: 3, patterns: ["circles-3"] });
    expect(asked.eggs[1]!.pattern?.name).toBe(seeded.eggs[1]!.pattern?.name);
  });

  /*
   * One unknown thing costs that thing, not the whole icon. A name can arrive
   * from a preference saved by a build that had a tile this one does not, and
   * an icon is not a place to throw.
   */
  it("draws a bare egg for a tile it does not know", () => {
    const c = resolveEggs("x", { count: 1, patterns: ["no-such-tile"] });
    expect(c.eggs[0]!.pattern).toBeNull();
  });

  it("falls back to the seed's palette for a name it does not know", () => {
    const seeded = resolveEggs("x");
    expect(resolveEggs("x", { palette: "plum" as never }).paletteName).toBe(
      seeded.paletteName
    );
  });

  it("takes colour overrides on top of the seeded palette", () => {
    const c = resolveEggs("x", { palette: { field: "#123456" } });
    expect(c.palette.field).toBe("#123456");
    expect(c.background).toBe("#123456");
  });

  // The eggs keep their shading. What goes is the field and its texture, which
  // is what a caller bringing its own tile is asking for.
  it("draws on nothing when asked", () => {
    expect(resolveEggs("x", { background: false }).background).toBeNull();
    const svg = eggAvatarSvg("x", {
      background: false,
      fieldPattern: "circles-3"
    });
    expect(svg).not.toContain('id="f');
    expect(svg).not.toContain('id="t');
    expect(svg).toContain('id="s');
  });

  it("clamps the corner radius and only clips when there is one", () => {
    expect(resolveEggs("x", { cornerRadius: 4 }).cornerRadius).toBe(1);
    expect(resolveEggs("x", { cornerRadius: -1 }).cornerRadius).toBe(0);
    expect(eggAvatarSvg("x")).not.toContain('id="r');
    expect(eggAvatarSvg("x", { cornerRadius: 0.2 })).toContain('id="r');
  });

  /*
   * The dial for the one real problem with drawing servers as eggs: whole eggs
   * sitting apart in a cluster read as a nest, and a nest reads as Easter. Past
   * about 1.5 they run off the edge and the icon reads as a mark instead.
   */
  it("takes a zoom, and clamps it", () => {
    expect(resolveEggs("x", { zoom: 1.6 }).zoom).toBe(1.6);
    expect(resolveEggs("x", { zoom: 9 }).zoom).toBe(2);
    expect(resolveEggs("x", { zoom: 0 }).zoom).toBe(0.5);
  });

  it("leaves the field alone when the eggs are zoomed", () => {
    const svg = eggAvatarSvg("x", { zoom: 1.6, fieldPattern: "circles-3" });
    // The field's rect and its texture both come before the group the eggs are
    // scaled inside, so neither is caught by the transform.
    expect(svg.indexOf("<g transform=")).toBeGreaterThan(
      svg.lastIndexOf('fill="url(#t')
    );
  });

  it("draws no transform at all at zoom 1", () => {
    expect(eggAvatarSvg("x", { zoom: 1 })).not.toContain("<g transform=");
  });

  it("names the icon when given a title", () => {
    const svg = eggAvatarSvg("x", { title: "The <Basement>" });
    expect(svg).toContain("<title>The &lt;Basement&gt;</title>");
    expect(svg).toContain('aria-label="The &lt;Basement&gt;"');
    expect(eggAvatarSvg("x")).toContain('aria-hidden="true"');
  });
});

describe("the markup", () => {
  it("is one svg at the size asked for", () => {
    const svg = eggAvatarSvg("x", { size: 48 });
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain('width="48" height="48"');
    expect(svg).toContain('viewBox="0 0 1024 1024"');
  });

  /*
   * Twenty of these go into one server rail inline, and two `<pattern id="a">`
   * in one document is one pattern — the second definition wins and every icon
   * on the page wears it. Every id carries a hash of the seed for that reason.
   */
  it("gives two icons on one page no ids in common", () => {
    const ids = (svg: string) =>
      [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]!);
    const a = ids(eggAvatarSvg("gryta krutt", { cornerRadius: 0.2 }));
    const b = ids(eggAvatarSvg("the basement", { cornerRadius: 0.2 }));
    expect(a.length).toBeGreaterThan(1);
    expect(new Set(a).size).toBe(a.length);
    expect(a.filter((id) => b.includes(id))).toEqual([]);
  });

  it("points every url() at an id it defined", () => {
    for (let i = 0; i < 100; i += 1) {
      const svg = eggAvatarSvg(`server-${i}`, { cornerRadius: 0.2 });
      const defined = new Set(
        [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]!)
      );
      for (const use of svg.matchAll(/url\(#([^)]+)\)/g)) {
        expect(defined).toContain(use[1]!);
      }
    }
  });

  it("survives a round trip through a data URI", () => {
    const uri = eggAvatarDataUri("x");
    expect(uri.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(
      decodeURIComponent(uri.slice("data:image/svg+xml;utf8,".length))
    ).toBe(eggAvatarSvg("x"));
  });

  it("answers with the colour it painted the field", () => {
    for (let i = 0; i < 50; i += 1) {
      const colour = eggAvatarColour(`server-${i}`);
      expect(colour).toMatch(/^#[0-9a-f]{6}$/);
      expect(eggAvatarSvg(`server-${i}`)).toContain(`stop-color="${colour}"`);
    }
  });
});

describe("the drawings and the tiles", () => {
  it("holds one, two and three eggs", () => {
    expect(EGG_BASES.map((b) => b.length)).toEqual([1, 2, 3]);
    for (const base of EGG_BASES) {
      for (const d of base) expect(d.startsWith("M")).toBe(true);
    }
  });

  it("names every tile once", () => {
    const names = EGG_PATTERNS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every tile a size, a layer and — if it strokes — a weight", () => {
    for (const p of EGG_PATTERNS) {
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
      expect(p.tile).toBeGreaterThan(0);
      expect(p.layers.length).toBeGreaterThan(0);
      expect(
        p.layers.every((l) => l.includes("<path") && l.includes("/>"))
      ).toBe(true);
      if (p.mode !== "fill") expect(p.stroke).toBeGreaterThan(0);
    }
  });

  it("finds a tile by name and nothing by a name it does not have", () => {
    expect(eggPatternByName(EGG_PATTERNS[0]!.name)).toBe(EGG_PATTERNS[0]);
    expect(eggPatternByName("no-such-tile")).toBeUndefined();
    expect(eggPatternByName(null)).toBeUndefined();
  });

  it("draws every tile without leaving a placeholder behind", () => {
    for (const p of EGG_PATTERNS) {
      const svg = eggAvatarSvg("x", {
        count: 1,
        patterns: [p.name],
        fieldPattern: null
      });
      expect(svg).not.toContain('fill=""');
      expect(svg).not.toContain("undefined");
      expect(svg).not.toContain("NaN");
    }
  });
});
