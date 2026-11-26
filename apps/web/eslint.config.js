import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import { guardrailsPlugin, guardrailRules } from "../../packages/config-eslint/guardrails.js";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
      gaki: guardrailsPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.app.json",
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...guardrailRules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // TODO(web): tighten back to "error" once legacy web files are typed/cleaned
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "react-hooks/rules-of-hooks": "error",
      "no-case-declarations": "warn",
      "no-useless-escape": "warn",
      "no-empty": "warn",
      "no-empty-pattern": "warn",
      "prefer-const": "warn",
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/shared",
              from: ["./src/features", "./src/kernel"],
              message: "Shared layer cannot import from features or kernel",
            },
            {
              target: "./src/features/canvas",
              from: ["./src/features/!(canvas)"],
              message: "Features cannot directly import from other features",
            },
            {
              target: "./src/kernel",
              from: ["./src/features"],
              message: "Kernel cannot import from features",
            },
          ],
        },
      ],
    },
  },
);
