const fs = require('fs');
const path = 'src/pages/Index/components/CanvasContainer.tsx';
try {
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.split(/\r?\n/);

    // Indices (0-based)
    const startIndex = 302; // Line 303
    const bannerHtmlIndex = 438; // Line 439

    console.log(`Checking Line 303 (Index ${startIndex}):`, JSON.stringify(lines[startIndex]));
    console.log(`Checking Line 439 (Index ${bannerHtmlIndex}):`, JSON.stringify(lines[bannerHtmlIndex]));

    if (!lines[startIndex].includes('Banner Text Editing Handlers')) {
        console.error('Mismatch at start index!');
        process.exit(1);
    }
    if (!lines[bannerHtmlIndex].includes('const generateBannerHtml')) {
        console.error('Mismatch at end index!');
        process.exit(1); // Safety check: Ensure we are cutting up to generateBannerHtml
    }

    // Calculate removal count
    // Remove from startIndex up to (but not including) bannerHtmlIndex.
    // Count = bannerHtmlIndex - startIndex.
    // 438 - 302 = 136 lines.

    // Wait, if I remove 136 lines starting at 302:
    // 302, 303, ..., 302 + 135 = 437.
    // Index 437 is Line 438.
    // Index 438 (Line 439) is KEPT.
    // Correct.

    const count = bannerHtmlIndex - startIndex;
    console.log(`Removing ${count} lines.`);

    lines.splice(startIndex, count);

    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully removed duplicate block.');
} catch (e) {
    console.error(e);
    process.exit(1);
}
