/* The theme controls, as a component rather than as a page.
 *
 * These lived in the docs site, which made the docs site the only place a theme
 * could be built. What somebody wants to know is whether a colour survives a
 * member list, a voice tile and a mention, and none of those are on a
 * documentation page. So it ships here and both hosts mount the same one.
 *
 * What is deliberately not in here:
 *
 * - **The preview.** In the docs it is a panel of specimens; in the client it
 *   is the client. Neither belongs to the editor.
 * - **The address bar.** The docs page writes the theme into the query string
 *   so the link in the bar is the link you paste. There is no bar in a desktop
 *   app, so copying is a slot the host fills.
 * - **Export as code.** Rendering `createGrytTheme` needs a syntax highlighter,
 *   which is a docs dependency. `footer` is where that goes.
 *
 * Import stays, because pasting a link somebody sent you is the other half of
 * sharing one and it needs nothing but the decoder.
 */
import type { GrytAppearance, GrytFontKey, GrytMotion } from "@gryt/theme";
import {
  GRYT_FONT_KEYS,
  GRYT_THEME_NAME_MAX,
  grytFonts,
  grytPresets,
  grytPresetsById
} from "@gryt/theme";
import { ArrowsClockwise } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Select } from "../Select/Select";
import { Slider } from "../Slider/Slider";
import { TextField } from "../TextField/TextField";
import { Toggle, ToggleGroup } from "../Toggle/Toggle";
import { cn } from "../utils/cn";
import { ColorField } from "./ColorField";
import { FontField } from "./FontField";
import { MotionField } from "./MotionField";
import { ContrastReport } from "./ContrastReport";
import { ScaleStrip } from "./ScaleStrip";
import { contrastChecks } from "./contrast";
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
} from "./draft";
import type {
  DraftPath,
  HueKey,
  NeutralKey,
  RadiusKey,
  ThemeDraft
} from "./draft";
import { generateDraft, labelsAreAuto, repairDraft, withAutoLabels } from "./generate";
import { importTheme } from "./share";

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

export interface ThemeEditorProps {
  /** The theme being edited. Controlled, so the host can preview it. */
  value: ThemeDraft;
  onChange: (next: ThemeDraft) => void;
  /**
   * Which half is on the bench.
   *
   * The host's, not the editor's: editing the light half while the app around
   * it is dark would be looking at two themes at once.
   */
  appearance: GrytAppearance;
  onAppearanceChange: (next: GrytAppearance) => void;
  /**
   * Whether a face this machine has to fetch will actually be fetched.
   *
   * The client keeps that behind a setting, so the picker says when a choice
   * will not take effect rather than letting somebody pick a font and wonder
   * why nothing changed. Defaults to true, which is right for the docs site
   * and for anything with no such setting.
   */
  remoteFontsAllowed?: boolean;
  /** End of the header row. Where a host puts its own copy or save control. */
  actions?: ReactNode;
  /** Under the controls. Where the docs site puts the export tabs. */
  footer?: ReactNode;
  className?: string;
}

