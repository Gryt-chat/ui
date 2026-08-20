// vite-plugin-dts emits .d.ts only, and the require condition in package.json
// points at a .d.cts. Same fix @gryt/ui carries, minus the extra entry points
// and the stylesheet copy — this package has one entry and ships no CSS.
import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve(import.meta.dir, "../dist");

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
  return declaration.replace(/from '(\.[^']+)'/g, (_match, specifier: string) => {
    if (specifier.endsWith(".js") || specifier.endsWith(".json")) {
      return `from '${specifier}'`;
    }

    return `from '${specifier}.js'`;
  });
}

for (const filePath of await declarationFiles(distDir)) {
  const declaration = await readFile(filePath, "utf8");
  await writeFile(filePath, addJsExtensions(declaration));
}

await copyFile(resolve(distDir, "index.d.ts"), resolve(distDir, "index.d.cts"));
