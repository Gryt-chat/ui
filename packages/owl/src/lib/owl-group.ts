/**
 * The names the bird's own layers carry inside `<g id="owl">`.
 *
 * Two things read this and they have to agree, or the whole structural route
 * silently degrades: `--base` writes these names into the bird it hands out,
 * and the extractor reads them back to work out which parts a drawing means to
 * replace. A drawing tool keeps layer names through an export, so the name is
 * the one piece of a drawing that survives the tool rewriting every number in
 * it.
 *
 * They read like something a person would call the part rather than like the
 * generator's own field — "Left Arm", not `wingLeft`. Somebody hiding a layer
 * in Figma sees this list, not the code, and the bird has arms.
 *
 * One entry per path, in the order the generator draws them, so the table can
 * be zipped straight onto `owlPartPaths`.
 */

import * as owl from "../index";
import type { OwlPart } from "../types";

export const OWL_LAYERS: ReadonlyArray<{ part: OwlPart; name: string }> = [
  { part: "earTufts", name: "Left Ear" },
  { part: "earTufts", name: "Right Ear" },
  { part: "body", name: "Body" },
  { part: "wingLeft", name: "Left Arm" },
  { part: "wingRight", name: "Right Arm" },
  { part: "face", name: "Face" },
  { part: "eyeLeft", name: "Left Eye" },
  { part: "eyeRight", name: "Right Eye" },
  { part: "beak", name: "Nose" },
];

/** A layer name from inside the group, lowercased, to the part it is. */
export const PART_BY_LAYER: ReadonlyMap<string, OwlPart> = new Map(
  OWL_LAYERS.map((l) => [l.name.toLowerCase(), l.part]),
);

/** Every part the group names, each once. */
export const GROUPED_PARTS: readonly OwlPart[] = [
  ...new Set(OWL_LAYERS.map((l) => l.part)),
];

/**
 * The bird to draw on, with each of its parts on a named layer.
 *
 * This is the half of the contract the tool owes. Hide `Left Eye` in the
 * drawing and the extraction knows the drawing replaces the left eye — nothing
 * to configure, and nothing a re-export can rewrite, because a drawing tool
 * carries layer names through an export even as it re-rounds every number.
 *
 * A drawing exported without the group still extracts: the bird gets
 * recognised by its geometry instead. That route only holds while the drawing
 * sits on a bird nobody nudged, which is the failure this replaces.
 *
 * Built by putting ids into the generated markup rather than by drawing the
 * bird a second time here. `owlPartPaths` walks the same renderers in the same
 * order, so the two line up path for path — and when they stop, this throws
 * rather than handing out a bird with its arms labelled as eyes.
 */
export function owlBaseSvg(options: owl.OwlOptions = owl.OWL_BASE): string {
  const svg = owl.owlAvatarSvg("base", options);
  const parts = owl.owlPartPaths(options);
  if (parts.length !== OWL_LAYERS.length) {
    throw new Error(
      `the bird draws ${parts.length} paths and OWL_LAYERS names ${OWL_LAYERS.length}. ` +
        "A part was added or split — name it in src/lib/owl-group.ts, in draw order.",
    );
  }

  let i = 0;
  const named = svg.replace(/<path\b/g, () => {
    const layer = OWL_LAYERS[i];
    i += 1;
    if (!layer) throw new Error("the bird drew more paths than OWL_LAYERS names");
    return `<path id="${layer.name}"`;
  });
  if (i !== OWL_LAYERS.length) {
    throw new Error(`only ${i} of the bird's ${OWL_LAYERS.length} paths were named`);
  }

  // The field is not part of the bird, so it stays outside the group. An
  // accessory meant to be worn behind the bird goes between the two.
  return named
    .replace(/(<rect\b[^>]*\/>)?(<path\b)/, (_m, rect = "", first: string) =>
      `${rect}<g id="owl">${first}`)
    .replace("</svg>", "</g></svg>");
}
