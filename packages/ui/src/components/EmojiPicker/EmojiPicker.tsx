"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";

import { cn } from "../utils/cn";
import { fieldControl, focusRing, popupSurface } from "../utils/styles";
import { filterEmojiItems } from "./emojiSearch";

export interface EmojiPickerItem {
  id: string;
  name: string;
  emoji?: string;
  imageUrl?: string;
  keywords?: readonly string[];
  disabled?: boolean;
}

export interface EmojiPickerGroup {
  id: string;
  label: string;
  icon?: ReactNode;
  items: EmojiPickerItem[];
}

export interface EmojiPickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onSelect"
> {
  groups: EmojiPickerGroup[];
  onSelect: (item: EmojiPickerItem) => void;
  selectedId?: string;
  autoFocus?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  error?: ReactNode;
}

function EmojiCell({
  item,
  selected,
  onSelect,
  onKeyDown
}: {
  item: EmojiPickerItem;
  selected: boolean;
  onSelect: (item: EmojiPickerItem) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      data-emoji-cell
      aria-label={`:${item.name}:`}
      aria-pressed={selected}
      disabled={item.disabled}
      title={`:${item.name}:`}
      onClick={() => onSelect(item)}
      onKeyDown={onKeyDown}
      className={cn(
        "gryt-emoji-picker-cell aspect-square min-w-0 rounded-(--gryt-radius-control) border-0 p-0",
        "inline-flex items-center justify-center bg-transparent text-[1.35rem] leading-none",
        "transition-[scale,background-color,color] duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
        "hover:not-disabled:bg-gryt-surface-hover active:not-disabled:scale-90",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "aria-pressed:bg-gryt-accent-3 aria-pressed:text-gryt-accent-11",
        focusRing
      )}
    >
      {item.emoji ? (
        <span aria-hidden>{item.emoji}</span>
      ) : item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="h-[1.35rem] w-[1.35rem] object-contain"
        />
      ) : null}
    </button>
  );
}

const COLUMNS = 7;

type EmojiRow =
  | { kind: "heading"; key: string; group: EmojiPickerGroup }
  | { kind: "items"; key: string; groupId: string; items: EmojiPickerItem[] };

function rowsFor(groups: EmojiPickerGroup[]): EmojiRow[] {
  return groups.flatMap((group) => {
    const rows: EmojiRow[] = [
      { kind: "heading", key: `heading:${group.id}`, group }
    ];
    for (let index = 0; index < group.items.length; index += COLUMNS) {
      rows.push({
        kind: "items",
        key: `${group.id}:${index}`,
        groupId: group.id,
        items: group.items.slice(index, index + COLUMNS)
      });
    }
    return rows;
  });
}

/* Hallmark · component: emoji picker · playful/utilitarian · Gryt tokens only.
 * States: hover, focus, active, disabled, loading, error, selected success. */
