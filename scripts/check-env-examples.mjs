#!/usr/bin/env node
/**
 * Verifies:
 * 1. No .env files (except .env.example) are tracked in git.
 * 2. No forbidden server secrets are referenced with a VITE_ prefix in client source or .env.example.
 * 3. Every import.meta.env.VITE_* used in apps/web/src or apps/gaki-mobile/src is documented in that app's .env.example.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const FORBIDDEN_VITE_SECRETS = [
  "VITE_TWITCH_CLIENT_SECRET",
  "VITE_KICK_CLIENT_SECRET",
  "VITE_DEEPGRAM_API_KEY",
  "VITE_GEMINI_API_KEY",
];

let failed = false;

// 1. Ensure no real .env files are tracked in git
const tracked = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

for (const file of tracked) {
  const base = path.basename(file);
  if (base.startsWith(".env") && base !== ".env.example") {
    console.error(`ERROR: Secret env file is tracked in git: ${file}`);
    failed = true;
  }
}

// 2. Check each Vite app
function walk(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      results.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function parseExampleKeys(examplePath) {
  if (!fs.existsSync(examplePath)) return new Set();
  const lines = fs.readFileSync(examplePath, "utf8").split(/\r?\n/);
  const keys = new Set();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq > 0) keys.add(line.slice(0, eq).trim());
  }
  return keys;
}

for (const appDir of ["apps/web", "apps/gaki-mobile"]) {
  const examplePath = path.join(ROOT, appDir, ".env.example");
  const exampleKeys = parseExampleKeys(examplePath);

  for (const secret of FORBIDDEN_VITE_SECRETS) {
    if (exampleKeys.has(secret)) {
      console.error(`ERROR: Forbidden secret key ${secret} found in ${appDir}/.env.example`);
      failed = true;
    }
  }

  const srcDir = path.join(ROOT, appDir, "src");
  const usedViteKeys = new Set();
  const re = /import\.meta\.env\.(VITE_[A-Z0-9_]+)/g;

  for (const file of walk(srcDir)) {
    const content = fs.readFileSync(file, "utf8");
    let match;
    while ((match = re.exec(content)) !== null) {
      const key = match[1];
      usedViteKeys.add(key);
      if (FORBIDDEN_VITE_SECRETS.includes(key)) {
        console.error(`ERROR: Forbidden secret ${key} referenced in ${path.relative(ROOT, file)}`);
        failed = true;
      }
    }
  }

  for (const key of usedViteKeys) {
    if (!exampleKeys.has(key)) {
      console.error(`ERROR: ${key} is used in ${appDir}/src but missing from ${appDir}/.env.example`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("✔ env-check passed: no tracked .env secrets, no forbidden VITE_* secrets, all used VITE_* keys documented.");
