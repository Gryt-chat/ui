import { defineConfig } from "vitest/config";

// No React Native runtime here on purpose. These tests cover the theme layer,
// which is plain data and arithmetic — rendering components needs a native
// harness and belongs with the app, not with the token pipeline.
export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
