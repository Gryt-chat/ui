/* Hallmark · genre: modern-minimal · macrostructure: Workbench
 * theme: custom (Gryt code-theme, OKLCH) · nav: inherited N13 · footer: inherited Ft2
 * enrichment: none · design-system: design.md · designed-as-app
 *
 * The controls are `ThemeEditor` from @gryt/ui now, not this file. They moved
 * because the client needs the same ones over the top of the running app, and
 * a page is not something a second host can mount. What is left here is the
 * part that only makes sense on a documentation site: the prose, the specimen
 * panel, the export snippets, and the address bar.
 */
import {
  Button,
  Tabs,
  ThemeEditor,
  decodeGrytTheme,
  encodeDraft,
  grytDraft,
  themeCode,
  themeJson,
  themeStyle
} from "@gryt/ui";
import type { ThemeDraft } from "@gryt/ui";
import { Link as LinkIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";
import { PreviewStage } from "../components/theme/PreviewStage";
import {
  setSiteAppearance,
  setSiteCustomTheme,
  useSiteTheme
} from "../lib/theme/siteTheme";

export function ThemeGeneratorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Read once. Re-reading would fight the editor every time the link is copied.
  const [shared] = useState(() => decodeGrytTheme(searchParams.toString()));

  const [draft, setDraft] = useState<ThemeDraft>(shared?.theme ?? grytDraft);
  // The appearance is the site's, not this page's. Editing the light half and
  // reading the docs around it in dark would be looking at two themes.
  const site = useSiteTheme();
  const appearance = site.appearance;

  const [exportTab, setExportTab] = useState("code");
  const [copied, setCopied] = useState(false);

  const theme = themeStyle(draft, appearance);

  /**
   * The site wears what is being built, as it is being built.
   *
   * The panel beside it was always the smaller half of the answer: what
   * somebody wants to know is whether a whole page survives their palette, and
   * the whole page is right here. It lands in the header's Custom option too,
   * so it survives walking off to another page.
   */
  // Not on arrival, though — opening the generator should not take over a
  // theme somebody chose in the header. The exception is a shared link, which
  // is somebody handing you a theme and expecting to see it.
  const untouched = useRef(shared === null);
  useEffect(() => {
    if (untouched.current) {
      untouched.current = false;
      return;
    }
    setSiteCustomTheme(draft);
  }, [draft]);

  function copyLink() {
    const params = encodeDraft(draft, appearance);
    const query = params.toString();
    const url = `${window.location.origin}${window.location.pathname}${
      query === "" ? "" : `?${query}`
    }`;
    // The address bar moves with the button, so what gets pasted somewhere else
    // and what is on screen are the same link.
    setSearchParams(params, { replace: true });
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className="flex min-w-0 flex-col gap-(--space-md)">
      <header className="max-w-[68ch]">
        <p className="m-0 font-mono text-xs tracking-wide text-gryt-accent-11">
          createGrytTheme
        </p>
        <h1 className="mt-2 font-display text-[length:var(--text-2xl)] font-semibold leading-tight tracking-[-0.022em] text-gryt-text">
          Theme generator
        </h1>
        <p className="mt-2 text-[length:var(--text-md)] leading-7 text-gryt-muted">
          Pick the anchors and watch the twelve-step scales redraw under them.
          Everything on the right is a real component reading the theme you are
          building, not a swatch. When it looks right, take the{" "}
          <code className="font-mono text-gryt-text">createGrytTheme</code> call
          away with you, or send the link.
        </p>
      </header>

      <div className="grid min-w-0 items-start gap-(--space-md) lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-2">
          <ThemeEditor
            actions={
              <Button onClick={copyLink} size="small" tone="neutral">
                <LinkIcon aria-hidden="true" size={15} />
                {copied ? "Copied" : "Copy link"}
              </Button>
            }
            appearance={appearance}
            onAppearanceChange={setSiteAppearance}
            onChange={setDraft}
            value={draft}
          />
        </aside>

        <section className="flex min-w-0 flex-col gap-(--space-md)">
          <PreviewStage
            palette={{
              page: draft[appearance].bg,
              accent: draft.hue.accent,
              secondary: draft.hue.secondary
            }}
            theme={theme}
          />

          <div className="min-w-0">
            <h2 className="m-0 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
              Take it away
            </h2>
            <Tabs
              onValueChange={(value) => setExportTab(String(value))}
              value={exportTab}
            >
              <Tabs.List aria-label="Export format">
                <Tabs.Tab value="code">createGrytTheme</Tabs.Tab>
                <Tabs.Tab value="json">JSON</Tabs.Tab>
                <Tabs.Indicator />
              </Tabs.List>
              <Tabs.Panel value="code">
                <CodeBlock
                  code={themeCode(draft)}
                  language="tsx"
                  maxHeight="26rem"
                  title="theme.ts"
                />
              </Tabs.Panel>
              <Tabs.Panel value="json">
                <CodeBlock
                  code={themeJson(draft)}
                  language="json"
                  maxHeight="26rem"
                  title="theme.json"
                />
              </Tabs.Panel>
            </Tabs>
          </div>
        </section>
      </div>

      <p className="max-w-[68ch] text-xs leading-6 text-gryt-muted">
        The ported presets are approximations. Each maps a published palette onto
        Gryt&rsquo;s anchors, which is a different shape from the one it was
        published in, and the names belong to their projects. Where a palette
        ships its own light variant — Latte, Snow Storm, GitHub Light, Solarized
        Light — that is what the light half uses.
      </p>
    </article>
  );
}
