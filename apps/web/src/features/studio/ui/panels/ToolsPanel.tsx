// src/features/studio/ui/panels/ToolsPanel.tsx
import React from "react";
import { Type, Pencil, Search, HelpCircle, Sparkles } from "lucide-react";
import { FloatingAssetSearch } from "@/features/assets/ui/FloatingAssetSearch";
import { InstructionsDialog } from "@/features/studio/ui/InstructionsDialog";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { cn } from "@gaki/core/lib/utils";

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
    <div className="space-y-3.5 w-full">
      {/* Primary Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Add Text Overlay */}
        <button
          onClick={onAddTextOverlay}
          className={cn(
            "group relative flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all duration-150",
            "bg-zinc-900/80 border border-zinc-700/80 hover:border-primary hover:bg-zinc-800/90 shadow-sm",
            "active:scale-[0.98]"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-150 shrink-0">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[12px] font-extrabold text-white group-hover:text-primary transition-colors">
              Add Text Overlay
            </h4>
            <p className="text-[10px] text-zinc-300 font-medium leading-tight mt-0.5">
              Insert styled typography on stream canvas
            </p>
          </div>
        </button>

        {/* Freehand Draw */}
        <button
          onClick={() => setIsDrawing(true)}
          className={cn(
            "group relative flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all duration-150",
            "bg-zinc-900/80 border border-zinc-700/80 hover:border-primary hover:bg-zinc-800/90 shadow-sm",
            "active:scale-[0.98]"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-150 shrink-0">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[12px] font-extrabold text-white group-hover:text-primary transition-colors">
              Canvas Drawing
            </h4>
            <p className="text-[10px] text-zinc-300 font-medium leading-tight mt-0.5">
              Draw annotations & sketches in real time
            </p>
          </div>
        </button>
      </div>

      {/* Asset Search & Quick Launcher */}
      <div className="rounded-2xl p-4 bg-zinc-900/70 border border-white/15 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-extrabold text-white">Media & Asset Library</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-400">GIPHY & Unsplash</span>
        </div>

        <FloatingAssetSearch
          onAssetSelect={onAssetSelect}
          renderTrigger={(onClick) => (
            <button
              onClick={onClick}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-150",
                "bg-zinc-800 hover:bg-zinc-750 border border-zinc-650 hover:border-primary text-zinc-100 hover:text-white",
                "shadow-sm active:scale-[0.99]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-primary" />
                <span>Search stickers, GIFs & images...</span>
              </div>
              <kbd className="px-2 py-0.5 text-[9px] font-mono font-extrabold bg-zinc-950 border border-zinc-600 rounded text-white">
                L
              </kbd>
            </button>
          )}
        />
      </div>

      {/* Shortcuts & Studio Guide Card */}
      <div className="rounded-2xl p-4 bg-zinc-900/70 border border-white/15 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-primary">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[12px] font-extrabold text-white">Studio Shortcuts Guide</h4>
            <p className="text-[10px] text-zinc-300 font-medium">Broadcast workflow hotkey cheatsheet</p>
          </div>
        </div>

        <InstructionsDialog
          renderTrigger={(onClick) => (
            <button
              onClick={onClick}
              className="px-3.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-sm transition-all duration-150 active:scale-95"
            >
              View Guide
            </button>
          )}
        />
      </div>
    </div>
  );
};
