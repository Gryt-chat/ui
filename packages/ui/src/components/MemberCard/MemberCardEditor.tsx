"use client";

import { Palette, Shuffle, SquaresFour, Swatches } from "@phosphor-icons/react";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";

import { type BannerColours, readBannerColours } from "../../memberCard/bannerColours";
import { BUILTIN_CARD_STYLES, randomCardStyle, styleSwatch } from "../../memberCard/builtinStyles";
import { type CardStyle, encodeCardStyle, TUNING } from "../../memberCard/cardStyle";
import { cardVars } from "../../memberCard/cardVars";
import { isTunable } from "../../memberCard/patterns";
import { Button } from "../Button/Button";
import { Select } from "../Select/Select";
import { Tabs } from "../Tabs/Tabs";
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

export interface MemberCardPane {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
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
  /** Panes that belong to the app, like bio or banner, listed after the built-in ones. */
  panes?: MemberCardPane[];
  /** The member's banner picture, if they have one. Its colours are offered for the card. */
  bannerUrl?: string | null;
}

/* Same press feedback as the owl designer's tabs. */
const TAB_PRESS =
  "transition-[scale,color,background-color] duration-(--gryt-dur-spring) ease-spring "
  + "motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.96] motion-reduce:transition-none";

/**
 * Everything about how a member card looks, in tabs with one pane at a time, so
 * nothing needs a long scroll.
 */
