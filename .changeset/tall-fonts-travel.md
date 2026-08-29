---
"@gryt/theme": minor
"@gryt/ui": minor
---

A theme carries its typefaces.

Three roles — `body`, `display` for headings, `mono` for code, hex values and
timestamps. Three because that is what the interface actually distinguishes;
finer is a knob nobody turns, and coarser loses the one that matters, which is
that a proportional face cannot do the third job.

`GrytTheme.fonts` is optional and null means the library's own, so every theme
written before this and every link already shared renders exactly as it did.
`createGrytTheme` emits `--gryt-font-body|display|mono` only for what a theme
sets, and the stylesheet's `--font-sans`, the new `--font-display` and
`--font-mono` fall through them. A theme that names no fonts emits no
variables and changes nothing.

Whole CSS stacks rather than family names, because the fallback is the point:
a theme names a face the reader may not have, and what it falls back to
decides whether that reads as a different choice or a broken one.

`isFontStack` refuses anything that could close a CSS declaration and start
another — braces, semicolons, comment markers, `url(`, `@import`. A font stack
has no legitimate use for any of them, and this is the first field in a theme
that is free text rather than a hex value. A role that fails the check falls
back to the library's instead of taking the value, so one bad parameter in a
link costs that parameter rather than the theme.

`ThemeEditor` grows a Type group: a curated list of thirteen faces, a
free-text box for everything else, and a specimen line set in whichever face
is chosen. Faces that need fetching are marked, and `remoteFontsAllowed`
lets a host say they will not be — the client keeps that behind a setting, so
the picker can say a choice will not take effect rather than leaving somebody
to wonder why nothing changed.

The list is curated rather than Google's catalogue on purpose. The catalogue
is about sixteen hundred families and fetching it is itself a request to
Google, which would leave the picker empty for exactly the people who left
that setting off.
