import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { Button } from "@/shared/ui/button";
import { LayoutGrid as Apps, Type, Pencil, Sun, Moon } from "lucide-react";
import { FloatingAssetSearch } from "@/features/assets/ui/FloatingAssetSearch";
import { InstructionsDialog } from "@/features/studio/ui/InstructionsDialog";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";

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
          <PopoverClose asChild>
            <Button
              onClick={onAddTextOverlay}
              size="icon"
              variant="ghost"
              className="rounded-full h-10 w-10"
              title="Add Text"
            >
              <Type className="h-5 w-5" />
            </Button>
          </PopoverClose>

          {/* Asset Search (which is already a Popover) */}
          <FloatingAssetSearch onAssetSelect={onAssetSelect} />

          {/* Draw Button */}
          <PopoverClose asChild>
            <Button
              onClick={() => setIsDrawing(true)}
              size="icon"
              variant="ghost"
              className="rounded-full h-10 w-10"
              title="Start Drawing"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          </PopoverClose>
          {/* Instructions (which is already a Dialog) */}
          <PopoverClose asChild>
            <InstructionsDialog />
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};
