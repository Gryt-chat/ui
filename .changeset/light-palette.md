---
"@gryt/ui": minor
---

A light palette. `.light` on an ancestor swaps every scale value; `:root` stays dark.

The library shipped one palette and it was dark, which only became visible when the client dropped Radix Themes and light mode lost its colours entirely — the class landed on the DOM and every surface stayed dark.

It is not the dark ramp inverted. In dark a surface sits lighter than the page; in light it is white and the page is the grey one, so neutral 1 and 2 run light-grey then white and the ramp is deliberately not monotonic across them. Step 9 is the same brand colour in both appearances, so a filled button does not change colour when somebody switches, and step 10 darkens on hover where the dark set lightens.

`createGrytTheme({ appearance: "light" })` builds the light set, and an overridden anchor regenerates it the same way the dark one does. `grytScalesLight`, `grytAlphaScalesLight` and `grytLightTokens` are exported for reading.

Contrast is measured on this set rather than assumed from the other, and tested: neutral 11 clears 4.5:1 on both the page and a white panel, neutral 12 clears 7:1 on both, and every hue's step 11 clears 4.5:1 on both.
