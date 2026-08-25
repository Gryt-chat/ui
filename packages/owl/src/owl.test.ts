/**
 * What this protects is not that an owl looks good — that is what the eye is
 * for — but that the same name keeps drawing the same owl.
 *
 * An avatar is how a person is recognised. Every consumer of this package draws
 * from a nickname and stores nothing, so there is no server-side record to fall
 * back on: if the output moves, everybody's face moves with it, everywhere, at
 * once. The pinned hashes below fail on any change to the geometry, the layer
 * order, the rounding or the weights.
 *
 * When one fails, the question is never "update the hash". It is whether the
 * change was meant, and whether it is worth every existing user looking
 * different.
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
  owlPartPaths,
  PALETTE_NAMES,
  PALETTE_SCHEMES,
  repaint,
  resolveOwl,
  TILE_HUES,
  type AccessorySlot,
} from "./index";

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
   * The pins. Generated once and left alone — see the note at the top of the
   * file before touching them.
   *
   * Regenerated once, on 2026-08-25, and it is the only time. GRYT-589 moved
   * accessory weights off a hand-written manifest and onto the filenames, and
   * changed the draw so that a candidate's chance stops depending on what else
   * is in its slot. Both change where a seed lands, so all three moved and so
   * did most owls.
   *
   * That was the point rather than a cost of it. Before, adding one drawing
   * changed 28.6% of owls while 8.7% wore the new thing — every drawing ever
   * added reshuffled a fifth of everybody for nothing, and would have gone on
   * doing it. It is 4.4% now, and the remainder is the slot holding its overall
   * rate steady. This is the last time a new accessory moves people who do not
   * get it, which is what buys the one-off.
   */
  it.each([
    ["sivert", "08e0f6cac482bd90"],
    ["ingy", "ef23823fe3db7b87"],
    ["gryt", "dcf2a44b431e7c5b"],
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
   * A voice tile takes the avatar's colour and snaps it to the nearest entry in
   * TILE_HUES. The palettes are built from that list precisely so the snap is
   * exact — one that drifted off it would still look fine and would quietly be
   * somebody else's colour.
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
    // Colour cannot tell an eye from the beak — both are accent — so the
    // extractor leans on this, and it is worth knowing when it stops working.
    expect(parts.filter((p) => p.part === "eyes")).toHaveLength(2);
    expect(parts.filter((p) => p.part === "beak")).toHaveLength(1);
    expect(parts.every((p) => p.d.length > 0)).toBe(true);
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
