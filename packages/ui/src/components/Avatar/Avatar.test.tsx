import { render, screen } from "@testing-library/react";
import { owlAvatarDataUri } from "@gryt/owl";
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
