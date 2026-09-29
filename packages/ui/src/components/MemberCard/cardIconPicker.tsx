"use client";

import { useEffect, useMemo, useState } from "react";

import { TextField } from "../TextField/TextField";
import { type CardIconModule, cardIcons } from "./cardIconSource";
import { DEFAULT_ICON } from "./patternAssets";

/** The icon module, once the app's loader has run. */
function useIconModule(): CardIconModule | null {
  const [mod, setMod] = useState<CardIconModule | null>(null);
  useEffect(() => {
    let live = true;
    void cardIcons()?.then((m) => live && setMod(m));
    return () => {
      live = false;
    };
  }, []);
  return mod;
}

/** How many matches are drawn at once; each one is its own small chunk. */
const SHOWN = 48;

function IconCell({ name, picked, onPick, icons }: { name: string; picked: boolean; onPick: () => void; icons: CardIconModule }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void icons.loadIconMark(name).then((mark) => {
      if (live && mark) setSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.viewBox}" fill="currentColor">${mark.body}</svg>`);
    });
    return () => {
      live = false;
    };
  }, [name, icons]);
  return (
    <button
      type="button"
      title={name}
      aria-label={name}
      aria-pressed={picked}
      onClick={onPick}
      className="grid h-9 cursor-pointer place-items-center rounded-(--gryt-radius-sm) border-0 bg-gryt-surface-raised p-1.5 text-gryt-text hover:bg-gryt-surface-hover"
      style={{ boxShadow: picked ? "0 0 0 2px var(--gryt-text)" : undefined }}
    >
      {/* Our own markup, built from Phosphor's path data, not anything a person typed. */}
      {svg && <span className="block h-5 w-5" dangerouslySetInnerHTML={{ __html: svg }} />}
    </button>
  );
}

/** Search every Phosphor icon by name and pick the one to strew. */
export default function CardIconPicker({ value, onPick }: { value?: string; onPick: (name: string) => void }) {
  const [query, setQuery] = useState("");
  const current = value ?? DEFAULT_ICON;
  const icons = useIconModule();
  const names = useMemo(() => icons?.ICON_NAMES ?? [], [icons]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "-");
    const all = q ? names.filter((n) => n.includes(q)) : names;
    return [current, ...all.filter((n) => n !== current)].slice(0, SHOWN);
  }, [query, current, names]);
  if (!icons) return <span className="text-xs text-gryt-muted">Loading icons…</span>;
  return (
    <div className="flex flex-col gap-2">
      <TextField placeholder="Search icons, like star or coffee" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1">
        {matches.map((name) => (
          <IconCell key={name} name={name} picked={name === current} onPick={() => onPick(name)} icons={icons} />
        ))}
      </div>
      <span className="text-xs text-gryt-muted">
        {names.length} icons from Phosphor. Showing {matches.length}; search to find the rest.
      </span>
    </div>
  );
}
