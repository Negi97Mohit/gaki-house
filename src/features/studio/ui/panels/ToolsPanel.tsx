// src/features/studio/ui/panels/ToolsPanel.tsx
import React from "react";
import { Button } from "@/shared/ui/button";
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
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground font-mono">
        Quick access to common tools
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Add Text */}
        <Button
          onClick={onAddTextOverlay}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/10"
        >
          <Type className="h-6 w-6" />
          <span className="text-xs font-mono">Add Text</span>
        </Button>

        {/* Draw */}
        <Button
          onClick={() => setIsDrawing(true)}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/10"
        >
          <Pencil className="h-6 w-6" />
          <span className="text-xs font-mono">Draw</span>
        </Button>

        {/* Asset Search - wrapped to fit */}
        <div className="col-span-2">
          <FloatingAssetSearch 
            onAssetSelect={onAssetSelect}
            renderTrigger={(onClick) => (
              <Button
                onClick={onClick}
                variant="outline"
                className="w-full h-14 flex items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/10"
              >
                <Search className="h-5 w-5" />
                <span className="text-xs font-mono">Search Assets (GIFs, Images, Icons)</span>
              </Button>
            )}
          />
        </div>

        {/* Instructions */}
        <div className="col-span-2">
          <InstructionsDialog
            renderTrigger={(onClick) => (
              <Button
                onClick={onClick}
                variant="outline"
                className="w-full h-14 flex items-center justify-center gap-2 border-2 hover:border-primary hover:bg-primary/10"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="text-xs font-mono">View Instructions & Shortcuts</span>
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
};
