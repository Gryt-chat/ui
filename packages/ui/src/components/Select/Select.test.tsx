import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GrytProvider } from "../../GrytProvider";
import { Select } from "./Select";

/**
 * Groups mix with plain options in one array, so what matters is that a grouped option
 * still selects and the trigger can name it — Base UI reads `items` to find the label.
 */
const GROUPED = [
  {
    label: "Winter",
    options: [
      { label: "Frost", value: "frost" },
      { label: "Aurora", value: "aurora" }
    ]
  },
  { label: "Custom", value: "custom" }
];

function renderSelect(value?: string) {
  return render(
    <GrytProvider>
      <Select aria-label="Theme" options={GROUPED} value={value} />
    </GrytProvider>
  );
}

describe("Select with groups", () => {
  it("names a grouped option on the trigger", () => {
    renderSelect("aurora");
    expect(screen.getByText("Aurora")).toBeInTheDocument();
  });

  it("names a loose option sitting beside the groups", () => {
    renderSelect("custom");
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("shows the placeholder when nothing is picked", () => {
    render(
      <GrytProvider>
        <Select aria-label="Theme" options={GROUPED} placeholder="Pick one" />
      </GrytProvider>
    );
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });

  it("still takes a flat list", () => {
    render(
      <GrytProvider>
        <Select
          aria-label="Size"
          options={[
            { label: "Small", value: "s" },
            { label: "Large", value: "l" }
          ]}
          value="l"
        />
      </GrytProvider>
    );
    expect(screen.getByText("Large")).toBeInTheDocument();
  });
});

// happy-dom does no layout, so this checks the classes. What they do was measured in
// Chrome, on the Select docs page at 390px.
describe("Select with a long label", () => {
  const LONG = "# deployment-notifications-from-the-production-cluster";

  it("truncates the label instead of widening the trigger", () => {
    render(
      <GrytProvider>
        <Select
          aria-label="Channel"
          options={[
            { label: "# general", value: "general" },
            { label: LONG, value: "deploys" }
          ]}
          value="deploys"
        />
      </GrytProvider>
    );
    expect(screen.getByText(LONG)).toHaveClass("min-w-0", "truncate");
  });

  it("truncates the placeholder the same way", () => {
    render(
      <GrytProvider>
        <Select aria-label="Channel" options={[]} placeholder={LONG} />
      </GrytProvider>
    );
    expect(screen.getByText(LONG)).toHaveClass("min-w-0", "truncate");
  });
});

// No layout here either, so these pin the classes and the mode. The cap itself was measured
// in Chrome on the docs header's theme picker, at 1280x600, 1280x400 and 390x700.
describe("Select with more options than fit", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function openGrouped() {
    render(
      <GrytProvider>
        <Select aria-label="Theme" options={GROUPED} value="aurora" />
      </GrytProvider>
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("combobox"));
    });
    return screen.findByRole("listbox");
  }

  it("opens below the trigger rather than over it", async () => {
    // A trigger mid-window. At happy-dom's all-zero rects Base UI drops the overlap by itself.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 100, y: 300, width: 144, height: 36 })
    );
    vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(800);

    const list = await openGrouped();
    // data-side="none" is the overlapping mode, which sizes the popup itself and ignores the cap.
    expect(list.closest(".gryt-select-positioner")).toHaveAttribute(
      "data-side",
      "bottom"
    );
  });

  it("caps the popup at the room to the window edge and scrolls the list", async () => {
    const list = await openGrouped();
    expect(list.parentElement).toHaveClass(
      "flex",
      "flex-col",
      "p-1",
      "max-h-[min(24rem,var(--available-height))]"
    );
    expect(list).toHaveClass("min-h-0", "overflow-y-auto");
  });
});
