---
"@gryt/ui": minor
---

The component-layer rules ship on their own, as components.css

`dist/styles.css` carries a full Tailwind utilities layer. An app that builds
its own Tailwind and imports it as well gets two of them, and the second copy
wins: `.flex-col` from the library landed after `.md:flex-row` from the app, so
the owl designer stayed a column at any width. The desktop client dropped the
import over that in GRYT-858 and scans `dist` for class names instead.

Scanning finds utilities. It cannot find these, because they are not utilities.
`.gryt-message-bubble`, `.gryt-composer`, `.gryt-composer-textarea`,
`.gryt-conversation-item`, `.gryt-progress-indeterminate` and the hover that
makes a label act like the control it wraps are hand-written rules, so the
client has been running without them since, and the welcome dialog's message
bubble has been a square with no padding.

`@gryt/ui/components.css` is those rules and nothing else. Shipped unprocessed,
like theme.css, so the `@apply` calls resolve against the consuming app's own
Tailwind build.

`dist/styles.css` is byte-identical to 0.25.1, so nothing changes for an app
that imports it.
