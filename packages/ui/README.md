# @gryt/ui

React component library for [Gryt](https://github.com/Gryt-chat/gryt), the open-source WebRTC voice chat platform.

Built with MUI v7, React, Tailwind-authored compiled CSS, and the Gryt design palette from [Gryt-chat/code-theme](https://github.com/Gryt-chat/code-theme).

## Install

```sh
bun add @gryt/ui @mui/material @mui/system @emotion/react @emotion/styled react react-dom
```

## Usage

```tsx
import "@gryt/ui/styles.css";
import { Button, GrytProvider } from "@gryt/ui";

export function App() {
  return (
    <GrytProvider>
      <Button>New chat</Button>
    </GrytProvider>
  );
}
```

## Components

Includes MUI-backed primitives for buttons, inputs, selects, tabs, menus, dialogs, drawers, cards, feedback, data display, and Gryt chat-specific components like `Composer`, `ConversationItem`, and `MessageBubble`.

## Links

- Gryt platform: [Gryt-chat/gryt](https://github.com/Gryt-chat/gryt)
- Gryt client: [Gryt-chat/client](https://github.com/Gryt-chat/client)
- Gryt docs: [docs.gryt.chat](https://docs.gryt.chat)
