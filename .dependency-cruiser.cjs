/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular-packages",
      severity: "error",
      comment:
        "Shared packages must not have circular dependencies (including @gaki/core <-> @gaki/ui).",
      from: {
        path: "^packages/",
      },
      to: {
        circular: true,
        path: "^packages/",
      },
    },
    {
      name: "no-package-depending-on-app",
      severity: "error",
      comment:
        "Shared packages under packages/* must never import from apps/*.",
      from: {
        path: "^packages/",
      },
      to: {
        path: "^apps/",
      },
    },
    {
      name: "no-package-app-alias",
      severity: "error",
      comment:
        "Shared packages must not use app-internal '@/' path aliases.",
      from: {
        path: "^packages/",
      },
      to: {
        couldNotResolve: true,
        path: "^@/",
      },
    },
    {
      name: "no-unresolvable-package-exports",
      severity: "error",
      comment:
        "Imports from @gaki/* must match an entry in the target package.json exports map.",
      from: {
        path: "^(apps|packages)/",
      },
      to: {
        couldNotResolve: true,
        path: "^@gaki/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: ["node_modules", "\\.d\\.ts$"],
    },
    exclude: {
      path: ["node_modules", "dist", "release", "\\.test\\.", "\\.spec\\."],
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
      mainFields: ["module", "main", "types", "typings"],
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
