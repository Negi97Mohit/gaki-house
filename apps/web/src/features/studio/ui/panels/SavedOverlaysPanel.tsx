// src/components/panels/SavedOverlaysPanel.tsx
import React from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { GeneratedOverlay } from "@gaki/core/types/caption";

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
        <div className="py-14 text-center">
          <Sparkles
            className="w-5 h-5 mx-auto mb-3 text-white/30"
            strokeWidth={1.5}
          />
          <h4 className="text-[13px] font-medium text-white/90">
            No saved overlays
          </h4>
          <p className="mt-1 mx-auto max-w-[240px] text-[11px] leading-relaxed text-white/45">
            Overlays you generate or save show up here, ready to add to the
            canvas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {savedOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="sp-tile group relative aspect-square bg-white/[0.02]"
            >
              <button
                className="w-full h-full flex items-center justify-center p-3"
                onClick={() => onAddSavedOverlay(overlay)}
                title="Add to canvas"
              >
                {overlay.preview ? (
                  <img
                    src={overlay.preview}
                    alt="Overlay preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-white/35">No preview</span>
                )}
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-2.5 py-1.5 bg-black/70 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <span className="text-[10px] text-white/80">Add to canvas</span>
                <button
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white/50 hover:text-red-400 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSavedOverlay(overlay.id);
                  }}
                  title="Delete overlay"
                  aria-label="Delete overlay"
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
