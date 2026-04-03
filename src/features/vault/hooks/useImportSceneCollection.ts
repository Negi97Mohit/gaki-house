import { useState } from 'react';
import { toast } from 'sonner';
import { importOBSSceneCollection } from '@/services/importers/obsImporter';
import { importStreamlabsCollection } from '@/services/importers/streamlabsImporter';
import { compositorSceneToLegacyScene } from '@/features/canvas/model/legacySceneAdapter';
import type { SceneState } from '@/types/caption';
import { useSceneCollectionStore } from '@/stores/sceneCollection.store';

interface UseImportSceneCollectionOptions {
  onSuccess?: (collectionName: string, scenes: SceneState[]) => void;
}

export const useImportSceneCollection = ({ onSuccess }: UseImportSceneCollectionOptions = {}) => {
  const [isImporting, setIsImporting] = useState(false);

  const importSetup = async () => {
    try {
      if (!window.electron?.import?.openSceneCollection) {
        toast.error("Import is only available in the desktop app");
        return;
      }

      setIsImporting(true);

      const result = await window.electron.import.openSceneCollection();

      if (!result.ok) {
        if (!result.canceled) {
          toast.error(`Import failed: ${result.error || 'Unknown error'}`);
        }
        return;
      }

      let importResult;

      // Handle raw JSON (OBS format natively exported or GAKI export)
      if (result.format === 'json') {
        try {
          // If the file is OBS standard
          importResult = importOBSSceneCollection(result.content);
        } catch (obsError) {
          console.error("Failed to parse as OBS JSON", obsError);
          toast.error("Invalid OBS Scene Collection format.");
          return;
        }
      } else if (result.format === 'zip') {
        // Streamlabs .overlay format (zip file)
        try {
          importResult = importStreamlabsCollection(result.content);
        } catch (slError) {
          console.error("Failed to parse Streamlabs overlay", slError);
          toast.error("Invalid Streamlabs .overlay format.");
          return;
        }
      } else {
        toast.error("Unsupported file format.");
        return;
      }

      const importedCollection = importResult?.collection;

      if (!importedCollection || !importedCollection.scenes || importedCollection.scenes.length === 0) {
        toast.error("No valid scenes found in the imported file.");
        return;
      }

      // We have the CompositorScene models! Now we convert them backwards to Legacy for UI.
      const legacyScenes: SceneState[] = importedCollection.scenes.map(compScene => 
        compositorSceneToLegacyScene(compScene)
      );

      // (Optional) We can also directly push to useSceneCollectionStore if we want to bypass the wait for useCompositorSync
      // but useCompositorSync will pick it up automatically from legacy UI anyway.
      
      // Call the success handler to add the imported subscenes
      if (onSuccess) {
        onSuccess(importedCollection.name || result.fileName || "Imported Setup", legacyScenes);
      }

      toast.success(`Successfully imported "${importedCollection.name || result.fileName}" with ${legacyScenes.length} scenes.`);

    } catch (error: any) {
      console.error("Scene import error:", error);
      toast.error(`Import failed: ${error.message || "An unexpected error occurred."}`);
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importSetup,
    isImporting,
  };
};
