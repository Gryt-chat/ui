/**
 * `import.meta.dir`, which is bun's and which @types/node does not know about.
 *
 * The scripts in this directory run under bun and nowhere else, so the property
 * is there. Declared here rather than by adding @types/bun to the package: one
 * property does not need a dependency, and the package's own devDependencies
 * are what a publish resolves.
 */
declare global {
  interface ImportMeta {
    /** The directory holding this module, absolute, with no trailing slash. */
    readonly dir: string;
  }
}

export {};
