---
"@gryt/ui-native": minor
"@gryt/theme": minor
"@gryt/ui": minor
---

A Drawer slides and nothing about it fades, and a Sheet takes longer to arrive.

**The Drawer's scrim no longer fades in and out.** The panel already only
translated — that is the whole distinction between a drawer and a dialog — but
the scrim was still fading up alongside it, which put a second, slower animation
on top of the one that matters. It is up when the drawer is up.

The drag term stays, and it is a different thing: pushing the panel off lightens
the scrim in proportion, so a half-gone drawer does not sit under a
full-strength one. That is the web's own rule in its own words.

This is not a return to the bug GRYT-395 fixed. There the scrim was a flat
colour that vanished with the Modal *before* the panel had moved, so a drawer
animating out sat under a full-strength scrim for 700ms and then blinked off.
The Modal now unmounts once the panel has finished travelling, so the scrim is
up for exactly as long as the panel is on screen — which is the fix, rather than
fading it.

**`grytDurations.springSlow` — 900ms — and `Sheet` uses it.** A drawer crosses
its own width; a sheet at 82% comes up from off the bottom edge and covers
nearly all of the screen. The same duration over a longer distance is a faster
animation, and at `springSoft` the sheet arrived quickly enough to read as a
snap rather than a slide.

`--gryt-dur-spring-slow` is declared alongside it, and the motion token test
derives its names rather than listing them, so it covered the new one without
being told.
