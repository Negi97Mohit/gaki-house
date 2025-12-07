const fs = require('fs');
const path = 'src/pages/Index/components/CanvasContainer.tsx';

try {
    // Read as buffer to detect BOM
    const buffer = fs.readFileSync(path);

    let content = buffer.toString('utf8');

    // Remove BOM if present (EF BB BF for UTF-8)
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log('Detected BOM, removing it...');
        content = content.slice(1);
    }

    // Also check for other garbage at start if `type` command messed up encodings (e.g. UTF-16 LE)
    // The error showed 'import', which suggests something weird.
    // Let's just find the first occurrence of 'import' and slice everything before it if it's close to start.
    const importIdx = content.indexOf('import');
    if (importIdx > 0 && importIdx < 10) {
        console.log(`Found 'import' at index ${importIdx}, trimming header garbage...`);
        content = content.substring(importIdx);
    }

    fs.writeFileSync(path, content, 'utf8');
    console.log('File fixed and saved as UTF-8.');
} catch (e) {
    console.error(e);
}
