---
"@gryt/ui-native": minor
---

Drawer can be swiped away, which the web's could and this one could not.

`@gryt/ui` gets swipe-to-dismiss from Base UI's drawer primitive — the panel
follows the pointer and a flick sends it back. React Native had no gesture code
in the file at all: it animated open, and the only ways out were the scrim and
the Android back button. That gap was not in the parity exceptions table either,
which is the part that mattered — the table is the honest list.

A drag along the closing axis moves the panel with the finger. Release past half
the panel, or with any speed behind it, dismisses; anything less springs back on
the same curve the drawer opens with.

The gesture is claimed on move rather than on start, so a tap on a button inside
the drawer still reaches the button.
