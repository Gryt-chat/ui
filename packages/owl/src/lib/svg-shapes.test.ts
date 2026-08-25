import { describe, expect, it } from "vitest";

import { colour, readShapes } from "./svg-shapes";

/**
 * Colours are compared as strings everywhere downstream — the extractor decides
 * an arm is meant to drop out with `p.fill === realPalette.background`, and the
 * ink table is keyed on hex. So a drawing tool that spells a colour differently
 * is a drawing that quietly does the wrong thing, and these are the spellings
 * that actually turn up.
 */
describe("one colour, spelled the one way", () => {
  it("folds the spellings of an opaque colour", () => {
    for (const spelling of [
      "#6cdac8",
      "#6CDAC8",
      "  #6cdac8  ",
      "#6cdac8ff",
      "rgb(108, 218, 200)",
      "rgb(108 218 200)",
      "rgba(108,218,200,1)",
    ]) {
      expect(colour(spelling)).toBe("#6cdac8");
    }
  });

  it("expands three-digit hex", () => {
    expect(colour("#6dc")).toBe("#66ddcc");
  });

  it("leaves a real alpha alone", () => {
    // A translucent colour genuinely is not the opaque one. Flattening it would
    // trade a silent miss for a silent lie — an arm that looks like it drops out
    // and does not.
    expect(colour("#6cdac880")).toBe("#6cdac880");
    expect(colour("rgba(108,218,200,0.5)")).toBe("rgba(108,218,200,0.5)");
  });

  it("leaves anything it cannot read alone", () => {
    expect(colour("red")).toBe("red");
    expect(colour("url(#gradient)")).toBe("url(#gradient)");
  });

  it("treats missing and none as no paint", () => {
    expect(colour(undefined)).toBe("");
    expect(colour("none")).toBe("");
  });

  it("normalises what readShapes hands back", () => {
    // The one that matters: an arm exported by a tool that writes eight-digit
    // hex has to arrive as the same string the base owl's background is.
    const svg =
      '<svg viewBox="0 0 1024 1024">' +
      '<path d="M10 10L20 20Z" fill="#6cdac8ff"/>' +
      '<path d="M30 30L40 40Z" fill="rgb(108, 218, 200)" stroke="#6DC"/>' +
      "</svg>";
    const { shapes } = readShapes(svg);
    expect(shapes[0].fill).toBe("#6cdac8");
    expect(shapes[1].fill).toBe("#6cdac8");
    expect(shapes[1].stroke).toBe("#66ddcc");
  });

  it("still reports a stroke of none as no stroke", () => {
    const svg = '<svg viewBox="0 0 1024 1024"><path d="M10 10L20 20Z" fill="#123456"/></svg>';
    const { shapes } = readShapes(svg);
    expect(shapes[0].stroke).toBe("");
    expect(shapes[0].strokeWidth).toBe(0);
  });
});
