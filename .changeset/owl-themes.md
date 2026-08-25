---
"@gryt/theme": minor
---

Six new themes, derived from the owl palettes: Rose, Amber, Wine, Indigo,
Forest and Ice.

They were drawn as artwork rather than as themes, so these are derived rather
than lifted — a drawing names four or five colours and a theme needs eleven
hues and seven neutrals in each of two appearances.

Derived in OKLCH, and the reason shows in the result: a ramp built by darkening
sRGB drifts grey, so the surfaces stop belonging to the theme about three steps
down. Holding hue and chroma while moving lightness keeps Rose's greys pink and
Forest's greys green.

Secondaries are analogous rather than complementary, matching Ember. A true
complement put Indigo's secondary on orange and Ice's on tan — colours that read
as borrowed from another theme.

`onAccent` is chosen per theme rather than assumed: whichever ink has more
contrast on that accent ships. Forest's sage takes dark ink at 8.1:1, Indigo's
periwinkle takes light at 4.7:1.

Checked in both appearances — text 14.8:1 or better on its own background,
muted 5.7:1 or better on its surface.
