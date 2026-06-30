import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
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
