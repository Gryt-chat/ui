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
      "@gryt/ui": resolve(__dirname, "../../packages/ui/src/index.ts"),
      // @gryt/ui's source imports this, and the docs app builds that source
      // rather than its dist, so the alias has to cover it too.
      "@gryt/theme": resolve(__dirname, "../../packages/theme/src/index.ts"),
      // The extractor, so the drawing guide can check an upload with the
      // same code the generator runs. Listed before "@gryt/owl" would be
      // wrong — vite matches longest-first, but keeping them adjacent is
      // how they stay in step.
      "@gryt/owl/authoring": resolve(
        __dirname,
        "../../packages/owl/scripts/authoring.ts"
      ),
      "@gryt/owl": resolve(__dirname, "../../packages/owl/src/index.ts")
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
