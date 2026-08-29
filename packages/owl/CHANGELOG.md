# @gryt/owl

## 0.6.0

### Minor Changes

- 0a3c9e3: Adds the eggs: a generated image for something that is not a person.

  `eggAvatarSvg`, `eggAvatarDataUri` and `eggAvatarColour` take a string and return
  one, two or three patterned eggs on a field. Same seeds and same rng as the owls,
  and the field is the owl palette's own `background` rather than a colour chosen
  to sit near it, so the two share a colour system rather than resembling one.

  The intended use is a group chat that has no picture uploaded. These were written
  for server icons and server icons are getting their own generator instead, so
  nothing here is named for servers.

  The patterns are forty tiles from pattern.monster (MIT, credited in the generated
  file and the README), curated down to surfaces — grids, hatches, waves, contours,
  speckles, scales, tessellations. `zoom` crops the arrangement: past about 1.5 the
  eggs run off the tile, which is what stops three of them reading as a nest.

  Nothing that already existed moved. No owl changes.

## 0.5.0

### Minor Changes

- 6c18ef4: Thirteen more cosmetics, and every drawing redrawn in one palette.

  New: three top hats, two bow-tie head pieces, a large bucket hat, over-ear
  headphones, and five expressions — hollow, small, sleeping, no-sleep and star.

  All fifty drawings now use `realPalette` and nothing else, so `artwork/inks.ts`
  needs no entry for any of them: every colour is definitionally its own role.
  `artwork/_palette.svg` is that swatch, named and importable.

  Accessory keys are unchanged and the thirteen new ones append.

  The two headsets were the same three paths and rendered identically. They are
  meant to differ by where the band sits, and now do: `hat-headset` goes behind
  the ear tufts, `hat-headset-overears` over them. Anyone wearing the first one
  looks different.

  A palette name nothing recognises used to produce `#d062NaN` — a string that is
  not a colour and that every renderer ignores. `owlPalette` refuses it and names
  the ten there are; `owlAvatarSvg` falls back to the seed's own palette, because
  drawing an owl is not a place to throw. The drawing guide had been asking for
  `plum` for months, so one of its three previews painted an owl in nothing.

## 0.4.0

### Minor Changes

- 04ac872: `OwlOptions.tint` paints one slot's accessory from a different palette, so an
  owl's hat need not be the same colours as the owl.

  Per slot rather than per part. "The hat" is a thing somebody can point at; "the
  second darkest tone in the hat" is not, and letting people set that is how you
  get an owl that is all hot pink except the beak. A slot picks one of the ten
  palettes and the drawing's accessory roles resolve from it, so every choice is a
  ramp somebody drew rather than a colour somebody mixed.

  The tint takes the owl's own scheme rather than bringing one. A day owl in a
  night hat reads as a hole in the picture rather than as a colour.

  The worn string grows five fields, one per slot, **appended**. `decodeWorn` has
  always read positionally for exactly this reason: a string written before the
  field existed still decodes, and decodes to no tint. An unknown palette key
  reads as no tint, the same rule an unknown accessory key already gets.

  Nothing existing moves. An untinted owl renders byte-identically and the three
  pinned hashes did not change.

### Patch Changes

- d11a52c: A colour written `#6cdac8ff` or `rgb(108, 218, 200)` is now the same colour as
  `#6cdac8`.

  Everything downstream compares colours as strings. The extractor decides "this
  arm is painted the background, so the drawing means to drop it" with an exact
  match, and the ink table is keyed on hex — so a drawing tool that spells a
  colour the other way produced a cosmetic that quietly did the wrong thing.

  Quietly is the problem. A wing whose colour matched nothing fell through to
  "could not place this", which drops the path and adds a warning, so the arm was
  neither hidden nor recoloured, the bird's own wing drew, and the run succeeded.
  Coats and jackets stopped dropping their arms with a warning line as the only
  sign.

  `#rgb`, `rgb()` and `rgba()` fold to six-digit hex; an eight-digit hex folds
  when its alpha is `ff`. A real alpha is left exactly as it was — `#6cdac880` is
  a translucent colour and genuinely is not the background, and flattening it
  would trade a silent miss for a silent lie.

  When a bird part still cannot be placed, the message now names the part and, for
  an arm, the exact colour to paint it.

  All 37 shipped cosmetics regenerate byte-identically. No avatar moves.

## 0.3.0

### Minor Changes

- 93dfe88: Adds `npx @gryt/owl check <file.svg>`, so a drawing can be checked without
  cloning the repository. It reports whether the filename gives the drawing a
  slot, whether it is on the 1024 frame, whether the transforms are flattened,
  how much of the bird it found, what is left after the subtraction, and which
  colours have no palette role. It writes nothing and exits non-zero when the
  drawing would not build.

  The CLI is built by a config of its own rather than as a second entry on the
  main one. A second entry makes rollup hoist the shared half into a chunk, which
  took `dist/index.js` from 86kB to 13kB and two `import` statements — the package
  would have quietly stopped being the one self-contained file it says it is.
  `scripts/check-dist-shape.ts` runs after the build and now fails on it.

  `extract`, `filename`, `svg-shapes` and `svg-simplify` moved from `scripts/lib/`
  to `src/lib/` so the CLI can reach them. The ink table did not: it is this
  repository's drawings rather than package data, and `scripts/authoring.ts` joins
  the two for the docs app's upload checker. Generated accessory output is
  byte-identical.

