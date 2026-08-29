---
"@gryt/owl": minor
---

Adds the eggs: a generated image for something that is not a person.

`eggAvatarSvg`, `eggAvatarDataUri` and `eggAvatarColour` take a string and return
one, two or three patterned eggs on a field. Same seeds and same rng as the owls,
and the field is the owl palette's own `background` rather than a colour chosen
to sit near it, so the two share a colour system rather than resembling one.

The intended use is a group chat that has no picture uploaded. These were written
for server icons and server icons are getting their own generator instead, so
nothing here is named for servers.

The patterns are forty tiles from pattern.monster (MIT, credited in the generated
file and the README), curated down to surfaces — grids, hatches, waves, contours,
speckles, scales, tessellations. `zoom` crops the arrangement: past about 1.5 the
eggs run off the tile, which is what stops three of them reading as a nest.

Nothing that already existed moved. No owl changes.
