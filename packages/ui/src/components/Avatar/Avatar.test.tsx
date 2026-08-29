import { render, screen } from "@testing-library/react";
import { eggAvatarDataUri, owlAvatarDataUri } from "@gryt/owl";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";
import { GrytProvider } from "../../GrytProvider";

describe("Avatar", () => {
  it("draws the seed's owl when there is no src", () => {
    render(
      <GrytProvider>
        <Avatar seed="sivert" alt="Sivert" />
      </GrytProvider>
    );

    expect(screen.getByAltText("Sivert")).toHaveAttribute(
      "src",
      owlAvatarDataUri("sivert", { size: 256 })
    );
  });

  // The owl is the fallback whether or not there is a src, so an uploaded
  // avatar that 404s lands back on this person's owl rather than on a letter.
  it("keeps the owl as the fallback behind an uploaded image", () => {
    render(
      <GrytProvider>
        <Avatar seed="sivert" src="/uploaded.png" alt="Sivert" />
      </GrytProvider>
    );

    expect(screen.getByAltText("Sivert")).toHaveAttribute(
      "src",
      owlAvatarDataUri("sivert", { size: 256 })
    );
  });

  it("draws the egg seed's eggs", () => {
    render(
      <GrytProvider>
        <Avatar eggSeed="the basement" alt="The Basement" />
      </GrytProvider>
    );

    expect(screen.getByAltText("The Basement")).toHaveAttribute(
      "src",
      eggAvatarDataUri("the basement", { size: 256 })
    );
  });

  /*
   * The corner belongs to the caller, not to the drawing. A caller asks for
   * `rounded-(--gryt-radius-md)` and the root clips to it, so the radius is the
   * theme's in pixels — an SVG that baked its own would be a fraction of the
   * box and would not match the theme at any size.
   */
  it("draws the eggs square and lets the root round them", () => {
    render(
      <GrytProvider>
        <Avatar eggSeed="the basement" alt="The Basement" />
      </GrytProvider>
    );

    // `rx` is the only rounded corner the generator can draw. The clipPaths in
    // there are the eggs' own, one per shell, and are not corners.
    const src = screen.getByAltText("The Basement").getAttribute("src")!;
    expect(decodeURIComponent(src)).not.toContain("rx=");
  });

  // A person and a not-a-person are separate props. Both at once is a caller
  // bug, and the more specific thing wins.
  it("draws the person when handed both", () => {
    render(
      <GrytProvider>
        <Avatar seed="sivert" eggSeed="the basement" alt="Sivert" />
      </GrytProvider>
    );

    expect(screen.getByAltText("Sivert")).toHaveAttribute(
      "src",
      owlAvatarDataUri("sivert", { size: 256 })
    );
  });

  it("gives two seeds two different owls", () => {
    expect(owlAvatarDataUri("sivert")).not.toBe(owlAvatarDataUri("kasper"));
  });

  it("still falls back to children with no seed and no src", () => {
    render(
      <GrytProvider>
        <Avatar>G</Avatar>
      </GrytProvider>
    );

    expect(screen.getByText("G")).toBeInTheDocument();
  });
});
