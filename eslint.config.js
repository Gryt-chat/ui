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
  }
);
