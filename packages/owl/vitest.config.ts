import { defineConfig } from "vitest/config";

// Node, no happy-dom and no setup file. Nothing here touches a document, and
// running the tests without one is what proves it.
export default defineConfig({
  test: {
    environment: "node",
    globals: true
  }
});
