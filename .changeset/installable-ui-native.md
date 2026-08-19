---
"@gryt/ui-native": patch
---

Declare `@gryt/ui` as a version range rather than `workspace:*`.

`0.1.0` published with the workspace protocol intact, so `npm install @gryt/ui-native` failed with `EUNSUPPORTEDPROTOCOL` before it got as far as downloading anything. The first release was not installable outside this repository.
