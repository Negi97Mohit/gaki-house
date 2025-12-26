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
    <div className="space-y-4 font-mono">
      {/* Section Label */}
      <div className="pb-3 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Saved Overlays ({savedOverlays.length})
        </span>
      </div>

      {savedOverlays.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-border">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" strokeWidth={1} />
          <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
            Generated overlays will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {savedOverlays.map((overlay) => (
            <div
              key={overlay.id}
              className={cn(
                "group relative aspect-square bg-card border border-border",
                "flex items-center justify-center overflow-hidden transition-all duration-150",
                "hover:border-primary"
              )}
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
                  <span className="text-[8px] text-muted-foreground tracking-wide">
                    NO PREVIEW
                  </span>
                )}
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                onClick={() => onDeleteSavedOverlay(overlay.id)}
                title="Delete saved overlay"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
