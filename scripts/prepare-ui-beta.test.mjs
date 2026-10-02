import assert from "node:assert/strict";
import { test } from "node:test";

import { assertPatchBeta } from "./prepare-ui-beta.mjs";

test("UI beta publishing allows only the next patch beta", () => {
  assertPatchBeta("0.39.2-beta.1", "0.39.1");
  for (const version of ["0.39.2", "0.39.2-latest.1", "0.40.0-beta.1", "0.39.1-beta.1", "0.39.3-beta.1", "latest"]) {
    assert.throws(() => assertPatchBeta(version, "0.39.1"));
  }
});
