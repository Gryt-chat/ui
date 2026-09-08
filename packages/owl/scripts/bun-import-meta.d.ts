/**
 * `import.meta.dir`, which is bun's and which @types/node does not know about. Declared
 * here rather than by adding @types/bun: one property does not need a dependency.
 */
declare global {
  interface ImportMeta {
    /** The directory holding this module, absolute, with no trailing slash. */
    readonly dir: string;
  }
}

export {};
