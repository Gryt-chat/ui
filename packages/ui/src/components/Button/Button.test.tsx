import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";
import { GrytProvider } from "../../GrytProvider";

describe("Button", () => {
  it("renders accessible button text", () => {
    render(
      <GrytProvider>
        <Button>New chat</Button>
      </GrytProvider>
    );

    const button = screen.getByRole("button", { name: "New chat" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("cursor-pointer");
  });
});
