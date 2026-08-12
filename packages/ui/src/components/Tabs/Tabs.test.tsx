import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrytProvider } from "../../GrytProvider";
import { Tabs } from "./Tabs";

/**
 * Every vertical rule in Tabs.tsx is a data-orientation selector, so these
 * assert the attribute is actually on the DOM. If Base UI stops putting it on
 * a part, the styling silently falls back to horizontal and nothing else here
 * would notice.
 */
function renderTabs(orientation: "horizontal" | "vertical") {
  return render(
    <GrytProvider>
      <Tabs defaultValue="chat" orientation={orientation}>
        <Tabs.List aria-label="Views">
          <Tabs.Tab value="chat">Chat</Tabs.Tab>
          <Tabs.Tab value="voice">Voice</Tabs.Tab>
          <Tabs.Indicator data-testid="indicator" />
        </Tabs.List>
        <Tabs.Panel value="chat">Chat panel</Tabs.Panel>
      </Tabs>
    </GrytProvider>
  );
}

describe("Tabs", () => {
  it("selects the default tab", () => {
    renderTabs("horizontal");

    expect(screen.getByRole("tab", { name: "Chat" })).toHaveAttribute(
      "data-active"
    );
    expect(screen.getByText("Chat panel")).toBeInTheDocument();
  });

  it("marks the parts horizontal by default", () => {
    renderTabs("horizontal");

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
    expect(screen.getByRole("tab", { name: "Chat" })).toHaveAttribute(
      "data-orientation",
      "horizontal"
    );
  });

  it("marks the parts vertical when asked", () => {
    renderTabs("vertical");

    const list = screen.getByRole("tablist");
    expect(list).toHaveAttribute("data-orientation", "vertical");
    expect(screen.getByRole("tab", { name: "Chat" })).toHaveAttribute(
      "data-orientation",
      "vertical"
    );
    // The indicator styles itself from an ancestor, so what matters is that one
    // above it carries the attribute rather than the indicator itself.
    expect(
      screen.getByTestId("indicator").closest("[data-orientation=vertical]")
    ).not.toBeNull();
  });
});
