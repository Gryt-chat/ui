---
"@gryt/ui": minor
---

GrytProvider gains `containOverlays`, which renders overlays inside the provider's own element rather than in `document.body`.

Off by default, and it should stay off for an app with one theme — the body is the right place for a popup, and `:root` already carries the variables it needs. Turn it on when a provider is one theme inside a page that has another, where an overlay in the body comes up in the surrounding page's colours instead.

`Select` and `Tooltip` were the two components that portalled internally with no way through; both now follow the provider. The rest already re-export Base UI's `Portal`, so callers could pass a container themselves.
