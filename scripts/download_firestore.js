import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const firebaseConfig = {
    apiKey: "AIzaSyCYdOJlvYVlc5KMqnqFYC67_bUVWfU8XfA",
    authDomain: "gaki-fb708.firebaseapp.com",
    projectId: "gaki-fb708",
    storageBucket: "gaki-fb708.firebasestorage.app",
    messagingSenderId: "696196670090",
    appId: "1:696196670090:web:91b7558f5dc050a1410373",
    measurementId: "G-T9G91VS18Q",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collectionsToDownload = [
    "anime_styles",
    "animation_library",
    "text_designs",
    "canvas_presets",
    "dynamic_presets",
    "social_banners",
    "animated_banners",
    "public_canvas_presets",
    "preset_templates",
    "filters",
    "caption_presets",
    "layout_templates"
];

async function downloadFirestore() {
    console.log("Starting Firestore download...");
    const dataDir = path.join(__dirname, '..', 'data', 'firestore_export');
    await fs.mkdir(dataDir, { recursive: true });

    const allData = {};

    for (const colName of collectionsToDownload) {
        console.log(`Downloading collection: ${colName}`);
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(colRef);
            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });
            console.log(`- Fetched ${items.length} items from ${colName}`);

            const filePath = path.join(dataDir, `${colName}.json`);
            await fs.writeFile(filePath, JSON.stringify(items, null, 2));

            allData[colName] = items;
        } catch (error) {
            console.error(`Error downloading ${colName}:`, error.message);
        }
    }

    await fs.writeFile(path.join(dataDir, 'all_data.json'), JSON.stringify(allData, null, 2));
    console.log("Download complete! Exported to data/firestore_export");
    process.exit(0);
}

downloadFirestore();
