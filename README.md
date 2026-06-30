# Gryt UI

React component library for Gryt, the open-source WebRTC voice chat platform from [Gryt-chat](https://github.com/Gryt-chat).

`@gryt/ui` wraps MUI v7 components with Gryt colors, rounded Material 3-style shapes, chat-focused primitives, and compiled Tailwind CSS. It is designed for the Gryt desktop/web client and reusable by Gryt-adjacent apps.

## Links

- Platform monorepo: [Gryt-chat/gryt](https://github.com/Gryt-chat/gryt)
- Desktop/web client: [Gryt-chat/client](https://github.com/Gryt-chat/client)
- Code theme palette: [Gryt-chat/code-theme](https://github.com/Gryt-chat/code-theme)
- Product site: [gryt.chat](https://gryt.chat)
- App: [app.gryt.chat](https://app.gryt.chat)
- Docs: [docs.gryt.chat](https://docs.gryt.chat)

## Development

```sh
bun install
bun run dev
```

## Package Usage

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

## Scripts

```sh
bun run typecheck
bun run test
bun run build
```

## Publishing

`packages/ui` is the npm package. The docs app is private and uses the workspace package through Vite.
