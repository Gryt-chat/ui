---
"@gryt/theme": minor
"@gryt/ui": minor
---

Finish the radius roles: `--gryt-radius-surface` and `--gryt-radius-popup`.

A panel you read and a panel that floats now each have a name, both derived
from `lg` and both overridable. That settles two splits nothing was deciding:
Card and Accordion sat on xl next to a Dialog on lg, so a card and the dialog
opening over it had different corners; and Menu had to leave the shared popup
surface behind to stay concentric with its own rows, which is the right
relationship for every popup with rows in it rather than Menu's exception.

The Select trigger, the Composer and the theme editor's URL input move to
`--gryt-radius-field`. All three are things you type into or pick from, and all
three were on xl — the Select trigger sat next to text fields at a different
corner from them.

Two things keep xl and are documented as deliberate. A message bubble is a
speech shape rather than a panel, and the softness is the look of a chat log. A
conversation row is about 46px tall, so xl clamps to 23 and it renders as a
pill — the one place the clamping works in the design's favour.

A Tooltip stays on `md`: it is a label rather than a panel, and at roughly 28px
tall a 20px radius would clamp to 14.
