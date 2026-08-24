import {
  ACCESSORIES,
  ACCESSORY_SLOTS,
  EMPTY_WEIGHT,
  PALETTE_NAMES,
  PALETTE_SCHEMES,
  accessoriesIn,
  owlAvatarDataUri,
  resolveOwl,
  type AccessorySlot
} from "@gryt/owl";
import { useMemo } from "react";
import { CodeBlock } from "../components/CodeBlock";

const webCode = `import { Avatar, avatarSeed } from "@gryt/ui";

<Avatar seed={avatarSeed(member.nickname)} alt={member.nickname} />`;

const nativeCode = `import { Avatar } from "@gryt/ui-native";
import { avatarSeed } from "@gryt/owl";

<Avatar seed={avatarSeed(member.nickname)} name={member.nickname} />`;

const rawCode = `import { owlAvatarSvg, owlAvatarColour } from "@gryt/owl";

const svg = owlAvatarSvg("sivert");
const tint = owlAvatarColour("sivert"); // "#6cdac8"`;

/** How many owls the sheet draws, and how many the tally counts. */
const SHEET = 96;
const SAMPLE = 3000;

/**
 * Stable seeds rather than random ones.
 *
 * A contact sheet is for checking that the mix looks right, which means the
 * mix has to be the same every time somebody looks. `owl-0` and its
 * neighbours have no meaning beyond being 96 different strings.
 */
const sheetSeeds = Array.from({ length: SHEET }, (_, i) => `owl-${i}`);
const sampleSeeds = Array.from({ length: SAMPLE }, (_, i) => `sample-${i}`);

/** Every slot emptied, so an accessory can be shown on its own. */
function only(slot: AccessorySlot, name: string) {
  const wearing: Partial<Record<AccessorySlot, string | null>> = {};
  for (const s of ACCESSORY_SLOTS) wearing[s] = null;
  wearing[slot] = name;
  return wearing;
}

function Owl({
  seed,
  options,
  size = 56,
  label
}: {
  seed: string;
  options?: Parameters<typeof owlAvatarDataUri>[1];
  size?: number;
  label?: string;
}) {
  return (
    <img
      alt={label ?? seed}
      className="block h-full w-full object-cover"
      height={size}
      src={owlAvatarDataUri(seed, { size, ...options })}
      width={size}
    />
  );
}

