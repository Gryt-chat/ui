import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrytProvider } from "../../GrytProvider";
import { Select } from "./Select";

/**
 * Groups are optional and mix with plain options in the same array, so the two
 * things worth asserting are that a grouped option still selects and that the
 * trigger can still name it.
 *
 * That second one is the failure this would otherwise ship with. Base UI reads
 * `items` to turn a value back into a label, and the obvious implementation
 * hands it the array it was given — which for a grouped select is the groups,
 * not the options. Everything looks right until something is selected and the
 * trigger shows the raw value.
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
