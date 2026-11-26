import { createWorkspaceConfig } from "@gaki/eslint-config/workspace";

export default createWorkspaceConfig({
  files: ["**/*.{js,mjs}"],
  env: "node",
  typescript: false,
});
