import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_CARD_STYLE } from "../../memberCard/cardStyle";
import { usePatternAssets } from "./patternAssets";

describe("pattern assets", () => {
  it("settles when emoji groups are omitted", async () => {
    let renders = 0;
    const { result } = renderHook(() => {
      if (++renders > 10) throw new Error("Pattern assets render loop");
      return usePatternAssets({ ...DEFAULT_CARD_STYLE, pattern: "emoji" }, { nickname: "Test" });
    });
    await waitFor(() => expect(result.current.mark?.body).toContain("✨"));
    expect(renders).toBeLessThan(10);
  });

  it("does not reload unchanged Unicode when the caller rebuilds groups", async () => {
    let renders = 0;
    const { result, rerender } = renderHook(() => {
      if (++renders > 10) throw new Error("Pattern assets render loop");
      return usePatternAssets({ ...DEFAULT_CARD_STYLE, pattern: "emoji" }, { nickname: "Test" }, []);
    });
    await waitFor(() => expect(result.current.mark?.body).toContain("✨"));
    const mark = result.current.mark;
    rerender();
    expect(result.current.mark).toBe(mark);
  });
});
