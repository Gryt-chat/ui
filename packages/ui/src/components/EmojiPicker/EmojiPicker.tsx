"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
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

function Grid({
  items,
  selectedId,
  onSelect
}: {
  items: EmojiPickerItem[];
  selectedId?: string;
  onSelect: (item: EmojiPickerItem) => void;
}) {
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const cells = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
        "[data-emoji-cell]:not(:disabled)"
      ) ?? []
    );
    const index = cells.indexOf(event.currentTarget);
    const template = getComputedStyle(
      event.currentTarget.parentElement!
    ).gridTemplateColumns;
    const columns =
      template && template !== "none" ? template.split(" ").length : 8;
    const movement: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -columns,
      ArrowDown: columns
    };
    let next =
      movement[event.key] === undefined ? index : index + movement[event.key];
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = cells.length - 1;
    else if (movement[event.key] === undefined) return;
    event.preventDefault();
    cells[Math.max(0, Math.min(cells.length - 1, next))]?.focus();
  };

  return (
    <div
      role="group"
      className="grid grid-cols-6 gap-1 p-2 min-[360px]:grid-cols-8"
    >
      {items.map((item) => (
        <EmojiCell
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onSelect={onSelect}
          onKeyDown={onKeyDown}
        />
      ))}
    </div>
  );
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
    const availableGroups = useMemo(
      () => groups.filter((group) => group.items.length > 0),
      [groups]
    );
    const current =
      availableGroups.find((group) => group.id === activeGroup) ??
      availableGroups[0];
    const results = useMemo(
      () => filterEmojiItems(availableGroups, query),
      [availableGroups, query]
    );
    const visibleItems = query.trim() ? results : (current?.items ?? []);

    useEffect(() => {
      if (autoFocus) searchRef.current?.focus({ preventScroll: true });
    }, [autoFocus]);

    const onCategoryKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      const tabs = Array.from(
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
          '[role="tab"]'
        ) ?? []
      );
      const index = tabs.indexOf(event.currentTarget);
      let next = index;
      if (event.key === "ArrowLeft") next = index - 1;
      else if (event.key === "ArrowRight") next = index + 1;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      const tab = tabs[(next + tabs.length) % tabs.length];
      tab?.focus();
      tab?.click();
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
            role="tablist"
            aria-label="Emoji categories"
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-gryt-border px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {availableGroups.map((group) => {
              const active = group.id === current?.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-label={group.label}
                  aria-selected={active}
                  title={group.label}
                  onClick={() => setActiveGroup(group.id)}
                  onKeyDown={onCategoryKeyDown}
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-(--gryt-radius-control) border-0 bg-transparent p-0 text-base",
                    "transition-[scale,background-color,color] duration-(--gryt-dur-spring) ease-spring motion-reduce:transition-none",
                    "hover:bg-gryt-surface-hover active:scale-90",
                    "aria-selected:bg-gryt-accent-3 aria-selected:text-gryt-accent-11",
                    focusRing
                  )}
                >
                  <span aria-hidden>{group.icon ?? "•"}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
          ) : visibleItems.length > 0 ? (
            <Grid
              items={visibleItems}
              selectedId={selectedId}
              onSelect={onSelect}
            />
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
            ? `${visibleItems.length} result${visibleItems.length === 1 ? "" : "s"}`
            : current?.label}
        </div>
      </div>
    );
  }
);
