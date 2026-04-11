import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { useSceneStore } from "../../store/useSceneStore";
import { parseObsCollection } from "../../lib/obsParser";

export const ImportOBSButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadScenes = useSceneStore((state) => state.loadScenes);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const parsedScenes = parseObsCollection(content);
          if (parsedScenes.length > 0) {
            loadScenes(parsedScenes);
            alert(`Successfully imported ${parsedScenes.length} scenes!`);
          }
        } catch (error) {
          alert(
            "Could not read this file. Are you sure it is an OBS Scene Collection?",
          );
        }
      }
    };
    reader.readAsText(file);

    // Reset input so the same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium border border-gray-600"
      >
        <Upload className="w-4 h-4" />
        Import OBS JSON
      </button>

      {/* Hidden file input */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
};
