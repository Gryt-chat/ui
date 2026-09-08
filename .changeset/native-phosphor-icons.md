---
"@gryt/ui-native": minor
---

Draw the ticks and carets instead of typing them. Checkbox, Select, Accordion
and NumberField each rendered a character — a check mark, an en dash, two
triangles, a minus and a plus — so their weight and shape were whatever the
device's font had. They use Phosphor now, the same artwork `@gryt/ui` draws on
the web.

`phosphor-react-native` is a new peer dependency. It is a peer rather than a
runtime dependency, so an app that already has it pays nothing, and the icons
are imported one file at a time because Metro does not tree-shake a barrel.
