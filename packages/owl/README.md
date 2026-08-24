# @gryt/owl

Gryt's owl avatars. Give it a name, get an SVG. No renderer, no DOM, no
dependencies.

MIT, like the rest of the UI packages, and unlike the AGPL-3.0 apps that use
them.

```sh
bun add @gryt/owl
```

## Using it

```ts
import { avatarSeed, owlAvatarDataUri } from "@gryt/owl";

const seed = avatarSeed(user.nickname); // trimmed and lower-cased
const src = owlAvatarDataUri(seed);
```

That string goes straight into an `<img src>`. React Native's `Image` cannot
decode SVG from a data URI, so there you want the markup instead:

```tsx
import { owlAvatarSvg } from "@gryt/owl";
import { SvgXml } from "react-native-svg";

<SvgXml xml={owlAvatarSvg(seed)} width={28} height={28} />;
```

Both take the same options: `size`, `background`, `cornerRadius`, `title`, and
overrides for the palette, the ear tufts and each accessory slot.

## What is in here

- `owlAvatarSvg`, `owlAvatarDataUri` — an owl, as markup or as an `<img src>`
- `owlAvatarColour` — the colour it is drawn on, as `#rrggbb`
- `avatarSeed` — the nickname rule
- `resolveOwl` — every choice a seed makes, without drawing anything
- `owlPalette`, `allOwlPalettes`, `TILE_HUES` — the thirty palettes
- `ACCESSORIES`, `accessoriesIn`, `accessoryByName` — what an owl can wear
- `OWL` — the fixed geometry, in artboard units

A bare owl is about 2.1 kB of markup, and about 4.1 kB with accessories on.

## The same seed draws the same owl

That has to hold on every client and across upgrades. A person is recognised by
their avatar, so an owl that shifts when the library is bumped has failed at the
one job it has.

Two consequences that look like fussiness:

- Every random draw is keyed on a channel name, so adding a part does not
  reshuffle the parts that were already there.
- Nothing depends on the platform. No `Math.random`, no `Date`, no `Intl`, no
  DOM. The tsconfig here drops the DOM lib on purpose, so reaching for
  `document` is a compile error rather than a crash on somebody's phone.

Three seeds are pinned in the tests against their exact output. When one of them
fails, work out whether every existing user is about to look different before
you touch the expected value.

## One drawn character

The body, the wings, the face plate and the beak never vary, in shape or in
size. Every number is a constant off the 1024 artboard, in `metrics.ts`. What
the seed picks is the palette, the ear tufts, and what the bird is wearing.

This is why it is not a DiceBear style and does not plug into one. DiceBear's
model is a style definition of interchangeable sprite layers, which suits a face
generator and does not suit this: a member list drawn that way looks like a
sticker sheet rather than like one product.

Fixed geometry is also what makes the accessories work. A drawing is pinned to
absolute artboard coordinates, so a pair of glasses lands on the eyes because
that is where the eyes are, on every owl.

## Colour

Thirty palettes: ten hues in three schemes, `night`, `day` and `dusk`. The hues
come from `TILE_HUES`, the list a voice tile's tint snaps to, so an avatar's
colour and its tile's colour are the same colour rather than neighbours.

An accessory names a colour role instead of carrying a hex, so a teal owl and a
pink owl wear the same hat in their own colours.

## Accessories are drawings

Five slots — `expression`, `eyewear`, `head`, `neck`, `body` — one accessory
each, rolled independently, so a hat and glasses and a scarf can all turn up at
once. A slot can also come up empty. An owl with no expression still has eyes:
the ones the bird is drawn with.

Adding one does not involve writing any path data. The bird is exported to draw
on, the drawing goes back into `artwork/` with a line in `accessories.json`, and
the extractor subtracts the bird out again:

```sh
bun scripts/owl-accessory.ts --base   # the bare bird, to draw on
bun scripts/owl-accessory.ts --all    # regenerate the registry
```

`src/accessories.generated.ts` is derived from the drawings and is rebuilt by
`build`. `--all --check` fails when what is committed disagrees with `artwork/`.

## Who uses it

- `@gryt/ui`'s `Avatar` generates one when it has a `seed` and no `src`.
- `@gryt/ui-native`'s does the same through `react-native-svg`.
- The Gryt web client and mobile app draw people from it. Server icons are
  still DiceBear Planets, because a server is not a person and should not be
  drawn as one.
