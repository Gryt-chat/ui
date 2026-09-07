---
"@gryt/theme": minor
"@gryt/ui": minor
---

Give a text field its own corner, and name the one a button uses.

`fieldControl` asked for `--gryt-radius-xl`, which is 28px. A browser clamps a
border radius to half the shorter side, so one declared value produced three
different corners: a pill on a 36px input, a near-pill at 22px on a 44px one,
and a soft 28px rectangle on a textarea — the only place the number you asked
for actually rendered.

There is a `--gryt-radius-field` now, derived from `md` rather than fixed, so a
theme that squares everything off squares its inputs too. SQUARE gets 4, PUFFY
16, CRISP 6, and none of the eleven presets had to say so. A theme that wants
something else sets `radius.field`.

`--gryt-radius-control` is the same idea for the things you press — Button,
IconButton, Toggle and Chip. All four are pills today and this only gives that
a name, so nothing moves; the point is that a theme wanting square buttons and
rounded inputs had to override `full`, which is also what a drawer handle uses.

`fieldRadius()` and `controlRadius()` are exported for anything computing
tokens itself.
