import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Dual ESM and CJS, matching the rest of the packages here. @gryt/ui has a
// CommonJS build and re-exports this one, so an ESM-only build would leave
// dist/index.cjs requiring something it cannot load.
//
// Nothing is external, because nothing is imported. That is the point of the
// package: a plain <script type="module">, a React app and a React Native app
// all get the same generator with nothing to install alongside it.
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
    sourcemap: true
  }
});
