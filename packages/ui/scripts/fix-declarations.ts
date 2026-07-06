import { copyFile, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve(import.meta.dir, "../dist");
const indexDtsPath = resolve(distDir, "index.d.ts");
const indexDCtsPath = resolve(distDir, "index.d.cts");

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
