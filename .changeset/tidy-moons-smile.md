---
"@gryt/ui-native": minor
---

Tabs is the same component as the web's now, not a different one.

It was an underline: each tab drew its own 2px bottom border and the active
label changed colour. The web is a pill rail — a `surfaceRaised` container with
4px padding and a full radius, and a separate accent-filled indicator that
*slides* between tabs on the spring curve while the active label goes
`onAccent`.

The indicator is drawn by `List`, which is the only part that sees every tab's
measured box. `Tabs.Indicator` is still exported and still renders nothing, so a
call site copied from the web keeps working.

`orientation="vertical"` exists now too, matching the web: the rail turns ninety
degrees, rows go full width, the radius drops from full to `lg`, and labels
left-align.

Geometry taken by measuring the running docs app rather than reading the classes
— list 4px padding and 4px gap, tabs 32pt min-height at 6/16 padding, 14px/500
labels, indicator inset 4 on every side.

`Tabs.List` gains `scrollable`, off by default. The web has no scroller here, so
off is the parity answer; it exists because a phone is narrow and clipping a
five-tab rail silently is worse than scrolling it.
