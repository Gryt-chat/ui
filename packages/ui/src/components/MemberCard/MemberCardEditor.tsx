"use client";

import { type CSSProperties, type ReactNode, useMemo, useState } from "react";

import { BUILTIN_CARD_STYLES, randomCardStyle, styleSwatch } from "../../memberCard/builtinStyles";
import { type CardStyle, decodeCardStyle, encodeCardStyle } from "../../memberCard/cardStyle";
import { cardVars } from "../../memberCard/cardVars";
import { isTunable } from "../../memberCard/patterns";
import { Button } from "../Button/Button";
import { Select } from "../Select/Select";
import { TextField } from "../TextField/TextField";
import { Toggle, ToggleGroup } from "../Toggle/Toggle";
import { PatternPicker, PatternTuning } from "./cardPatternPicker";

/** The colours a Solid or Gradient pick starts from. */
const START = { c1: "#7c5cff", c2: "#ff7a59", angle: 135 };

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-gryt-text">{title}</span>
        {description && <span className="text-xs text-gryt-muted">{description}</span>}
      </div>
      {children}
    </section>
  );
}

export interface MemberCardEditorProps {
  /** The style being edited. */
  value: CardStyle;
  onChange: (next: CardStyle) => void;
  /** The owl's colour, which the "Owl colour" fill and the default card use. */
  owlHex: string;
  nickname?: string;
  worn?: string | null;
  seed: number;
  appearance: "light" | "dark";
  /** Makes a link from a style code, like the theme generator's. Without one, Copy style copies the code. */
  shareLink?: (code: string) => string;
  /** Sections that belong to the app, like bio or banner, drawn after the colours and before the styles. */
  children?: ReactNode;
}

/**
 * Everything about how a member card looks: colour, pattern and its tuning, where the
 * colour and pattern go, built-in styles, Surprise me, and a code or link to share it.
 */
