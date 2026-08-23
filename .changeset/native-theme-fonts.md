---
"@gryt/ui-native": minor
---

The theme can carry a font, so an app can set one everywhere.

There was not one `fontFamily` anywhere in this library, so every `Text` it
rendered fell back to the platform default — and React Native has no cascade, so
there was no root rule a consuming app could write to change that from outside.
An app with its own typeface got a button whose label was in a different font
from the text beside it.

`GrytThemeProvider` now takes `fonts`, a map of face names per weight plus a
mono pair. The library ships no font files and is not going to; an app registers
its own faces and passes the names in. `theme.font(weight, { mono })` returns a
style fragment to spread — a `fontFamily` when faces are configured, a
`fontWeight` when they are not, which is what makes this safe to adopt
everywhere at once. A theme built without `fonts` produces exactly the styles
this library produced before.

`Text` and `TextInput` are now exported. Every component here draws through
them, and an app's own screens have the same problem the library did.
