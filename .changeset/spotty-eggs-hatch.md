---
"@gryt/owl": minor
---

Adds an egg generator for server icons, so servers stop being DiceBear Planets.

`eggAvatarSvg`, `eggAvatarDataUri` and `eggAvatarColour` take a server's name
and return one, two or three patterned eggs on a field. Same seeds and same rng
as the owls, and the field is the owl palette's own `background` rather than a
colour chosen to sit near it.

The patterns are forty tiles from pattern.monster (MIT, credited in the
generated file and the README), curated down to surfaces — grids, hatches,
waves, contours, speckles, scales, tessellations. `zoom` crops the arrangement:
past about 1.5 the eggs run off the tile and the icon stops reading as a nest.

Nothing that already existed moved. No owl changes.
