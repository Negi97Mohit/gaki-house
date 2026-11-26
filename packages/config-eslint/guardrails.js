/**
 * Shared ESLint guardrails plugin & rule set for all GAKI workspaces.
 */
const CODE_COMMENT_PATTERNS = [
  /^(const|let|var|import|export|function|return|class|interface|type)\s+[A-Za-z_$]/,
  /^(if|for|while|switch)\s*\(/,
  /^console\.log\s*\(/,
];

export const guardrailsPlugin = {
  rules: {
    "no-commented-out-code": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Flag commented-out code statements",
        },
        schema: [],
      },
      create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        return {
          Program() {
            for (const comment of sourceCode.getAllComments()) {
              if (comment.type !== "Line") continue;
              const text = comment.value.trim();
              if (!text) continue;
              if (CODE_COMMENT_PATTERNS.some((re) => re.test(text))) {
                context.report({
                  loc: comment.loc,
                  message: "Remove commented-out code instead of leaving it in comments.",
                });
              }
            }
          },
        };
      },
    },
  },
};

export const guardrailRules = {
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "no-debugger": "error",
  // Flags unowned TODO/FIXME comments (e.g. "TODO: ..." without "(owner)")
  "no-warning-comments": [
    "warn",
    {
      terms: ["todo:", "todo ", "fixme:", "fixme "],
      location: "start",
    },
  ],
  "gaki/no-commented-out-code": "warn",
  "max-lines": ["warn", { max: 300, skipBlankLines: true, skipComments: true }],
};
