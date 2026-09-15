import { describe, expect, it } from "vitest";
import { defaultTimestamp, dotColor, footerText, openableUrl } from "./webhookCardParts";

describe("dotColor", () => {
  it("keeps a #rrggbb colour", () => {
    expect(dotColor("#3ba55d", "border")).toBe("#3ba55d");
    expect(dotColor("#ABCDEF", "border")).toBe("#ABCDEF");
  });

  it("falls back for anything else", () => {
    expect(dotColor(undefined, "border")).toBe("border");
    expect(dotColor("red", "border")).toBe("border");
    expect(dotColor("#fff", "border")).toBe("border");
    expect(dotColor("#3ba55d; background: red", "border")).toBe("border");
  });
});

describe("openableUrl", () => {
  it("accepts http and https", () => {
    expect(openableUrl("https://ci.example.com/run/1")).toBe("https://ci.example.com/run/1");
    expect(openableUrl(" http://example.com ")).toBe("http://example.com");
  });

  it("refuses other schemes and empty values", () => {
    expect(openableUrl(undefined)).toBeUndefined();
    expect(openableUrl("")).toBeUndefined();
    expect(openableUrl("javascript:alert(1)")).toBeUndefined();
    expect(openableUrl("gryt://invite?host=x")).toBeUndefined();
    expect(openableUrl("https://")).toBeUndefined();
  });
});

describe("defaultTimestamp", () => {
  it("formats a valid ISO string", () => {
    expect(defaultTimestamp("2026-09-15T09:42:00Z")).not.toBe("");
  });

  it("returns an empty string for garbage", () => {
    expect(defaultTimestamp("not a date")).toBe("");
  });
});

describe("footerText", () => {
  it("joins footer and time", () => {
    expect(footerText("ci.example.com", "Sep 15")).toBe("ci.example.com · Sep 15");
  });

  it("uses whichever half exists", () => {
    expect(footerText("ci.example.com", "")).toBe("ci.example.com");
    expect(footerText(undefined, "Sep 15")).toBe("Sep 15");
    expect(footerText("  ", "Sep 15")).toBe("Sep 15");
  });

  it("is null with neither", () => {
    expect(footerText(undefined, "")).toBeNull();
  });
});
