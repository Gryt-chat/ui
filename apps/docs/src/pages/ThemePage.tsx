import { createGrytTheme, GrytProvider, Button } from "@gryt/ui";
import { CodeBlock } from "../components/CodeBlock";

const themeCode = `const theme = createGrytTheme({
  palette: {
    primary: {
      main: "#b4afff"
    }
  }
});`;

const theme = createGrytTheme({
  palette: {
    primary: {
      main: "#b4afff"
    }
  }
});

export function ThemePage() {
  return (
    <article className="prose prose-invert max-w-none">
      <h1>Theme</h1>
      <p>Base tokens mirror the Gryt code-theme palette.</p>
      <div className="not-prose my-6 grid gap-3 rounded-[28px] border border-gryt-border bg-gryt-surface p-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Background", "#111318"],
          ["Raised", "#1a1d24"],
          ["Card", "#1e2028"],
          ["Accent", "#968FF8"],
          ["Accent light", "#b4afff"],
          ["Text", "#e0e0e6"],
          ["Dim text", "#888888"],
          ["Border", "#2b303d"]
        ].map(([label, color]) => (
          <div
            key={label}
            className="rounded-[20px] border border-gryt-border bg-gryt-bg p-3"
          >
            <div
              className="mb-3 h-10 rounded-full border border-gryt-border"
              style={{ backgroundColor: color }}
            />
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-xs text-gryt-muted">{color}</div>
          </div>
        ))}
      </div>
      <p>Use MUI theme overrides when Gryt tokens need app-specific changes.</p>
      <div className="not-prose my-6 rounded-[28px] border border-gryt-border bg-gryt-surface p-6">
        <GrytProvider theme={theme} disableBaseline>
          <Button>Custom primary</Button>
        </GrytProvider>
      </div>
      <CodeBlock code={themeCode} language="ts" />
    </article>
  );
}
