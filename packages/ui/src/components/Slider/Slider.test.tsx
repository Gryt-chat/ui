import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrytProvider } from "../../GrytProvider";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("labels the thumb", () => {
    render(
      <GrytProvider>
        <Slider defaultValue={40} aria-label="Input volume" />
      </GrytProvider>
    );

    expect(screen.getByRole("slider", { name: "Input volume" })).toHaveValue(
      "40"
    );
  });

  // The focus ring is has-[:focus-visible] on the thumb, which only works
  // while the focusable element is inside the thumb. If Base UI ever moves the
  // input out, the ring silently stops appearing and keyboard users lose the
  // only indication of where they are.
  it("keeps the focusable input inside the thumb", () => {
    const { container } = render(
      <GrytProvider>
        <Slider defaultValue={40} aria-label="Input volume" />
      </GrytProvider>
    );

    const input = screen.getByRole("slider", { name: "Input volume" });
    const thumb = container.querySelector("[data-index]");

    expect(thumb).not.toBeNull();
    expect(thumb!.contains(input)).toBe(true);
  });
});
