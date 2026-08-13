/* Hallmark · genre: modern-minimal · macrostructure: Workbench
 * theme: custom (Gryt code-theme, OKLCH) · nav: inherited N13 · footer: inherited Ft2
 * enrichment: none · design-system: design.md · designed-as-app
 */
import {
  Button,
  Checkbox,
  Select,
  Slider,
  Tabs,
  Toggle,
  ToggleGroup
} from "@gryt/ui";
import { ArrowsClockwise, Link as LinkIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { CodeBlock } from "../components/CodeBlock";
import { ColorField } from "../components/theme/ColorField";
import { ContrastReport } from "../components/theme/ContrastReport";
import { PreviewStage } from "../components/theme/PreviewStage";
import { ScaleStrip } from "../components/theme/ScaleStrip";
import { contrastChecks } from "../lib/theme/contrast";
import {
  HUE_LABELS,
  NEUTRAL_LABELS,
  RADIUS_HINTS,
  RADIUS_KEYS,
  RADIUS_LABELS,
  draftSignature,
  hueSlot,
  huesFor,
  scaleFrom,
  themeStyle
} from "../lib/theme/draft";
import type {
  Appearance,
  DraftPath,
  HueKey,
  NeutralKey,
  RadiusKey,
  ThemeDraft
} from "../lib/theme/draft";
import {
  generateDraft,
  labelsAreAuto,
  repairDraft,
  withAutoLabels
} from "../lib/theme/generate";
import { presets, presetsById } from "../lib/theme/presets";
import {
  decodeDraft,
  encodeDraft,
  importTheme,
  themeCode,
  themeJson
} from "../lib/theme/share";

/**
 * How far each radius slider travels.
 *
 * `full` is the odd one: the token is 999px, and a slider that ran to 999 would
 * put every value anybody wants inside the first four percent of the track. So
 * it travels to 40 and the far end means pill, which is the only thing past 40
 * that anyone picks.
 */
const RADIUS_MAX: Record<RadiusKey, number> = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
  full: 40
};
const PILL = 999;

const SURFACE_KEYS: NeutralKey[] = [
  "bg",
  "surface",
  "surfaceRaised",
  "surfaceHover",
  "border"
];
const TEXT_KEYS: NeutralKey[] = ["text", "muted"];

