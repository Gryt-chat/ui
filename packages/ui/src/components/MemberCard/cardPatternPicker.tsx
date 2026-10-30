"use client";

import { Button } from "../Button/Button";
import type { EmojiPickerGroup } from "../EmojiPicker/EmojiPicker";
import { Popover } from "../Popover/Popover";
import { Select } from "../Select/Select";
import { Slider } from "../Slider/Slider";
import { Tooltip } from "../Tooltip/Tooltip";
import { type CSSProperties, lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_EMOJI, DEFAULT_ICON, usePatternAssets } from "./patternAssets";
import { type CardStyle, PATTERN_FADES, type PatternFade, TUNING } from "../../memberCard/cardStyle";
import { cardVars } from "../../memberCard/cardVars";
import { GRYT_MARK } from "../../memberCard/grytMark";
import { CARD_PATTERNS, cardPattern, isTunable, PATTERN_GROUPS } from "../../memberCard/patterns";
import type { Tile } from "../../memberCard/patterns/tileTypes";
import { patternLayers, type PatternMark } from "../../memberCard/patternSvg";

const IconPicker = lazy(() => import("./cardIconPicker"));
const EmojiPatternPicker = lazy(() => import("./cardEmojiPicker"));

const FADE_LABEL: Record<PatternFade, string> = {
  none: "No fade",
  top: "Fade to the top",
  bottom: "Fade to the bottom",
  left: "Fade to the left",
  right: "Fade to the right",
  radial: "Fade to the edges",
};

interface PickerProps {
  style: CardStyle;
  owlHex: string;
  nickname: string;
  worn: string | null;
  seed: number;
  appearance: "light" | "dark";
  emojiGroups: readonly EmojiPickerGroup[];
  onPick: (over: Partial<CardStyle>) => void;
}

function emojiLabel(picked: string | undefined): string {
  if (picked?.startsWith("unicode:")) return picked.slice(8);
  return picked ? "server emoji" : DEFAULT_EMOJI.slice(8);
}

interface TilePaint {
  ink: string;
  alpha: number;
  ground: string;
  surface: string;
  owl: string;
}

const REPAINT_DELAY_MS = 120;
const REPAINT_BATCH = 8;
const GRYT_FACES: PatternMark = { ...GRYT_MARK, mono: false };
const ORDERED_PATTERNS = PATTERN_GROUPS.flatMap((group) => CARD_PATTERNS.filter((p) => p.group === group));
const TILE_ORDER = new Map(ORDERED_PATTERNS.map((p, i) => [p.id, i]));

