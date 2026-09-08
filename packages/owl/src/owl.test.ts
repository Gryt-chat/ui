/**
 * What this protects is that the same name keeps drawing the same owl. Nothing is stored,
 * so if the output moves, everybody's face moves with it at once.
 */

import { describe, expect, it } from "vitest";

import {
  ACCESSORIES,
  ACCESSORY_SLOTS,
  avatarSeed,
  EAR_STYLES,
  owlAvatarColour,
  owlAvatarDataUri,
  owlAvatarSvg,
  owlPalette,
  OWL_BASE,
  owlPartPaths,
  PALETTE_NAMES,
  PALETTE_SCHEMES,
  repaint,
  resolveOwl,
  TILE_HUES,
  type AccessorySlot,
} from "./index";
import { OWL_LAYERS, PART_BY_LAYER } from "./lib/owl-group";

const BARE = Object.fromEntries(ACCESSORY_SLOTS.map((s) => [s, null])) as Record<
  AccessorySlot,
  null
>;

/** A stable digest without pulling in node:crypto, which React Native lacks. */
function digest(value: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < value.length; i += 1) {
    h1 = Math.imul(h1 ^ value.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 + value.charCodeAt(i), 0x85ebca6b) >>> 0;
  }
  return (h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0");
}

describe("the same name draws the same owl", () => {
  it.each(["sivert", "ingy", "gryt", "a", "Ævar", "  spaced  "])("%s is stable", (seed) => {
    expect(owlAvatarSvg(seed)).toBe(owlAvatarSvg(seed));
  });

  it("draws two different names differently", () => {
    expect(owlAvatarSvg("sivert h")).not.toBe(owlAvatarSvg("sivert"));
  });

  /*
   * The pins. Generated once, and regenerated once on 2026-08-25 when GRYT-589 moved
   * weights onto the filenames. Ask whether the change was meant, not whether to update.
   */
  it.each([
    ["sivert", "8e6200915eb65797"],
    ["ingy", "ae9902b72ddb5d51"],
    ["gryt", "ddd680cd5c4e30a9"],
  ])("%s is unchanged", (seed, expected) => {
    expect(digest(owlAvatarSvg(seed))).toBe(expected);
  });
});

describe("the seed", () => {
  it("treats case and surrounding whitespace as the same person", () => {
    expect(avatarSeed("  Sivert ")).toBe("sivert");
    expect(avatarSeed("SIVERT")).toBe(avatarSeed("sivert"));
  });

  it("has no seed for a name that is empty or only whitespace", () => {
    for (const empty of ["", "   ", null, undefined]) {
      expect(avatarSeed(empty)).toBeUndefined();
    }
  });

  it("keeps everything that is not case or edge whitespace", () => {
    expect(avatarSeed("Sivert H")).toBe("sivert h");
  });
});

describe("the colour a tile is tinted from", () => {
  /**
   * A voice tile snaps the avatar's colour to the nearest TILE_HUES entry. The palettes
   * are built from that list so the snap is exact rather than somebody else's colour.
   */
  function hueOf(hex: string): number | null {
    const int = parseInt(hex.slice(1), 16);
    const [r, g, b] = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => v / 255) as [
      number,
      number,
      number,
    ];
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    if (delta === 0) return null;
    const h =
      max === r ? ((g - b) / delta) % 6
      : max === g ? (b - r) / delta + 2
      : (r - g) / delta + 4;
    return (h * 60 + 360) % 360;
  }

  it.each(PALETTE_NAMES.flatMap((name) => PALETTE_SCHEMES.map((s) => [name, s] as const)))(
    "%s/%s lands on a tile hue",
    (name, scheme) => {
      const colour = owlAvatarColour("x", { palette: name, scheme });
      expect(colour).toMatch(/^#[0-9a-f]{6}$/);

      const hue = hueOf(colour);
      expect(hue).not.toBeNull();
      const nearest = Math.min(
        ...TILE_HUES.map((c) => Math.abs(((c - hue! + 540) % 360) - 180)),
      );
      expect(nearest).toBeLessThan(1.5);
    },
  );

  it("does not move when the owl is wearing something", () => {
    const bare = owlAvatarColour("x", { wearing: BARE });
    for (const accessory of ACCESSORIES) {
      expect(owlAvatarColour("x", { wearing: { [accessory.slot]: accessory.name } })).toBe(bare);
    }
  });
});

