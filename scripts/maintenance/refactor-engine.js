const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

// 1. Refactor Monolith to point to new Engine
const monolithFiles = walkSync('apps/legacy-monolith/src');
monolithFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace kernel and obs imports
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?kernel\/([^'"]+)['"]/g, 'from "@caption-cam/engine/kernel/$1"');
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?lib\/obs\/([^'"]+)['"]/g, 'from "@caption-cam/engine/obs/$1"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated engine imports in monolith: ' + file);
  }
});

// 2. Refactor Internal Engine Links
const engineFiles = walkSync('packages/engine/src');
engineFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // If a kernel file imported an obs file via old paths
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?lib\/obs\/([^'"]+)['"]/g, 'from "../../obs/$1"');
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?shared\/lib\/([^'"]+)['"]/g, 'from "@caption-cam/core/lib/$1"');
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?types\/([^'"]+)['"]/g, 'from "@caption-cam/core/types/$1"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed internal imports in engine: ' + file);
  }
});

console.log('✅ Engine refactoring complete!');
