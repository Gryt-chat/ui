import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Thumb } from "./Thumb";

describe("Thumb", () => {
  it("opens its drawer on a tap and closes from the same tab", async () => {
    render(
      <Thumb>
        <a href="/features">Features</a>
      </Thumb>
    );
    expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    expect(await screen.findByRole("link", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
  });
});