export function MemberCardEditor({ value: style, onChange, owlHex, nickname = "", worn = null, seed, appearance, shareLink, children }: MemberCardEditorProps) {
  const [picks, setPicks] = useState(() => ({
    c1: style.c1 ?? START.c1,
    c2: style.c2 ?? START.c2,
    angle: style.fill === "gradient" ? style.angle : START.angle,
  }));
  const [code, setCode] = useState(() => encodeCardStyle(style));
  const [codeNote, setCodeNote] = useState<{ ok: boolean; text: string } | null>(null);
  // The box follows the style whenever the style changes from anywhere, typing included.
  const [shown, setShown] = useState(style);
  if (shown !== style) {
    setShown(style);
    setCode(encodeCardStyle(style));
  }

  const drawn = useMemo(() => cardVars(style, owlHex, { appearance, seed }), [style, owlHex, appearance, seed]);
  const change = (over: Partial<CardStyle>) => onChange({ ...style, ...over });
  const colourOf = (fill: CardStyle["fill"], p = picks): Partial<CardStyle> =>
    fill === "owl" ? { fill: "owl", c1: undefined, c2: undefined } : { fill, c1: p.c1, c2: fill === "gradient" ? p.c2 : p.c1, angle: p.angle };
  const pick = (next: typeof picks) => {
    setPicks(next);
    change(colourOf(style.fill, next));
  };
  const apply = (next: CardStyle) => {
    if (next.fill !== "owl" && next.c1) setPicks({ c1: next.c1, c2: next.c2 ?? next.c1, angle: next.angle });
    onChange({ ...next });
  };
  const copy = () => {
    const text = shareLink ? shareLink(encodeCardStyle(style)) : encodeCardStyle(style);
    void navigator.clipboard?.writeText(text).then(
      () => setCodeNote({ ok: true, text: shareLink ? "Link copied" : "Style copied" }),
      () => setCodeNote({ ok: false, text: "Couldn't copy. The code is in the box above." }),
    );
  };

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Group title="Card colour" description="The owl's colour to start with. The text and buttons are worked out from it, so small text stays readable.">
        <ToggleGroup
          value={[style.fill]}
          onValueChange={(v) => change(colourOf((v[0] as CardStyle["fill"] | undefined) ?? style.fill))}
          aria-label="Card colour"
        >
          <Toggle value="owl" size="small">Owl colour</Toggle>
          <Toggle value="solid" size="small">Solid</Toggle>
          <Toggle value="gradient" size="small">Gradient</Toggle>
        </ToggleGroup>
        {style.fill !== "owl" && (
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="color"
              aria-label="First colour"
              value={picks.c1}
              onChange={(e) => pick({ ...picks, c1: e.target.value })}
              className="h-8 w-11 cursor-pointer rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-surface p-0.5"
            />
            {style.fill === "gradient" && (
              <>
                <input
                  type="color"
                  aria-label="Second colour"
                  value={picks.c2}
                  onChange={(e) => pick({ ...picks, c2: e.target.value })}
                  className="h-8 w-11 cursor-pointer rounded-(--gryt-radius-sm) border border-gryt-border bg-gryt-surface p-0.5"
                />
                <input
                  aria-label="Angle"
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={picks.angle}
                  onChange={(e) => pick({ ...picks, angle: Number(e.target.value) })}
                  style={{ flex: 1, minWidth: 120, accentColor: "var(--gryt-accent)" }}
                />
                <output className="min-w-[3.5em] font-mono text-xs text-gryt-muted">{picks.angle}°</output>
              </>
            )}
          </div>
        )}
      </Group>

      <Group title="Pattern" description="Drawn from the colour, so there's nothing to upload.">
        <PatternPicker style={style} owlHex={owlHex} nickname={nickname} worn={worn} seed={seed} appearance={appearance} onPick={change} />
      </Group>

      {isTunable(style.pattern) && (
        <Group title="Customise pattern" description="Size, turn, strength and colour. The strength is turned down if it would make small text hard to read.">
          <PatternTuning style={style} effectiveInk={drawn.patternInk} effectiveAlpha={drawn.patternAlpha} onChange={change} />
        </Group>
      )}

      <Group title="Colour fills" description="The whole card, or only the banner and the band under it.">
        <Select
          value={style.colours}
          onValueChange={(v) => change({ colours: v === "banner" ? "banner" : "card" })}
          options={[
            { value: "card", label: "The whole card" },
            { value: "banner", label: "The banner and band" },
          ]}
        />
      </Group>

      {style.colours === "card" && (
        <>
          <Group title="Pattern covers" description="Just the banner, or the whole card behind everything.">
            <Select
              value={style.cover}
              onValueChange={(v) => change({ cover: v === "card" ? "card" : "banner" })}
              options={[
                { value: "banner", label: "The banner" },
                { value: "card", label: "The whole card" },
              ]}
            />
          </Group>
          <Group title="Banner fade" description="Fade only the bottom of the banner into the card, or all of it so there's no edge.">
            <Select
              value={style.fade}
              onValueChange={(v) => change({ fade: v === "banner" ? "banner" : "bottom" })}
              options={[
                { value: "bottom", label: "Bottom" },
                { value: "banner", label: "Whole banner" },
              ]}
            />
          </Group>
        </>
      )}

      {children}

      <Group title="Card styles" description="A style is a card's colours and pattern. It never carries a banner, bio or pronouns.">
        <div className="flex flex-wrap gap-1.5">
          {BUILTIN_CARD_STYLES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => apply(b.style)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gryt-border bg-gryt-surface-raised py-1 pr-2.5 pl-1 text-[12.5px] font-bold text-gryt-text hover:bg-gryt-surface-hover"
            >
              <i className="h-[18px] w-[18px] rounded-full border border-gryt-border" style={{ background: styleSwatch(b.style) } as CSSProperties} />
              {b.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => apply(randomCardStyle())}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gryt-border bg-gryt-surface-raised px-2.5 py-1 text-[12.5px] font-bold text-gryt-text hover:bg-gryt-surface-hover"
          >
            Surprise me
          </button>
        </div>
        <TextField
          aria-label="Style code or link"
          spellCheck={false}
          autoComplete="off"
          value={code}
          placeholder="Paste a card link or style code"
          onChange={(e) => {
            setCode(e.target.value);
            setCodeNote(null);
          }}
          className="font-mono"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="small" tone="neutral" onClick={copy}>
            {shareLink ? "Copy link" : "Copy style"}
          </Button>
          <Button
            size="small"
            tone="neutral"
            onClick={() => {
              const next = decodeCardStyle(code);
              if (!next) return setCodeNote({ ok: false, text: "There's no card style in that. Paste a card link or a style code." });
              apply(next);
              setCodeNote({ ok: true, text: "Style applied" });
            }}
          >
            Use this style
          </Button>
        </div>
        {codeNote && <span className={codeNote.ok ? "text-xs text-gryt-muted" : "text-xs text-gryt-danger-11"}>{codeNote.text}</span>}
      </Group>
    </div>
  );
}
