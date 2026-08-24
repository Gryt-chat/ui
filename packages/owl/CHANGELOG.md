# @gryt/owl

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
