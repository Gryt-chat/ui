import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrytProvider } from "./GrytProvider";
import { Select } from "./components/Select/Select";
import { Tooltip } from "./components/Tooltip/Tooltip";
import { createGrytTheme } from "@gryt/theme";

describe("GrytProvider", () => {
  it("paints nothing when it is given no theme", () => {
    /**
     * The stylesheet already declares the defaults on :root. A provider re-stating them on
     * its own div sits below the root, so an app theming the documented way is overridden.
     */
    const { container } = render(
      <GrytProvider>
        <span>hello</span>
      </GrytProvider>
    );

    expect(container.firstElementChild?.getAttribute("style")).toBeNull();
  });

  it("paints what it is given", () => {
    const { container } = render(
      <GrytProvider theme={{ color: { accent: "#ff8800" } }}>
        <span>hello</span>
      </GrytProvider>
    );

    const style = container.firstElementChild?.getAttribute("style") ?? "";
    expect(style).toContain("--gryt-accent: #ff8800");
    // The scale comes with it: overriding an anchor regenerates its ramp.
    expect(style).toContain("--gryt-accent-9: #ff8800");
  });

  it("takes an already-built theme without rebuilding it", () => {
    const built = createGrytTheme({ color: { accent: "#ff8800" } });
    const { container } = render(
      <GrytProvider theme={built}>
        <span>hello</span>
      </GrytProvider>
    );

    expect(container.firstElementChild?.getAttribute("style")).toContain(
      "--gryt-accent: #ff8800"
    );
  });
});

describe("GrytProvider containOverlays", () => {
  const options = [{ label: "One", value: "one" }];

  /**
   * The point of the flag is where the popup ends up, so the assertion is exactly that: a
   * themed subtree is only a themed subtree for an overlay actually inside it.
   */
  it("leaves overlays in the body by default", async () => {
    const { container } = render(
      <GrytProvider theme={{ color: { accent: "#ff8800" } }}>
        <Select options={options} placeholder="Pick" />
      </GrytProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("combobox"));
    });

    const popup = await screen.findByRole("listbox");
    expect(container.firstElementChild?.contains(popup)).toBe(false);
  });

  it("puts overlays inside the themed element when asked", async () => {
    const { container } = render(
      <GrytProvider containOverlays theme={{ color: { accent: "#ff8800" } }}>
        <Select options={options} placeholder="Pick" />
      </GrytProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("combobox"));
    });

    const popup = await screen.findByRole("listbox");
    const themed = container.firstElementChild;
    expect(themed?.getAttribute("style")).toContain("--gryt-accent: #ff8800");
    expect(themed?.contains(popup)).toBe(true);
  });

  it("carries a tooltip too, not just the select", async () => {
    const { container } = render(
      <GrytProvider containOverlays tooltipDelay={0}>
        <Tooltip title="Explained">
          <button type="button">Trigger</button>
        </Tooltip>
      </GrytProvider>
    );

    await act(async () => {
      fireEvent.pointerEnter(screen.getByRole("button", { name: "Trigger" }));
      fireEvent.mouseEnter(screen.getByRole("button", { name: "Trigger" }));
    });

    const popup = await screen.findByText("Explained");
    expect(container.firstElementChild?.contains(popup)).toBe(true);
  });
});
