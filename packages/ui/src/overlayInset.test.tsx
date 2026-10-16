import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrytProvider } from "./GrytProvider";
import { usePopupCollisionPadding } from "./overlayInset";

function Probe({ base, onValue }: { base?: number; onValue: (v: unknown) => void }) {
  onValue(usePopupCollisionPadding(base));
  return null;
}

function read(base: number | undefined, inset?: number) {
  let value: unknown;
  render(
    <GrytProvider overlayInsetTop={inset}>
      <Probe base={base} onValue={(v) => (value = v)} />
    </GrytProvider>,
  );
  return value;
}

describe("popup collision padding", () => {
  it("is the plain number with no inset", () => {
    expect(read(undefined)).toBe(8);
    expect(read(5)).toBe(5);
  });

  it("adds the title bar to the top only (GRYT-1784)", () => {
    expect(read(undefined, 36)).toEqual({ top: 44, right: 8, bottom: 8, left: 8 });
    expect(read(5, 36)).toEqual({ top: 41, right: 5, bottom: 5, left: 5 });
  });
});
