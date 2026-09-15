---
"@gryt/ui": patch
---

`Select` cuts a long selected label off with an ellipsis now. It used to wrap onto two or more lines, centred in the trigger, and a label with no spaces or hyphens set the width of the whole Select.

In a flex row, a Select still widens to fit its label unless you give it `min-w-0`. The wrapper doesn't get it by default, because two Selects side by side would then split the row evenly and cut off the longer label.
