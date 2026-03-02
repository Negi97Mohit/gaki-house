import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
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

async function uploadMobileFirestore() {
    console.log("Starting Mobile Firestore upload...");
    const dataDir = path.join(__dirname, '..', 'data', 'mobile_firestore_export');

    // Read master file
    const masterFilePath = path.join(dataDir, 'mobile_redesigned_data.json');
    let masterData;
    try {
        const rawData = await fs.readFile(masterFilePath, 'utf8');
        masterData = JSON.parse(rawData);
    } catch (error) {
        console.error("Error reading master file:", error.message);
        process.exit(1);
    }

    // Identify collections
    const collections = Object.keys(masterData);
    console.log(`Found collections: ${collections.join(', ')}`);

    for (const colName of collections) {
        console.log(`\nProcessing collection: ${colName}`);
        const items = masterData[colName];

        if (!Array.isArray(items)) {
            console.warn(`Skipping ${colName} as it is not an array.`);
            continue;
        }

        // 1. Update the local JSON file
        const filePath = path.join(dataDir, `${colName}.json`);
        try {
            await fs.writeFile(filePath, JSON.stringify(items, null, 2));
            console.log(`- Updated local file: ${colName}.json`);
        } catch (error) {
            console.error(`- Error writing ${colName}.json:`, error.message);
        }

        // 2. Upload to Firestore
        let successCount = 0;
        let failCount = 0;

        const colRef = collection(db, colName);
        for (const item of items) {
            try {
                // Determine ID (either item.id or fallback)
                const docId = item.id;
                if (!docId) {
                    console.warn(`  Item missing 'id' field in ${colName}, skip or auto-gen. Skipping for now.`);
                    failCount++;
                    continue;
                }
                const docRef = doc(colRef, docId);
                await setDoc(docRef, item);
                successCount++;
            } catch (error) {
                console.error(`  Error uploading document to ${colName}:`, error.message);
                failCount++;
            }
        }
        console.log(`- Uploaded to Firestore. Success: ${successCount}. Failed: ${failCount}`);
    }

    console.log("\nUpload process complete!");
    process.exit(0);
}

uploadMobileFirestore();
