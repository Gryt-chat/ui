import { MagnifyingGlass } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export interface PaletteEntry {
  group: string;
  label: string;
  href: string;
}

// The pill is the visible half of N13 — the affordance newcomers can see, with
// the shortcut behind it for everyone else. Shipping the pill means shipping the
// keyboard model too: ⌘K opens, Esc closes, arrows move, Enter opens.
export function SearchPill({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      aria-label="Search components (Command K)"
      onClick={onOpen}
      className="group flex h-10 w-full max-w-80 items-center gap-2.5 rounded-full border border-gryt-border bg-gryt-surface px-3.5 text-left text-sm text-gryt-muted transition-colors duration-200 hover:border-gryt-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gryt-accent-light"
    >
      <MagnifyingGlass size={15} aria-hidden="true" className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">Search components…</span>
      <span className="hidden shrink-0 items-center gap-0.5 sm:flex">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-[5px] border border-gryt-border bg-gryt-surface-raised px-1.5 py-0.5 font-mono text-[11px] leading-none text-gryt-muted">
      {children}
    </kbd>
  );
}

// Mounted only while open (see AppShell). That is deliberate: it makes the
// initial useState values the reset, so opening needs no effect and no
// synchronous setState during render.
export function CommandPalette({
  entries,
  onClose
}: {
  entries: PaletteEntry[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return entries;
    }
    return entries.filter((entry) =>
      `${entry.group} ${entry.label}`.toLowerCase().includes(q)
    );
  }, [entries, query]);

  useEffect(() => {
    // Focus after paint — focusing a node the browser has not laid out yet
    // silently does nothing.
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Keep the highlighted row inside the scroll container when arrowing past its
  // edge, otherwise keyboard navigation walks off-screen.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>("[data-active='true']")
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(index: number) {
    const entry = results[index];
    if (!entry) {
      return;
    }
    navigate(entry.href);
    onClose();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, results.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      choose(active);
    }
  }

  let cursor = -1;

  return (
    <div className="fixed inset-0 z-[70]" onKeyDown={onKeyDown}>
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-black/65"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        className="absolute left-1/2 top-[12vh] flex max-h-[70vh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 flex-col overflow-hidden rounded-(--gryt-radius-lg) border border-gryt-border bg-gryt-surface"
      >
        <div className="flex items-center gap-3 border-b border-gryt-border px-4">
          <MagnifyingGlass
            size={16}
            aria-hidden="true"
            className="shrink-0 text-gryt-muted"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder="Search components…"
            aria-label="Search components"
            className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-gryt-text outline-none placeholder:text-gryt-muted"
          />
          <Kbd>esc</Kbd>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gryt-muted">
              Nothing matches “{query}”.
            </p>
          ) : (
            groupEntries(results).map(([group, items]) => (
              <div key={group} className="pb-1">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-gryt-muted">
                  {group}
                </p>
                {items.map((entry) => {
                  cursor += 1;
                  const index = cursor;
                  const isActive = index === active;

                  return (
                    <button
                      key={entry.href}
                      type="button"
                      data-active={isActive}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(index)}
                      className={[
                        "flex w-full items-center justify-between gap-3 rounded-(--gryt-radius-md) px-3 py-2 text-left text-sm transition-colors",
                        isActive
                          ? "bg-gryt-surface-raised text-gryt-text"
                          : "text-gryt-muted"
                      ].join(" ")}
                    >
                      <span className="truncate">{entry.label}</span>
                      {isActive ? (
                        <span className="shrink-0 text-[11px] text-gryt-muted">
                          ↵
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-gryt-border px-4 py-2.5 text-[11px] text-gryt-muted">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> open
          </span>
        </div>
      </div>
    </div>
  );
}

function groupEntries(entries: PaletteEntry[]) {
  const groups = new Map<string, PaletteEntry[]>();
  for (const entry of entries) {
    const existing = groups.get(entry.group);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.group, [entry]);
    }
  }
  return [...groups.entries()];
}
