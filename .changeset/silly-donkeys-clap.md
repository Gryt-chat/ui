---
"@gryt/ui-native": minor
---

The Slider runs on `react-native-gesture-handler`, and `useDragLock` is gone.

**Breaking:** `useDragLock` and the `DragLock` type are no longer exported.
Nothing outside this package used them — they existed so a `Slider` could
reach the `ScrollArea` it was sitting in.

That whole mechanism was a workaround for something `PanResponder` could not
do. Dragging a slider inside a scrolling screen scrolled the screen, and
refusing to hand back the JS responder did not help, because on iOS the
scrolling is a native recogniser that never asks the JS responder system
anything. So `ScrollArea` published a lock, `Slider` claimed it for the
duration of a drag, and the list was switched off.

`activeOffsetX` says the same thing without switching anything off: the pan
claims the gesture once the finger has clearly gone sideways, and a vertical
drag never activates it, so the scroll view keeps it. `ScrollArea` is back to
being a thin pass over `ScrollView`.

Also fixed on the way past: the drag reads the finger's position in the track
rather than anchoring on where the gesture started and adding the total
translation. The old arithmetic added the whole travel again on every move,
and was worked around rather than removed.

Both gestures run on the JS thread. The Drawer's stay worklets because they
only move a shared value; every callback here reaches React state and the
consumer's `onValueChange`, so the hop happens either way.

One behaviour change worth knowing: the value no longer jumps on touch-down.
A tap still seeks, and a drag seeks once it has moved 4pt sideways — which is
the threshold that lets a scroll through.
