// src/components/SavedSessionsPanel.tsx
import React, { useState } from "react";
import { LayoutPreset } from "@/types/layoutPreset";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  Layers,
  CheckCircle,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

interface SavedSessionsPanelProps {
  presets: LayoutPreset[];
  onDeletePreset: (id: string) => void;
  onLoadPreset: (preset: LayoutPreset) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SavedSessionsPanel: React.FC<SavedSessionsPanelProps> = ({
  presets,
  onDeletePreset,
  onLoadPreset,
  isOpen,
  onClose,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleLoadPreset = (preset: LayoutPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    onLoadPreset(preset);
    toast.success(`"${preset.name}" preset loaded!`);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this preset?")) {
      onDeletePreset(id);
      toast.success("Preset deleted");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      style={{ zIndex: "var(--z-sessions-panel)" }}
      onClick={onClose}
    >
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-neutral-900 shadow-2xl animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">
              Saved Layouts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
          {presets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Layers className="w-16 h-16 text-neutral-700 mb-4" />
              <p className="text-neutral-400 text-sm">No saved layouts yet</p>
              <p className="text-neutral-600 text-xs mt-1">
                Save a layout to see it here
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {presets.map((preset) => (
                <Card
                  key={preset.id}
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-200 border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 hover:border-primary/50 group",
                    hoveredId === preset.id && "ring-2 ring-primary/20"
                  )}
                  onMouseEnter={() => setHoveredId(preset.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={(e) => handleLoadPreset(preset, e)}
                >
                  <div className="flex gap-4 p-4">
                    {/* Preview */}
                    <div className="relative w-40 h-24 flex-shrink-0 bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700 flex items-center justify-center">
                      <Layers className="w-8 h-8 text-neutral-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate mb-1">
                        {preset.name}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Click to load this layout
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-primary hover:bg-primary/10"
                        onClick={(e) => handleLoadPreset(preset, e)}
                        title="Load"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

