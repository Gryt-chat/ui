import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "memberCard.css"),
  "utf8"
);
const component = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "MemberCardView.tsx"),
  "utf8"
);

describe("MemberCard banner corners", () => {
  it("clips the banner inside a thick outline", () => {
    expect(css).toMatch(/\.gmc-banner\s*\{[^}]*overflow:\s*hidden/);
    expect(css).toMatch(
      /border-radius:\s*calc\(var\(--r-lg\) - var\(--gmc-edge, 1px\)\)/
    );
  });

  it("keeps the coloured outline in its own clipped frame", () => {
    expect(css).toMatch(
      /\.gmc-frame\[data-fc\]\s*\{[^}]*padding:\s*var\(--gmc-edge, 1px\)/
    );
    expect(css).toMatch(
      /background-image:\s*linear-gradient\(var\(--fc-edge\), var\(--fc-edge\)\), var\(--fc-bg\)/
    );
    expect(css).toMatch(/\.gmc\[data-fc\]\s*\{[^}]*box-shadow:\s*inset 0 0 0 1px var\(--fc-glint\)/);
  });

  it("clips video banners and fades them with full-card colours", () => {
    expect(css).toMatch(/\.gmc-banner-media\s*\{[^}]*object-fit:\s*cover/);
    expect(css).toMatch(/\.gmc\[data-fc\] \.gmc-banner\.video \.gmc-banner-media\s*\{[^}]*mask-image:\s*var\(--fade\)/);
    expect(component).toMatch(/<video[^>]*autoPlay[^>]*loop[^>]*muted[^>]*playsInline/);
  });
});
