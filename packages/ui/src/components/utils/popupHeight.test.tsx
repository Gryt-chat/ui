import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Autocomplete } from "../Autocomplete/Autocomplete";
import { Combobox } from "../Combobox/Combobox";
import { Menu } from "../Menu/Menu";

// Select's own test covers Select. These are the other popups that hold a list, checked by
// class because happy-dom has no layout.
const ITEMS = ["One", "Two", "Three"];

function popup(className: string) {
  const element = document.querySelector(`.${className}`);
  if (!element) throw new Error(`No .${className} rendered`);
  return element;
}

describe("list popups stop at the window edge", () => {
  it("caps a menu at the room it has, with no ceiling", () => {
    render(
      <Menu.Root defaultOpen>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup>
              {ITEMS.map((item) => (
                <Menu.Item key={item}>{item}</Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    );
    expect(popup("gryt-menu")).toHaveClass(
      "max-h-(--available-height)",
      "overflow-y-auto"
    );
  });

  it("keeps the combobox's 16rem ceiling inside that room", () => {
    render(
      <Combobox.Root defaultOpen items={ITEMS}>
        <Combobox.Input aria-label="Pick" />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Popup>
              <Combobox.List>
                {(item: string) => (
                  <Combobox.Item key={item} value={item}>
                    {item}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    );
    expect(popup("gryt-combobox")).toHaveClass(
      "max-h-[min(16rem,var(--available-height))]",
      "overflow-y-auto"
    );
  });

  it("does the same for autocomplete", () => {
    render(
      <Autocomplete.Root defaultOpen items={ITEMS}>
        <Autocomplete.Input aria-label="Search" />
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popup>
              <Autocomplete.List>
                {(item: string) => (
                  <Autocomplete.Item key={item} value={item}>
                    {item}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
    );
    expect(popup("gryt-autocomplete")).toHaveClass(
      "max-h-[min(16rem,var(--available-height))]",
      "overflow-y-auto"
    );
  });
});
