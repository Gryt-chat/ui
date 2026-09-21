import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it("sits on its own surface inside a border, and shows a pointer when it opens something", () => {
    const { container, rerender } = renderCard();
    const card = container.querySelector("article")!;
    expect(card).toHaveClass("bg-gryt-bg", "border-gryt-border", "cursor-pointer");

    rerender(
      <GrytProvider>
        <WebhookCard card={{ title: "Backup completed", description: "18.4 GB" }} />
      </GrytProvider>
    );
    expect(card).toHaveClass("bg-gryt-bg", "border-gryt-border");
    expect(card).not.toHaveClass("cursor-pointer");
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
    expect(onOpenUrl).toHaveBeenCalledTimes(1);
    expect(onOpenUrl).toHaveBeenCalledWith("https://ci.example.test/deploys/1");
  });

  it("opens the card's link from a click anywhere on it", () => {
    const onOpenUrl = vi.fn();
    renderCard({ onOpenUrl, formatTimestamp: () => "at 07:42" });
    fireEvent.click(screen.getByText("Rolled out in **4 minutes**."));
    fireEvent.click(screen.getByText("Environment"));
    fireEvent.click(screen.getByText("at 07:42"));
    expect(onOpenUrl).toHaveBeenCalledTimes(3);
    expect(onOpenUrl).toHaveBeenLastCalledWith("https://ci.example.test/deploys/1");
  });

  it("opens a new tab without an opener when there is no onOpenUrl", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { container } = renderCard();
    fireEvent.click(container.querySelector("article")!);
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      "https://ci.example.test/deploys/1",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("leaves a click on something inside the card to that thing", () => {
    const onOpenUrl = vi.fn();
    const onPressImage = vi.fn();
    renderCard({
      onOpenUrl,
      onPressImage,
      renderMarkdown: (text) => (
        <a href="https://docs.example.test" onClick={(event) => event.preventDefault()}>
          {text}
        </a>
      )
    });
    fireEvent.click(screen.getByRole("link", { name: "Build runner" }));
    expect(onOpenUrl).toHaveBeenCalledTimes(1);
    expect(onOpenUrl).toHaveBeenCalledWith("https://ci.example.test");

    fireEvent.click(screen.getAllByRole("button", { name: "Open image" })[1]);
    expect(onPressImage).toHaveBeenCalledWith("/image.jpg");
    fireEvent.click(screen.getByRole("link", { name: "Two fixes" }));
    expect(onOpenUrl).toHaveBeenCalledTimes(1);
  });

  it("does not open the link when the click ended a text selection", () => {
    const onOpenUrl = vi.fn();
    renderCard({ onOpenUrl });
    vi.spyOn(window, "getSelection").mockReturnValue({
      toString: () => "Rolled out"
    } as Selection);
    fireEvent.click(screen.getByText("Rolled out in **4 minutes**."));
    expect(onOpenUrl).not.toHaveBeenCalled();
  });

  it("still calls the host's onClick, and stops when it prevented the default", () => {
    const onOpenUrl = vi.fn();
    const onClick = vi.fn();
    const { rerender } = renderCard({ onOpenUrl, onClick });
    fireEvent.click(screen.getByText("Environment"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenUrl).toHaveBeenCalledTimes(1);

    rerender(
      <GrytProvider>
        <WebhookCard
          card={full}
          onOpenUrl={onOpenUrl}
          onClick={(event) => event.preventDefault()}
        />
      </GrytProvider>
    );
    fireEvent.click(screen.getByText("Environment"));
    expect(onOpenUrl).toHaveBeenCalledTimes(1);
  });

  it("only links to http(s), and needs a title to open anything", () => {
    const onOpenUrl = vi.fn();
    const { container, rerender } = renderCard({
      onOpenUrl,
      card: { ...full, url: "javascript:alert(1)", author: { name: "Runner", url: "ftp://x" } }
    });
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByText("Environment"));
    expect(onOpenUrl).not.toHaveBeenCalled();
    expect(container.querySelector("article")).not.toHaveClass("cursor-pointer");

    rerender(
      <GrytProvider>
        <WebhookCard card={{ url: full.url, description: "No title" }} onOpenUrl={onOpenUrl} />
      </GrytProvider>
    );
    fireEvent.click(screen.getByText("No title"));
    expect(onOpenUrl).not.toHaveBeenCalled();
  });

  it("passes the description and field values through renderMarkdown", () => {
    const renderMarkdown = vi.fn((text: string) => <span>md:{text}</span>);
    renderCard({ renderMarkdown });
    expect(renderMarkdown).toHaveBeenCalledWith("Rolled out in **4 minutes**.");
    expect(renderMarkdown).toHaveBeenCalledWith("production");
    expect(screen.getByText("md:Two fixes")).toBeInTheDocument();
  });

  it("shows plain text with its line breaks when there is no markdown renderer", () => {
    renderCard();
    expect(screen.getByText("Rolled out in **4 minutes**.")).toHaveClass("whitespace-pre-line");
  });

  it("leaves line breaks to the markdown renderer when there is one", () => {
    const { container } = renderCard({ renderMarkdown: (text) => <p>{text}</p> });
    expect(container.querySelector(".whitespace-pre-line")).toBeNull();
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
