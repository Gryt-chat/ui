---
"@gryt/ui": minor
---

The owl designer moves into the library.

It lived in two places: `packages/client`, and a copy the site took for its front
page during GRYT-640. The client is not published to npm and a path dependency
across repositories does not build in CI, so copying was the only way to get it
onto gryt.chat. The two had already drifted — the site's copy gained a
`lookFromSeed` and split the editor out of its dialog, and the client's never got
either.

`OwlDesigner` is the editor on its own, for a host that wants it inline.
`OwlDesignerDialog` wraps it in a dialog, which is what the client uses.
`AvatarChoiceDialog` is the picker that offers designing an owl or uploading a
picture. The export helpers, the wardrobe and the seen-cosmetics record come with
them.

The nine `react-icons/pi` icons became `@phosphor-icons/react` with an explicit
`weight`, since that is what the rest of the library already uses.
