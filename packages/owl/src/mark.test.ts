import { describe, expect, it } from "vitest";

import { GRYT_MARK, grytMarkSvg } from "./mark";

describe("grytMarkSvg", () => {
  it("cuts the face and both wing folds out of the body, under its own mask id", () => {
    const svg = grytMarkSvg({ size: 48, color: "#A495E3", id: "mark-a" });
    expect(svg).toContain('width="48"');
    expect(svg).toContain('<mask id="mark-a"');
    expect(svg).toContain('mask="url(#mark-a)"');
    expect(svg).toContain('fill="#A495E3"');
    expect(svg.match(/stroke="black"/g)).toHaveLength(2);
  });

  it("cuts open fold lines, not closed wing outlines", () => {
    for (const d of GRYT_MARK.wings) expect(d).not.toMatch(/Z$/);
  });
});
