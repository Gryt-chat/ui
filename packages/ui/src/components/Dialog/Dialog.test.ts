// Read off disk, the same way tones.test.ts does: this is a check on the source
// text, not on a render.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const componentsDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function popupWidth(file: string): string {
  const source = readFileSync(join(componentsDir, file), "utf8");
  const match = /"flex (w-\[[^\]]+\]|w-\d+) max-w-\[calc\(100vw-3rem\)\]/.exec(
    source
  );
  if (!match) throw new Error(`No popup width found in ${file}`);
  return match[1];
}

/**
 * AlertDialog is styled identically to Dialog on purpose — the difference is behaviour.
 * Nothing enforced that, so raising one default and forgetting the other was invisible.
 */
describe("dialog width", () => {
  it("is the same for Dialog and AlertDialog", () => {
    expect(popupWidth(join("AlertDialog", "AlertDialog.tsx"))).toBe(
      popupWidth(join("Dialog", "Dialog.tsx"))
    );
  });
});
