import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "dist");

// Ensure the dist folder exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

// Write a package.json that forces CommonJS
fs.writeFileSync(
  path.join(distPath, "package.json"),
  JSON.stringify({ type: "commonjs" }, null, 2)
);
