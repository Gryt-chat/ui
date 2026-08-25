import {
  ACCESSORIES,
  OWL_BASE,
  accessoryByName,
  owlAvatarDataUri,
  owlAvatarSvg
} from "@gryt/owl";
import { KEYWORDS } from "@gryt/owl/authoring";
import { Button, Surface } from "@gryt/ui";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { CodeBlock } from "../components/CodeBlock";
import { CosmeticChecker } from "../components/CosmeticChecker";

/* The example runs through the winter jacket because it is the hardest one in
   the folder: eighteen paths, four tones, and it repaints the wings away. An
   example that only worked for a bow tie would leave the interesting half out. */
const EXAMPLE = "shirt-jacket-winter";

const DISCORD = "https://discord.gg/Q3JKUGsnHE";

/* The type words a filename may start with, grouped by the slot each one puts
   the drawing in. Module scope rather than a useMemo: KEYWORDS is a constant,
   so there is nothing here that could change between renders. */
const TYPES_BY_SLOT = (() => {
  const bySlot = new Map<string, string[]>();
  for (const [word, slot] of Object.entries(KEYWORDS)) {
    if (!bySlot.has(slot)) bySlot.set(slot, []);
    bySlot.get(slot)!.push(word);
  }
  return [...bySlot];
})();

/* OWL_BASE pins the palette so the drawing steps show the bird as you draw on
   it. A preview on somebody else's colours hands those two keys back. */
function withoutColours(options: typeof OWL_BASE): Omit<typeof OWL_BASE, "palette" | "scheme"> {
  const copy: Record<string, unknown> = { ...options };
  delete copy.palette;
  delete copy.scheme;
  return copy as Omit<typeof OWL_BASE, "palette" | "scheme">;
}

function Owl({
  seed,
  wearing,
  size = 200,
  label,
  ownPalette = false
}: {
  seed: string;
  wearing?: Record<string, string | null>;
  size?: number;
  label: string;
  ownPalette?: boolean;
}) {
  const base = ownPalette ? withoutColours(OWL_BASE) : OWL_BASE;
  return (
    <img
      alt={label}
      className="block h-full w-full object-cover"
      height={size}
      src={owlAvatarDataUri(seed, {
        ...base,
        size,
        wearing: { ...OWL_BASE.wearing, ...wearing }
      })}
      width={size}
    />
  );
}

function Panel({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className="m-0 flex flex-col gap-(--space-sm)">
      <Surface className="overflow-hidden p-0">{children}</Surface>
      <figcaption className="m-0 text-center text-[11px] text-gryt-muted">
        {caption}
      </figcaption>
    </figure>
  );
}

