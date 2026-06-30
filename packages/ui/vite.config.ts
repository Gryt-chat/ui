import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const peerDependencies = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "@emotion/react",
  "@emotion/styled",
  "@mui/material",
  "@mui/system"
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
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs")
    },
    rollupOptions: {
      external: (id) =>
        peerDependencies.some((dep) => id === dep || id.startsWith(`${dep}/`)),
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
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true
  }
});