## 0.2.0

### Minor Changes

- 481dd0f: Every accessory has a permanent two-letter key, and a worn look encodes to a sixteen-character string.

  `encodeWorn` and `decodeWorn` turn what somebody is wearing into `aiasbd----aaabab` and back. Two characters per field, eight fields, fixed width and fixed order, so it can travel beside a nickname and be diagnosed by looking at it. `--` is a slot deliberately left empty, which is a different thing from a field that is absent.

  The keys come from `artwork/keys.json`, a ledger the generator only ever adds to. That matters more than it sounds: the obvious encoding is "third hat in the slot", and under it, dropping `hat_apple.svg` into `artwork/` re-sorts the folder and shifts every hat after it — quietly re-dressing everybody who had saved a look. A deleted drawing keeps its entry so its key is never handed to something else, and a drawing that comes back gets the key it had before.

  Decoding is forgiving about content and about length, and strict about shape. Fields are read positionally for as many as are present: trailing ones this build does not know about are ignored, and ones it expects and does not find are left unset. That is what makes adding a sixth slot survivable — under a strict-length check, the day `WORN_LENGTH` changed, every string anybody had saved would decode to null and every wardrobe would empty at once. New fields have to be appended rather than inserted, which is the same discipline the ledger runs on. A key this build has never seen — a newer accessory, a palette from a later release — reads as empty rather than failing, so one unknown hat costs that hat instead of the whole avatar. A string of the wrong length is refused outright, because that is a bug rather than a drawing that moved on.

  `ACCESSORY_SLOTS` moved from `index.ts` to `accessories.ts`. It is still exported from the package root; the move breaks an import cycle, since the codec needs the slot order and the root re-exports the codec.

  `OwlPart` names each of a pair separately: `eyeLeft`, `eyeRight`, `wingLeft`, `wingRight`, alongside the existing `eyes` and `wings` which still mean both.

  This fixes a wink coming out blank-faced. `hides` could only name the pair, so a drawing that supplied one closed eye hid both and the open one went with it. A coat that covers one arm has the same problem in the other direction.

  A bird part painted the background's colour is now recorded as hiding that part rather than as a repaint of its palette role. The two garments produced `recolour: { wing: "background" }`, which took both arms whether the drawing covered both or not; they produce `hides: ["wingLeft", "wingRight"]` instead. Same result on every palette, and it can now say one.

- a55dc06: Accessories are configured by their filename, and adding one no longer moves people who do not get it.

  `artwork/accessories.json` is gone. A drawing's slot comes from a word in its filename — `Winter_Hat.svg` is a hat — with dot-tags for the rest: `.rare`, `.covers-head`, `.over-face`, an explicit slot, or a leading underscore to keep a file out of the registry. Colours come from `artwork/inks.ts`, one table for every drawing rather than a copy per drawing, so a new accessory in colours already in use needs no configuration at all. A word or a colour the script does not know stops the run and says what to add.

  How often a slot is filled is now set directly, in `SLOT_PRESENCE`, and weights are sized to hit it. Before, the rate was a side effect of how many drawings were in the slot: eight pairs of glasses had put eyewear on 38% of owls, and a ninth would have pushed it higher with nobody choosing that.

  Accessories are also drawn per candidate rather than along one shared range, so adding a drawing can only take owls from the others. Adding one used to change 28.6% of owls while 8.7% wore the new thing — a fifth of everyone reshuffled for nothing, on every addition. It is 4.4% now, all of it the slot holding its rate steady.

  **This moves existing avatars once.** Roughly three quarters of seeds resolve to a different owl, because both the weights and the draw changed. The three pinned hashes in `owl.test.ts` were regenerated, which is the only time they have been. Nothing after this moves anyone who does not get the new accessory.

  `SLOT_PRESENCE` is exported alongside `EMPTY_WEIGHT`, which is now a flat constant and no longer a knob.

## 0.1.0

### Minor Changes

- 6a7255d: First published release. Gryt's owl avatars: give it a name, get an SVG.

  One drawn character rather than a face generator. The body, the wings, the face
  plate and the beak never vary, in shape or in size — every number is a constant
  off a 1024 artboard. What the seed picks is the palette, the ear tufts, and what
  the bird is wearing.

  Seventeen accessories across five slots, each one a drawing rather than hand-written
  path data: the bird is exported to draw on, the drawing goes back into `artwork/`,
  and `scripts/owl-accessory.ts` subtracts the bird out again to regenerate the
  registry. `--all --check` fails when what is committed disagrees with the drawings.

  The same seed draws the same owl on every client, and it has to keep doing so:
  no `Math.random`, no `Date`, no `Intl`, no DOM, and the tsconfig drops the DOM
  lib so a helper cannot reach for `document` and crash on a phone. Three seeds are
  pinned in the tests against their exact output.

  Palettes are built from `TILE_HUES`, the list a voice tile's tint snaps to, so an
  avatar's colour and its tile's colour are the same colour rather than neighbours.

  This replaces DiceBear Moods for people in the Gryt client and the mobile app.
  Server icons are still DiceBear Planets.
