---
"@gryt/ui": minor
---

The member card now lives here. `MemberCard` draws it, `MemberCardEditor` edits its style, and `encodeGrytCard`/`decodeGrytCard` turn a style into a link or code in the same format as a theme link. It brings 306 tile patterns (loaded only when one is drawn), scatter patterns, built-in styles and `randomCardStyle`. Icon patterns need the app to hand over a loader with `setCardIconLoader`. The docs have a "Build your own card" page at /card that copies a link, which Edit my card in the app accepts.
