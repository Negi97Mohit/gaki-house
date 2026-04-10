const fs = require('fs');
const path = 'src/pages/Index/components/CanvasContainer.tsx';

try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);

    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('// --- Banner Text Editing Handlers ---')) {
            // We want the FIRST occurrence
            if (startIndex === -1) startIndex = i;
        }
        if (line.includes('const generateBannerHtml = useCallback')) {
            if (endIndex === -1 && startIndex !== -1 && i > startIndex) {
                endIndex = i;
                break;
            }
        }
    }

    console.log(`Start Index: ${startIndex}`);
    console.log(`End Index: ${endIndex}`);

    if (startIndex !== -1 && endIndex !== -1) {
        // Remove from startIndex up to endIndex (but keep endIndex)
        const count = endIndex - startIndex; // Remove the gap
        console.log(`Removing ${count} lines from ${startIndex} to ${endIndex - 1}`);

        // Verify we are not removing the second block (which is after generateBannerHtml)
        // The second block starts AFTER generateBannerHtml.
        // So searching for 'Banner Text Editing Handlers' should find the FIRST one (at 303).
        // And 'const generateBannerHtml' (at 439).
        // This looks correct.

        lines.splice(startIndex, count);
        fs.writeFileSync(path, lines.join('\n'));
        console.log('Success!');
    } else {
        console.error('Could not find Start or End markers.');
        // Dump some context
        console.log('Line 303 check:', lines[302]);
        process.exit(1);
    }

} catch (e) {
    console.error(e);
    process.exit(1);
}
