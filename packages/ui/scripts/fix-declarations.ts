import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve(import.meta.dir, "../dist");
const indexDtsPath = resolve(distDir, "index.d.ts");
const indexDCtsPath = resolve(distDir, "index.d.cts");
// The ./theme subpath has its own declaration for the same reason the root
// does: the require condition points at a .d.cts, and vite-plugin-dts only
// emits .d.ts. See GRYT-351.
const themeDtsPath = resolve(distDir, "theme.d.ts");
const themeDCtsPath = resolve(distDir, "theme.d.cts");
const themeSourcePath = resolve(import.meta.dir, "../src/styles/theme.css");
const themeDistPath = resolve(distDir, "theme.css");
const componentsSourcePath = resolve(import.meta.dir, "../src/styles/components.css");
const componentsDistPath = resolve(distDir, "components.css");

async function declarationFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const entryPath = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        return declarationFiles(entryPath);
      }

      if (entry.isFile() && entry.name.endsWith(".d.ts")) {
        return [entryPath];
      }

      return [];
    })
  );

  return files.flat();
}

function addJsExtensions(declaration: string) {
  return declaration.replace(
    /from '(\.[^']+)'/g,
    (_match, specifier: string) => {
      if (specifier.endsWith(".js") || specifier.endsWith(".json")) {
        return `from '${specifier}'`;
      }

      return `from '${specifier}.js'`;
    }
  );
}

for (const filePath of await declarationFiles(distDir)) {
  const declaration = await readFile(filePath, "utf8");
  await writeFile(filePath, addJsExtensions(declaration));
}

await copyFile(indexDtsPath, indexDCtsPath);
await copyFile(themeDtsPath, themeDCtsPath);

// Copied verbatim rather than built. dist/styles.css goes through Vite and
// Tailwind, which resolves @theme into :root variables — useful at runtime,
// useless as theme config. A consumer that wants bg-gryt-accent in its own app
// needs the @theme block intact, so this one file bypasses the build.
await copyFile(themeSourcePath, themeDistPath);

// Same reason, one layer down: the @apply calls in components.css have to
// resolve against the consuming app own Tailwind build, so this one is copied
// rather than built too.
await copyFile(componentsSourcePath, componentsDistPath);
