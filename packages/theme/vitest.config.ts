import { defineConfig } from "vitest/config";

// No happy-dom and no setup file, unlike @gryt/ui. Nothing here touches a
// document, and the node environment is what proves it.
export default defineConfig({
  test: {
    environment: "node",
    globals: true
  }
});
