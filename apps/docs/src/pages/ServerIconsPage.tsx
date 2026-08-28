import {
  EGG_PATTERNS,
  PALETTE_NAMES,
  PALETTE_SCHEMES,
  eggAvatarDataUri,
  eggPalette,
  resolveEggs,
  type EggOptions
} from "@gryt/owl";
import { Avatar } from "@gryt/ui";
import { useMemo } from "react";
import { CodeBlock } from "../components/CodeBlock";

const uiCode = `import { Avatar } from "@gryt/ui";

// The corner is the theme's, in pixels. Avatar clips; the drawing is square.
<Avatar serverSeed={server.name} className="rounded-(--gryt-radius-md)" />`;

const rawCode = `import { eggAvatarDataUri, eggAvatarColour } from "@gryt/owl";

const src = eggAvatarDataUri(server.name);
const tint = eggAvatarColour(server.name); // "#1c2f3d"`;

const zoomCode = `eggAvatarSvg(server.name, { zoom: 1.6 });`;

/** How many icons the sheet draws, and how many the tally counts. */
const SHEET = 72;
const SAMPLE = 3000;

/**
 * Stable seeds rather than random ones, for the same reason the avatars page
 * uses them: a contact sheet is for checking the mix, and the mix has to be the
 * same every time somebody looks at it.
 */
const sheetSeeds = Array.from({ length: SHEET }, (_, i) => `server-${i}`);
const sampleSeeds = Array.from({ length: SAMPLE }, (_, i) => `sample-${i}`);

/**
 * One icon, in the container the client puts it in.
 *
 * `Avatar` with `rounded-(--gryt-radius-md)`, which is what sidebar.tsx renders
 * — so the corner on this page is the theme's radius in pixels and follows the
 * theme picker, rather than a fraction of the drawing baked into the SVG.
 *
 * `serverSeed` covers the seeded case. Anything this page wants to fix — a
 * palette, a single pattern, a zoom — is drawn directly instead, since those
 * are illustrations rather than the thing the client does.
 */
function Egg({
  seed,
  options,
  size = 56,
  label
}: {
  seed: string;
  options?: EggOptions;
  size?: number;
  label?: string;
}) {
  const box = { width: size, height: size };

  if (!options) {
    return (
      <Avatar
        alt={label ?? seed}
        className="rounded-(--gryt-radius-md)"
        serverSeed={seed}
        style={box}
      />
    );
  }

  return (
    <span
      className="inline-flex overflow-hidden rounded-(--gryt-radius-md) align-middle"
      style={box}
    >
      <img
        alt={label ?? seed}
        height={size}
        src={eggAvatarDataUri(seed, { size, ...options })}
        width={size}
      />
    </span>
  );
}

