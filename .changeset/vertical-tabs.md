---
"@gryt/ui": minor
---

Tabs takes `orientation="vertical"`, for a rail of destinations rather than a row of them.

The prop goes on `Tabs.Root` and nowhere else. Every part styles itself from the `data-orientation` Base UI writes to the DOM, so the list stacks, the labels left-align, and the accent pill travels down the rail instead of across the row — and the arrow keys follow it too, up and down rather than left and right. Horizontal is unchanged.
