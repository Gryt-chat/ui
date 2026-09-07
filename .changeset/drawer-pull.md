---
"@gryt/ui-native": minor
---

`Drawer.Root` takes an optional `pull`, so a drawer can be dragged open from
somewhere else on screen rather than appearing when a gesture crosses a line.

`open` cannot express a drag: it is a boolean, so the panel springs the whole
way and the finger is left behind. `pull` is how far out the caller has brought
it, 0 to 1, and the panel sits at whichever of the two reaches further.

The release is the part with a trap in it. The caller's pull falls while the
spring rises, on different clocks, and the larger of two numbers still shrinks
if the falling one starts above the rising one — so the panel jumps backwards
out of the hand that just let go. The opening spring therefore starts from
wherever the drag had got to rather than from nothing, which makes the caller's
job "set open, clear pull" instead of holding the pull at exactly the right
value until the spring overtakes it.

Writing `pull` mounts the panel and returning it to 0 unmounts it, so a drag
that is abandoned takes the drawer away without `open` ever being set.

Nothing changes for a caller that does not pass it.
