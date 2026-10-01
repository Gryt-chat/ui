import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EmojiPicker } from "./EmojiPicker";
import { filterEmojiItems } from "./emojiSearch";

const GROUPS = [
  {
    id: "faces",
    label: "Faces",
    icon: "😀",
    items: [
      { id: "smile", name: "smile", emoji: "😀", keywords: ["happy"] },
      { id: "cry", name: "cry", emoji: "😢", keywords: ["sad"] }
    ]
  },
  {
    id: "things",
    label: "Things",
    icon: "💡",
    items: [{ id: "bulb", name: "light bulb", emoji: "💡", keywords: ["idea"] }]
  }
];

describe("EmojiPicker", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(336);
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(300);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows every category in one scroll and reports the selected item", () => {
    const onSelect = vi.fn();
    render(
      <EmojiPicker groups={GROUPS} onSelect={onSelect} autoFocus={false} />
    );

    expect(screen.getByRole("button", { name: ":smile:" })).toBeInTheDocument();
    expect(screen.getByText("Faces")).toBeInTheDocument();
    expect(screen.getByText("Things")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: ":light bulb:" }));
    expect(onSelect).toHaveBeenCalledWith(GROUPS[1].items[0]);
    expect(screen.getByText("3 emoji")).toBeInTheDocument();
  });

  it("searches names and keywords across categories", () => {
    render(
      <EmojiPicker
        groups={GROUPS}
        onSelect={() => undefined}
        autoFocus={false}
      />
    );
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "idea" }
    });

    expect(
      screen.getByRole("button", { name: ":light bulb:" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: ":smile:" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("1 result")).toBeInTheDocument();
  });

  it("moves through the grid with arrow keys", () => {
    render(
      <EmojiPicker
        groups={GROUPS}
        onSelect={() => undefined}
        autoFocus={false}
      />
    );
    const smile = screen.getByRole("button", { name: ":smile:" });
    const cry = screen.getByRole("button", { name: ":cry:" });
    smile.focus();
    fireEvent.keyDown(smile, { key: "ArrowRight" });
    expect(cry).toHaveFocus();
  });

  it("moves through category jump controls with arrow keys", () => {
    render(
      <EmojiPicker
        groups={GROUPS}
        onSelect={() => undefined}
        autoFocus={false}
      />
    );
    const faces = screen.getByRole("button", { name: "Faces" });
    const things = screen.getByRole("button", { name: "Things" });
    faces.focus();
    fireEvent.keyDown(faces, { key: "ArrowRight" });
    expect(things).toHaveFocus();
    expect(things).toHaveAttribute("aria-current", "true");
  });

  it("renders custom image emoji and disabled state", () => {
    render(
      <EmojiPicker
        groups={[
          {
            id: "custom",
            label: "Custom",
            items: [
              { id: "owl", name: "owl", imageUrl: "/owl.png", disabled: true }
            ]
          }
        ]}
        onSelect={() => undefined}
        autoFocus={false}
      />
    );
    expect(screen.getByRole("button", { name: ":owl:" })).toBeDisabled();
    expect(screen.getByRole("presentation")).toHaveAttribute("src", "/owl.png");
  });
});

describe("filterEmojiItems", () => {
  it("ranks a name prefix ahead of a keyword match and removes duplicates", () => {
    const groups = [...GROUPS, { ...GROUPS[0], id: "duplicate" }];
    expect(filterEmojiItems(groups, "sm").map((item) => item.id)).toEqual([
      "smile"
    ]);
  });
});
