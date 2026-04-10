const fs = require('fs');
const path = 'src/pages/Index/components/CanvasContainer.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

console.log('Total Lines:', lines.length);

lines.forEach((line, i) => {
    if (line.includes('Banner Text Editing Handlers')) {
        console.log(`Found START at Line ${i + 1} (Index ${i}): "${line}"`);
    }
    if (line.includes('const generateBannerHtml')) {
        console.log(`Found END at Line ${i + 1} (Index ${i}): "${line}"`);
    }
});
