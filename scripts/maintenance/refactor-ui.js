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

  // Regex replacements for deep nested legacy UI imports -> new clean workspace UI imports
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?shared\/ui\/([^'"]+)['"]/g, 'from "@caption-cam/ui/$1"');
  content = content.replace(/from\s+['"](?:(?:\.\.\/)*|\.\/|@\/)?shared\/ui\/?['"]/g, 'from "@caption-cam/ui"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated UI imports in: ' + file);
  }
});
console.log('✅ UI Import refactoring complete!');
