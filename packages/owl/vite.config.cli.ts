import { resolve } from "node:path";
import { defineConfig } from "vite";

/**
 * The CLI, built entirely on its own.
 *
 * A separate config rather than a second entry on the main one, and that is the
 * whole point of the file. `dist/index.js` is one self-contained file with no
 * imports, which is what lets a plain `<script type="module">` and a React
 * Native app both take the same generator. Give the main build two entries that
 * share code and vite hoists the shared half into a chunk: measured, adding one
 * entry took `dist/index.js` from 86kB to 13kB and two `import` statements.
 * Nothing errors.
 *
 * Two builds of one entry each cannot do that to each other. The cost is that
 * the generator is compiled twice and the CLI carries its own copy.
 *
 * `check-dist-shape.ts` runs after both and fails the build if `index.js` ever
 * grows an import.
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
