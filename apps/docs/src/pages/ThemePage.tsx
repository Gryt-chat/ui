import {
  Button,
  createGrytTheme,
  GrytProvider,
  grytScales,
  grytScalesLight,
  grytTokens
} from "@gryt/ui";
import { CodeBlock } from "../components/CodeBlock";

const themeCode = `const theme = createGrytTheme({
  color: {
    accent: "#b4afff"
  }
});

<GrytProvider theme={theme}>
  <Button>Custom primary</Button>
</GrytProvider>`;

// createGrytTheme returns CSS custom properties rather than a theme object,
// so overriding one token leaves the rest of the palette alone.
const theme = createGrytTheme({
  color: {
    accent: "#b4afff"
  }
});

const SCALE_NAMES = [
  "neutral",
  "accent",
  "secondary",
  "success",
  "danger",
  "warning"
] as const;

const swatchGroups: Array<{
  title: string;
  swatches: Array<{ name: string; value: string }>;
}> = [
  {
    title: "Surfaces",
    swatches: [
      { name: "bg", value: grytTokens.color.bg },
      { name: "surface", value: grytTokens.color.surface },
      { name: "surfaceRaised", value: grytTokens.color.surfaceRaised },
      { name: "border", value: grytTokens.color.border }
    ]
  },
  {
    title: "Text",
    swatches: [
      { name: "text", value: grytTokens.color.text },
      { name: "muted", value: grytTokens.color.muted },
      { name: "onAccent", value: grytTokens.color.onAccent }
    ]
  },
  {
    title: "Accent and status",
    swatches: [
      { name: "accent", value: grytTokens.color.accent },
      { name: "accentLight", value: grytTokens.color.accentLight },
      { name: "secondary", value: grytTokens.color.secondary },
      { name: "success", value: grytTokens.color.success },
      { name: "warning", value: grytTokens.color.warning },
      { name: "danger", value: grytTokens.color.danger }
    ]
  }
];

export function ThemePage() {
  return (
    <article className="prose prose-invert max-w-[68ch] prose-headings:font-display prose-headings:tracking-[-0.022em] prose-h1:text-[length:var(--text-2xl)] prose-h2:mt-(--space-xl) prose-h2:text-[length:var(--text-lg)] prose-p:text-gryt-muted prose-p:leading-7">
      <h1>Theme</h1>
      <p className="lead text-[length:var(--text-md)]">
        The palette comes from{" "}
        <a
          className="text-gryt-text decoration-gryt-border underline-offset-4 hover:decoration-gryt-accent"
          href="https://github.com/Gryt-chat/code-theme"
          rel="noreferrer"
          target="_blank"
        >
          Gryt code-theme
        </a>
        , so the components match the editor theme and the client that ships
        them. Every value below is read straight from{" "}
        <code>grytTokens</code> — this page cannot drift from the library.
      </p>

      {swatchGroups.map((group) => (
        <section key={group.title} className="not-prose mt-(--space-lg)">
          <h2 className="m-0 pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
            {group.title}
          </h2>
          <ul className="grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {group.swatches.map((swatch) => (
              <li
                key={swatch.name}
                className="overflow-hidden rounded-(--gryt-radius-md) border border-gryt-border"
              >
                <div
                  className="h-12 w-full"
                  style={{ backgroundColor: swatch.value }}
                />
                <div className="bg-gryt-surface px-3 py-2">
                  <p className="m-0 text-sm font-medium text-gryt-text">
                    {swatch.name}
                  </p>
                  <p className="m-0 font-mono text-xs text-gryt-muted">
                    {swatch.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2>Scales</h2>
      <p>
        Twelve steps per family, each step meaning the same thing wherever it
        appears. The flat names above are aliases onto these — <code>surface</code>{" "}
        is <code>neutral-2</code>, <code>accent</code> is <code>accent-9</code> —
        so a colour has one definition and it lives here.
      </p>
      <p>
        Steps 1 and 2 are backgrounds, 3 to 5 are a component and its hover and
        active states, 6 to 8 are borders, 9 and 10 are solid fills, and 11 and
        12 are text. That is what makes them worth having: the flat tokens could
        not say &ldquo;this surface, but hovered&rdquo; at all.
      </p>
      {SCALE_NAMES.map((name) => (
        <section key={name} className="not-prose mt-(--space-md)">
          <h3 className="m-0 pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
            {name}
          </h3>
          <ol className="m-0 grid list-none grid-cols-6 gap-1 p-0 lg:grid-cols-12">
            {grytScales[name].map((value, index) => (
              <li key={value + index} className="min-w-0">
                <div
                  className="h-12 w-full rounded-(--gryt-radius-sm) border border-gryt-border"
                  style={{ backgroundColor: value }}
                />
                <p className="m-0 pt-1 text-center font-mono text-[10px] text-gryt-muted">
                  {index + 1}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <h2>Light</h2>
      <p>
        Dark is what <code>:root</code> carries. An app offering a light
        appearance puts <code>.light</code> on an ancestor — the root element,
        usually, since overlays portal to <code>document.body</code> and would
        otherwise miss it — and every value swaps underneath it.
      </p>
      <p>
        It is not the dark ramp inverted. In dark a surface sits lighter than
        the page; in light it is white and the page is the grey one, so steps 1
        and 2 run light-grey then white. Step 9 is the same brand colour in both,
        so a filled button does not change colour when somebody switches, and
        step 10 darkens on hover where the dark set lightens.
      </p>
      {SCALE_NAMES.map((name) => (
        <section key={name} className="not-prose mt-(--space-md)">
          <h3 className="m-0 pb-(--space-sm) text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
            {name}
          </h3>
          <ol className="m-0 grid list-none grid-cols-6 gap-1 p-0 lg:grid-cols-12">
            {grytScalesLight[name].map((value, index) => (
              <li key={value + index} className="min-w-0">
                <div
                  className="h-12 w-full rounded-(--gryt-radius-sm) border border-gryt-border"
                  style={{ backgroundColor: value }}
                />
                <p className="m-0 pt-1 text-center font-mono text-[10px] text-gryt-muted">
                  {index + 1}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <h2>Overriding a token</h2>
      <p>
        <code>createGrytTheme</code> returns CSS custom properties, not a theme
        object. Pass the ones you want to change; the rest of the palette stays
        as it is.
      </p>
      <div className="not-prose my-(--space-md) rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface p-5">
        <GrytProvider theme={theme}>
          <Button>Custom primary</Button>
        </GrytProvider>
      </div>
      <CodeBlock code={themeCode} language="tsx" />

      <h2>Radius</h2>
      <p>
        Five steps, from <code>sm</code> at {grytTokens.radius.sm}px to{" "}
        <code>full</code> at {grytTokens.radius.full}px. Controls use{" "}
        <code>full</code>; surfaces use <code>lg</code> or <code>xl</code>.
      </p>
    </article>
  );
}
