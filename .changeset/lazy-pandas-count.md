---
"@gryt/ui": patch
---

`--gryt-dur-fast` is declared, so ScrollArea and OtpField animate at all.

Both used `duration-(--gryt-dur-fast)` and nothing declared it, so the scrollbar
fade and the focused-cell tint were instant. `@gryt/theme` has had the value —
150ms — the whole time; the stylesheet just never got it.

The duration test now derives its variable names from `grytDurations` instead of
listing three by hand, which is what let this through: `fast` was simply not
among the names anyone had thought to check.
