/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";

  const MDXComponent: ComponentType;
  export default MDXComponent;
}
/** The @gryt/ui version this site documents, from its package.json. */
declare const __UI_VERSION__: string;
