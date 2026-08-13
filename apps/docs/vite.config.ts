import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

/* The version being documented. The sidebar wears a New tag on pages that
   arrived in it, and reading the number here means nobody has to remember to
   take the tag off — the next minor does it. */
const uiVersion: string = JSON.parse(
  readFileSync(resolve(__dirname, "../../packages/ui/package.json"), "utf8")
).version;

export default defineConfig({
  define: {
    __UI_VERSION__: JSON.stringify(uiVersion)
  },
  resolve: {
    alias: {
      "@gryt/ui/styles.css": resolve(
        __dirname,
        "../../packages/ui/src/styles/index.css"
      ),
      "@gryt/ui": resolve(__dirname, "../../packages/ui/src/index.ts")
    }
  },
  plugins: [
    mdx({ providerImportSource: "@mdx-js/react" }),
    react(),
    tailwindcss()
  ],
  server: {
    fs: {
      allow: ["../.."]
    }
  }
});