export function AvatarsPage() {
  /* Counted from the generator rather than written down, so the numbers on this
     page cannot drift from the weights above them. `resolveOwl` picks without
     drawing, which is what makes three thousand of them cheap. */
  const tally = useMemo(() => {
    const counts = new Map<string, number>();
    const empty = new Map<AccessorySlot, number>();

    for (const slot of ACCESSORY_SLOTS) empty.set(slot, 0);

    for (const seed of sampleSeeds) {
      const { wearing } = resolveOwl(seed);
      for (const slot of ACCESSORY_SLOTS) {
        const worn = wearing[slot];
        if (!worn) empty.set(slot, empty.get(slot)! + 1);
        else counts.set(worn, (counts.get(worn) ?? 0) + 1);
      }
    }

    return { counts, empty };
  }, []);

  const percent = (n: number) => `${((n / SAMPLE) * 100).toFixed(1)}%`;

  return (
    <article className="prose prose-invert max-w-[68ch] prose-headings:font-display prose-headings:tracking-[-0.022em] prose-h1:text-[length:var(--text-2xl)] prose-h2:mt-(--space-xl) prose-h2:text-[length:var(--text-lg)] prose-p:text-gryt-muted prose-p:leading-7">
      <h1>Avatars</h1>
      <p className="lead text-[length:var(--text-md)]">
        Give <code>@gryt/owl</code> a name and it returns an SVG. One drawn
        character rather than a face generator: the body, the wings, the face
        plate and the beak never vary, and the seed picks the colour, the ear
        tufts and what the bird is wearing. Every owl on this page is drawn by
        the library as you read it.
      </p>

      <h2>Using it</h2>
      <p>
        <code>Avatar</code> takes a <code>seed</code> and draws that person's owl
        when there is no uploaded image. Pass <code>avatarSeed(nickname)</code>{" "}
        rather than the nickname: the two differ for anyone whose name is not
        already lower case, and an avatar drawn from one seed beside a voice tile
        tinted from the other is the bug that rule exists to prevent.
      </p>
      <CodeBlock code={webCode} language="tsx" />
      <p>
        React Native's <code>Image</code> cannot decode SVG, so{" "}
        <code>@gryt/ui-native</code> hands the markup to <code>SvgXml</code>{" "}
        instead. The prop and the seed are the same, and so is the owl.
      </p>
      <CodeBlock code={nativeCode} language="tsx" />
      <p>
        The package works on its own too, with no renderer attached. It has no
        dependencies and never touches a DOM.
      </p>
      <CodeBlock code={rawCode} language="ts" />

      <h2>{SHEET} owls</h2>
      <p>
        Fixed seeds, so this sheet is the same every time it is opened and two
        people can talk about the same row. An accessory that turns up in half
        the grid is over-weighted, however good the drawing is.
      </p>
      <ul className="not-prose m-0 grid list-none grid-cols-6 gap-2 p-0 sm:grid-cols-8 lg:grid-cols-12">
        {sheetSeeds.map((seed) => (
          <li
            key={seed}
            className="aspect-square overflow-hidden rounded-(--gryt-radius-full) ring-1 ring-gryt-border"
          >
            <Owl seed={seed} />
          </li>
        ))}
      </ul>

      <h2>Colour</h2>
      <p>
        Ten hues in three schemes. The hues come from <code>TILE_HUES</code>, the
        list a voice tile's tint snaps to, so an avatar's colour and its tile's
        colour are the same colour rather than neighbours. The same seed is
        drawn below in each of the thirty.
      </p>
      {PALETTE_SCHEMES.map((scheme) => (
        <section key={scheme} className="not-prose mt-(--space-md)">
          <h3 className="m-0 pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
            {scheme}
          </h3>
          <ul className="m-0 grid list-none grid-cols-5 gap-2 p-0 lg:grid-cols-10">
            {PALETTE_NAMES.map((name) => (
              <li key={name} className="min-w-0">
                <div className="aspect-square overflow-hidden rounded-(--gryt-radius-md) ring-1 ring-gryt-border">
                  <Owl
                    label={`${name} ${scheme}`}
                    options={{ palette: name, scheme }}
                    seed="gryt"
                  />
                </div>
                <p className="m-0 truncate pt-1 text-center font-mono text-[10px] text-gryt-muted">
                  {name}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2>Accessories</h2>
      <p>
        Five slots, one accessory each, rolled independently — so a hat and
        glasses and a scarf can all turn up at once, and two hats never can. A
        slot can also come up empty, and an owl with no expression still has
        eyes: the ones the bird is drawn with.
      </p>
      <p>
        Each one is an SVG drawing on the owl's own 1024 frame, so nobody writes
        path data by hand. Everything below is read from{" "}
        <code>ACCESSORIES</code>, so this page cannot drift from the library.
      </p>
      {ACCESSORY_SLOTS.map((slot) => {
        const worn = accessoriesIn(slot);
        return (
          <section key={slot} className="not-prose mt-(--space-lg)">
            <h3 className="m-0 flex items-baseline justify-between pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
              <span>{slot}</span>
              <span className="font-mono normal-case tracking-normal">
                empty {EMPTY_WEIGHT[slot]} · {percent(tally.empty.get(slot) ?? 0)}
              </span>
            </h3>
            <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:grid-cols-4 lg:grid-cols-6">
              {worn.map((accessory) => (
                <li key={accessory.name} className="min-w-0">
                  <div className="aspect-square overflow-hidden rounded-(--gryt-radius-md) ring-1 ring-gryt-border">
                    <Owl
                      label={accessory.name}
                      options={{ wearing: only(slot, accessory.name) }}
                      seed="gryt"
                    />
                  </div>
                  <p
                    className="m-0 truncate pt-1 text-center text-[11px] text-gryt-text"
                    title={accessory.name}
                  >
                    {accessory.name}
                  </p>
                  <p className="m-0 text-center font-mono text-[10px] text-gryt-muted">
                    {accessory.weight} · {percent(tally.counts.get(accessory.name) ?? 0)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <h2>How often each one turns up</h2>
      <p>
        The percentages above are counted over {SAMPLE.toLocaleString("en")}{" "}
        seeds, drawn by the library on this page rather than measured once and
        written down. A weight is a share of its slot, set against the other
        accessories in it and against the slot's own chance of coming up empty.
        Eight pairs of glasses in one slot each get a smaller share than one
        scarf in another, and counting is the only way to see what that adds up
        to.
      </p>
      <p>
        {ACCESSORIES.length} accessories today. An owl with a coat has no scarf:
        the two exclude each other, which the tally sees and the weights on their
        own do not.
      </p>

      <h2>The same seed draws the same owl</h2>
      <p>
        That has to hold on every client and across upgrades. A person is
        recognised by their avatar, so an owl that shifts when the library is
        bumped has failed at the one job it has. Nothing in the package depends
        on the platform: no <code>Math.random</code>, no <code>Date</code>, no{" "}
        <code>Intl</code>, no DOM. Three seeds are pinned in its tests against
        their exact output.
      </p>
      <p>
        The bird's geometry is fixed for the same reason accessories can be
        drawings: a pair of glasses is pinned to absolute coordinates, and it
        lands on the eyes because that is where the eyes are, on every owl.
      </p>
    </article>
  );
}
