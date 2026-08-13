---
"@gryt/ui": minor
---

A theme is a document now, and the document has a link.

`createGrytTheme` takes the colours for one appearance, which is the right shape for a caller who wants one theme and the wrong shape for a theme that travels: dark and light do not derive from each other, so a shared theme has to carry both. `GrytTheme` is that — two sets of neutrals, one set of hues, and `lightHue` for the palettes whose accent genuinely differs between halves — with `grytThemeToOptions(theme, appearance)` to get back to what `createGrytTheme` takes.

`encodeGrytTheme` and `decodeGrytTheme` are the link. Only what differs from Gryt's own values is carried, so a theme that changed one colour is a link with one parameter in it, and `decodeGrytTheme` takes any of the three things somebody might paste: a whole URL, a bare query string, or the JSON form.

This moved out of the docs site because it stopped being the only reader. The generator writes these links; the client imports them. A second copy of the format in the client would be the copy that goes stale.
