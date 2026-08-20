import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Dual ESM and CJS, matching what @gryt/ui/theme shipped before this package
// existed. @gryt/ui still has a CommonJS build and re-exports this one, so an
// ESM-only build here would leave dist/theme.cjs requiring something it cannot
// load.
//
// `react` is external for the sake of one `import type { CSSProperties }`.
// It is erased at compile time and never reaches the bundle, which is the
// whole reason this package can sit in a React Native app.
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
      exclude: ["src/**/*.test.ts"]
    })
  ],
  build: {
    lib: {
      entry: { index: resolve(__dirname, "src/index.ts") },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: (id) => id === "react" || id.startsWith("react/")
    },
    sourcemap: true
  }
});
