import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// No React Native runtime here on purpose. These tests cover the theme layer, which is
// plain data and arithmetic; rendering components needs a native harness.
export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the `paths` entry in tsconfig.json: the exports map sends @gryt/theme to
      // ./dist, which only exists after a build, and CI typechecks before building.
      "@gryt/theme": resolve(__dirname, "../theme/src/index.ts"),
      "@gryt/owl": resolve(__dirname, "../owl/src/index.ts"),
    },
  },
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
