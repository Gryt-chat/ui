/**
 * The names the bird's own layers carry inside `<g id="owl">`. `--base` writes them and
 * the extractor reads them back; a layer name is what survives a tool rewriting numbers.
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
 * The bird to draw on, with each part on a named layer: hide `Left Eye` and the extraction
 * knows. Built from the generated markup, so the two line up path for path or this throws.
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
