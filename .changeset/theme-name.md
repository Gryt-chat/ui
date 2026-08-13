---
"@gryt/ui": minor
---

A theme can be called something, and the name travels with it.

`GrytTheme` takes an optional `name`, `encodeGrytTheme` puts it in the link, and `decodeGrytTheme` reads it back — from the JSON form too. It is metadata rather than a colour: `grytThemeToOptions` drops it, so nothing about what a theme looks like depends on whether it has one.

It exists because a link full of hex values says nothing about what it is, and the person who made it already knew. The generator names a theme where it is built; the client fills in its name field from what arrived instead of asking again.

Names are trimmed, their whitespace collapsed, and capped at 60 characters on the way in, so a link cannot carry a paragraph.
