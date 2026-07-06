import { CodeBlock } from "../components/CodeBlock";

export function InstallationPage() {
  const installCode = "bun add @gryt/ui";
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
      <p>
        Gryt UI includes its MUI, Emotion, and icon dependencies. Your app only
        needs React and React DOM, which are already present in most React
        projects.
      </p>
      <h2>Usage</h2>
      <CodeBlock code={usageCode} language="tsx" />
    </article>
  );
}
