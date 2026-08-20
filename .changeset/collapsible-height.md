---
"@gryt/ui-native": minor
---

Animate Collapsible's height, matching the web.

The panel was unmounted when closed rather than animated, on the grounds that measuring the content first would cost a frame of it drawn at the wrong size. It is now measured off an absolutely positioned copy that never affects layout, so that objection does not apply — the height animates on the same `ease-spring` at the same 500ms the web uses.

Children now stay mounted while closed, at height zero with `overflow: hidden`, as they do on the web. That is a behaviour change as well as a visual one: state inside a closed panel survives, where before it was destroyed on close.

Also corrects a comment on Progress that described its missing indeterminate state as a parity exception. It is not one — `@gryt/ui` has no keyframes, no `data-indeterminate` rule, and no rule at all matching `gryt-progress` in its compiled stylesheet, so an indeterminate Progress renders an empty track on the web too. Tracked as GRYT-382 for both platforms rather than fixed on one.
