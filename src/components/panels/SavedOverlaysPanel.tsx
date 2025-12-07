// src/components/panels/SavedOverlaysPanel.tsx
import React from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedOverlay } from "@/types/caption";

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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-base font-semibold tracking-wide">
          Saved Overlays
        </h3>
      </div>
      {savedOverlays.length === 0 ? (
        <div className="text-center p-8 rounded-lg bg-background/50 border-2 border-purple-500/20">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500/50" />
          <p className="text-sm text-muted-foreground font-cyber">
            Generated overlays will be saved here for reuse.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {savedOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className="group relative aspect-square rounded-lg bg-background/50 border-2 border-purple-500/20 hover:border-purple-500 flex items-center justify-center overflow-hidden transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              <button
                className="w-full h-full"
                onClick={() => onAddSavedOverlay(overlay)}
                title="Add overlay to canvas"
              >
                {overlay.preview ? (
                  <img
                    src={overlay.preview}
                    alt="Overlay preview"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground font-cyber">
                    NO PREVIEW
                  </span>
                )}
              </button>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onDeleteSavedOverlay(overlay.id)}
                title="Delete saved overlay"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
