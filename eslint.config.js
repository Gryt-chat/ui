import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Globbed rather than bare names: a flat-config ignore of "dist" only matches
  // the repo root, so apps/docs/dist and packages/ui/dist were being linted and
  // `bun run lint` failed with thousands of errors from bundled output after
  // any build. CI never caught it because CI does not run lint.
  {
    ignores: ["**/dist/**", "**/build/**", "**/coverage/**", "**/node_modules/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Build scripts. They run under Node, are not part of any bundle, and have
  // neither a DOM nor the browser globals the recommended config assumes.
  {
    files: ["**/scripts/**/*.mjs"],
    languageOptions: {
      globals: { console: "readonly", process: "readonly" }
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true }
      ]
    }
  },
  // Our own values get real types; existing debt is listed below, the goal is to empty it (GRYT-1792).
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-restricted-types": ["error", { types: { unknown: "Type it. If it's outside input being checked, list the file in the config with the reason." } }],
      "no-restricted-syntax": ["error", {
        selector: "TSAsExpression > TSAsExpression.expression[typeAnnotation.type='TSUnknownKeyword']",
        message: "Don't cast through unknown. Fix the types, or disable this line with the reason.",
      }],
      "no-nested-ternary": "error",
      eqeqeq: ["error", "smart"],
      "no-else-return": "error",
      "prefer-const": "error",
      "no-param-reassign": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports", disallowTypeAnnotations: false }],
    },
  },
  // unknown: not typed yet.
  {
    files: [
      "apps/docs/scripts/og-drawings.ts",
      "apps/docs/src/lib/cardIcons.ts",
      "apps/docs/src/pages/DrawingPage.tsx",
      "packages/ui-native/src/components/Drawer/Drawer.tsx",
      "packages/ui/src/components/ThemeEditor/draft.ts",
      "packages/ui/src/memberCard/patterns.ts",
    ],
    rules: { "@typescript-eslint/no-restricted-types": "off" },
  },
  // unknown: caught errors are unknown until checked.
  {
    files: [
      "apps/docs/src/components/CosmeticChecker.tsx",
    ],
    rules: { "@typescript-eslint/no-restricted-types": "off" },
  },
  // unknown: stored and parsed data arrives unchecked and is validated there.
  {
    files: [
      "apps/docs/src/lib/theme/siteTheme.ts",
      "packages/ui/src/components/OwlDesigner/owlSeen.ts",
      "packages/ui/src/components/OwlDesigner/owlWardrobe.ts",
      "packages/ui/src/memberCard/cardStyle.ts",
    ],
    rules: { "@typescript-eslint/no-restricted-types": "off" },
  },
  // unknown: socket payloads arrive unchecked and are validated there.
  {
    files: [
      "packages/theme/src/theme.ts",
    ],
    rules: { "@typescript-eslint/no-restricted-types": "off" },
  },
  // unknown: tests build loose values on purpose.
  {
    files: [
      "packages/ui/src/entries.test.ts",
      "packages/ui/src/overlayInset.test.tsx",
    ],
    rules: { "@typescript-eslint/no-restricted-types": "off" },
  },
  // Nested ternaries from before the rule.
  {
    files: [
      "apps/docs/src/components/CosmeticChecker.tsx",
      "packages/owl/src/eggs/index.ts",
      "packages/owl/src/index.ts",
      "packages/owl/src/owl.test.ts",
      "packages/owl/src/palette.ts",
    ],
    rules: { "no-nested-ternary": "off" },
  },
  // Tests may assert non-null: a wrong guess fails the test, which is the point.
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
  // Non-null assertions from before the rule.
  {
    files: [
      "apps/docs/src/main.tsx",
      "apps/docs/src/pages/AvatarsPage.tsx",
      "apps/docs/src/pages/DrawingPage.tsx",
      "packages/owl/scripts/egg-base.ts",
      "packages/owl/scripts/owl-accessory.ts",
      "packages/owl/src/eggs/index.ts",
      "packages/owl/src/geometry.ts",
      "packages/owl/src/index.ts",
      "packages/owl/src/lib/filename.ts",
      "packages/owl/src/rng.ts",
    ],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
);
