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
  const tailwindCode = `/* Only needed if you write Gryt utility classes in your own files.
   The library ships its own compiled CSS either way. */
@import "tailwindcss";
@source "../node_modules/@gryt/ui/dist";`;

  return (
    <article className="prose prose-invert max-w-[68ch] prose-headings:font-display prose-headings:tracking-[-0.022em] prose-h1:text-[length:var(--text-2xl)] prose-h2:mt-(--space-xl) prose-h2:text-[length:var(--text-lg)] prose-p:text-gryt-muted prose-p:leading-7 prose-a:text-gryt-text prose-a:decoration-gryt-border hover:prose-a:decoration-gryt-accent">
      <h1>Installation</h1>
      <p className="lead text-[length:var(--text-md)]">
        One package, one stylesheet import, one provider. There is no build
        plugin and no CSS-in-JS runtime to configure.
      </p>

      <CodeBlock code={installCode} language="sh" />

      <p>
        The package brings Base UI and Phosphor icons with it. Your app supplies{" "}
        <code>react</code> and <code>react-dom</code>, which are already there in
        any React project.
      </p>

      <h2>Usage</h2>
      <p>
        Import the stylesheet once, at your entry point, then wrap the tree in{" "}
        <code>GrytProvider</code>. The provider carries the theme variables and
        mounts Base UI&rsquo;s tooltip provider, which shares hover timing
        between triggers.
      </p>
      <CodeBlock code={usageCode} language="tsx" />

      <h2>Tailwind</h2>
      <p>
        You do not need Tailwind to use the library — <code>styles.css</code> is
        already compiled. Add the source directive below only if you want to
        write <code>gryt-*</code> utility classes in your own components, so
        Tailwind can see the class names the library uses.
      </p>
      <CodeBlock code={tailwindCode} language="css" />

      <h2>Versions</h2>
      <p>
        React 17, 18 and 19 are all supported — Base UI&rsquo;s peer range, not a
        narrower one imposed here.
      </p>
    </article>
  );
}
