---
"@gryt/ui-native": minor
---

`Avatar` takes a `seed` and draws that person's owl, from `@gryt/owl`.

The same generator and the same seed the web uses, so somebody looks the same in
both apps. Without a seed the component is unchanged: the `source` image if
there is one, initials if there is not. A `source` that fails to load now falls
back to the owl when there is a seed for it.

`react-native-svg` is a new peer dependency. React Native's `Image` cannot decode
SVG from a data URI, so the markup goes to `SvgXml` rather than through a URI —
the web hands the same string to an `<img>`.
