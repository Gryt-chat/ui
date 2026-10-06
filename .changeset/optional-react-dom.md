---
"@gryt/ui": patch
---

`react-dom` is an optional peer now. The `card-core` and `card-tiles` entries never touch it, and the phone app, which imports only those, failed `expo-doctor` for not having it.