export function ServerIconsPage() {
  /* Counted from the generator rather than written down, so the numbers here
     cannot drift from the weights they describe. `resolveEggs` picks without
     drawing, which is what makes three thousand of them cheap. */
  const tally = useMemo(() => {
    const counts = new Map<string, number>();
    const arrangements = new Map<number, number>();
    let bareEggs = 0;
    let eggs = 0;
    let bareFields = 0;
    let mixed = 0;

    for (const seed of sampleSeeds) {
      const c = resolveEggs(seed);
      arrangements.set(c.count, (arrangements.get(c.count) ?? 0) + 1);
      if (!c.field.pattern) bareFields += 1;
      if (c.eggs.some((e) => e.hue !== c.paletteName)) mixed += 1;
      for (const egg of c.eggs) {
        eggs += 1;
        if (!egg.pattern) bareEggs += 1;
        else
          counts.set(egg.pattern.name, (counts.get(egg.pattern.name) ?? 0) + 1);
      }
    }

    return { counts, arrangements, bareEggs, eggs, bareFields, mixed };
  }, []);

  const pct = (n: number, of = SAMPLE) => `${((n / of) * 100).toFixed(1)}%`;

  return (
    <article className="prose prose-invert max-w-[68ch] prose-headings:font-display prose-headings:tracking-[-0.022em] prose-h1:text-[length:var(--text-2xl)] prose-h2:mt-(--space-xl) prose-h2:text-[length:var(--text-lg)] prose-p:text-gryt-muted prose-p:leading-7">
      <h1>Server icons</h1>
      <p className="lead text-[length:var(--text-md)]">
        Give <code>@gryt/owl</code> a server's name and it returns an SVG of
        eggs. A server is not a person and should not be drawn as one, so it is
        not an owl: an owl is one character wearing things, and an icon here is
        a shape with a surface. Every icon on this page is drawn by the library
        as you read it.
      </p>

      <h2>Using it</h2>
      <p>
        Seeded on the name rather than the address, so renaming a server changes
        its icon and a server that has not been reached yet still has one to
        draw. A server that has uploaded an icon never gets here.
      </p>
      <CodeBlock code={uiCode} language="tsx" />
      <p>
        The corner comes from the container. <code>Avatar</code> clips to
        whatever radius its class sets and the drawing is square, so a rail
        asking for <code>--gryt-radius-md</code> gets the theme's twelve pixels
        — not a fraction of the box, which would be a different corner at every
        size. Every icon on this page is drawn that way, so the theme picker
        above changes them.
      </p>
      <p>Without React, or anywhere the markup is wanted directly:</p>
      <CodeBlock code={rawCode} language="ts" />

      <h2>What a seed picks</h2>
      <p>
        The arrangement first: one, two or three eggs. Then a pattern and an
        angle for each, a texture for the field behind them, and how close the
        tile crops in. The eggs are drawn back to front in the order they were
        painted, deep then mid then light, which is what makes an arrangement of
        three read as three objects rather than one shape.
      </p>
      <ul className="not-prose my-(--space-md) grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-(--space-xs) p-0">
        {sheetSeeds.map((seed) => (
          <li className="list-none" key={seed}>
            <Egg seed={seed} size={72} />
          </li>
        ))}
      </ul>
      <p>
        {pct(tally.arrangements.get(1) ?? 0)} of servers get one egg,{" "}
        {pct(tally.arrangements.get(2) ?? 0)} get two and{" "}
        {pct(tally.arrangements.get(3) ?? 0)} get three, counted over{" "}
        {SAMPLE.toLocaleString("en")} seeds on this page. An egg comes up bare{" "}
        {pct(tally.bareEggs, tally.eggs)} of the time — a plain egg beside two
        patterned ones is a rest — and the field is bare {pct(tally.bareFields)}{" "}
        of the time, because a texture under every icon is a hum rather than a
        detail.
      </p>
      <p>
        {pct(tally.mixed)} of icons take one egg's tone from another hue. Never
        the egg at the back: that is the one the icon is read as, and letting it
        wander would make the field's colour and the icon's colour two different
        answers to what colour a server is.
      </p>

      <h2>It does look like Easter</h2>
      <p>
        Four things fight that, and no one of them is enough on its own. The
        palette never puts a pale egg on a pale field, which is the Easter
        signature. The tiles are surfaces rather than decorations: grids,
        hatches, waves, contours, scales. The ink sits about 22 points of
        lightness off its shell rather than 50, bounded from above in the tests
        as well as below, so "make it pop" fails the build. And one gradient
        runs across the whole arrangement, so an egg reads as a form rather than
        a flat sticker with a pattern printed on it.
      </p>
      <p>
        The fourth is the crop. Whole eggs with room around them is a nest; eggs
        running off the edge is a mark. At <code>zoom</code> 1 they are the
        drawing as painted; around 1.5 they start running off.
      </p>
      <ul className="not-prose my-(--space-md) flex flex-wrap gap-(--space-xs) p-0">
        {[1, 1.2, 1.4, 1.6, 1.8, 2].map((zoom) => (
          <li className="list-none text-center" key={zoom}>
            <Egg options={{ zoom }} seed="gryta krutt" size={88} />
            <p className="m-0 mt-1 font-mono text-[10px] text-gryt-muted">
              {zoom}
            </p>
          </li>
        ))}
      </ul>
      <CodeBlock code={zoomCode} language="ts" />
      <p>
        Left alone the seed picks between 1.05 and 1.5, so most icons crop a
        little and some crop a lot.
      </p>

      <h2>Colour</h2>
      <p>
        The field is the owl's own background: the same string{" "}
        <code>owlPalette</code> returns, not a colour picked to go with it, so a
        server rail and a member list cannot drift apart on the next edit. What
        sits on it is a ladder rather than named roles — three shells that
        separate from each other and from the field, each carrying the ink its
        pattern is drawn in.
      </p>
      <ul className="not-prose my-(--space-md) grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-(--space-xs) p-0">
        {PALETTE_NAMES.flatMap((name) =>
          PALETTE_SCHEMES.map((scheme) => (
            <li className="list-none" key={`${name}-${scheme}`}>
              <Egg
                label={`${name} ${scheme}`}
                options={{ palette: name, scheme, count: 3 }}
                seed="palette"
                size={56}
              />
            </li>
          ))
        )}
      </ul>
      <p>
        The gaps on that ladder are asserted in the package's tests at all ten
        hues, because a tweak that reads fine in violet is the one that loses
        the middle egg in gold. A day icon's shells are{" "}
        {eggPalette("teal", "day").shells.join(", ")}; a night icon's are{" "}
        {eggPalette("teal", "night").shells.join(", ")}.
      </p>

      <h2>The patterns</h2>
      <p>
        {EGG_PATTERNS.length} tiles from{" "}
        <a href="https://pattern.monster" rel="noreferrer" target="_blank">
          pattern.monster
        </a>
        , MIT licensed. Upstream ships 330; these are the ones that are
        surfaces: grids, hatches, waves, contours, speckles, scales,
        tessellations. The decorative ones are left out on purpose, because a
        zigzag band or a big spot on an egg is what a decorated egg looks like.
        Each is drawn in its egg's ink on its egg's shell, so a tile brings no
        colours of its own.
      </p>
      <ul className="not-prose my-(--space-md) grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-(--space-xs) p-0">
        {EGG_PATTERNS.map((pattern) => (
          <li className="list-none text-center" key={pattern.name}>
            <Egg
              label={pattern.name}
              options={{
                count: 1,
                patterns: [pattern.name],
                fieldPattern: null,
                palette: "teal",
                scheme: "night",
                zoom: 1
              }}
              seed="tile"
              size={76}
            />
            <p className="m-0 mt-1 truncate font-mono text-[9px] text-gryt-muted">
              {pattern.name}
            </p>
          </li>
        ))}
      </ul>
      <p>
        Adding one is a line in <code>artwork/eggs/patterns.json</code>. The
        draw is keyed on the tile's own name rather than laid out along a shared
        range, so a server that was not going to wear the new tile keeps the one
        it had — the same rule the owl accessories run on, and the reason adding
        a drawing there stopped reshuffling a fifth of everybody.
      </p>

      <h2>The same seed draws the same icon</h2>
      <p>
        Weaker than it is for an avatar and still worth holding: a server that
        has set its own icon never reaches this code, so what moves when the
        output moves is every server that has not. Nothing in the package
        depends on the platform, and three seeds are pinned in its tests against
        their exact output.
      </p>
    </article>
  );
}
