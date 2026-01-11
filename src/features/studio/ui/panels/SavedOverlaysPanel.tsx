// src/components/panels/SavedOverlaysPanel.tsx
import React from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { GeneratedOverlay } from "@/types/caption";
import { cn } from "@/shared/lib/utils";

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
    <>
      {savedOverlays.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" strokeWidth={1} />
          <p className="text-[10px] text-muted-foreground/50">No saved overlays</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {savedOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={cn(
                "group relative aspect-square bg-card border border-border rounded-lg",
                "flex items-center justify-center overflow-hidden transition-all",
                "hover:border-primary"
              )}
            >
              <button
                className="w-full h-full"
                onClick={() => onAddSavedOverlay(overlay)}
              >
                {overlay.preview ? (
                  <img
                    src={overlay.preview}
                    alt="Overlay"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span className="text-[8px] text-muted-foreground/50">No preview</span>
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded"
                onClick={() => onDeleteSavedOverlay(overlay.id)}
              >
                <Trash2 className="w-2.5 h-2.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
