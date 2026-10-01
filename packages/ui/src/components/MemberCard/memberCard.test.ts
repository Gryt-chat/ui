import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "memberCard.css"),
  "utf8"
);

describe("MemberCard banner corners", () => {
  it("clips the banner inside a thick outline", () => {
    expect(css).toMatch(/\.gmc-banner\s*\{[^}]*overflow:\s*hidden/);
    expect(css).toMatch(
      /border-radius:\s*calc\(var\(--r-lg\) - var\(--gmc-edge, 1px\)\)/
    );
  });

  it("draws the outline over the card fill", () => {
    expect(css).toMatch(
      /\.gmc\[data-fc\]\s*\{[^}]*border-color:\s*transparent/
    );
    expect(css).toMatch(
      /inset 0 0 0 var\(--gmc-edge, 1px\) var\(--fc-edge\)/
    );
  });
});
