---
"@gryt/ui-native": minor
---

`Sheet` can be opened from outside it, and `Drawer` keeps clear of the phone's furniture.

**`Sheet` takes `open` with `onOpenChange`**, which every other overlay in this
package already did. It was the exception: `defaultOpen` and a `Trigger`, and
nothing else.

What that cost a caller was not obvious until something opened a sheet that was
not a Pressable. A tab bar item, a notification, a deep link — none of them can
be a `Sheet.Trigger`, so the only way to open one was to unmount the whole sheet
and remount it with `defaultOpen`. That throws the body away on every open. The
mobile app shell did exactly that, twice, and the comment explaining why was
longer than the component it was in.

It is `useOpenState` now, the same hook `Drawer`, `Dialog`, `Menu` and the rest
use, so a call site moving between them does not change shape. A controlled
Sheet's parent gets the final say — `setOpen` reports rather than decides — and
a flick down or a tap on the backdrop tells the state, which is how the parent
finds out its sheet is gone.

**`Drawer` applies the safe-area insets.** A panel from the side is full height
by definition, so its first row sat under the Dynamic Island and its last under
the home indicator. GRYT-402 made this call for `Sheet` and it belongs here for
the same reason: every caller would otherwise write the same two lines, and the
one that forgets ships a drawer with its heading under the clock. That is how
the mobile shell's server switcher first looked.

The padding goes on before the caller's `style`, so a drawer that wants to run
under the island still can.

**Two stale claims in the parity table, while in there.** It said indeterminate
`Progress` renders an empty track, which stopped being true when GRYT-382 fixed
it on both platforms and did not touch the README. And `Sheet`'s own doc comment
said it was listed in that table as an addition, which it never was — there was
no additions table at all. There is one now, since a component the web does not
have needs the same justification as one it does.
