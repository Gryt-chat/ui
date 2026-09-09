import { describe, expect, it } from "vitest";

import {
  createGrytTheme,
  grytLightTokens,
  grytTokens
} from "./createGrytTheme";
import { contrast } from "./oklch";

type Vars = Record<string, string>;

/**
 * Unread is one literal shared by both appearances rather than a step of a family,
 * so its contrast is checked here rather than per preset.
 */
describe("the unread colour", () => {
  const unread = grytTokens.color.unread;

  // A filled shape carrying a count, not text: 3:1 is what WCAG asks of it.
  it.each([
    ["dark page", grytTokens.color.bg],
    ["dark surface", grytTokens.color.surface],
    ["light page", grytLightTokens.bg],
    ["light surface", grytLightTokens.surface]
  ])("clears 3:1 on the %s", (_where, background) => {
    expect(contrast(unread, background)).toBeGreaterThanOrEqual(3);
  });

  // The count sits on the fill, and it is a digit or two at 600 weight.
  it("carries its own ink at 4.5:1", () => {
    expect(contrast(grytTokens.color.onUnread, unread)).toBeGreaterThanOrEqual(4.5);
  });

  /* The whole point of it being its own colour: a mention and an unread channel
     are two answers, and a sidebar where they are shades of one says nothing. */
  it("is nowhere near the accent", () => {
    expect(contrast(unread, grytTokens.color.accent)).toBeLessThan(1.5);
    expect(unread).not.toBe(grytTokens.color.danger);
  });

  it("reaches the stylesheet under both names", () => {
    const vars = createGrytTheme() as Vars;
    expect(vars["--gryt-unread"]).toBe(unread);
    expect(vars["--color-gryt-unread"]).toBe(unread);
    expect(vars["--gryt-on-unread"]).toBe(grytTokens.color.onUnread);
  });

  // What "overridden if needed by the themer" has to mean in practice.
  it("takes an override", () => {
    const vars = createGrytTheme({ color: { unread: "#00ff88" } }) as Vars;
    expect(vars["--gryt-unread"]).toBe("#00ff88");
    expect(vars["--color-gryt-unread"]).toBe("#00ff88");
  });

  // Light borrows the hues, so one value covers both and there is nothing to sync.
  it("is the same colour in both appearances", () => {
    const light = createGrytTheme({ appearance: "light" }) as Vars;
    const dark = createGrytTheme({ appearance: "dark" }) as Vars;
    expect(light["--gryt-unread"]).toBe(dark["--gryt-unread"]);
  });
});