export function ThemeEditor({
  value: draft,
  onChange,
  appearance,
  onAppearanceChange,
  remoteFontsAllowed = true,
  actions,
  footer,
  className
}: ThemeEditorProps) {
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
    () =>
      labelsAreAuto(draft.hue) &&
      (draft.lightHue === null || labelsAreAuto(draft.lightHue))
  );

  /**
   * A theme the editor did not produce is a theme somebody else chose.
   *
   * The host can replace `value` at any time — a shared link on arrival, a
   * preset picked somewhere else in the app — and when it does, the automatic
   * labels have to be reconsidered exactly as they are for a preset picked in
   * here. Without this, opening a link to Dracula and then touching one slider
   * would quietly rewrite its ink.
   */
  // State rather than a ref, because this is read while rendering and a ref
  // read during render is a lie about when it was written.
  const [emitted, setEmitted] = useState<ThemeDraft | null>(null);
  if (emitted !== null && emitted !== draft) {
    setEmitted(null);
    const auto =
      labelsAreAuto(draft.hue) &&
      (draft.lightHue === null || labelsAreAuto(draft.lightHue));
    if (auto !== autoLabels) setAutoLabels(auto);
  }

  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const theme = useMemo(() => themeStyle(draft, appearance), [draft, appearance]);
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
    grytPresets.find((preset) => draftSignature(preset.theme) === signature)?.id ??
    "custom";

  const neutrals = draft[appearance];
  const slot = hueSlot(draft, appearance);
  const hues = huesFor(draft, appearance);
  const failures = checks.filter(
    (item) => !item.advisory && item.level === "fail"
  ).length;

  function emit(next: ThemeDraft) {
    setEmitted(next);
    onChange(next);
  }

  /** Every edit goes through here, so the automatic labels cannot be bypassed. */
  function commit(change: (current: ThemeDraft) => ThemeDraft) {
    const next = change(draft);
    emit(
      autoLabels
        ? {
            ...next,
            hue: withAutoLabels(next.hue),
            lightHue:
              next.lightHue === null ? null : withAutoLabels(next.lightHue)
          }
        : next
    );
  }

  /** A whole theme from elsewhere: a preset, a link, a paste. */
  function adopt(next: ThemeDraft) {
    setAutoLabels(
      labelsAreAuto(next.hue) &&
        (next.lightHue === null || labelsAreAuto(next.lightHue))
    );
    emit(next);
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
    emit({
      ...draft,
      hue: withAutoLabels(draft.hue),
      lightHue: draft.lightHue === null ? null : withAutoLabels(draft.lightHue)
    });
  }

  function setNeutral(key: NeutralKey, value: string) {
    commit((current) => ({
      ...current,
      [appearance]: { ...current[appearance], [key]: value }
    }));
  }

  function setName(value: string) {
    // Kept as typed and tidied on the way out, so a trailing space while
    // somebody is still typing does not disappear under the cursor.
    commit((current) => ({ ...current, name: value === "" ? undefined : value }));
  }

  /* Fonts are not per-appearance, so this writes one block rather than one
     per half. A theme that changed typeface when somebody flipped to light
     would be two themes. */
  function setFont(role: GrytFontKey, stack: string) {
    commit((current) => ({
      ...current,
      fonts: { ...(current.fonts ?? grytFonts), [role]: stack }
    }));
  }

  function setMotion(next: GrytMotion) {
    commit((current) => ({ ...current, motion: next }));
  }

  function setRadius(key: RadiusKey, value: number) {
    commit((current) => ({
      ...current,
      radius: { ...current.radius, [key]: value }
    }));
  }

  function load(text: string) {
    const result = importTheme(text);
    if (result.error !== undefined || result.draft === undefined) {
      setImportError(result.error ?? "That did not look like a theme.");
      return;
    }
    adopt(result.draft);
    if (result.appearance !== undefined) onAppearanceChange(result.appearance);
    setImportError(null);
    setImportText("");
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-(--space-md)", className)}>
      <div className="flex flex-wrap items-end gap-3 border-y border-gryt-border py-3">
        <div className="w-52">
          <Select
            label="Preset"
            onValueChange={(value) => {
              const preset = grytPresetsById.get(String(value));
              if (preset) adopt(preset.theme);
            }}
            options={[
              ...grytPresets.map((preset) => ({
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

        {/* Named here rather than by whoever receives it. The name rides in
            the link, so a theme arrives at the client already called
            something, and the person importing it is not asked a question its
            author already answered. */}
        <div className="w-48">
          <TextField
            label="Name"
            maxLength={GRYT_THEME_NAME_MAX}
            onChange={(event) => setName(event.target.value)}
            placeholder="Untitled theme"
            size="small"
            value={draft.name ?? ""}
          />
        </div>

        <Button onClick={() => adopt(generateDraft())} size="small" tone="neutral">
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
              if (next === "dark" || next === "light") onAppearanceChange(next);
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
          {actions}
        </div>
      </div>

      <p className="m-0 text-xs text-gryt-muted">
        Editing the {appearance} half. The neutrals below belong to it
        {draft.lightHue === null
          ? "; the hues are shared, because step 9 is the same colour in both."
          : " and so do the hues."}
      </p>

      <div className="flex flex-col gap-2">
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
          <ScaleStrip label="secondary" steps={scaleFrom(theme, "secondary")} />
        </Group>

        <Group title="Status">
          {(
            [
              "success",
              "danger",
              "dangerLight",
              "onDanger",
              "warning"
            ] as HueKey[]
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

        <Group title="Type">
          {GRYT_FONT_KEYS.map((role) => (
            <FontField
              key={role}
              fonts={draft.fonts}
              onChange={(stack) => setFont(role, stack)}
              remoteAllowed={remoteFontsAllowed}
              role={role}
            />
          ))}
        </Group>

        <Group title="Motion">
          <MotionField motion={draft.motion} onChange={setMotion} />
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
                      key === "full" && number >= RADIUS_MAX.full ? PILL : number
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
          onRepair={failures > 0 ? () => emit(repairDraft(draft)) : undefined}
        />

        <section className="min-w-0">
          <h2 className="m-0 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
            Load one back
          </h2>
          <p className="m-0 pb-2 text-sm text-gryt-muted">
            Paste a theme&rsquo;s JSON, or a link somebody sent you.
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
            <p className="m-0 pt-2 text-sm text-gryt-danger-11">{importError}</p>
          ) : null}
        </section>

        {footer}
      </div>
    </div>
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
