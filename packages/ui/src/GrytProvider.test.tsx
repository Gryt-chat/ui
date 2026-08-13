import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrytProvider } from "./GrytProvider";
import { createGrytTheme } from "./theme/createGrytTheme";

describe("GrytProvider", () => {
  it("paints nothing when it is given no theme", () => {
    /**
     * The stylesheet already declares the defaults on :root. A provider that
     * re-stated them on its own div sat below the root in the cascade, so an
     * app theming itself the documented way — variables on the root element,
     * where overlays portalled to document.body can still read them — found
     * every one of them overridden by a wrapper repeating what it already had.
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
