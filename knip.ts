import type { KnipConfig } from "knip";

const config: KnipConfig = {
  ignore: [
    // Standalone Firestore admin/seed CLI scripts invoked manually via node
    "scripts/*.js",
  ],
  ignoreBinaries: [
    // Invoked only via optional dev:signaling script
    "nodemon",
    // Provided by root/workspace typescript package for type-check scripts
    "tsc",
  ],
  // Exclude unused exports/types/duplicates from blocking CI while legacy exports are pruned incrementally
  exclude: ["exports", "types", "duplicates"],
  workspaces: {
    "apps/web": {
      entry: ["netlify/functions/*.ts!"],
      project: ["src/**/*.{ts,tsx}!", "netlify/functions/*.ts!"],
    },
    "apps/gaki-mobile": {
      project: ["src/**/*.{ts,tsx}!"],
    },
    "apps/desktop": {
      entry: ["electron/preload.ts!"],
      project: ["electron/**/*.ts!"],
    },
    "apps/api-handoff": {
      project: ["src/**/*.ts!"],
    },
    "apps/api-signaling": {
      project: ["*.js!"],
    },
    "packages/*": {
      entry: ["src/**/*.{ts,tsx}!"],
      project: ["src/**/*.{ts,tsx}!"],
    },
  },
};

export default config;
