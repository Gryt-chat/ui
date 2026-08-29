---
"@gryt/theme": patch
---

Read a theme's motion back out of JSON.

`decodeGrytTheme` handled motion on the query-string path and not the JSON
one, so a theme round-tripped through a shared link and lost its motion
through JSON. That is the path that matters most: the client keeps saved
themes in localStorage as JSON and re-reads them through this function, so
every saved theme dropped its speed and curve on every launch. Exporting a
theme as JSON and pasting it back did the same.

Nothing failed. The app moved at the default speed and the setting looked
like it had never been made.

Both halves are tested through both doors now — fonts were already on the JSON
path, and had no test there either.