export function MemberCardEditor({ value: style, onChange, owlHex, nickname = "", worn = null, seed, appearance, panes = [], bannerUrl = null }: MemberCardEditorProps) {
  const [pane, setPane] = useState("colour");
  const [picks, setPicks] = useState(() => ({
    c1: style.c1 ?? START.c1,
    c2: style.c2 ?? START.c2,
    angle: style.fill === "gradient" ? style.angle : START.angle,
  }));
  const [shown, setShown] = useState(style);
  if (shown !== style) {
    setShown(style);
    // A style from outside, like a pasted link or a Surprise me beside the card, moves the pickers too.
    if (style.fill !== "owl" && style.c1) setPicks({ c1: style.c1, c2: style.c2 ?? style.c1, angle: style.angle });
  }

  const [banner, setBanner] = useState<{ url: string; colours: BannerColours | null } | null>(null);
  useEffect(() => {
    if (!bannerUrl) return;
    let live = true;
    void readBannerColours(bannerUrl).then((colours) => {
      if (live) setBanner({ url: bannerUrl, colours });
    });
    return () => {
      live = false;
    };
  }, [bannerUrl]);
  const fromBanner = bannerUrl && banner?.url === bannerUrl ? banner.colours : null;

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

  const colour = (
    <>
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
      {fromBanner && (
        <Group title="From your banner" description="Colour the card to match the picture. The first is where the banner meets the card.">
          <div className="flex flex-wrap gap-1.5">
            {[fromBanner.bottom, ...fromBanner.palette].map((hex, i) => (
              <button
                key={hex + i}
                type="button"
                title={i === 0 ? "Match the bottom edge" : hex}
                aria-label={i === 0 ? "Match the bottom edge of the banner" : `Use ${hex} from the banner`}
                // A flat bottom edge needs only the short fade; a busy one is faded all the way down.
                onClick={() => apply({ ...style, fill: "solid", c1: hex, c2: hex, colours: "card", fade: i === 0 && fromBanner.flat ? "bottom" : "banner" })}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gryt-border bg-gryt-surface-raised py-1 pr-2.5 pl-1 text-[12.5px] font-bold text-gryt-text hover:bg-gryt-surface-hover"
              >
                <i className="h-[18px] w-[18px] rounded-full border border-gryt-border" style={{ background: hex }} />
                {i === 0 ? "Bottom edge" : hex}
              </button>
            ))}
          </div>
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
      )}
      <Group title="Outline" description="The line around the card. None at 0.">
        <div className="flex items-center gap-2.5">
          <input
            aria-label="Outline thickness"
            type="range"
            min={TUNING.edge.min}
            max={TUNING.edge.max}
            value={style.edge ?? TUNING.edge.default}
            onChange={(e) => change({ edge: Number(e.target.value) === TUNING.edge.default ? undefined : Number(e.target.value) })}
            style={{ flex: 1, minWidth: 120, accentColor: "var(--gryt-accent)" }}
          />
          <output className="min-w-[3.5em] font-mono text-xs text-gryt-muted">{style.edge ?? TUNING.edge.default}px</output>
        </div>
      </Group>
    </>
  );

  const pattern = (
    <>
      <Group title="Pattern" description="Drawn from the colour, so there's nothing to upload.">
        <PatternPicker style={style} owlHex={owlHex} nickname={nickname} worn={worn} seed={seed} appearance={appearance} onPick={change} />
      </Group>
      {style.colours === "card" && (
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
      )}
      {bannerUrl && style.pattern !== "none" && (
        <Group title="Pattern sits" description="Over your banner picture, or behind it so the picture covers it.">
          <Select
            value={style.pLayer ?? "behind"}
            onValueChange={(v) => change({ pLayer: v === "front" ? "front" : undefined })}
            options={[
              { value: "behind", label: "Behind the banner" },
              { value: "front", label: "In front of the banner" },
            ]}
          />
        </Group>
      )}
      {isTunable(style.pattern) && (
        <Group title="Customise pattern" description="Size, turn, strength and colour. The strength is turned down if it would make small text hard to read.">
          <PatternTuning style={style} effectiveInk={drawn.patternInk} effectiveAlpha={drawn.patternAlpha} onChange={change} />
        </Group>
      )}
    </>
  );

  const styles = (
    <Group title="Card styles" description="A style is a card's colours and pattern. It never carries a banner, bio or pronouns.">
      <div className="flex flex-wrap gap-1.5">
        {BUILTIN_CARD_STYLES.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => apply(b.style)}
            aria-pressed={encodeCardStyle(b.style) === encodeCardStyle(style)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gryt-border bg-gryt-surface-raised py-1 pr-2.5 pl-1 text-[12.5px] font-bold text-gryt-text hover:bg-gryt-surface-hover aria-pressed:border-gryt-accent"
          >
            <i className="h-[18px] w-[18px] rounded-full border border-gryt-border" style={{ background: styleSwatch(b.style) } as CSSProperties} />
            {b.name}
          </button>
        ))}
      </div>
      <div>
        <Button size="small" tone="neutral" onClick={() => apply(randomCardStyle())}>
          <Shuffle weight="bold" size={14} />
          Surprise me
        </Button>
      </div>
    </Group>
  );

  const all: MemberCardPane[] = [
    { value: "colour", label: "Colour", icon: <Palette weight="fill" size={16} />, content: colour },
    { value: "pattern", label: "Pattern", icon: <SquaresFour weight="fill" size={16} />, content: pattern },
    { value: "styles", label: "Styles", icon: <Swatches weight="fill" size={16} />, content: styles },
    ...panes,
  ];
  const current = all.find((p) => p.value === pane) ?? all[0];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <Tabs className="shrink-0 px-4 pt-3" onValueChange={(v) => setPane(String(v))} value={current.value}>
        <Tabs.List aria-label="What to change" className="max-w-full overflow-x-auto">
          {all.map((p) => (
            <Tabs.Tab className={TAB_PRESS} key={p.value} value={p.value}>
              {p.icon}
              <span>{p.label}</span>
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-4">{current.content}</div>
    </div>
  );
}

/** Copies a link to the card builder with this style in it, like the theme generator's links. */
export function CopyCardLink({ style, link, size = "small" }: { style: CardStyle; link: (code: string) => string; size?: "small" | "medium" }) {
  const [note, setNote] = useState<string | null>(null);
  const copy = () => {
    void navigator.clipboard?.writeText(link(encodeCardStyle(style))).then(
      () => setNote("Copied"),
      () => setNote("Couldn't copy"),
    );
    window.setTimeout(() => setNote(null), 1600);
  };
  return (
    <Button size={size} tone="neutral" onClick={copy}>
      {note ?? "Copy link"}
    </Button>
  );
}
