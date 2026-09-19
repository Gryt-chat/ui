---
"@gryt/ui": patch
---

Dialog and AlertDialog no longer grow past the browser viewport. Their popups keep the same 1.5rem edge clearance they already use horizontally, cap against the dynamic viewport height, and scroll vertically when their content is taller than the available space.
