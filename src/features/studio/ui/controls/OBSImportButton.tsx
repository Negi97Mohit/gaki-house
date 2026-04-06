// Single responsibility: file-picker UI that reads an OBS .json, parses it, and fires onImportOBSScenes.
import React, { useRef, useEffect } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";
import { SceneState } from "@/types/caption";
import { parseOBSCollection } from "@/lib/obs/OBSParser";
import { mapOBSCollectionToScenes } from "@/lib/obs/OBSSourceMapper";

interface OBSImportButtonProps {
  onImportOBSScenes: (scenes: SceneState[], stingerConfig?: { path: string; transitionPoint: number }) => void;
}

export const OBSImportButton: React.FC<OBSImportButtonProps> = ({
  onImportOBSScenes,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("[OBSImportButton] mounted");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.error("[OBSImportButton] handleFileChange: no file selected");
      return;
    }

    console.log(`[OBSImportButton] Reading file: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result as string);
        console.log("[OBSImportButton] JSON parsed successfully");

        const collection = parseOBSCollection(raw);
        console.log(
          `[OBSImportButton] Collection "${collection.name}" has ${collection.scenes.length} scene(s)`
        );

        const scenes = mapOBSCollectionToScenes(collection);

        if (scenes.length === 0) {
          console.error(
            "[OBSImportButton] mapOBSCollectionToScenes returned 0 scenes"
          );
          toast.error("No scenes could be imported from this OBS file.");
          return;
        }

        console.log(
          `[OBSImportButton] Calling onImportOBSScenes with ${scenes.length} scene(s)`
        );
        onImportOBSScenes(scenes, collection.stingerConfig);
        toast.success(
          `Imported ${scenes.length} scene${scenes.length > 1 ? "s" : ""} from OBS`
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[OBSImportButton] Parse error:", msg);
        toast.error(`OBS import failed: ${msg}`);
      } finally {
        // Reset input so the same file can be re-imported
        if (inputRef.current) inputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      console.error("[OBSImportButton] FileReader error reading:", file.name);
      toast.error("Could not read the selected file.");
    };

    reader.readAsText(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Import OBS scene collection"
      />
      <ShortcutTooltip label="Import OBS Scene Collection">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
          onClick={() => {
            if (!inputRef.current) {
              console.error(
                "[OBSImportButton] onClick: inputRef.current is null"
              );
              return;
            }
            console.log("[OBSImportButton] Opening file picker");
            inputRef.current.click();
          }}
          aria-label="Import OBS scenes"
          data-floating-trigger
        >
          <Upload className="w-3.5 h-3.5" />
        </Button>
      </ShortcutTooltip>
    </>
  );
};