describe("the parts draw", () => {
  it.each(EAR_STYLES)("%s ears", (ears) => {
    expect(owlAvatarSvg("x", { ears }).length).toBeGreaterThan(500);
  });

  it("names every one of the bird's own paths", () => {
    const parts = owlPartPaths();
    expect(parts.length).toBeGreaterThan(0);
    // Colour cannot tell an eye from the beak, so the extractor leans on this. Named a
    // side at a time: naming the pair meant a wink hid both and came out blank-faced.
    expect(parts.filter((p) => p.part === "eyeLeft")).toHaveLength(1);
    expect(parts.filter((p) => p.part === "eyeRight")).toHaveLength(1);
    expect(parts.filter((p) => p.part === "wingLeft")).toHaveLength(1);
    expect(parts.filter((p) => p.part === "wingRight")).toHaveLength(1);
    expect(parts.filter((p) => p.part === "beak")).toHaveLength(1);
    expect(parts.every((p) => p.d.length > 0)).toBe(true);
  });
});

/*
 * The bird handed out to draw on carries a named layer per path, and the extractor reads
 * those back. Two files have to agree, and nothing else would notice them drifting.
 */

/*
 * A palette name nothing knows used to make a hue of `undefined`, which `hsl` turned into
 * `#d062NaN` — not a colour, ignored by every renderer, invisible to the type checker.
 */
describe("a palette name nothing knows", () => {
  it("is refused by owlPalette, which names the ones there are", () => {
    expect(() => owlPalette("plum" as never, "dusk")).toThrow(/not one of the owl palettes/);
  });

  it("never reaches a colour value", () => {
    for (const name of PALETTE_NAMES) {
      for (const scheme of PALETTE_SCHEMES) {
        for (const hex of Object.values(owlPalette(name, scheme))) {
          expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        }
      }
    }
  });

  it("falls back to the seed's own when an owl is drawn with it", () => {
    const asked = owlAvatarSvg("sivert", { palette: "plum" as never });
    expect(asked).toBe(owlAvatarSvg("sivert"));
    expect(asked).not.toContain("NaN");
  });
});

describe("the bird's layer names", () => {
  it("names every path the bird draws, in draw order", () => {
    const parts = owlPartPaths(OWL_BASE);
    expect(OWL_LAYERS.map((l) => l.part)).toEqual(parts.map((p) => p.part));
  });

  it("gives every layer a distinct name that reads back to its part", () => {
    const names = OWL_LAYERS.map((l) => l.name);
    expect(new Set(names).size).toBe(names.length);
    for (const l of OWL_LAYERS) {
      expect(PART_BY_LAYER.get(l.name.toLowerCase())).toBe(l.part);
    }
  });
});

/*
 * A wink is one closed eye and one open one. It came out blank-faced, because `hides`
 * could only name the pair and the drawing supplied only the closed one.
 */
