# Gryt UI

React component library for Gryt Chat, built with MUI v7, Tailwind CSS, and Vite.

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
