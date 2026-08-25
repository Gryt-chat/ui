---
"@gryt/owl": patch
---

A colour written `#6cdac8ff` or `rgb(108, 218, 200)` is now the same colour as
`#6cdac8`.

Everything downstream compares colours as strings. The extractor decides "this
arm is painted the background, so the drawing means to drop it" with an exact
match, and the ink table is keyed on hex — so a drawing tool that spells a
colour the other way produced a cosmetic that quietly did the wrong thing.

Quietly is the problem. A wing whose colour matched nothing fell through to
"could not place this", which drops the path and adds a warning, so the arm was
neither hidden nor recoloured, the bird's own wing drew, and the run succeeded.
Coats and jackets stopped dropping their arms with a warning line as the only
sign.

`#rgb`, `rgb()` and `rgba()` fold to six-digit hex; an eight-digit hex folds
when its alpha is `ff`. A real alpha is left exactly as it was — `#6cdac880` is
a translucent colour and genuinely is not the background, and flattening it
would trade a silent miss for a silent lie.

When a bird part still cannot be placed, the message now names the part and, for
an arm, the exact colour to paint it.

All 37 shipped cosmetics regenerate byte-identically. No avatar moves.
