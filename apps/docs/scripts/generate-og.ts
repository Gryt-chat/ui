/* Generates one 1200x630 OG image per page into public/og/.
 *
 * No headless browser: satori lays the tree out and resvg rasterises it, both
 * of which run anywhere Node runs. That matters because this executes inside
 * the Docker build, where pulling Chromium would dominate both image size and
 * build time.
 *
 * Fonts are the one wrinkle. satori's parser cannot read variable fonts, and
 * every @fontsource-variable package is variable — so the static @fontsource
 * packages are dev dependencies purely for this script, decompressed from
 * woff2 to ttf at generation time. The site itself still ships the variable
 * faces it always did.
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { decompress } from "wawoff2";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ogPages, type OgPage } from "./og-pages";
import { drawing, C, type Node } from "./og-drawings";
import {
  fileNameFor,
  heroFontSize,
  heroLine,
  HERO_MAX,
  OG_CONTENT as CONTENT,
  OG_HEIGHT,
  OG_PAD as PAD,
  OG_WIDTH
} from "./og-meta";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "og");

async function loadFont(spec: string): Promise<Buffer> {
  const woff2 = readFileSync(require.resolve(spec));
  return Buffer.from(await decompress(woff2));
}

function template(page: OgPage): Node {
  const size = heroFontSize(heroLine(page));

  const mono = (color: string, value: string): Node => ({
    type: "div",
    props: {
      style: {
        display: "flex",
        fontFamily: "Mono",
        fontSize: size,
        color,
        whiteSpace: "pre"
      },
      children: value
    }
  });

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        backgroundColor: C.paper,
        padding: PAD,
        position: "relative"
      },
      children: [
        // hero — the copy-pasteable line
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", alignItems: "baseline" },
            children: page.hero.map((token) => mono(token.color, token.text))
          }
        },
        // hairline
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: CONTENT,
              height: 1.5,
              backgroundColor: C.rule,
              marginTop: 34,
              marginBottom: 34
            }
          }
        },
        // drawing + caption
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "row", alignItems: "center", gap: 30 },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", justifyContent: "flex-start" },
                  children: [drawing(page.drawing)]
                }
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flex: 1,
                    fontFamily: "Inter",
                    fontSize: 21,
                    lineHeight: 1.45,
                    color: C.ink2
                  },
                  children: page.caption
                }
              }
            ]
          }
        },
        // footer rule line
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              left: PAD,
              right: PAD,
              bottom: 44,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "Mono",
              fontSize: 19,
              color: C.ink2
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontFamily: "Geist",
                    fontWeight: 600,
                    fontSize: 19,
                    color: C.ink
                  },
                  children: "Gryt UI"
                }
              },
              { type: "div", props: { style: { display: "flex" }, children: "ui.gryt.chat" } }
            ]
          }
        }
      ]
    }
  };
}

async function main() {
  // Sequentially, not Promise.all: wawoff2 is an Emscripten module with shared
  // internal state, and concurrent decompress() calls return corrupted buffers
  // that surface later as "Unsupported OpenType signature".
  const mono = await loadFont(
    "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2"
  );
  const inter = await loadFont("@fontsource/inter/files/inter-latin-400-normal.woff2");
  const geist = await loadFont("@fontsource/geist-sans/files/geist-sans-latin-600-normal.woff2");

  const fonts = [
    { name: "Mono", data: mono, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: geist, weight: 600 as const, style: "normal" as const }
  ];

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  let smallest = HERO_MAX;
  for (const page of ogPages) {
    const svg = await satori(template(page) as never, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts
    });
    const png = new Resvg(svg).render().asPng();
    writeFileSync(join(outDir, fileNameFor(page.route)), png);

    smallest = Math.min(smallest, heroFontSize(heroLine(page)));
  }

  console.log(
    `og: ${ogPages.length} images -> public/og (hero type ${smallest}-${HERO_MAX}px)`
  );
}

await main();
