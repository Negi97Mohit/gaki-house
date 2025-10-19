// src/components/AICommandPopover.tsx

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2, BrainCircuit, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GeneratedOverlay } from "@/types/caption";

// MODIFIED: Update props interface to include fullscreen controls
interface AICommandPopoverProps {
  onSubmit: (text: string, targetId: string | null) => void;
  isProcessing: boolean;
  children: React.ReactNode;
  activeOverlays: GeneratedOverlay[];
  isFullscreen?: boolean;
  isAiModeEnabled?: boolean;
  onAiModeToggle?: (enabled: boolean) => void;
  captionsEnabled?: boolean;
  portalContainer?: HTMLElement | null; 
  onCaptionsToggle?: (enabled: boolean) => void;
}

export const AICommandPopover = ({
  onSubmit,
  isProcessing,
  children,
  activeOverlays,
  isFullscreen,
  isAiModeEnabled,
  onAiModeToggle,
  captionsEnabled,portalContainer,
  onCaptionsToggle,
}: AICommandPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    onSubmit(text.trim(), targetId);
    setText("");
    setOpen(false);
    setTargetId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  console.log('DEBUG: Popover open state is:', open);

  return (
    <Popover 
      open={open} 
      onOpenChange={(isOpen) => {
        // *** ADDED: DEBUG LOG to see when the open state is triggered ***
        console.log(`DEBUG: Popover onOpenChange triggered. New state: ${isOpen}`);
        setOpen(isOpen);
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
<PopoverContent 
  container={portalContainer}  
  className="w-96 p-4 z-[1100] aicp-content" // <-- Add the 'aicp-content' class
  align="end"
>  
          <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold leading-none flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Overlay Command
            </h4>
            <p className="text-xs text-muted-foreground">
              Describe the overlay you want to create or modify.
            </p>
          </div>

          {/* ADDED: Fullscreen-only controls for AI and Captions */}
          {isFullscreen && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isAiModeEnabled ? "default" : "secondary"}
                size="sm"
                onClick={() => onAiModeToggle?.(!isAiModeEnabled)}
              >
                {isAiModeEnabled ? <Sparkles className="w-4 h-4 mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                AI Mode
              </Button>
              <Button
                variant={captionsEnabled ? "default" : "secondary"}
                size="sm"
                onClick={() => onCaptionsToggle?.(!captionsEnabled)}
              >
                {captionsEnabled ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                Captions
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="target-overlay">Target</Label>
<Select 
  value={targetId || 'new'} // <-- ADD THIS LINE
  onValueChange={(value) => setTargetId(value === 'new' ? null : value)} 
  disabled={activeOverlays.length === 0}
>
  <SelectTrigger id="target-overlay">
    <SelectValue placeholder="Create New Overlay" />
  </SelectTrigger>
  <SelectContent>
                      <SelectItem value="new">Create New Overlay</SelectItem>
                    {activeOverlays.map(overlay => (
                        <SelectItem key={overlay.id} value={overlay.id}>
                            {overlay.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="e.g., animated flames around the border..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="min-h-24 text-sm resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};