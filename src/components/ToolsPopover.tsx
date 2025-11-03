import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LayoutGrid as Apps, Type, Pencil, Sun, Moon } from "lucide-react";
import { FloatingAssetSearch } from "@/components/FloatingAssetSearch";
import { InstructionsDialog } from "@/components/InstructionsDialog";
import { AssetResult } from "@/components/AssetLibrary";

interface ToolsPopoverProps {
  onAddTextOverlay: () => void;
  onAssetSelect: (asset: AssetResult) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setTheme: (theme: string) => void;
  theme: string | undefined;
  portalContainer?: HTMLElement | null;
}

export const ToolsPopover: React.FC<ToolsPopoverProps> = ({
  onAddTextOverlay,
  onAssetSelect,
  setIsDrawing,
  setTheme,
  theme,
  portalContainer,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10"
          title="More Tools"
        >
          <Apps className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        container={portalContainer}
        align="center"
        side="top"
        className="w-auto p-2"
        style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
      >
        <div className="flex items-center gap-1">
          {/* Add Text Button */}
          <Button
            onClick={onAddTextOverlay}
            size="icon"
            variant="ghost"
            className="rounded-full h-10 w-10"
            title="Add Text"
          >
            <Type className="h-5 w-5" />
          </Button>

          {/* Asset Search (which is already a Popover) */}
          <FloatingAssetSearch onAssetSelect={onAssetSelect} />

          {/* Draw Button */}
          <Button
            onClick={() => setIsDrawing(true)}
            size="icon"
            variant="ghost"
            className="rounded-full h-10 w-10"
            title="Start Drawing"
          >
            <Pencil className="h-5 w-5" />
          </Button>

          {/* Instructions (which is already a Dialog) */}
          <InstructionsDialog />
        </div>
      </PopoverContent>
    </Popover>
  );
};
