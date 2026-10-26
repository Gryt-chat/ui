import { describe, expect, it } from "vitest";

import {
  createGrytTheme,
  grytLightTokens,
  grytLightUnread,
  grytTokens
} from "./createGrytTheme";
import { contrast } from "./oklch";

type Vars = Record<string, string>;

/**
 * Unread is a literal per appearance rather than a step of a family, so its contrast
 * is checked here rather than per preset.
 */
describe("the unread colour", () => {
  const unread = grytTokens.color.unread;

  // A filled shape carrying a count, not text: 3:1 is what WCAG asks of it.
  it.each([
    ["dark page", unread, grytTokens.color.bg],
    ["dark surface", unread, grytTokens.color.surface],
    ["light page", grytLightUnread, grytLightTokens.bg],
    ["light surface", grytLightUnread, grytLightTokens.surface]
  ])("clears 3:1 on the %s", (_where, fill, background) => {
    expect(contrast(fill, background)).toBeGreaterThanOrEqual(3);
  });

  // The count sits on the fill, and it is a digit or two at 600 weight.
  it.each([unread, grytLightUnread])("carries its own ink at 4.5:1 on %s", (fill) => {
    expect(contrast(grytTokens.color.onUnread, fill)).toBeGreaterThanOrEqual(4.5);
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

  it("uses the darker coral under light", () => {
    const light = createGrytTheme({ appearance: "light" }) as Vars;
    expect(light["--gryt-unread"]).toBe(grytLightUnread);
    expect((createGrytTheme({ appearance: "light", color: { unread: "#00ff88" } }) as Vars)["--gryt-unread"]).toBe("#00ff88");
  });
});
