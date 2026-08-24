---
"@gryt/ui": minor
---

`Avatar` takes a `seed` and draws that person's owl.

Without one it behaves as it always has: `src` if there is one, initials if
there is not. With a seed and no `src` it renders the owl from `@gryt/owl`, and
with both it keeps the owl underneath, so an uploaded avatar whose URL 404s
lands back on this person's face rather than on a letter.

The owl is a plain `<img>` in the fallback rather than a `BaseAvatar.Image`.
Base UI's Image renders nothing until the browser reports the image loaded,
which is right for a URL over the network and wrong for a data URI already in
memory — it would blank the avatar for a frame on every mount.

`avatarSeed` is re-exported here, because `seed` wants a normalised nickname and
a caller who passes the raw one gets an owl drawn from a seed nothing else uses.
