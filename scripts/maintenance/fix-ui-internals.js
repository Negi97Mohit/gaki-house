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

const files = walkSync('packages/ui/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Fix utility imports: @/shared/lib/utils -> @caption-cam/core/lib/utils
  content = content.replace(/from\s+['"]@\/shared\/lib\/utils['"]/g, 'from "@caption-cam/core/lib/utils"');
  
  // 2. Fix internal UI imports: @/shared/ui/button -> ./button
  content = content.replace(/from\s+['"]@\/shared\/ui\/([^'"]+)['"]/g, 'from "./$1"');

  // 3. Fix hook imports (like use-toast): @/shared/hooks/use-toast -> @caption-cam/core/hooks/use-toast
  // Note: We need to move the hooks to core in the next step, but let's prep the import now
  content = content.replace(/from\s+['"]@\/shared\/hooks\/([^'"]+)['"]/g, 'from "@caption-cam/core/hooks/$1"');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed internal imports in: ' + file);
  }
});
console.log('✅ UI Internal refactoring complete!');
