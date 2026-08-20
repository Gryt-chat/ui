/* The `@gryt/ui/theme` entry point, kept as a re-export.
 *
 * The tokens, scales, presets and OKLCH maths moved to `@gryt/theme` so a
 * React Native app can take them without pulling a web renderer behind them —
 * `@gryt/ui` depends on Base UI and Phosphor, both of which require react-dom,
 * so depending on this package at all dragged ~85 MB of DOM code into a phone
 * app that only wanted the colours (GRYT-374).
 *
 * This file stays so that `import { grytTokens } from "@gryt/ui/theme"` keeps
 * resolving for anyone already writing it. New code on the web can use either;
 * anything without a DOM should depend on `@gryt/theme` directly.
 */
export * from "@gryt/theme";
