import {
  ACCESSORIES,
  OWL_BASE,
  accessoryByName,
  owlAvatarDataUri,
  owlAvatarSvg
} from "@gryt/owl";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { CodeBlock } from "../components/CodeBlock";

/* The example runs through the winter jacket because it is the hardest one in
   the folder: eighteen paths, four tones, and it repaints the wings away. An
   example that only worked for a bow tie would leave the interesting half out. */
const EXAMPLE = "shirt-jacket-winter";

function Owl({
  seed,
  wearing,
  size = 160,
  label,
  ownPalette = false
}: {
  seed: string;
  wearing?: Record<string, string | null>;
  size?: number;
  label: string;
  /* Let the seed choose its own colours. Off by default, because the first two
     panels are the bird as you draw on it, and that is one specific palette. */
  ownPalette?: boolean;
}) {
  const { palette, scheme, ...rest } = OWL_BASE;
  const base = ownPalette ? rest : OWL_BASE;

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

function Panel({
  caption,
  children
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="m-0 flex flex-col gap-(--space-sm)">
      <div className="overflow-hidden rounded-(--radius-md) bg-gryt-surface">{children}</div>
      <figcaption className="m-0 text-center text-[11px] text-gryt-muted">{caption}</figcaption>
    </figure>
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
        or measuring anything.
      </p>

      <h2>Start from the bird</h2>
      <p>
        Open this in whatever you draw in. It is the exact bird the script
        subtracts, on a 1024 x 1024 frame.
      </p>
      <p>
        <a
          className="inline-block rounded-(--radius-md) bg-gryt-accent px-(--space-md) py-(--space-sm) text-gryt-on-accent no-underline"
          download="owl-base.svg"
          href={baseHref}
        >
          Download owl-base.svg
        </a>
      </p>
      <p>
        Do not move it, resize it, or redraw any part of it. The script finds the
        bird in your file by shape, and a nudged path is one it cannot find. Its
        colours are only there to draw against — the subtraction ignores colour
        except where you changed it deliberately.
      </p>

      <h2>Draw</h2>
      <ul>
        <li>
          Stay on the 1024 frame. Everything is positioned absolutely, so where
          you put it is where it lands.
        </li>
        <li>
          Flatten your transforms before exporting. A <code>{"<g transform>"}</code>{" "}
          around a layer stops the build rather than being applied, because an
          accessory that is silently offset is worse than one that fails.
        </li>
        <li>
          To take a part of the bird away, paint it out rather than deleting it.
          A coat paints the wings in the background colour and the script records
          that as a repaint, so it still works on all thirty palettes.
        </li>
      </ul>

      <h2>Name the file</h2>
      <p>
        The filename is the configuration. There is no manifest to edit, and the
        shape is <code>type_family_variant.svg</code>: underscores between the
        three fields, hyphens inside one of them.
      </p>
      <div className="not-prose overflow-x-auto">
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
              ["sporran_dress.neck.svg", "a type the script has not been taught"],
              ["_hat_winter_old.svg", "kept in the folder, left out of the registry"]
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
        The type decides the slot. A type the script does not know stops the run
        and prints the ones it does, because a scarf worn as a hat is not
        something anyone notices from a diff.
      </p>
      <p>
        Variants of one thing share a family. A family competes for its slot as
        one thing and its variants split whatever it wins, so six colourways of
        round glasses stay as likely to turn up as a pair drawn once. Without
        that they would be six times as likely, and drawing variants would
        quietly bury everything that only exists in one.
      </p>

      <h2>Use colours it already knows</h2>
      <p>
        An accessory is drawn in ordinary colours and repainted per owl, so each
        colour has to map to a palette role. <code>artwork/inks.ts</code> is that
        map, and it is one table for every drawing rather than one per drawing.
        Draw in colours already in there and you write no configuration at all.
      </p>
      <p>
        A colour it has not seen stops the run and prints the line to add. It
        will not guess: the role is which rung of the palette you meant, and the
        hex value on its own does not say.
      </p>

      <h2>Run it</h2>
      <CodeBlock
        code={`cd packages/owl
bun scripts/owl-accessory.ts --all`}
        language="sh"
      />
      <p>
        That reads every drawing in <code>artwork/</code> and rewrites{" "}
        <code>src/accessories.generated.ts</code>. Commit both. Look at the{" "}
        <Link to="/avatars">contact sheet</Link> before you ship it.
      </p>

      <h2>The winter jacket, end to end</h2>
      <p>
        The hardest one in the folder: eighteen paths, four tones, and it takes
        the wings off.
      </p>
      <div className="not-prose grid grid-cols-1 gap-(--space-md) sm:grid-cols-3">
        <Panel caption="1. the bird you download">
          <Owl label="The bare owl" seed="example" />
        </Panel>
        <Panel caption="2. saved as shirt_jacket_winter.svg">
          <Owl label="An owl in the winter jacket" seed="example" wearing={{ body: EXAMPLE }} />
        </Panel>
        <Panel caption="3. the same drawing, another palette">
          <Owl
            label="The same jacket on a different palette"
            ownPalette
            seed="ingy"
            wearing={{ body: EXAMPLE }}
          />
        </Panel>
      </div>
      <p>
        The drawing was made in one palette and is worn in all thirty, because
        what was recorded is which role each colour is rather than the colour
        itself.
      </p>
      {example ? (
        <>
          <p>What the script wrote for it:</p>
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

      <h2>When it refuses</h2>
      <p>Three things stop the run, and each prints what to do about it.</p>
      <CodeBlock
        code={`sporran_dress.svg: "sporran" is not a type this knows, so there is
no slot to put it in.
  Types:
    expression  eyes, expression, smile, frown, wink, blink
    eyewear     glasses, spectacles, shades, goggles, monocle, visor
    head        hat, cap, beanie, crown, helmet, headset, flower, halo
    neck        scarf, bowtie, tie, necklace, collar, bandana, cravat
    body        shirt, jacket, coat, hoodie, sweater, vest, dress, cape
  Or name the slot yourself, e.g. sporran_dress.head.svg`}
        language="text"
      />
      <CodeBlock
        code={`1 colour(s) are not in artwork/inks.ts.

Add them, with the role each one should be repainted as:

  "#ff00aa": "trim",   // cravat-fancy`}
        language="text"
      />
      <CodeBlock
        code={`glasses_round.svg has a <g transform=...> in it. Flatten the
transforms in the drawing tool and export again.`}
        language="text"
      />

      <h2>Where things live</h2>
      <ul>
        <li>
          <code>packages/owl/artwork/</code> holds the drawings, and{" "}
          <code>inks.ts</code>
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
        {ACCESSORIES.length} accessories are in the registry today.{" "}
        <code>--all --check</code> runs in CI and fails when the generated file
        disagrees with the folder.
      </p>
    </article>
  );
}
