# @gryt/owl

Gryt's owl avatars, and its egg icons for servers. Give it a name, get an SVG.
No renderer, no DOM, no dependencies.

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
- `eggAvatarSvg`, `eggAvatarDataUri`, `eggAvatarColour` — a server's icon
- `resolveEggs`, `eggPalette`, `EGG_PATTERNS` — the same three for the eggs

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

Adding one does not involve writing any path data, or a manifest. Export the
bird, draw on it, save the result into `artwork/` under a name that says what it
is, and run the script:

```sh
bun scripts/owl-accessory.ts --base   # the bare bird, to draw on
bun scripts/owl-accessory.ts --all    # regenerate the registry
```

Most of these were drawn in Figma, against
[Build A Gryt](https://www.figma.com/community/file/1674379263156144233), which
carries the bird as a component and a walkthrough. `--base` writes the same bird
as an SVG for anyone not in Figma: a group called `owl` with a layer per part,
`Left Eye`, `Right Arm`, `Nose`. Draw on top of it and hide whatever you draw over.
Which layers are missing on the way back in is which parts the accessory
replaces, so a wink is one hidden eye and a coat is two hidden arms. Where the
drawing sits relative to the group says whether it is worn over the bird or
behind it.

Export with layer names on — `Include id attribute` in Figma. With them, the
group is read by name and nothing done inside it can break the extraction; only
what you draw outside it travels, so a bird you rearranged shows up in the
drawing tool and nowhere else. Without them the bird has to be recognised by its
geometry, which holds only while the drawing sits on a bird nobody has nudged.

The filename is the configuration. A word in it says which slot the drawing
belongs in — `Winter_Hat.svg` is a hat, `Heart_Glasses.svg` is eyewear — and
optional dot-tags cover the rest:

| | |
|---|---|
| `Cravat.neck.svg` | a slot, for a word the script has not been taught |
| `Heart_Glasses.rare.svg` | seen less often than the rest of its slot |
| `Hoodie.covers-head.svg` | cannot be worn with a hat |
| `Round_Glasses.over-face.svg` | drawn as holes, so the eyes show through |
| `Hollow_Eyes.over-eyes.svg` | drawn on the eyes rather than instead of them |
| `Headset.behind.svg` | worn behind the bird, whatever the export's order says |
| `_Old_Hat.svg` | kept in the folder, left out of the registry |

A word the script does not know stops the run and says so, rather than putting
the drawing somewhere and leaving you to notice a scarf worn as a hat.

Colours are not configuration either. `artwork/inks.ts` maps the colours
accessories are drawn in to palette roles, and it is one table for all of them,
so a drawing in colours already used needs nothing at all. A new colour stops
the run and prints the line to add.

### Colouring an accessory

Accessories are painted from the owl's own palette, so a hat is normally the
same family of colours as the bird. `tint` overrides that per slot:

```ts
owlAvatarSvg("sivert", { wearing: { head: "hat-winter" }, tint: { head: "amber" } })
```

A slot is as fine as it goes. "The hat" is a thing somebody can point at; "the
second darkest tone in the hat" is not, and letting people set that is how you
get an owl that is all hot pink except the beak. A slot picks a palette and the
drawing's accessory roles resolve from it, so every choice is a ramp somebody
drew.

The tint takes the owl's own scheme. A day owl wearing a night hat reads as a
hole in the picture rather than as a colour.

How often a slot is filled is set once, in `SLOT_PRESENCE`, and the weights are
sized to hit it. Adding a ninth pair of glasses changes which glasses turn up,
not whether anyone is wearing any.

`src/accessories.generated.ts` is derived from the drawings and is rebuilt by
`build`. `--all --check` fails when what is committed disagrees with `artwork/`.

The full walkthrough, with the bird to download and a worked example, is at
**[ui.gryt.chat/avatars/drawing](https://ui.gryt.chat/avatars/drawing)**.

### Checking a drawing without cloning anything

```sh
npx @gryt/owl check my-hat.svg
```

Reads a drawing and says whether it would work: whether the filename gives it a
slot, whether it is on the 1024 frame, whether the transforms are flattened, how
many of the bird's paths it found, and what is left once the bird is subtracted
back out. Anything short of all of the bird means the drawing was moved or was
never on the base. It writes nothing, and exits non-zero when the drawing would
not build, so it can hang off a commit hook.

It looks for an `inks.ts` by walking up from the file it was given. Without one
it reports every colour as needing a role, which is also the line you would have
to add.

`bun scripts/owl-accessory.ts` does all of this and then writes the registry.
That one needs this repository checked out; this one needs Node.

## Who uses it

- `@gryt/ui`'s `Avatar` generates one when it has a `seed` and no `src`.
- `@gryt/ui-native`'s does the same through `react-native-svg`.
- The Gryt web client and mobile app draw people from it, and servers from the
  eggs.

## Eggs, for servers

A server is not a person and should not be drawn as one, which is why server
icons were never owls. They were DiceBear Planets, which was fine and was also
somebody else's drawing sitting next to Gryt's own.

```tsx
import { Avatar } from "@gryt/ui";

// The corner is the theme's, in pixels. Avatar clips; the drawing is square.
<Avatar serverSeed={server.name} className="rounded-(--gryt-radius-md)" />;
```

Or without React:

```ts
import { eggAvatarDataUri } from "@gryt/owl";

const src = eggAvatarDataUri(server.name);
```

`cornerRadius` exists and is usually the wrong answer for an icon in a themed
container. It is a fraction of the drawing, so it is a different corner at every
size; a container that clips gets the theme's radius in pixels at all of them.

Same seeds, same rules, same ten hues and three schemes. What the seed picks is
the arrangement (one, two or three eggs, drawn back to front deep, mid and
light), a pattern and an angle for each, a texture for the field behind them,
and how close the tile crops in.

The patterns are tiles from [pattern.monster](https://pattern.monster), MIT
licensed and listed in `artwork/eggs/patterns.json`. Upstream ships 330; that
file names the forty that are surfaces rather than decorations: grids, hatches,
waves, contours, speckles, scales, tessellations. `bun scripts/egg-pattern.ts`
pulls them in, and adding one is a line in that file. The draw is keyed on the
tile's own name, so a server that was not going to wear the new tile keeps the
one it had.

The field is the owl's own background, the same string `owlPalette` returns
rather than a colour chosen to go with it. On top of it sits a ladder: three
shells that separate from each other and from the field, each with the ink its
pattern is drawn in. `palette.test.ts` asserts every gap on that ladder, at all
ten hues, because a tweak that reads fine in violet is the one that loses the
middle egg in gold.

### It does look like Easter

Four things fight that, and no one of them is enough on its own:

- **No pastel on pastel.** Either the field is deep and the eggs are pale, or
  the field is bright and the eggs are deep. A soft egg on a soft field is the
  Easter signature, and the palette test refuses one.
- **Surfaces, not decorations.** The ink sits about 22 points of lightness off
  its shell rather than 50, and the test bounds that from above as well as
  below, so "make it pop" fails the build. No zigzag bands, no plaid, no
  flowers, no stars, no big spots.
- **Shading.** One gradient across the whole arrangement, so an egg reads as a
  form rather than a flat sticker with a pattern printed on it.
- **Cropping.** Whole eggs with room around them is a nest; eggs running off the
  edge is a mark. `zoom` is that dial, and the seed picks between 1.05 and 1.5.

```ts
eggAvatarSvg(server.name, { zoom: 1.6 }); // further still
eggAvatarSvg(server.name, { zoom: 1 });   // the drawing as painted
```

Still open: the shells themselves. There are three arrangements and each egg in
them is the shape it was drawn as, and varying that per seed (taller, narrower,
tilted) would help. It wants more drawings rather than a transform that squashes
the ones there are.

### The drawings

`artwork/eggs/egg_base_1.svg` through `_3.svg`, one arrangement each, on the same
1024 frame the owl uses. Each egg is one closed path tagged `id="Egg-N"`, and N
is the order it stacks in, which is also the order the shell tones are handed
out in. `bun scripts/egg-base.ts` turns them into path data;
`--check` fails when what is committed disagrees with the drawings.

## Licences

The package is MIT, like the rest of the UI packages.

The pattern tiles in `src/eggs/patterns.generated.ts` are Pattern Monster's,
used under its own MIT licence:

> Copyright (c) 2020-2023 Pattern Monster —
> [github.com/catchspider2002/svelte-svg-patterns](https://github.com/catchspider2002/svelte-svg-patterns)
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

The same notice travels in the generated file, which is what ends up in `dist`.