function Step({
  n,
  title,
  children
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-(--space-xl)">
      <h2 className="not-prose flex items-baseline gap-3 text-[length:var(--text-lg)] font-semibold tracking-[-0.022em] text-gryt-text">
        <span
          aria-hidden="true"
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gryt-accent text-sm text-gryt-on-accent"
        >
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function DrawingPage() {
  /* Generated here rather than committed, so the download cannot go stale. The
     options come from the package, which is also what the extractor subtracts —
     a second copy that drifted would hand you a bird a little unlike the one
     your drawing is measured against. */
  const baseHref = useMemo(() => {
    const svg = owlAvatarSvg("base", OWL_BASE);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, []);

  const example = accessoryByName(EXAMPLE);

  return (
    <article className="prose prose-invert max-w-[68ch] prose-headings:font-display prose-headings:tracking-[-0.022em] prose-h1:text-[length:var(--text-2xl)] prose-h2:mt-(--space-xl) prose-h2:text-[length:var(--text-lg)] prose-p:text-gryt-muted prose-p:leading-7">
      <h1>Drawing a cosmetic</h1>
      <p>
        An owl wears up to five things at once, and every one of them started as
        a drawing of the whole bird. You draw on top of the bird and a script
        subtracts the bird back out, so nothing here involves writing path data
        or measuring anything. There are {ACCESSORIES.length} in the game today.
      </p>

      <Step n={1} title="Start from the bird">
        <div className="not-prose my-(--space-md) grid grid-cols-1 items-center gap-(--space-md) sm:grid-cols-[200px_1fr]">
          <Surface className="overflow-hidden p-0">
            <Owl label="The bare owl" seed="base" />
          </Surface>
          <div className="flex flex-col items-start gap-(--space-sm)">
            <Button render={<a download="owl-base.svg" href={baseHref} />}>
              Download owl-base.svg
            </Button>
            <p className="m-0 text-sm text-gryt-muted">
              The exact bird the script subtracts, on a 1024 x 1024 frame. Open
              it in whatever you draw in.
            </p>
          </div>
        </div>
        <p>
          Do not move it, resize it, or redraw any part of it. The script finds
          the bird in your file by shape, and a nudged path is one it cannot
          find. Its colours are only there to draw against.
        </p>
      </Step>

      <Step n={2} title="Draw on top of it">
        <div className="not-prose my-(--space-md) grid grid-cols-1 gap-(--space-md) sm:grid-cols-3">
          <Panel caption="the bird you started with">
            <Owl label="The bare owl" seed="example" />
          </Panel>
          <Panel caption="your drawing over it">
            <Owl label="An owl in the winter jacket" seed="example" wearing={{ body: EXAMPLE }} />
          </Panel>
          <Panel caption="what everyone else sees">
            <Owl
              label="The same jacket on another palette"
              ownPalette
              seed="ingy"
              wearing={{ body: EXAMPLE }}
            />
          </Panel>
        </div>
        <p>
          The drawing is made once and worn on all thirty palettes, because what
          gets recorded is which role each colour is rather than the colour
          itself. Three things to hold to:
        </p>
        <ul>
          <li>
            Stay on the 1024 frame. Everything is positioned absolutely, so
            where you put it is where it lands.
          </li>
          <li>
            Flatten your transforms before exporting. A{" "}
            <code>{"<g transform>"}</code> around a layer stops the build rather
            than being applied, because an accessory that is silently offset is
            worse than one that fails.
          </li>
          <li>
            Never delete a part of the bird. The script finds it by shape, and a
            missing part reads as a drawing made on something other than the
            base.
          </li>
        </ul>
        <p>
          You can recolour the bird, and that is how a part is taken away.
          Recolour it to a colour already in the drawing rather than a new one,
          because what gets recorded is not the colour — it is which part now
          follows which.
        </p>
        <p>
          Paint the body in the background&rsquo;s colour and what is written
          down is <em>body follows background</em>. On every one of the thirty
          palettes the body then takes that palette&rsquo;s background, so it
          keeps disappearing rather than turning into one particular shade of
          teal. That is how the jacket above loses the wings, and why it still
          works on the amber owl next to it.
        </p>
        <p>
          Reuse colours from a cosmetic that already exists wherever you can.
          Each one has to map to a rung of the palette, and the ones already
          drawn are already mapped — a drawing in those needs no configuration
          at all. A new colour is fine too; you will be asked which rung it is.
        </p>
        <h3 className="not-prose mt-(--space-lg) text-[length:var(--text-base)] font-semibold text-gryt-text">
          The colour you draw in is thrown away
        </h3>
        <p>
          Worth knowing before you pick one. Nothing stores the colour you drew
          — each shape stores <em>which rung of the palette</em> it is, and the
          owl wearing it supplies the actual value. Draw a pair of glasses in
          pink, say that pink is the dark rung, and they come out dark violet on
          a violet owl and dark teal on a teal one. They are never pink again.
        </p>
        <p>There are two kinds of rung, and only five owls in ten get the same one:</p>
        <ul>
          <li>
            <code>trimSoft</code>, <code>trimLight</code>, <code>trim</code>,{" "}
            <code>trimDeep</code>, <code>accent</code> — near-white down to
            near-black, all in the owl&rsquo;s own hue. Almost everything is one
            of these.
          </li>
          <li>
            <code>gold</code> and <code>goldDeep</code> — the one pair that
            leaves the owl&rsquo;s hue. Not a fixed gold: it is whichever of
            amber or a cold blue sits further from that owl&rsquo;s own colour,
            so a teal owl gets the amber and an amber owl gets the blue. A gold
            owl never ends up in a gold scarf.
          </li>
        </ul>
        <p>
          So a cosmetic cannot be one specific colour on every owl. A red hat, a
          flag, a brand colour — none of those survive, and that is the trade
          that lets one drawing work on all thirty palettes instead of thirty
          drawings working on one each.
        </p>
      </Step>

      <Step n={3} title="Export it as SVG, named for where it goes">
        <p>
          Export at <strong>1x</strong> as <strong>SVG</strong>. Name the layer
          in Figma and the export takes its name from it, so the naming below is
          something you do once in the layers panel rather than every time you
          export.
        </p>
        <div className="not-prose my-(--space-md) max-w-[280px]">
          <Surface className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gryt-text">Export</span>
              <span aria-hidden="true" className="text-gryt-muted">
                +
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1 rounded-(--gryt-radius-sm) border border-gryt-border px-2 py-1 text-xs text-gryt-muted">
                1x
              </span>
              <span className="flex-1 rounded-(--gryt-radius-sm) border border-gryt-border px-2 py-1 text-xs text-gryt-text">
                SVG
              </span>
            </div>
            <span className="rounded-(--gryt-radius-sm) border border-gryt-border px-2 py-1.5 text-center text-xs text-gryt-text">
              Export shirt_jacket_winter
            </span>
          </Surface>
        </div>
        <p>
          The filename is the configuration. There is no manifest to edit, and
          the shape is <code>type_family_variant.svg</code>: underscores between
          the three fields, hyphens inside one of them.
        </p>
        <div className="not-prose my-(--space-md) overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {[
                ["scarf.svg", "a type on its own is its own family"],
                ["glasses_round.svg", "round glasses"],
                ["glasses_round_gold.svg", "the gold pair of them"],
                ["hat_winter-beanie_red.svg", "two words in a field, joined by a hyphen"],
                ["glasses_heart.rare.svg", "seen less often than the other eyewear"],
                ["hoodie.covers-head.svg", "has a hood, so no hat over it"],
                ["glasses_round.over-face.svg", "drawn as holes, so the eyes show through"],
                ["sporran_dress.neck.svg", "a type the script has not been taught"]
              ].map(([name, meaning]) => (
                <tr key={name} className="border-b border-gryt-border">
                  <td className="py-2 pr-4 align-top font-mono text-gryt-text">{name}</td>
                  <td className="py-2 align-top text-gryt-muted">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          The type is the first field and it decides which of the five slots the
          drawing is worn in. Pick one of these words:
        </p>
        <div className="not-prose my-(--space-md) flex flex-col gap-(--space-sm)">
          {TYPES_BY_SLOT.map(([slot, words]) => (
            <div key={slot} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <span className="w-24 shrink-0 font-mono text-xs text-gryt-muted">{slot}</span>
              <span className="text-[13px] text-gryt-text">{words.join(", ")}</span>
            </div>
          ))}
        </div>
        <p>
          A word that is not on the list stops the run rather than being placed
          somewhere, because a scarf worn as a hat is not something anyone
          notices from a diff. Add <code>.neck</code> or whichever slot to the
          name and it goes there instead.
        </p>
        <p>
          Variants of one thing share a family, and the family is what competes
          for the slot — its variants split whatever it wins. Six colourways of
          round glasses stay as likely to turn up as a pair drawn once. Without
          that they would be six times as likely, and drawing variants would
          quietly bury everything that only exists in one.
        </p>
      </Step>

      <Step n={4} title="Check it here">
        <p>
          Drop the file in and it runs the same extractor the build runs. It
          reads the file in your browser and sends it nowhere.
        </p>
        <div className="my-(--space-md)">
          <CosmeticChecker />
        </div>
      </Step>

      <Step n={5} title="Share it">
        <p>
          Post the SVG in{" "}
          <a href={DISCORD} rel="noreferrer" target="_blank">
            the Gryt Discord
          </a>
          , with the name you would like to be credited under. If the checker
          asked you about any colours, say which rung of the palette each one
          is, and it goes in with the drawing.
        </p>
        <p>
          Cosmetics that go in keep their author. The registry records who drew
          each one, and the intention is that a Gryt you are wearing can tell
          you whose drawing it is.
        </p>
      </Step>

      <h2>The winter jacket, end to end</h2>
      <p>
        The hardest one in the folder: eighteen paths, four tones, and it takes
        the wings off. What the script wrote for it:
      </p>
      {example ? (
        <>
          <CodeBlock
            code={`{
  name: "${example.name}",
  slot: "${example.slot}",
  layer: "${example.layer}",
  weight: ${example.weight},
  excludes: [${(example.excludes ?? []).map((e) => `"${e}"`).join(", ")}],
  recolour: { wing: "background" },
  paths: [ /* ${example.paths.length} of them */ ],
}`}
            language="ts"
          />
          <p>
            The <code>recolour</code> line is the wings being painted out. It
            repaints a role rather than a path, so both wings go together and it
            holds on every palette. Nobody wrote it. The script noticed the
            wings had changed colour and recorded what that meant.
          </p>
        </>
      ) : null}

      <h2>Where things live</h2>
      <ul>
        <li>
          <code>packages/owl/artwork/</code> holds the drawings, and{" "}
          <code>inks.ts</code> maps every colour they are drawn in to a palette
          role
        </li>
        <li>
          <code>packages/owl/src/accessories.generated.ts</code> is derived,
          rebuilt by <code>build</code>, and never edited by hand
        </li>
        <li>
          <code>packages/owl/src/accessories.ts</code> holds{" "}
          <code>SLOT_PRESENCE</code>, which sets how often each slot is filled
        </li>
      </ul>
      <p>
        Running it yourself is <code>bun scripts/owl-accessory.ts --all</code>{" "}
        from <code>packages/owl</code>. <code>--all --check</code> runs in CI and
        fails when the generated file disagrees with the folder. The{" "}
        <Link to="/avatars">contact sheet</Link> is worth a look before shipping
        anything.
      </p>
    </article>
  );
}
