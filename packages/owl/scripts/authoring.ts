/**
 * The extractor plus this repository's ink table, for anything authoring a
 * cosmetic against these drawings.
 *
 * The two are separate on purpose and joined here. `src/lib/extract.ts` is
 * package code: it subtracts the bird out of a drawing and knows nothing about
 * which colours this project happens to paint in. `artwork/inks.ts` is the
 * project's own answer to that, and somebody drawing a hat outside this
 * repository has no copy of it — the CLI walks up the filesystem looking for
 * one and does without.
 *
 * The docs app's upload checker wants both, because it is checking a drawing
 * against these drawings. It is aliased to this file rather than reaching into
 * two places, and it lives under scripts/ rather than src/ because src/ is what
 * gets published and this half of it is not.
 */

export * from "../src/lib/extract";
export { INKS } from "../artwork/inks";
