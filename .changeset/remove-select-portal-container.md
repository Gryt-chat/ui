---
"@gryt/ui": minor
---

Remove `Select`'s `portalContainer` prop. It made the popup render inside a dialog, where Base UI's positioning resolves against the dialog and counts its offset twice, so the list opened away from its trigger. Portalling to the document body positions correctly and already renders above the dialog.
