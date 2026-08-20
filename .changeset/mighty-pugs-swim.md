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

Drawer also lands on the calmer curve and stops covering more screen than
`size` asks for.

The overshooting spring moved to `ease-spring-tight` on **both** platforms. The
note in the React Native file said a panel travelling its own width was exactly
the case the tight curve was added for, and that if it ever felt wrong on a
device the web was what was wrong. It did. A 12% overshoot on a 20pt switch
thumb is texture; on a 320pt panel it is a slam.

The overhang also hung the wrong way — added to the panel's width, so it grew
*inwards* and covered 64pt more of the screen while the seam it was meant to
hide stayed exactly where it was. It hangs off the entering edge now.

Dismissing a Drawer animates it out, rather than making it vanish.

Two causes, both needed fixing: the close snapped `progress` straight to 0
instead of animating it, and React Native's `Modal` unmounts the moment
`visible` goes false, so there would have been nothing left to animate anyway.
The panel now stays mounted until the close has actually finished.

`springy`, `travel` and `fade` forward Reanimated's completion callback, which
is what makes that possible without reaching past them to `withTiming` — and
reaching past them is how the sampled curve stops being the thing that runs.
