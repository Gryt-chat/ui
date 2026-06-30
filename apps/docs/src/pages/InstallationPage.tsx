import { CodeBlock } from "../components/CodeBlock";

export function InstallationPage() {
  const installCode =
    "bun add @gryt/ui @mui/material @mui/system @emotion/react @emotion/styled react react-dom";
  const usageCode = `import "@gryt/ui/styles.css";
import { Button, GrytProvider } from "@gryt/ui";

export function App() {
  return (
    <GrytProvider>
      <Button>New chat</Button>
    </GrytProvider>
  );
}`;

  return (
    <article className="prose prose-invert max-w-none">
      <h1>Installation</h1>
      <CodeBlock code={installCode} language="sh" />
      <h2>Usage</h2>
      <CodeBlock code={usageCode} language="tsx" />
    </article>
  );
}
