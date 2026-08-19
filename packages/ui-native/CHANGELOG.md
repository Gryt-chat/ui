# @gryt/ui-native

## 0.1.1

### Patch Changes

- ba60da9: Declare `@gryt/ui` as a version range rather than `workspace:*`.

  `0.1.0` published with the workspace protocol intact, so `npm install @gryt/ui-native` failed with `EUNSUPPORTEDPROTOCOL` before it got as far as downloading anything. The first release was not installable outside this repository.

## 0.1.0

### Minor Changes

- 36b4b3b: First published release. Thirty-three components on React Native, built on the same tokens as `@gryt/ui`: the five overlays, the form controls, and the layout and feedback set.

  The Gryt-specific components are deliberately absent — Composer, ConversationItem, MessageBubble, PreviewCard, Form, NavigationMenu, ContextMenu, Autocomplete and Combobox all need a screen to design against rather than a web component to copy.

  Read the parity exceptions in the README before assuming a component behaves the way its web counterpart does. Fifteen of them are real differences, and `Tooltip` is a different interaction wearing the same name.

## 0.0.1

### Patch Changes

- Updated dependencies [96b5c90]
  - @gryt/ui@0.14.0
