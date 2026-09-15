import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GrytProvider } from "../../GrytProvider";
import { WebhookCard } from "./WebhookCard";
import type { WebhookCardData, WebhookCardProps } from "./WebhookCard";

const full: WebhookCardData = {
  author: { name: "Build runner", url: "https://ci.example.test", iconUrl: "/icon.png" },
  title: "Deploy finished",
  url: "https://ci.example.test/deploys/1",
  description: "Rolled out in **4 minutes**.",
  color: "#3fb27f",
  fields: [
    { name: "Environment", value: "production", inline: true },
    { name: "Changes", value: "Two fixes" }
  ],
  thumbnailUrl: "/thumb.jpg",
  imageUrl: "/image.jpg",
  footer: { text: "ci.example.test", iconUrl: "/icon.png" },
  timestamp: "2026-09-15T07:42:00Z"
};

function renderCard(props: Partial<WebhookCardProps> = {}) {
  return render(
    <GrytProvider>
      <WebhookCard card={full} {...props} />
    </GrytProvider>
  );
}

describe("WebhookCard", () => {
  it("draws every part of the card", () => {
    const { container } = renderCard({ formatTimestamp: () => "at 07:42" });
    expect(screen.getByRole("link", { name: "Deploy finished" })).toHaveAttribute(
      "href",
      "https://ci.example.test/deploys/1"
    );
    expect(screen.getByRole("link", { name: "Build runner" })).toBeInTheDocument();
    expect(screen.getByText("Environment")).toBeInTheDocument();
    expect(screen.getByText("production")).toBeInTheDocument();
    expect(screen.getByText(/ci\.example\.test/)).toBeInTheDocument();
    expect(screen.getByText("at 07:42")).toHaveAttribute("datetime", full.timestamp);
    expect(container.querySelectorAll(".gryt-webhook-card-image")).toHaveLength(2);
  });

  it("opens links with noopener and without a referrer", () => {
    renderCard();
    const link = screen.getByRole("link", { name: "Deploy finished" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("hands links to onOpenUrl instead of navigating", () => {
    const onOpenUrl = vi.fn();
    renderCard({ onOpenUrl });
    fireEvent.click(screen.getByRole("link", { name: "Deploy finished" }));
    expect(onOpenUrl).toHaveBeenCalledWith("https://ci.example.test/deploys/1");
  });

  it("passes the description and field values through renderMarkdown", () => {
    const renderMarkdown = vi.fn((text: string) => <span>md:{text}</span>);
    renderCard({ renderMarkdown });
    expect(renderMarkdown).toHaveBeenCalledWith("Rolled out in **4 minutes**.");
    expect(renderMarkdown).toHaveBeenCalledWith("production");
    expect(screen.getByText("md:Two fixes")).toBeInTheDocument();
  });

  it("shows plain text when there is no markdown renderer", () => {
    renderCard();
    expect(screen.getByText("Rolled out in **4 minutes**.")).toBeInTheDocument();
  });

  it("uses the colour for the dot only, and ignores one that is not #rrggbb", () => {
    const { container, rerender } = renderCard();
    const card = container.querySelector("article")!;
    expect(card.style.getPropertyValue("--gryt-webhook-card-color")).toBe("#3fb27f");

    rerender(
      <GrytProvider>
        <WebhookCard card={{ ...full, color: "red; background: url(x)" }} />
      </GrytProvider>
    );
    expect(card.style.getPropertyValue("--gryt-webhook-card-color")).toBe("var(--gryt-border)");
  });

  it("shows an error state when a picture fails to load", () => {
    const { container } = renderCard({ card: { title: "Chart", imageUrl: "/gone.png" } });
    const image = container.querySelector(".gryt-webhook-card-image")!;
    expect(image).toHaveAttribute("data-state", "loading");
    fireEvent.error(image.querySelector("img")!);
    expect(image).toHaveAttribute("data-state", "error");
    expect(screen.getByRole("img", { name: "Image unavailable" })).toBeInTheDocument();
  });

  it("opens a picture through onPressImage", () => {
    const onPressImage = vi.fn();
    renderCard({ card: { imageUrl: "/chart.png" }, onPressImage });
    fireEvent.click(screen.getByRole("button", { name: "Open image" }));
    expect(onPressImage).toHaveBeenCalledWith("/chart.png");
  });

  it("draws a title and description with nothing else", () => {
    const { container } = renderCard({ card: { title: "Backup completed", description: "18.4 GB" } });
    expect(screen.getByText("Backup completed")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector("dl")).toBeNull();
    expect(container.querySelector("time")).toBeNull();
  });
});
