import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Dual ESM and CJS: @gryt/ui still has a CommonJS build and re-exports this one, so an
// ESM-only build here leaves dist/theme.cjs requiring something it cannot load.

// `react` is external for one `import type { CSSProperties }`, erased at compile time.
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
