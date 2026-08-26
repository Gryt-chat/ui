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

Adding one does not involve writing any path data, or a manifest. Export the
bird, draw on it, save the result into `artwork/` under a name that says what it
is, and run the script:

```sh
bun scripts/owl-accessory.ts --base   # the bare bird, to draw on
bun scripts/owl-accessory.ts --all    # regenerate the registry
```

`--base` writes the bird as a group called `owl` with a layer per part: `Left
Eye`, `Right Arm`, `Nose`. Draw on top of it and hide whatever you draw over.
Which layers are missing on the way back in is which parts the accessory
replaces, so a wink is one hidden eye and a coat is two hidden arms. Where the
drawing sits relative to the group says whether it is worn over the bird or
behind it.

Export with layer names on — `Include id attribute` in Figma. Without them the
bird has to be recognised by its geometry, which holds only while the drawing
sits on a bird nobody has nudged.

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
- The Gryt web client and mobile app draw people from it. Server icons are
  still DiceBear Planets, because a server is not a person and should not be
  drawn as one.
