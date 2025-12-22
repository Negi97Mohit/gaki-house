import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import local data
import socialBannersData from "@/data/socialBanners.json";
import captionPresetsData from "@/data/captionPresets.json";
import canvasPresetsData from "@/data/canvasPresets.json";
import animationLibraryData from "@/data/animationLibrary.json";
import animatedBannersData from "@/data/animatedBanners.json";
import dynamicPresetsData from "@/data/dynamic/dynamicPresets.json";
import presetTemplatesData from "@/data/presetTemplates.json";

export const DataMigration = () => {
    const [isMigrating, setIsMigrating] = useState(false);

    const migrateCollection = async (
        collectionName: string,
        data: any[],
        idField: string = "id"
    ) => {
        const batch = writeBatch(db);
        let count = 0;

        // Firestore batches are limited to 500 operations
        // For simplicity in this one-off tool, we'll assume < 500 items per collection 
        // or just process the first 500 if more. Ideally we chunk it.

        // Actually, let's chunk it properly to be safe.
        const chunks = [];
        for (let i = 0; i < data.length; i += 450) {
            chunks.push(data.slice(i, i + 450));
        }

        for (const chunk of chunks) {
            const subBatch = writeBatch(db);
            chunk.forEach((item: any) => {
                const docRef = doc(db, collectionName, item[idField]);
                subBatch.set(docRef, {
                    ...item,
                    source: "system",
                    createdAt: serverTimestamp(),
                });
            });
            await subBatch.commit();
            count += chunk.length;
        }

        console.log(`Migrated ${count} items to ${collectionName}`);
        return count;
    };

    const handleMigration = async () => {
        setIsMigrating(true);
        const toastId = toast.loading("Starting migration...");

        try {
            // 1. Social Banners
            await migrateCollection("social_banners", socialBannersData.designs);
            toast.info("Social Banners migrated");

            // 2. Caption Presets
            await migrateCollection("caption_presets", captionPresetsData);
            toast.info("Caption Presets migrated");

            // 3. Canvas Presets
            await migrateCollection("canvas_presets", canvasPresetsData);
            toast.info("Canvas Presets migrated");

            // 4. Animation Library
            await migrateCollection("animation_library", animationLibraryData);
            toast.info("Animation Library migrated");

            // 5. Animated Banners
            await migrateCollection("animated_banners", animatedBannersData.designs);
            toast.info("Animated Banners migrated");

            // 6. Dynamic Presets
            await migrateCollection("dynamic_presets", dynamicPresetsData);
            toast.info("Dynamic Presets migrated");

            // 7. Preset Templates
            await migrateCollection("preset_templates", presetTemplatesData);
            toast.info("Preset Templates migrated");

            toast.success("Migration Complete!", { id: toastId });
        } catch (error) {
            console.error("Migration failed:", error);
            toast.error(`Migration failed: ${(error as Error).message}`, { id: toastId });
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 p-4 bg-background border rounded-lg shadow-lg">
            <h3 className="font-bold mb-2">Admin Migration</h3>
            <Button
                onClick={handleMigration}
                disabled={isMigrating}
                variant="destructive"
            >
                {isMigrating ? "Migrating..." : "Migrate All Data to Firestore"}
            </Button>
        </div>
    );
};
