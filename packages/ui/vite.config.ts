import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import pkg from "./package.json" with { type: "json" };

// Derived rather than hand-listed. The hand-written list still named MUI and
// Emotion after they were removed, and had never been given @base-ui/react or
// @phosphor-icons/react — so both were being inlined, which took the bundle
// from 200 kB to 505 kB. Reading package.json means the two cannot drift.
const bundledExternally = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {})
];

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"]
    })
  ],
  build: {
    lib: {
      // Two entries, not one. The theme has to be importable without dragging
      // the components in — React Native can take the tokens and none of the
      // rest. See GRYT-351.
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        theme: resolve(__dirname, "src/theme/index.ts")
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: (id) =>
        bundledExternally.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "styles.css"
            : "assets/[name][extname]"
      }
    },
    sourcemap: true
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true
  }
});
