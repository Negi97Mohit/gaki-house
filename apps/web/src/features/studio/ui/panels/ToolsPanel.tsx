// src/features/studio/ui/panels/ToolsPanel.tsx
import React from "react";
import { Type, Pencil, Search, HelpCircle, ChevronRight } from "lucide-react";
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
    <div className="w-full divide-y divide-white/[0.07]">
      <ToolRow
        icon={Type}
        title="Add text overlay"
        hint="Place styled text on the canvas"
        onClick={onAddTextOverlay}
      />
      <ToolRow
        icon={Pencil}
        title="Draw on canvas"
        hint="Sketch and annotate freehand"
        onClick={() => setIsDrawing(true)}
      />

      <div className="py-4 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-white/90">
            Stickers, GIFs and photos
          </span>
          <span className="text-[11px] text-white/35">GIPHY, Unsplash</span>
        </div>
        <FloatingAssetSearch
          onAssetSelect={onAssetSelect}
          renderTrigger={(onClick) => (
            <button
              onClick={onClick}
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-white/[0.09] hover:border-white/20 text-[12px] text-white/50 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:border-primary"
            >
              <span className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
                Search assets
              </span>
              <kbd className="text-[10px] font-sans text-white/35">L</kbd>
            </button>
          )}
        />
      </div>

      <div className="py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <HelpCircle
            className="w-4 h-4 shrink-0 text-white/40"
            strokeWidth={1.6}
          />
          <div className="min-w-0">
            <h4 className="text-[13px] font-medium text-white/90">
              Keyboard shortcuts
            </h4>
            <p className="text-[11px] text-white/45">
              Hotkeys for a faster broadcast workflow
            </p>
          </div>
        </div>
        <InstructionsDialog
          renderTrigger={(onClick) => (
            <button
              onClick={onClick}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium text-white/80 border border-white/[0.12] hover:border-white/30 hover:text-white transition-colors"
            >
              View guide
            </button>
          )}
        />
      </div>
    </div>
  );
};

const ToolRow: React.FC<{
  icon: React.ElementType;
  title: string;
  hint: string;
  onClick: () => void;
}> = ({ icon: Icon, title, hint, onClick }) => (
  <button
    onClick={onClick}
    className="group w-full flex items-center gap-3.5 py-4 text-left focus-visible:outline-none"
  >
    <Icon
      className="w-4 h-4 shrink-0 text-white/40 group-hover:text-primary transition-colors"
      strokeWidth={1.6}
    />
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-medium text-white/90">
        {title}
      </span>
      <span className="block text-[11px] text-white/45">{hint}</span>
    </span>
    <ChevronRight className="w-3.5 h-3.5 text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
  </button>
);
