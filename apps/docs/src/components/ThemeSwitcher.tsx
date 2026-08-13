import { Select, Toggle, ToggleGroup, grytPresets } from "@gryt/ui";
import { Moon, Sun } from "@phosphor-icons/react";
import {
  setSiteAppearance,
  setSitePreset,
  useSiteTheme
} from "../lib/theme/siteTheme";

/**
 * What the site is wearing, in the header.
 *
 * The presets the library ships, plus Custom when the generator has something
 * in it. Custom is only offered once it exists: an option that silently does
 * nothing is worse than one that is not there.
 *
 * There is a way to lock yourself out of this — build a theme with no contrast
 * and the control that fixes it is hard to see. The generator measures contrast
 * as you pick and chooses label colours for you, which makes it unlikely rather
 * than impossible, and Gryt is always the first option in the list.
 */
export function ThemeSwitcher() {
  const site = useSiteTheme();

  const options = [
    ...grytPresets.map((preset) => ({ label: preset.name, value: preset.id })),
    ...(site.custom === null
      ? []
      : [{ label: site.custom.name ?? "Custom", value: "custom" }])
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="w-36">
        <Select
          aria-label="Theme"
          onValueChange={(value) => setSitePreset(String(value))}
          options={options}
          size="small"
          value={site.presetId}
        />
      </div>

      <ToggleGroup
        aria-label="Appearance"
        // Last one wins, and an empty array is a press on the one already
        // pressed, which should leave the appearance alone.
        onValueChange={(value: string[]) => {
          const next = value[value.length - 1];
          if (next === "dark" || next === "light") setSiteAppearance(next);
        }}
        value={[site.appearance]}
      >
        <Toggle aria-label="Dark" size="small" value="dark">
          <Moon size={15} />
        </Toggle>
        <Toggle aria-label="Light" size="small" value="light">
          <Sun size={15} />
        </Toggle>
      </ToggleGroup>
    </div>
  );
}
