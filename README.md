# Gryt UI

React component library for Gryt, the open-source WebRTC voice chat platform from [Gryt-chat](https://github.com/Gryt-chat).

`@gryt/ui` wraps MUI v7 components with Gryt colors, rounded Material 3-style shapes, chat-focused primitives, and compiled Tailwind CSS. It is designed for the Gryt desktop/web client and reusable by Gryt-adjacent apps.

## Install

```sh
bun add @gryt/ui
```

```sh
npm install @gryt/ui
pnpm add @gryt/ui
yarn add @gryt/ui
```

`@gryt/ui` includes MUI, Emotion, Phosphor icons, and the compiled Gryt styles. Your app provides `react` and `react-dom`.

## Usage

Import the stylesheet once in your app's global entry file.

```tsx
// main.tsx, app.tsx, layout.tsx, or another global app entry
import "@gryt/ui/styles.css";
```

Wrap your app with `GrytProvider`, then use the components.

```tsx
import { Button, GrytProvider, TextField } from "@gryt/ui";

export function App() {
  return (
    <GrytProvider>
      <form>
        <TextField label="Channel name" placeholder="Design review" />
        <Button tone="primary" size="medium">
          Create channel
        </Button>
      </form>
    </GrytProvider>
  );
}
```

For Next.js, import the stylesheet from `app/layout.tsx` or `pages/_app.tsx`.

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

## Scripts

```sh
bun run typecheck
bun run test
bun run build
```

## Publishing

`packages/ui` is the npm package. The docs app is private and uses the workspace package through Vite.
