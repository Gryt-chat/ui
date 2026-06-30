# @gryt/ui

React component library for Gryt Chat.

```sh
bun add @gryt/ui @mui/material @mui/system @emotion/react @emotion/styled react react-dom
```

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
