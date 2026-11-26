import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { guardrailsPlugin, guardrailRules } from "./guardrails.js";

/**
 * Shared ESLint flat config builder for GAKI workspaces.
 */
export function createWorkspaceConfig({
  files = ["**/*.{ts,tsx}"],
  env = "browser",
  typescript = true,
  ignores = ["dist", "node_modules", "release"],
  extraRules = {},
} = {}) {
  const envGlobals =
    env === "node"
      ? globals.node
      : env === "both"
        ? { ...globals.browser, ...globals.node }
        : globals.browser;

  const baseExtends = typescript
    ? [js.configs.recommended, ...tseslint.configs.recommended]
    : [js.configs.recommended];

  return tseslint.config(
    { ignores },
    {
      extends: baseExtends,
      files,
      languageOptions: {
        ecmaVersion: 2022,
        globals: envGlobals,
      },
      plugins: {
        gaki: guardrailsPlugin,
      },
      rules: {
        ...guardrailRules,
        "no-empty": "warn",
        "no-async-promise-executor": "warn",
        ...(typescript
          ? {
              "@typescript-eslint/no-unused-vars": "off",
              "@typescript-eslint/no-explicit-any": "warn",
              "@typescript-eslint/no-empty-object-type": "warn",
              "@typescript-eslint/no-namespace": "warn",
            }
          : {
              "no-unused-vars": "off",
            }),
        ...extraRules,
      },
    },
  );
}