/** Tiles below `count` wear `to` and the rest keep `from`, so a colour drag only repaints the card. */
function useRepaintInBatches(paint: TilePaint) {
  const [run, setRun] = useState({ from: paint, to: paint, count: ORDERED_PATTERNS.length });
  useEffect(() => {
    let frame = 0;
    let count = 0;
    const timer = setTimeout(() => {
      setRun((prev) => (prev.to === paint ? prev : { from: prev.to, to: paint, count: 0 }));
      const step = () => {
        count += REPAINT_BATCH;
        setRun((prev) => ({ ...prev, count }));
        if (count < ORDERED_PATTERNS.length) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, REPAINT_DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [paint]);
  return run;
}

const PatternTile = memo(function PatternTile({
  id,
  name,
  scatter,
  paint,
  tile,
  mark,
  seed,
  picked,
  onChoose,
}: {
  id: string;
  name: string;
  scatter: boolean;
  paint: TilePaint;
  tile: Tile | undefined;
  mark: PatternMark | undefined;
  seed: number;
  picked: boolean;
  onChoose: (id: string) => void;
}) {
  const layers = patternLayers(
    id,
    {
      ink: paint.ink,
      // Stronger than on the card, so a 56px swatch still shows its pattern.
      alpha: Math.max(paint.alpha, 0.35),
      // Scattered marks are drawn smaller, or a 56px swatch holds one of them.
      scale: scatter ? 0.45 : 0.8,
      rotate: 0,
      fade: "none",
      seed,
      tile,
      mark,
    },
    { owl: paint.owl, accent: paint.ink, surface: paint.surface },
  );
  return (
    <Tooltip title={name}>
      <button
        type="button"
        aria-label={name}
        aria-pressed={picked}
        onClick={() => onChoose(id)}
        className="h-10 cursor-pointer rounded-(--gryt-radius-sm) border-0 p-0"
        style={
          {
            background: [layers.image, layers.base ?? paint.ground].filter(Boolean).join(", "),
            boxShadow: picked ? "0 0 0 2px var(--gryt-surface), 0 0 0 4px var(--gryt-text)" : "inset 0 0 0 1px var(--gryt-border)",
          } as CSSProperties
        }
      />
    </Tooltip>
  );
});

/**
 * Every pattern as a swatch in your card's own colours, under its heading. The tiles
 * load in one go the first time this opens; scatter swatches use the mark they strew.
 */
export function PatternPicker({ style, owlHex, nickname, worn, seed, appearance, emojiGroups, onPick }: PickerProps) {
  const [tiles, setTiles] = useState<Map<string, Tile> | null>(null);
  const icon = usePatternAssets({ ...style, pattern: "icon" }, { nickname, worn }).mark;
  const owl = usePatternAssets({ ...style, pattern: "my-owl" }, { nickname, worn }).mark;
  const emoji = usePatternAssets({ ...style, pattern: "emoji" }, { nickname, worn }, emojiGroups).mark;

  useEffect(() => {
    let live = true;
    void import("../../memberCard/patterns/tiles.generated").then((m) => {
      if (live) setTiles(new Map(m.TILES.map((t) => [t.id, t])));
    });
    return () => {
      live = false;
    };
  }, []);

  /* The card's colours once; each swatch only swaps the pattern layer. */
  const card = useMemo(() => cardVars({ ...style, pattern: "none", pFade: "none" }, owlHex, { appearance, seed }), [style, owlHex, appearance, seed]);
  const ground = card.vars["--fc-bg"] ?? card.vars["--base"] ?? owlHex;

  const surface = card.vars["--fc-mid"] ?? owlHex;
  const ink = card.patternInk;
  const alpha = card.patternAlpha;
  const paint = useMemo<TilePaint>(() => ({ ink, alpha, ground, surface, owl: owlHex }), [ink, alpha, ground, surface, owlHex]);
  const run = useRepaintInBatches(paint);

  const marks: Record<string, PatternMark | undefined> = { "gryt-faces": GRYT_FACES, "my-owl": owl, icon, emoji };
  const pickRef = useRef(onPick);
  useEffect(() => {
    pickRef.current = onPick;
  });
  const choose = useCallback((id: string) => pickRef.current({ pattern: id }), []);

  return (
    <div className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-(--gryt-radius-md) border border-gryt-border p-2.5">
      <p className="sticky top-0 z-10 -mx-2.5 -mt-2.5 m-0 border-b border-gryt-border bg-gryt-surface px-2.5 py-1.5 text-xs text-gryt-muted">
        Selected: <b className="text-gryt-text">{cardPattern(style.pattern).name}</b>
      </p>
      {PATTERN_GROUPS.map((group) => (
        <div key={group} className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-gryt-muted">{group}</span>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-1.5">
            {CARD_PATTERNS.filter((p) => p.group === group).map((p) => (
              <PatternTile
                key={p.id}
                id={p.id}
                name={p.name}
                scatter={p.kind === "scatter"}
                paint={(TILE_ORDER.get(p.id) ?? 0) < run.count ? run.to : run.from}
                tile={tiles?.get(p.id)}
                mark={marks[p.id]}
                seed={seed}
                picked={style.pattern === p.id}
                onChoose={choose}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** A labelled Gryt UI slider with its value beside it. */
export function Range({
  id,
  label,
  min,
  max,
  step,
  value,
  unit,
  onChange,
}: {
  id: string;
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {label && (
        <span id={id + "-label"} className="w-20 text-xs font-bold text-gryt-muted">
          {label}
        </span>
      )}
      <Slider
        aria-label={label ?? id}
        className="min-w-[120px] flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
      />
      <output className="min-w-[3.5em] font-mono text-xs text-gryt-muted">
        {value}
        {unit}
      </output>
    </div>
  );
}

/** Size, turn, strength, fade, shuffle and colour, for a pattern that draws lines or marks. */
export function PatternTuning({
  style,
  effectiveInk,
  effectiveAlpha,
  emojiGroups,
  onChange,
}: {
  style: CardStyle;
  effectiveInk: string;
  effectiveAlpha: number;
  emojiGroups: readonly EmojiPickerGroup[];
  onChange: (over: Partial<CardStyle>) => void;
}) {
  const pattern = cardPattern(style.pattern);
  const [iconOpen, setIconOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  if (!isTunable(pattern.id)) return null;
  const strength = Math.round(effectiveAlpha * 100);
  const limited = style.pOpacity !== undefined && strength < style.pOpacity;
  return (
    <div className="flex flex-col gap-2.5">
      {pattern.id === "icon" && (
        <Popover.Root open={iconOpen} onOpenChange={setIconOpen}>
          <Popover.Trigger render={<Button size="small" tone="neutral" />}>
            Choose icon · {style.pIcon ?? DEFAULT_ICON}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner align="start">
              <Popover.Popup className="w-[min(22rem,calc(100vw-2rem))] p-3">
                <Popover.Title>Pattern icon</Popover.Title>
                <Popover.Description>Search every Phosphor icon.</Popover.Description>
                <div className="mt-3">
                  <Suspense fallback={<span className="text-xs text-gryt-muted">Loading icons…</span>}>
                    <IconPicker
                      value={style.pIcon}
                      onPick={(name) => {
                        onChange({ pIcon: name });
                        setIconOpen(false);
                      }}
                    />
                  </Suspense>
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
      {pattern.id === "emoji" && (
        <Popover.Root open={emojiOpen} onOpenChange={setEmojiOpen}>
          <Popover.Trigger render={<Button size="small" tone="neutral" />}>
            Choose emoji · {emojiLabel(style.pEmoji)}
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner align="start">
              <Popover.Popup className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0">
                <Suspense fallback={<span className="block p-4 text-xs text-gryt-muted">Loading emoji…</span>}>
                  <EmojiPatternPicker
                    customGroups={emojiGroups}
                    value={style.pEmoji}
                    onPick={(item) => {
                      onChange({ pEmoji: item.id });
                      setEmojiOpen(false);
                    }}
                  />
                </Suspense>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      )}
      <Range id="p-scale" label="Size" min={TUNING.pScale.min} max={TUNING.pScale.max} value={style.pScale} unit="%" onChange={(v) => onChange({ pScale: v })} />
      <Range id="p-rotate" label="Rotation" min={TUNING.pRotate.min} max={TUNING.pRotate.max} value={style.pRotate} unit="°" onChange={(v) => onChange({ pRotate: v })} />
      {pattern.kind !== "scatter" && (
        <Range id="p-stroke" label="Line weight" min={TUNING.pStroke.min} max={TUNING.pStroke.max} value={style.pStroke ?? TUNING.pStroke.default} unit="%" onChange={(v) => onChange({ pStroke: v === TUNING.pStroke.default ? undefined : v })} />
      )}
      <Range
        id="p-opacity"
        label="Strength"
        min={TUNING.pOpacity.min}
        max={TUNING.pOpacity.max}
        value={Math.min(TUNING.pOpacity.max, Math.max(TUNING.pOpacity.min, style.pOpacity ?? strength))}
        unit="%"
        onChange={(v) => onChange({ pOpacity: v })}
      />
      {limited && <span className="text-xs text-gryt-muted">Held at {strength}% so the small text on your card stays readable.</span>}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="w-20 text-xs font-bold text-gryt-muted">Fade</span>
        <div className="min-w-40 flex-1">
          <Select
            value={style.pFade}
            onValueChange={(v) => onChange({ pFade: (PATTERN_FADES as readonly string[]).includes(String(v)) ? (v as PatternFade) : "none" })}
            options={PATTERN_FADES.map((f) => ({ value: f, label: FADE_LABEL[f] }))}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <label htmlFor="p-ink" className="w-20 text-xs font-bold text-gryt-muted">
          Colour
        </label>
        <input
          id="p-ink"
          type="color"
          value={style.pInk ?? effectiveInk}
          onChange={(e) => onChange({ pInk: e.target.value })}
          className="h-8 w-11 cursor-pointer rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-surface p-0.5"
        />
        {style.pInk && (
          <Button size="small" tone="neutral" onClick={() => onChange({ pInk: undefined })}>
            Use the card&rsquo;s own
          </Button>
        )}
        {pattern.kind === "scatter" && (
          <Button size="small" tone="neutral" onClick={() => onChange({ pSeed: Math.floor(Math.random() * (TUNING.pSeed.max + 1)) })}>
            Shuffle
          </Button>
        )}
        <Button
          size="small"
          tone="neutral"
          onClick={() => onChange({ pScale: 100, pRotate: 0, pOpacity: undefined, pFade: "none", pSeed: undefined, pInk: undefined, pStroke: undefined })}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
