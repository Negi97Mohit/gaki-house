import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INPUT_DIR = path.join(__dirname, '..', 'data', 'firestore_export');
const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'mobile_firestore_export');

// Aspect ratio assumptions for scaling
// Desktop assumed (16:9) typical 1920x1080 -> Ratio = 1.77
// Mobile targeted (9:16) typical 1080x1920 -> Ratio = 0.56
// We will center-crop or scale coordinates where possible.
// Because "percentages" or raw pixels might be used, we'll implement heuristic rules.

async function processFile(filename) {
    if (!filename.endsWith('.json') || filename === 'all_data.json') return;

    console.debug(`[DEBUG] Processing layout file: ${filename}`);

    try {
        const rawData = await fs.readFile(path.join(INPUT_DIR, filename), 'utf-8');
        const data = JSON.parse(rawData);

        console.debug(`[DEBUG] Read ${data.length} items from ${filename}`);

        const mobileData = data.map(item => transformToMobile(item, filename));

        await fs.writeFile(path.join(OUTPUT_DIR, filename), JSON.stringify(mobileData, null, 2));
        console.log(`[SUCCESS] Converted ${filename} for Mobile and saved.`);
    } catch (e) {
        console.error(`[ERROR] Failed to process ${filename}:`, e.message);
    }
}

// Transform rules based on structure
function transformToMobile(item, collectionName) {
    let mobileItem = JSON.parse(JSON.stringify(item));

    // Tag item as a mobile variant
    mobileItem.isMobile = true;
    mobileItem.originalDesktopId = item.id;
    mobileItem.id = `${item.id}_mobile`;
    if (mobileItem.name) mobileItem.name = `${mobileItem.name} (Mobile)`;

    console.debug(`[DEBUG] Transforming item: ${mobileItem.id} from ${collectionName}`);

    // If item has width/height, swap X/Y and W/H proportions (heuristics)
    // 1920 (w) x 1080 (h) -> 1080 (w) x 1920 (h) ratio shifts.
    // If it has a specific layout template:
    if (mobileItem.layout) {
        mobileItem.layout = scaleLayoutArray(mobileItem.layout);
    }

    // Some collections have styles or dimensions at root
    if (mobileItem.width && mobileItem.height) {
        let temp = mobileItem.width;
        mobileItem.width = mobileItem.height;
        mobileItem.height = temp;
    }

    if (mobileItem.x !== undefined && mobileItem.y !== undefined) {
        // Just stack everything vertically or roughly adapt to portrait center
        if (typeof mobileItem.x === 'number') mobileItem.x = Math.max(0, mobileItem.x / 1.77);
    }

    // Canvas Presets / elements scaling
    if (mobileItem.elements && Array.isArray(mobileItem.elements)) {
        mobileItem.elements = mobileItem.elements.map(el => {
            if (el.position) {
                if (el.position.x !== undefined) el.position.x = el.position.x * 0.5; // roughly scale down width axis
                if (el.position.y !== undefined) el.position.y = Math.min(100, el.position.y * 1.5); // push down height axis if percentage
            }
            if (el.size) {
                if (el.size.width) el.size.width = el.size.width * 0.8;
                // Keep height proportional or allow wrapping
            }
            return el;
        });
    }

    return mobileItem;
}

function scaleLayoutArray(layoutArr) {
    if (!Array.isArray(layoutArr)) return layoutArr;
    return layoutArr.map(layer => {
        let mobileLayer = { ...layer };

        // Example: Layer properties like width: 25, height: 80, x: 70, y: 10
        // We will shift coordinates. A 2-person side by side (w:50/50, h:100/100) 
        // becomes top-bottom (w:100/100, h:50/50).

        if (typeof mobileLayer.width === 'number' && typeof mobileLayer.height === 'number') {
            // Very naive heuristic conversion:
            // Swap width & height conceptually, but keep within bounds of 100%
            let w = mobileLayer.width;
            let h = mobileLayer.height;
            mobileLayer.width = Math.min(100, (h > w ? h : w * 2));
            mobileLayer.height = Math.min(100, (w > h ? w : h * 1.5));
        }

        if (typeof mobileLayer.x === 'number') {
            // Try to align center horizontally
            if (mobileLayer.x > 30) mobileLayer.x = 10;
        }

        if (typeof mobileLayer.y === 'number') {
            // Try to separate vertically
            mobileLayer.y = Math.min(100, mobileLayer.y * 1.5);
        }

        return mobileLayer;
    });
}

async function main() {
    console.log("[INFO] Starting Mobile Redesign Generation...");
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    let files;
    try {
        files = await fs.readdir(INPUT_DIR);
    } catch (e) {
        console.error("[FATAL] Could not read input directory:", e.message);
        process.exit(1);
    }

    const promises = files.map(file => processFile(file));
    await Promise.all(promises);

    console.log("[INFO] Finished Mobile Redesign Generation!");
    console.log(`[INFO] Output available in: ${OUTPUT_DIR}`);
}

main().catch(err => {
    console.error("[FATAL ERROR]", err);
    process.exit(1);
});