export const EmojiPicker = forwardRef<HTMLDivElement, EmojiPickerProps>(
  function EmojiPicker(
    {
      autoFocus = true,
      className,
      emptyMessage = "No emoji found",
      error,
      groups,
      loading = false,
      onSelect,
      searchPlaceholder = "Search emoji",
      selectedId,
      ...props
    },
    ref
  ) {
    const firstGroup = groups.find((group) => group.items.length > 0)?.id ?? "";
    const [activeGroup, setActiveGroup] = useState(firstGroup);
    const [query, setQuery] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const availableGroups = useMemo(
      () => groups.filter((group) => group.items.length > 0),
      [groups]
    );
    const results = useMemo(
      () => filterEmojiItems(availableGroups, query),
      [availableGroups, query]
    );
    const visibleGroups = useMemo(
      () =>
        query.trim()
          ? [
              {
                id: "search",
                label: "Search results",
                icon: "⌕",
                items: results
              }
            ]
          : availableGroups,
      [availableGroups, query, results]
    );
    const rows = useMemo(() => rowsFor(visibleGroups), [visibleGroups]);
    const headingIndexes = useMemo(
      () =>
        new Map(
          rows.flatMap((row, index) =>
            row.kind === "heading" ? [[row.group.id, index] as const] : []
          )
        ),
      [rows]
    );
    // eslint-disable-next-line react-hooks/incompatible-library -- Virtualizer is intentionally stateful.
    const virtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => scrollRef.current,
      estimateSize: (index) => (rows[index]?.kind === "heading" ? 34 : 44),
      getItemKey: (index) => rows[index]?.key ?? index,
      overscan: 8,
      initialRect: { width: 336, height: 300 }
    });

    useEffect(() => {
      if (autoFocus) searchRef.current?.focus({ preventScroll: true });
    }, [autoFocus]);

    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [query]);

    const onGridKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      const cells = Array.from(
        scrollRef.current?.querySelectorAll<HTMLButtonElement>(
          "[data-emoji-cell]:not(:disabled)"
        ) ?? []
      );
      const index = cells.indexOf(event.currentTarget);
      const movement: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -COLUMNS,
        ArrowDown: COLUMNS
      };
      let next =
        movement[event.key] === undefined ? index : index + movement[event.key];
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = cells.length - 1;
      else if (movement[event.key] === undefined) return;
      event.preventDefault();
      cells[Math.max(0, Math.min(cells.length - 1, next))]?.focus();
    };

    const onCategoryKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      const buttons = Array.from(
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
          "[data-emoji-category]"
        ) ?? []
      );
      const index = buttons.indexOf(event.currentTarget);
      let next = index;
      if (event.key === "ArrowLeft") next = index - 1;
      else if (event.key === "ArrowRight") next = index + 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      const button = buttons[(next + buttons.length) % buttons.length];
      button?.focus();
      button?.click();
    };

    const jumpToGroup = (groupId: string) => {
      const index = headingIndexes.get(groupId);
      if (index === undefined) return;
      setActiveGroup(groupId);
      virtualizer.scrollToIndex(index, { align: "start" });
    };

    return (
      <div
        ref={ref}
        aria-label="Emoji picker"
        className={cn(
          "gryt-emoji-picker flex h-[min(25rem,calc(100dvh-2rem))] w-full max-w-[21rem] flex-col overflow-hidden",
          popupSurface,
          className
        )}
        {...props}
      >
        <label className="relative m-2 mb-1 block">
          <span className="sr-only">{searchPlaceholder}</span>
          <MagnifyingGlass
            aria-hidden
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gryt-muted"
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(event) => setQuery(event.currentTarget.value)}
            className={cn(
              fieldControl,
              "h-10 py-2 pl-9 pr-3 text-sm border-gryt-border"
            )}
          />
        </label>

        {!query.trim() ? (
          <div
            role="navigation"
            aria-label="Emoji categories"
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-gryt-border px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {availableGroups.map((group) => {
              const active = group.id === activeGroup;
              return (
                <button
                  key={group.id}
                  type="button"
                  data-emoji-category
                  aria-label={group.label}
                  aria-current={active ? "true" : undefined}
                  title={group.label}
                  onClick={() => jumpToGroup(group.id)}
                  onKeyDown={onCategoryKeyDown}
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-(--gryt-radius-control) border-0 bg-transparent p-0 text-base",
                    "transition-[scale,background-color,color] duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
                    "hover:bg-gryt-surface-hover active:scale-90",
                    "aria-current:bg-gryt-accent-3 aria-current:text-gryt-accent-11",
                    focusRing
                  )}
                >
                  <span aria-hidden>{group.icon ?? "•"}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          ref={scrollRef}
          data-emoji-scroll
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          onScroll={(event) => {
            if (query.trim()) return;
            const top = event.currentTarget.scrollTop + 1;
            let offset = 0;
            let currentGroup = availableGroups[0]?.id ?? "";
            for (const row of rows) {
              if (offset > top) break;
              if (row.kind === "heading") currentGroup = row.group.id;
              offset += row.kind === "heading" ? 34 : 44;
            }
            setActiveGroup(currentGroup);
          }}
        >
          {loading ? (
            <div
              role="status"
              className="grid h-full place-items-center p-6 text-sm text-gryt-muted"
            >
              Loading emoji…
            </div>
          ) : error ? (
            <div
              role="alert"
              className="grid h-full place-items-center p-6 text-center text-sm text-gryt-danger-11"
            >
              {error}
            </div>
          ) : rows.length > 0 && visibleGroups[0]?.items.length ? (
            <div
              className="relative w-full"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                if (!row) return null;
                return (
                  <div
                    key={virtualRow.key}
                    ref={virtualizer.measureElement}
                    data-index={virtualRow.index}
                    className="absolute left-0 top-0 w-full"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    {row.kind === "heading" ? (
                      <div className="flex h-[34px] items-center gap-2 px-3 pt-2 text-xs font-medium text-gryt-muted">
                        <span aria-hidden>{row.group.icon}</span>
                        <span>{row.group.label}</span>
                      </div>
                    ) : (
                      <div
                        role="group"
                        aria-label={
                          availableGroups.find(
                            (group) => group.id === row.groupId
                          )?.label
                        }
                        className="grid h-11 grid-cols-7 gap-1 px-2"
                      >
                        {row.items.map((item) => (
                          <EmojiCell
                            key={item.id}
                            item={item}
                            selected={selectedId === item.id}
                            onSelect={onSelect}
                            onKeyDown={onGridKeyDown}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              role="status"
              className="grid h-full place-items-center p-6 text-sm text-gryt-muted"
            >
              {emptyMessage}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gryt-border px-3 py-2 text-xs text-gryt-muted">
          {query.trim()
            ? `${results.length} result${results.length === 1 ? "" : "s"}`
            : `${availableGroups.reduce((total, group) => total + group.items.length, 0)} emoji`}
        </div>
      </div>
    );
  }
);
