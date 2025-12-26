import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

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
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
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
