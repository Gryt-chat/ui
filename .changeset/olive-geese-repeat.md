---
"@gryt/ui-native": patch
---

A Dialog taller than its 80% cap scrolls, and still dismisses on outside press.

The popup's wrapper was a `Pressable`, there to stop a tap on the panel reaching
the scrim. A Pressable sets `onResponderTerminationRequest: () => false`, so
once it had the touch it would not hand it over — the ScrollView inside never
saw a drag and anything past the cap was unreachable.

It is a plain `View` with `onStartShouldSetResponder` now.
`onStartShouldSetResponder` is asked during the bubble phase, so children are
offered the touch first: a ScrollView claims a drag and scrolls, and a tap on
empty space that nobody wanted lands on the wrapper and stops there, so the
scrim never sees it. Nothing is refused, so nothing is starved.
