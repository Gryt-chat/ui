/* The `@gryt/ui/theme` entry point, kept as a re-export so existing imports
 * keep resolving. The tokens and maths live in `@gryt/theme` — this package
 * pulls Base UI and Phosphor, ~85 MB of DOM code, behind anything that only
 * wanted the colours (GRYT-374).
 *
 * **Anything without a DOM should depend on `@gryt/theme` directly.**
 */
export * from "@gryt/theme";
