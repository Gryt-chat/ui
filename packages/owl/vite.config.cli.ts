import { resolve } from "node:path";
import { defineConfig } from "vite";

/**
 * The CLI, built on its own. A second entry on the main config makes vite hoist shared
 * code into a chunk, and `dist/index.js` has to stay one file that imports nothing.
 */
export default defineConfig({
  build: {
    // The main build has already run and written index.js beside this.
    emptyOutDir: false,
    // No CJS. This is run, not imported, and `npx` gets an ESM file happily
    // because the package is `"type": "module"`.
    lib: {
      entry: { cli: resolve(__dirname, "src/cli/check.ts") },
      formats: ["es"],
      fileName: () => "cli.js",
    },
    rollupOptions: {
      // Node's own modules, which the CLI reads files with and the library
      // deliberately does not touch.
      external: [/^node:/],
      output: {
        banner: "#!/usr/bin/env node",
      },
    },
    sourcemap: true,
  },
});