describe("a drawing that replaces one of a pair", () => {
  const parts = owlPartPaths(OWL_BASE);
  const pathFor = (part: string) => parts.find((p) => p.part === part)!.d;
  const wearing = (worn: Record<string, string | null>) =>
    owlAvatarSvg("x", { ...OWL_BASE, wearing: { ...OWL_BASE.wearing, ...worn } });

  it("leaves the other eye alone on a wink", () => {
    const left = wearing({ expression: "eyes-wink-left" });
    expect(left).not.toContain(pathFor("eyeLeft"));
    expect(left).toContain(pathFor("eyeRight"));

    const right = wearing({ expression: "eyes-wink-right" });
    expect(right).toContain(pathFor("eyeLeft"));
    expect(right).not.toContain(pathFor("eyeRight"));
  });

  it("still takes both when the drawing brings both", () => {
    const happy = wearing({ expression: "eyes-happy" });
    expect(happy).not.toContain(pathFor("eyeLeft"));
    expect(happy).not.toContain(pathFor("eyeRight"));
  });

  /*
   * A coat keeps the arms and covers them, so what has to hold is the order. The sleeves
   * cover both completely; what breaks it is the coat drawing before the arms.
   */
  it("draws a coat after the arms it covers", () => {
    const coat = wearing({ body: "shirt-jacket-winter" });
    const jacket = ACCESSORIES.find((a) => a.name === "shirt-jacket-winter")!;

    const arm = coat.indexOf(pathFor("wingLeft"));
    expect(arm).toBeGreaterThan(-1);
    expect(coat.indexOf(jacket.paths[0]!.d)).toBeGreaterThan(arm);
  });

  it("leaves both arms on when nothing is worn over them", () => {
    const bare = wearing({});
    expect(bare).toContain(pathFor("wingLeft"));
    expect(bare).toContain(pathFor("wingRight"));
  });
});