export function ThemeGeneratorPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Read once. Re-reading would fight the editor every time the link is copied.
  const [shared] = useState(() => decodeDraft(searchParams));

  const [draft, setDraft] = useState<ThemeDraft>(shared.draft);
  const [appearance, setAppearance] = useState<Appearance>(shared.appearance);
  /**
   * Whether the label colours follow their fills.
   *
   * On by default, because picking the ink for a filled button by hand is a
   * job with one right answer and it is the answer people get wrong — the
   * library's own accent shipped at 6.7:1 for a year. It turns itself off when
   * a theme arrives carrying labels somebody else chose, which is every ported
   * preset: overwriting Dracula's ink would make it not Dracula.
   */
  const [autoLabels, setAutoLabels] = useState(
    labelsAreAuto(shared.draft.hue) &&
      (shared.draft.lightHue === null || labelsAreAuto(shared.draft.lightHue))
  );
  const [exportTab, setExportTab] = useState("code");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const theme = useMemo(
    () => themeStyle(draft, appearance),
    [draft, appearance]
  );
  const checks = useMemo(
    () => contrastChecks(draft, theme, appearance),
    [draft, theme, appearance]
  );
  const warnings = useMemo(() => {
    const map = new Map<DraftPath, string>();
    for (const item of checks) {
      if (item.advisory || item.level !== "fail") continue;
      for (const path of item.paths) {
        if (!map.has(path)) {
          map.set(path, `${item.label}: ${item.ratio.toFixed(1)}, needs ${item.min}`);
        }
      }
    }
    return map;
  }, [checks]);

  const signature = draftSignature(draft);
  const activePreset =
    presets.find((preset) => draftSignature(preset.draft) === signature)?.id ??
    "custom";

  const neutrals = draft[appearance];
  const slot = hueSlot(draft, appearance);
  const hues = huesFor(draft, appearance);

  /** Every edit goes through here, so the automatic labels cannot be bypassed. */
  function commit(change: (current: ThemeDraft) => ThemeDraft) {
    setDraft((current) => {
      const next = change(current);
      if (!autoLabels) return next;
      return {
        ...next,
        hue: withAutoLabels(next.hue),
        lightHue: next.lightHue === null ? null : withAutoLabels(next.lightHue)
      };
    });
  }

  /** A whole theme from elsewhere: a preset, a link, a paste. */
  function adopt(next: ThemeDraft) {
    const auto =
      labelsAreAuto(next.hue) &&
      (next.lightHue === null || labelsAreAuto(next.lightHue));
    setAutoLabels(auto);
    setDraft(next);
  }

  function setHue(key: HueKey, value: string) {
    commit((current) => {
      const target = hueSlot(current, appearance);
      return {
        ...current,
        [target]: { ...huesFor(current, appearance), [key]: value }
      };
    });
  }

  /**
   * Give light its own hues, or take them away again.
   *
   * Off is the library's own arrangement and the right default: a filled
   * button that changes colour when somebody flips appearance is usually a
   * mistake. On is for palettes where it is not — Catppuccin and GitHub both
   * publish a different accent per half, and forcing one on them would make
   * the preset wrong in one of the two.
   */
  function toggleSplit(split: boolean) {
    commit((current) => ({
      ...current,
      lightHue: split ? { ...current.hue } : null
    }));
  }

  /** Turning it on repairs what is there; turning it off leaves it as it is. */
  function toggleAutoLabels(auto: boolean) {
    setAutoLabels(auto);
    if (!auto) return;
    setDraft((current) => ({
      ...current,
      hue: withAutoLabels(current.hue),
      lightHue:
        current.lightHue === null ? null : withAutoLabels(current.lightHue)
    }));
  }

  function setNeutral(key: NeutralKey, value: string) {
    commit((current) => ({
      ...current,
      [appearance]: { ...current[appearance], [key]: value }
    }));
  }

  function setRadius(key: RadiusKey, value: number) {
    commit((current) => ({
      ...current,
      radius: { ...current.radius, [key]: value }
    }));
  }

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
    setCopied("link");
    window.setTimeout(() => setCopied(null), 1600);
  }

  function load(text: string) {
    const result = importTheme(text);
    if (result.error !== undefined || result.draft === undefined) {
      setImportError(result.error ?? "That did not look like a theme.");
      return;
    }
    adopt(result.draft);
    if (result.appearance !== undefined) setAppearance(result.appearance);
    setImportError(null);
    setImportText("");
  }

  const failures = checks.filter(
    (item) => !item.advisory && item.level === "fail"
  ).length;

  return (
    <article className="flex min-w-0 flex-col gap-(--space-md)">
      <header className="max-w-[68ch]">
        <p className="m-0 font-mono text-xs tracking-wide text-gryt-accent">
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

      <div className="flex flex-wrap items-end gap-3 border-y border-gryt-border py-3">
        <div className="w-52">
          <Select
            label="Preset"
            onValueChange={(value) => {
              const preset = presetsById.get(String(value));
              if (preset) adopt(preset.draft);
            }}
            options={[
              ...presets.map((preset) => ({
                label: preset.name,
                value: preset.id
              })),
              ...(activePreset === "custom"
                ? [{ label: "Custom", value: "custom" }]
                : [])
            ]}
            size="small"
            value={activePreset}
          />
        </div>

        <Button
          onClick={() => adopt(generateDraft())}
          size="small"
          tone="neutral"
        >
          <ArrowsClockwise aria-hidden="true" size={15} />
          Generate
        </Button>

        <div className="ml-auto flex items-end gap-3">
          <ToggleGroup
            aria-label="Appearance"
            // Last one wins, and an empty array is a click on the one already
            // pressed — which should leave the appearance alone rather than
            // switch to neither.
            onValueChange={(value: string[]) => {
              const next = value[value.length - 1];
              if (next === "dark" || next === "light") setAppearance(next);
            }}
            value={[appearance]}
          >
            <Toggle size="small" value="dark">
              Dark
            </Toggle>
            <Toggle size="small" value="light">
              Light
            </Toggle>
          </ToggleGroup>

          <Button onClick={copyLink} size="small" tone="neutral">
            <LinkIcon aria-hidden="true" size={15} />
            {copied === "link" ? "Copied" : "Copy link"}
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-(--space-md) lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pr-2">
          <p className="m-0 pb-2 text-xs text-gryt-muted">
            Editing the {appearance} half. The neutrals below belong to it
            {draft.lightHue === null
              ? "; the hues are shared, because step 9 is the same colour in both."
              : " and so do the hues."}
          </p>

          <div className="flex flex-col gap-2 pb-3">
            {appearance === "light" ? (
              <label className="flex cursor-pointer items-center gap-2 text-xs text-gryt-muted">
                <Checkbox
                  checked={draft.lightHue !== null}
                  onCheckedChange={toggleSplit}
                />
                Light has its own hues
              </label>
            ) : null}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gryt-muted">
              <Checkbox checked={autoLabels} onCheckedChange={toggleAutoLabels} />
              Pick label colours automatically
            </label>
          </div>

          <div className="flex flex-col gap-(--space-md)">
            <Group title="Surfaces">
              {SURFACE_KEYS.map((key) => (
                <ColorField
                  key={key}
                  label={NEUTRAL_LABELS[key]}
                  onChange={(value) => setNeutral(key, value)}
                  value={neutrals[key]}
                  warning={warnings.get(`${appearance}.${key}`)}
                />
              ))}
              <ScaleStrip label="neutral" steps={scaleFrom(theme, "neutral")} />
            </Group>

            <Group title="Text">
              {TEXT_KEYS.map((key) => (
                <ColorField
                  key={key}
                  label={NEUTRAL_LABELS[key]}
                  onChange={(value) => setNeutral(key, value)}
                  value={neutrals[key]}
                  warning={warnings.get(`${appearance}.${key}`)}
                />
              ))}
            </Group>

            <Group title="Accent">
              {(["accent", "accentLight", "onAccent"] as HueKey[]).map((key) => (
                <ColorField
                  key={key}
                  disabled={autoLabels && key === "onAccent"}
                  label={HUE_LABELS[key]}
                  onChange={(value) => setHue(key, value)}
                  value={hues[key]}
                  warning={warnings.get(`${slot}.${key}`)}
                />
              ))}
              <ScaleStrip label="accent" steps={scaleFrom(theme, "accent")} />
            </Group>

            <Group title="Secondary">
              {(["secondary", "secondaryLight", "onSecondary"] as HueKey[]).map(
                (key) => (
                  <ColorField
                    key={key}
                    disabled={autoLabels && key === "onSecondary"}
                    label={HUE_LABELS[key]}
                    onChange={(value) => setHue(key, value)}
                    value={hues[key]}
                    warning={warnings.get(`${slot}.${key}`)}
                  />
                )
              )}
              <ScaleStrip
                label="secondary"
                steps={scaleFrom(theme, "secondary")}
              />
            </Group>

            <Group title="Status">
              {(
                ["success", "danger", "dangerLight", "onDanger", "warning"] as HueKey[]
              ).map((key) => (
                <ColorField
                  key={key}
                  disabled={autoLabels && key === "onDanger"}
                  label={HUE_LABELS[key]}
                  onChange={(value) => setHue(key, value)}
                  value={hues[key]}
                  warning={warnings.get(`${slot}.${key}`)}
                />
              ))}
              <ScaleStrip label="success" steps={scaleFrom(theme, "success")} />
              <ScaleStrip label="danger" steps={scaleFrom(theme, "danger")} />
              <ScaleStrip label="warning" steps={scaleFrom(theme, "warning")} />
            </Group>

            <Group title="Radius">
              {RADIUS_KEYS.map((key) => {
                const value = draft.radius[key];
                const position =
                  key === "full" && value >= PILL ? RADIUS_MAX.full : value;
                return (
                  <div key={key} className="min-w-0">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-xs font-medium text-gryt-muted">
                        {RADIUS_LABELS[key]}
                      </span>
                      <span className="font-mono text-[11px] text-gryt-muted">
                        {value >= PILL ? "pill" : `${value}px`}
                      </span>
                    </div>
                    <Slider
                      aria-label={`${RADIUS_LABELS[key]} radius`}
                      max={RADIUS_MAX[key]}
                      min={0}
                      onValueChange={(next) => {
                        const number = Number(next);
                        setRadius(
                          key,
                          key === "full" && number >= RADIUS_MAX.full
                            ? PILL
                            : number
                        );
                      }}
                      value={Math.min(position, RADIUS_MAX[key])}
                    />
                    <p className="m-0 pt-1 text-[11px] text-gryt-muted">
                      {RADIUS_HINTS[key]}
                    </p>
                  </div>
                );
              })}
            </Group>

            <ContrastReport
              checks={checks}
              onRepair={
                failures > 0
                  ? () => setDraft((current) => repairDraft(current))
                  : undefined
              }
            />
          </div>
        </aside>

        <section className="flex min-w-0 flex-col gap-(--space-md)">
          <PreviewStage
            palette={{
              page: neutrals.bg,
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

            <div className="pt-(--space-md)">
              <h2 className="m-0 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
                Load one back
              </h2>
              <p className="m-0 pb-2 text-sm text-gryt-muted">
                Paste the JSON above, or a link somebody sent you.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                  aria-label="Theme JSON or a shared link"
                  className="min-h-11 flex-1 rounded-(--gryt-radius-xl) border border-gryt-border bg-gryt-surface-raised px-4 py-2.5 font-mono text-sm text-gryt-text outline-none placeholder:text-gryt-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="{ …"
                  rows={2}
                  spellCheck={false}
                  value={importText}
                />
                <Button onClick={() => load(importText)} tone="neutral">
                  Load
                </Button>
              </div>
              {importError ? (
                <p className="m-0 pt-2 text-sm text-gryt-danger">{importError}</p>
              ) : null}
            </div>
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

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0">
      <h2 className="m-0 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
