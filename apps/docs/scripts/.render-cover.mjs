/*
 * A slide SVG to PNG at whatever size Figma Community wants.
 *
 * resvg rather than a headless browser, the same pair the docs app's OG
 * images use. The fonts are the whole difficulty: the SVG names Atkinson
 * Hyperlegible by family, resvg only knows fonts it is handed, and the repo
 * ships them as variable woff2. wawoff2 decompresses to ttf, which resvg does
 * read.
 */
import { Resvg } from "@resvg/resvg-js";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const [svgPath, outDir, widthArg, fontDirArg] = process.argv.slice(2);
const width = Number(widthArg || 1920);

/*
 * Static faces, not the repo's variable ones. resvg renders a variable font at
 * its default instance and ignores font-weight, so the headline came out light.
 * These are the 400/600/700 cuts Google Fonts serves, one file per weight.
 */
const FONT_DIR = fontDirArg;
const fontFiles = readdirSync(FONT_DIR)
  .filter((f) => f.endsWith(".ttf"))
  .map((f) => join(FONT_DIR, f));
if (fontFiles.length === 0) throw new Error(`no .ttf in ${FONT_DIR}`);

const svg = readFileSync(svgPath, "utf8");
const r = new Resvg(svg, {
  fitTo: { mode: "width", value: width },
  font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Atkinson Hyperlegible Next" },
});
const png = r.render().asPng();
const out = join(outDir, basename(svgPath).replace(/\.svg$/, `@${width}.png`));
writeFileSync(out, png);
console.log(`${out}  ${(png.length / 1024).toFixed(0)}kB`);
