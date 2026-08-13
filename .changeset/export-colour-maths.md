---
"@gryt/ui": minor
---

Export `contrast`, `hexToOklch`, `oklchToHex` and the `Oklch` type.

Anything that builds a theme rather than consuming one needs the maths the scales are built from. The docs site's theme generator measures contrast against the theme somebody is editing, as they edit it, and picks the label colour for a filled control from the colour underneath it — both of which mean the same OKLab matrices the library already carries. Keeping them internal would have meant a second copy of them somewhere, which is the thing one generator was meant to stop.
