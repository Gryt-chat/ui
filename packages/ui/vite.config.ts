import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readdirSync } from "node:fs";
import { basename, resolve } from "node:path";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import dts from "vite-plugin-dts";

import pkg from "./package.json" with { type: "json" };

// Derived rather than hand-listed. The hand-written list still named MUI after it was
// removed and had never been given Base UI, which took the bundle from 200 kB to 505 kB.
const bundledExternally = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {})
];

// Every file in src/entries is a subpath: src/entries/button.ts ships as @gryt/ui/button.
const componentEntries = Object.fromEntries(
  readdirSync(resolve(__dirname, "src/entries"))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => [
      `entries/${basename(file, ".ts")}`,
      resolve(__dirname, "src/entries", file)
    ])
);

// Rollup drops module-level directives, so "use client" is put back on each module that had it.
function keepUseClient(): Plugin {
  const clientModules = new Set<string>();
  return {
    name: "gryt:keep-use-client",
    transform(code, id) {
      if (/^\s*["']use client["']/.test(code)) clientModules.add(id);
      return null;
    },
    onLog(level, log) {
      if (
        log.code === "MODULE_LEVEL_DIRECTIVE" &&
        log.message.includes("use client")
      )
        return false;
    },
    banner(chunk) {
      return chunk.moduleIds.some((id) => clientModules.has(id))
        ? '"use client";'
        : "";
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    keepUseClient(),
    dts({
      insertTypesEntry: true,
      // tsconfig.build.json, not tsconfig.json: the typecheck config maps @gryt/theme to
      // its source, and the emitted .d.ts would then point at ../theme/src.
      tsconfigPath: resolve(__dirname, "tsconfig.build.json"),
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"]
    })
  ],
  build: {
    lib: {
      // Two entries, not one. The theme has to be importable without dragging the
      // components in — React Native can take the tokens and none of the rest (GRYT-351).
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        theme: resolve(__dirname, "src/theme/index.ts"),
        ...componentEntries
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`
    },
    rollupOptions: {
      external: (id) =>
        bundledExternally.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      output: {
        // One file per source module, so a bundler can drop what a page never imports.
        preserveModules: true,
        preserveModulesRoot: "src",
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
    globals: true,
    // Under `test`, deliberately, not `resolve`. A top-level alias would make Rollup
    // inline @gryt/theme into the bundle rather than leaving it external.
    alias: {
      "@gryt/theme": resolve(__dirname, "../theme/src/index.ts"),
      "@gryt/owl": resolve(__dirname, "../owl/src/index.ts")
    }
  }
});
