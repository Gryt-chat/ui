---
"@gryt/ui": patch
---

`VideoPlayer` keeps the poster, or the placeholder when there is none, in place until the video's first frame is decoded. Pressing play no longer blacks the player out or shrinks it while the file starts loading.
