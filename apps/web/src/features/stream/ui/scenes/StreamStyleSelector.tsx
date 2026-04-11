// src/components/stream-scenes/StreamStyleSelector.tsx

import React, { useState } from 'react';
import { 
  Tv, 
  Coffee, 
  Clock, 
  Power, 
  Video,
  Sparkles,
  Zap,
  Gamepad2,
  Check,
  Pause
} from 'lucide-react';
import { Button } from "@caption-cam/ui/button";
import { Badge } from "@caption-cam/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@caption-cam/ui/dialog";
import { ScrollArea } from "@caption-cam/ui/scroll-area";
import { 
  STREAM_STYLE_PRESETS, 
  StreamStylePreset, 
  StreamSceneType,
  DEFAULT_STREAM_SCENES
} from "@caption-cam/core/types/streamStyle";
import { cn } from "@caption-cam/core/lib/utils";
import { toast } from 'sonner';

interface StreamStyleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStyle: (preset: StreamStylePreset) => void;
}

export const StreamStyleSelector: React.FC<StreamStyleSelectorProps> = ({
  isOpen,
  onClose,
  onApplyStyle
}) => {
  const [selectedPreset, setSelectedPreset] = useState<StreamStylePreset | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'anime': return <Sparkles className="w-3 h-3" />;
      case 'neon': return <Zap className="w-3 h-3" />;
      case 'gaming': return <Gamepad2 className="w-3 h-3" />;
      default: return <Tv className="w-3 h-3" />;
    }
  };

  const handleApply = () => {
    if (selectedPreset) {
      onApplyStyle(selectedPreset);
      toast.success(`Applied "${selectedPreset.name}" stream style`);
      onClose();
      setSelectedPreset(null);
    }
  };

  const handleClose = () => {
    setSelectedPreset(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            Stream Styles
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choose a style to generate all stream scenes
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {STREAM_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={cn(
                  'text-left p-2 rounded-lg border transition-all',
                  'hover:border-primary/50 hover:bg-accent/50',
                  selectedPreset?.id === preset.id 
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30' 
                    : 'border-border bg-card'
                )}
              >
                {/* Color preview bar */}
                <div className="h-8 rounded-md mb-2 overflow-hidden flex">
                  {Object.values(preset.theme.colors).slice(0, 4).map((color, i) => (
                    <div 
                      key={i} 
                      className="flex-1" 
                      style={{ background: color }}
                    />
                  ))}
                </div>
                
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-medium truncate">{preset.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5">
                    {getCategoryIcon(preset.theme.category)}
                    {preset.theme.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between w-full gap-2">
            <span className="text-xs text-muted-foreground">
              {selectedPreset ? `"${selectedPreset.name}" selected` : 'Select a style'}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleApply} 
                disabled={!selectedPreset}
                className="gap-1"
              >
                <Check className="w-3 h-3" />
                Apply
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StreamStyleSelector;
