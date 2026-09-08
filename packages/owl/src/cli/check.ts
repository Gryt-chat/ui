/**
 * `npx @gryt/owl check my-hat.svg` — does this drawing work as a cosmetic? It reports and
 * writes nothing, so nobody has to clone the monorepo. Exit 1 when it would not build.
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

import { ACCESSORY_SLOTS, type PaletteSlot } from "../index";
import { extract } from "../lib/extract";
import { isIgnored, placementFor, RARITY_SHARE } from "../lib/filename";

/**
 * The ink table, found by walking up from the drawing. `artwork/inks.ts` is project data,
 * so it is looked for and done without, and parsed by regex rather than imported.
 */
function findInks(from: string): { path: string; inks: Map<string, PaletteSlot> } | null {
  let dir = resolve(dirname(from));
  for (let up = 0; up < 6; up++) {
    for (const candidate of [join(dir, "inks.ts"), join(dir, "artwork", "inks.ts")]) {
      if (!existsSync(candidate)) continue;
      const inks = new Map<string, PaletteSlot>();
      const source = readFileSync(candidate, "utf8");
      for (const [, hex, role] of source.matchAll(/"(#[0-9a-fA-F]{3,8})"\s*:\s*"(\w+)"/g)) {
        inks.set(hex.toLowerCase(), role as PaletteSlot);
      }
      if (inks.size > 0) return { path: candidate, inks };
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const BULLET = "  ";

/**
 * What checking one file came to. `skipped` exists because a file the registry walks past
 * has nothing to check: `_palette.svg` used to throw and fail every run.
 */
type Verdict = "ok" | "skipped" | "bad";

function report(file: string): Verdict {
  const name = basename(file);

  if (!existsSync(file)) {
    console.error(`${name}: no such file`);
    return "bad";
  }
  if (!/\.svg$/i.test(name)) {
    console.error(`${name}: not an .svg. This reads the SVG a drawing tool exports.`);
    return "bad";
  }

  console.log(name);

  if (isIgnored(name)) {
    // Said rather than checked anyway. A leading underscore keeps a drawing beside the
    // ones in use without being one, which is exactly what somebody here is asking.
    console.log(`${BULLET}starts with "_" or ".", so the registry walks past it — not checked`);
    return "skipped";
  }

  let placement;
  try {
    placement = placementFor(name, ACCESSORY_SLOTS);
  } catch (err) {
    console.error(`${BULLET}${err instanceof Error ? err.message : String(err)}`);
    return "bad";
  }

  console.log(
    `${BULLET}name      ${placement.name}` +
      `\n${BULLET}slot      ${placement.slot}, layer ${placement.layer}` +
      `\n${BULLET}family    ${placement.family}${placement.variant ? `, variant ${placement.variant}` : " (only drawing in it)"}` +
      `\n${BULLET}rarity    ${placement.rarity} (${RARITY_SHARE[placement.rarity]}x a common one)` +
      (placement.excludes.length ? `\n${BULLET}covers    ${placement.excludes.join(", ")}` : ""),
  );

  const found = findInks(file);
  if (found) console.log(`${BULLET}inks      ${found.path} (${found.inks.size} colours)`);
  else console.log(`${BULLET}inks      none found — every colour will report as needing a role`);

  let result;
  try {
    result = extract(readFileSync(file, "utf8"), name, {
      name: placement.name,
      // Neither is written anywhere, because nothing is written. A real key comes from the
      // ledger, which lives in the repository this exists to avoid needing.
      key: "??",
      slot: placement.slot,
      layer: placement.layer,
      weight: 1,
      excludes: placement.excludes,
      places: 2,
      tolerance: 0.5,
      map: found?.inks ?? new Map(),
    });
  } catch (err) {
    console.error(`${BULLET}${err instanceof Error ? err.message : String(err)}`);
    return "bad";
  }

  console.log(
    `${BULLET}bird      ${result.found}/${result.ofBird} paths found` +
      (result.missed > 0 ? "  ← not all of it" : ""),
  );
  console.log(`${BULLET}left      ${result.kept.length} paths after the subtraction`);

  if (result.guessed.length > 0) {
    console.log(
      `${BULLET}no role   ${result.guessed.join(" ")}\n` +
        `${BULLET}          add these to artwork/inks.ts. Until then they are ranked ` +
        `lightest to darkest,\n${BULLET}          which is a guess and is wrong more often than not.`,
    );
  }

  for (const note of result.notes) console.log(`${BULLET}warning   ${note}`);

  // The one that decides it. A drawing that finds none of the bird extracts happily and
  // hands back an accessory shaped like a whole owl, so "it produced something" is not it.
  if (result.missed > 0) {
    console.error(
      `${BULLET}\n${BULLET}${result.missed} of the bird's paths were not found. A layer was moved, rescaled or\n` +
        `${BULLET}deleted, or this was not drawn on the base bird at all. Export the bird with\n` +
        `${BULLET}\`--base\`, draw on that, and keep its layers where they are.`,
    );
    return "bad";
  }

  console.log(`${BULLET}\n${BULLET}looks usable.`);
  return "ok";
}

function main(argv: string[]): number {
  const args = argv.filter((a) => a !== "check");

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(
      "Check a drawing before it becomes a cosmetic.\n\n" +
        "  npx @gryt/owl check my-hat.svg\n" +
        "  npx @gryt/owl check artwork/*.svg\n\n" +
        "The filename is the configuration: type_family_variant.svg, with dot-tags\n" +
        "for a rarity, an explicit slot, a covers-<slot> or a layer. The full guide,\n" +
        "with the bird to draw on, is at https://ui.gryt.chat/avatars/drawing",
    );
    return args.length === 0 ? 1 : 0;
  }

  let ok = 0;
  let skipped = 0;
  let bad = 0;
  args.forEach((file, i) => {
    if (i > 0) console.log("");
    const verdict = report(file);
    if (verdict === "ok") ok += 1;
    else if (verdict === "skipped") skipped += 1;
    else bad += 1;
  });

  if (args.length > 1) {
    console.log(
      `\n${ok}/${args.length - skipped} usable` +
        (skipped > 0 ? `, ${skipped} not checked.` : "."),
    );
  }
  return bad > 0 ? 1 : 0;
}

process.exit(main(process.argv.slice(2)));
