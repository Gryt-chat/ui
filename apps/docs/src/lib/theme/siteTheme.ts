/* The theme the docs site is wearing.
 *
 * The generator previews a theme in a panel. The more convincing thing is the
 * site around it — reading the whole of ui.gryt.chat in Nord, or in light, is
 * what tells somebody whether the library survives their palette, and a 38rem
 * box cannot say that.
 *
 * One store, two readers. The header picks from it and the generator writes to
 * it, so building a theme and then walking the docs in it is not a step: the
 * page you are already on is wearing it before you go anywhere.
 *
 * useSyncExternalStore rather than context, because the applying happens on
 * document.documentElement — overlays portal to document.body, so anything
 * lower would leave every dialog and menu on the old palette — and a provider
 * that only exists to reach the root element is a provider that does nothing.
 */

import {
  createGrytTheme,
  decodeGrytTheme,
  grytPresetsById,
  grytTheme,
  grytThemeToOptions
} from "@gryt/ui";
import type { GrytAppearance, GrytTheme } from "@gryt/ui";
import { useEffect, useSyncExternalStore } from "react";

const PRESET_KEY = "docs.theme.preset";
const APPEARANCE_KEY = "docs.theme.appearance";
const CUSTOM_KEY = "docs.theme.custom";

/** The id of the preset in use, or "custom" for whatever is in the generator. */
export type SiteThemeId = string;

export interface SiteThemeState {
  presetId: SiteThemeId;
  appearance: GrytAppearance;
  custom: GrytTheme | null;
}

function readCustom(): GrytTheme | null {
  const raw = localStorage.getItem(CUSTOM_KEY);
  if (raw === null) return null;
  // Back through the parser rather than trusted: localStorage is editable, and
  // an old entry may predate a key.
  return decodeGrytTheme(raw)?.theme ?? null;
}

let state: SiteThemeState = {
  presetId: localStorage.getItem(PRESET_KEY) ?? "gryt",
  appearance: localStorage.getItem(APPEARANCE_KEY) === "light" ? "light" : "dark",
  custom: readCustom()
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSiteTheme(): SiteThemeState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state
  );
}

export function setSitePreset(presetId: SiteThemeId) {
  state = { ...state, presetId };
  localStorage.setItem(PRESET_KEY, presetId);
  emit();
}

export function setSiteAppearance(appearance: GrytAppearance) {
  state = { ...state, appearance };
  localStorage.setItem(APPEARANCE_KEY, appearance);
  emit();
}

/**
 * What the generator is holding, kept as the site's custom theme.
 *
 * Selecting it as well, because a theme you are actively editing and cannot see
 * on the page is the situation this exists to remove.
 */
export function setSiteCustomTheme(theme: GrytTheme) {
  state = { ...state, custom: theme, presetId: "custom" };
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(theme));
  localStorage.setItem(PRESET_KEY, "custom");
  emit();
}

/** The theme itself, whichever way it was chosen. */
export function siteThemeOf(state: SiteThemeState): GrytTheme {
  if (state.presetId === "custom") return state.custom ?? grytTheme;
  return grytPresetsById.get(state.presetId)?.theme ?? grytTheme;
}

/**
 * Paint it onto the root element.
 *
 * The class goes on too: the library's own .light block is what a consumer
 * would use, and the docs site should not be the one place that skips it — the
 * inline variables win over it either way, so this is belt and braces rather
 * than two mechanisms disagreeing.
 */
export function useApplySiteTheme() {
  const site = useSiteTheme();
  const theme = siteThemeOf(site);

  useEffect(() => {
    const root = document.documentElement;
    const variables = createGrytTheme(
      grytThemeToOptions(theme, site.appearance)
    ) as unknown as Record<string, string>;

    for (const [name, value] of Object.entries(variables)) {
      root.style.setProperty(name, value);
    }
    root.classList.toggle("light", site.appearance === "light");
    root.classList.toggle("dark", site.appearance === "dark");
    root.style.colorScheme = site.appearance;

    return () => {
      // Removed before the next set goes on: a theme is not guaranteed to
      // declare what the one before it did.
      for (const name of Object.keys(variables)) {
        root.style.removeProperty(name);
      }
    };
  }, [theme, site.appearance]);
}
