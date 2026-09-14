---
"@gryt/ui": minor
---

`VideoPlayer` takes an `onError` prop, called when the video fails to load or play. Hand back a new `src` from it, like a URL with a fresh file token, and the player loads that and carries on from the same spot. It keeps playing if it was playing, and the error doesn't show. It only does this once. If the new `src` fails too before playback gets past that spot, you get the error as before.

Try again keeps the position now too, where it used to start over from 0.
