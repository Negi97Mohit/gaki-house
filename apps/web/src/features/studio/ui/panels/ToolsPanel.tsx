// src/features/studio/ui/panels/ToolsPanel.tsx
import React from "react";
import { Button } from "@caption-cam/ui/button";
import { Type, Pencil, Search, HelpCircle } from "lucide-react";
import { FloatingAssetSearch } from "@/features/assets/ui/FloatingAssetSearch";
import { InstructionsDialog } from "@/features/studio/ui/InstructionsDialog";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";

interface ToolsPanelProps {
  onAddTextOverlay: () => void;
  onAssetSelect: (asset: AssetResult) => void;
  setIsDrawing: (isDrawing: boolean) => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  onAddTextOverlay,
  onAssetSelect,
  setIsDrawing,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        onClick={onAddTextOverlay}
        variant="outline"
        className="h-16 flex flex-col items-center justify-center gap-1.5 border hover:border-primary hover:bg-primary/5"
      >
        <Type className="h-5 w-5" />
        <span className="text-[10px]">Text</span>
      </Button>

      <Button
        onClick={() => setIsDrawing(true)}
        variant="outline"
        className="h-16 flex flex-col items-center justify-center gap-1.5 border hover:border-primary hover:bg-primary/5"
      >
        <Pencil className="h-5 w-5" />
        <span className="text-[10px]">Draw</span>
      </Button>

      <div className="col-span-2">
        <FloatingAssetSearch 
          onAssetSelect={onAssetSelect}
          renderTrigger={(onClick) => (
            <Button
              onClick={onClick}
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-2 border hover:border-primary hover:bg-primary/5"
            >
              <Search className="h-4 w-4" />
              <span className="text-[10px]">Search Assets</span>
            </Button>
          )}
        />
      </div>

      <div className="col-span-2">
        <InstructionsDialog
          renderTrigger={(onClick) => (
            <Button
              onClick={onClick}
              variant="outline"
              className="w-full h-11 flex items-center justify-center gap-2 border hover:border-primary hover:bg-primary/5"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-[10px]">Shortcuts</span>
            </Button>
          )}
        />
      </div>
    </div>
  );
};
