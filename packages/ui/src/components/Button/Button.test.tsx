import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";
import { IconButton } from "../IconButton/IconButton";
import { GrytProvider } from "../../GrytProvider";

// A consumer that underlines its links draws a line through these unless they
// say not to. Only the one rendered *as* the anchor: inline-flex blocks the rest.
describe("controls rendered as links", () => {
  it("keeps a Button from being underlined", () => {
    render(
      <GrytProvider>
        <Button render={<a href="/download">Download</a>} />
      </GrytProvider>
    );

    expect(screen.getByRole("link", { name: "Download" })).toHaveClass("no-underline");
  });

  it("keeps an IconButton from being underlined", () => {
    render(
      <GrytProvider>
        <IconButton aria-label="Open" render={<a href="/open">·</a>} />
      </GrytProvider>
    );

    expect(screen.getByRole("link", { name: "Open" })).toHaveClass("no-underline");
  });
});
