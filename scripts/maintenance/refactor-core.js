const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.endsWith('.js')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const files = walkSync('apps/legacy-monolith/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Regex replacements for deep nested legacy imports -> new clean workspace imports
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?shared\/lib\/([^'"]+)['"]/g, 'from "@caption-cam/core/lib/$1"');
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?shared\/lib\/?['"]/g, 'from "@caption-cam/core/lib"');

  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?shared\/constants\/([^'"]+)['"]/g, 'from "@caption-cam/core/constants/$1"');
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?shared\/constants\/?['"]/g, 'from "@caption-cam/core/constants"');

  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?types\/([^'"]+)['"]/g, 'from "@caption-cam/core/types/$1"');
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?types\/?['"]/g, 'from "@caption-cam/core/types"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated imports in: ' + file);
  }
});
console.log('✅ Import refactoring complete!');
