// src/components/panels/SavedOverlaysPanel.tsx
import React from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { GeneratedOverlay } from "@gaki/core/types/caption";
import { cn } from "@gaki/core/lib/utils";

interface SavedOverlaysPanelProps {
  savedOverlays: GeneratedOverlay[];
  onAddSavedOverlay: (overlay: GeneratedOverlay) => void;
  onDeleteSavedOverlay: (id: string) => void;
}

export const SavedOverlaysPanel: React.FC<SavedOverlaysPanelProps> = ({
  savedOverlays,
  onAddSavedOverlay,
  onDeleteSavedOverlay,
}) => {
  return (
    <div className="space-y-3.5 w-full antialiased">
      {savedOverlays.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mb-3">
            <Sparkles className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h4 className="text-[13px] font-semibold tracking-tight text-white mb-1">No Saved Overlays</h4>
          <p className="text-[11px] text-zinc-400 font-normal max-w-[240px]">
            Generated AI stream graphics and lower-thirds will be collected here for 1-click insertion.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {savedOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={cn(
                "group relative aspect-square rounded-2xl overflow-hidden transition-all duration-200",
                "bg-white/[0.03] backdrop-blur-xl border border-white/10",
                "hover:border-primary hover:ring-1 hover:ring-primary/40 hover:shadow-lg hover:shadow-primary/15"
              )}
            >
              <button
                className="w-full h-full flex items-center justify-center p-2.5"
                onClick={() => onAddSavedOverlay(overlay)}
                title="Add to canvas"
              >
                {overlay.preview ? (
                  <img
                    src={overlay.preview}
                    alt="Overlay preview"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                ) : (
                  <span className="text-[9px] font-mono text-zinc-400">No preview</span>
                )}
              </button>

              {/* Action buttons on hover */}
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                <span className="text-[9px] font-semibold text-white truncate px-1">
                  Insert
                </span>
                <button
                  className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white flex items-center justify-center border border-red-500/40 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSavedOverlay(overlay.id);
                  }}
                  title="Delete overlay"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