describe("accessories", () => {
  const roles = Object.keys(owlPalette("teal", "day"));

  it("gives every accessory a unique name", () => {
    const names = ACCESSORIES.map((a) => a.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it.each(ACCESSORIES.map((a) => [a.name, a] as const))("%s is drawable", (_name, accessory) => {
    for (const p of accessory.paths) {
      expect(p.d.length).toBeGreaterThan(0);
      // A path with neither is invisible, which is what a drawing losing a
      // stroke on the way in looks like.
      expect(Boolean(p.fill || p.stroke)).toBe(true);
      if (p.fill) expect(roles).toContain(p.fill);
      if (p.stroke) {
        expect(roles).toContain(p.stroke);
        expect(p.strokeWidth).toBeGreaterThan(0);
      }
    }
    for (const [part, source] of Object.entries(accessory.recolour ?? {})) {
      expect(roles).toContain(part);
      expect(roles).toContain(source);
    }
    // Hiding a part of the bird and drawing nothing in its place leaves a hole.
    if (accessory.hides?.length) expect(accessory.paths.length).toBeGreaterThan(0);
  });

  it.each(ACCESSORIES.map((a) => [a.name, a] as const))("%s renders paint", (_name, accessory) => {
    const svg = owlAvatarSvg("x", { wearing: { [accessory.slot]: accessory.name } });
    // An SVG in an <img> has no document to inherit from, so a missing fill is
    // black rather than nothing — an unpainted line becomes a solid blob.
    expect(svg).not.toContain('fill=""');
    expect(svg).not.toContain("undefined");
  });

  it("wears what the caller asks for", () => {
    for (const accessory of ACCESSORIES) {
      const owl = resolveOwl("x", { wearing: { [accessory.slot]: accessory.name } });
      expect(owl.wearing[accessory.slot]).toBe(accessory.name);
    }
  });

  it("empties a slot on null rather than re-rolling it", () => {
    for (const slot of ACCESSORY_SLOTS) {
      expect(resolveOwl("x", { wearing: { [slot]: null } }).wearing[slot]).toBeUndefined();
    }
  });

  it("swaps roles on a repaint rather than collapsing them", () => {
    const base = owlPalette("teal", "day");
    const swapped = repaint(base, [
      {
        name: "t",
        key: "zz",
        slot: "body",
        layer: "behind",
        weight: 1,
        paths: [],
        recolour: { wing: "background", background: "wing" },
      },
    ]);
    expect(swapped.wing).toBe(base.background);
    expect(swapped.background).toBe(base.wing);
  });
});

describe("the output", () => {
  it("is a square SVG on the 1024 frame", () => {
    const svg = owlAvatarSvg("sivert", { size: 64 });
    expect(svg).toContain('viewBox="0 0 1024 1024"');
    expect(svg).toContain('width="64"');
    expect(svg.endsWith("</svg>")).toBe(true);
  });

  it("survives a round trip through a data URI", () => {
    const uri = owlAvatarDataUri("sivert");
    expect(uri.startsWith("data:image/svg+xml;utf8,")).toBe(true);
    expect(decodeURIComponent(uri.slice("data:image/svg+xml;utf8,".length))).toBe(
      owlAvatarSvg("sivert"),
    );
  });

  it("escapes a title rather than letting it close the tag", () => {
    const svg = owlAvatarSvg("x", { title: '</svg><script>alert(1)</script>' });
    expect(svg).not.toContain("<script>");
    expect(svg.match(/<\/svg>/g)).toHaveLength(1);
  });

  it("draws nothing behind the owl when the background is off", () => {
    expect(owlAvatarSvg("x", { background: false })).not.toContain("<rect");
  });
});

describe("painting one slot a different colour", () => {
  const seed = "sivert";
  const wearing = { head: "hat-winter", expression: null, eyewear: null, neck: null, body: null };

  it("changes the owl when a slot is tinted", () => {
    const plain = owlAvatarSvg(seed, { wearing });
    const amber = owlAvatarSvg(seed, { wearing, tint: { head: "amber" } });
    expect(amber).not.toBe(plain);
  });

  it("repaints the hat and nothing else", () => {
    // "Colour my hat" must not quietly become "recolour me". Comparing fills in order says
    // which paths moved: the bird's are drawn first, so the tail is the hat.
    const fills = (svg: string) =>
      [...svg.matchAll(/fill="(#[0-9a-f]{6})"/g)].map((m) => m[1]);

    const bare = { expression: null, eyewear: null, head: null, neck: null, body: null };
    const birdOnly = fills(owlAvatarSvg(seed, { wearing: bare }));

    const plain = fills(owlAvatarSvg(seed, { wearing }));
    const amber = fills(owlAvatarSvg(seed, { wearing, tint: { head: "amber" } }));

    // A tint repaints; it never adds or drops a path.
    expect(amber).toHaveLength(plain.length);

    // Every fill the bare bird has is still exactly where it was.
    expect(amber.slice(0, birdOnly.length)).toEqual(plain.slice(0, birdOnly.length));

    // And the hat really did change, rather than the test passing on an owl
    // whose hat happened to already be amber.
    expect(amber.slice(birdOnly.length)).not.toEqual(plain.slice(birdOnly.length));
  });

  it("leaves an untinted slot alone", () => {
    const both = { ...wearing, eyewear: "glasses-round" };
    const onlyHat = owlAvatarSvg(seed, { wearing: both, tint: { head: "amber" } });
    const neither = owlAvatarSvg(seed, { wearing: both });
    const bothTinted = owlAvatarSvg(seed, { wearing: both, tint: { head: "amber", eyewear: "amber" } });

    expect(onlyHat).not.toBe(neither);
    expect(bothTinted).not.toBe(onlyHat);
  });

  it("ignores a palette name it does not know", () => {
    const plain = owlAvatarSvg(seed, { wearing });
    // @ts-expect-error deliberately not a PaletteName — this is what a string
    // from a newer build looks like arriving at an older one.
    const bogus = owlAvatarSvg(seed, { wearing, tint: { head: "chartreuse" } });
    expect(bogus).toBe(plain);
  });

  it("does nothing for a slot wearing nothing", () => {
    const bare = { expression: null, eyewear: null, head: null, neck: null, body: null };
    expect(owlAvatarSvg(seed, { wearing: bare, tint: { head: "amber" } })).toBe(
      owlAvatarSvg(seed, { wearing: bare }),
    );
  });

  it("is the same on both sides of the wire", () => {
    // The property the whole package exists for: the same input draws the same
    // owl every time, tints included.
    const opts = { wearing, tint: { head: "amber" as const } };
    expect(owlAvatarSvg(seed, opts)).toBe(owlAvatarSvg(seed, opts));
  });
});
