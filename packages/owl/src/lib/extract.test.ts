/**
 * The loop the drawing guide describes, run end to end.
 *
 * `owlBaseSvg` writes the bird somebody draws on and `extract` reads their
 * drawing back, and the two only work together because they agree on layer
 * names and on what document order means. Nothing else fails when they stop
 * agreeing: the extraction still succeeds, and the accessory it produces is
 * quietly wrong — an eye drawn over the bird's own, or a headset worn on the
 * wrong side of the head.
 */

import { describe, expect, it } from "vitest";

import * as owl from "../index";
import { extract } from "./extract";
import { owlBaseSvg } from "./owl-group";

const base = owlBaseSvg(owl.OWL_BASE);
const p = owl.owlPalette(owl.OWL_BASE.palette, owl.OWL_BASE.scheme);

const OPTS = {
  key: "zz",
  weight: 1,
  excludes: [],
  places: 2,
  tolerance: 0.5,
  map: new Map<string, owl.PaletteSlot>(),
};

const run = (svg: string, slot: owl.AccessorySlot) =>
  extract(svg, "test.svg", { ...OPTS, name: "test", slot });

describe("a drawing made on the bird the guide hands out", () => {
  it("takes the part whose layer was hidden, and only that one", () => {
    const wink = base
      .replace(/<path id="Left Eye"[^>]*\/>/, "")
      .replace("</g></svg>", `</g><path d="M320 495H420" stroke="${p.accent}" stroke-width="18"/></svg>`);

    const result = run(wink, "expression");
    expect(result.replaced).toEqual(["eyeLeft"]);
    expect(result.notes).toEqual([]);
    expect(result.kept).toHaveLength(1);
  });

  it("is worn behind the bird when it is drawn before the group", () => {
    const halo = `<path d="M312 200C312 90 712 90 712 200 712 310 312 310 312 200Z" fill="${p.gold}"/>`;
    const behind = base.replace('<g id="owl">', `${halo}<g id="owl">`);
    const over = base.replace("</g></svg>", `</g>${halo}</svg>`);

    expect(run(behind, "head").literal).toContain('layer: "behind"');
    expect(run(over, "head").literal).toContain('layer: "overAll"');
  });

  it("refuses a file that is only the bird", () => {
    expect(() => run(base, "head")).toThrow(/nothing left/);
  });

  /*
   * A layer inside the group that is not one of the bird's parts is dropped
   * with the bird, so it is neither drawn nor extracted. The drawing looks
   * right in Figma and the accessory comes out missing a piece, which is the
   * kind of thing a warning has to catch.
   */
  it("says so when a layer inside the group is not a part of the bird", () => {
    const stray = base
      .replace("</g></svg>", `<path id="Elbow" d="M320 900H420" fill="${p.gold}"/></g></svg>`)
      .replace("</svg>", `<path d="M480 300H560" fill="${p.gold}"/></svg>`);

    const result = run(stray, "head");
    expect(result.kept).toHaveLength(1);
    expect(result.notes.join(" ")).toContain('"Elbow"');
  });
});
