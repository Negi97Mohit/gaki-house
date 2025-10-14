// src/components/AICommandPopover.tsx

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GeneratedOverlay } from "@/types/caption";

// MODIFIED: Update props interface
interface AICommandPopoverProps {
  onSubmit: (text: string, targetId: string | null) => void;
  isProcessing: boolean;
  children: React.ReactNode;
  activeOverlays: GeneratedOverlay[];
}

export const AICommandPopover = ({ onSubmit, isProcessing, children, activeOverlays }: AICommandPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  // ADDED: State to hold the ID of the targeted overlay
  const [targetId, setTargetId] = useState<string | null>(null);

  // MODIFIED: Pass the targetId to the onSubmit handler
  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    onSubmit(text.trim(), targetId);
    setText("");
    setOpen(false);
    setTargetId(null); // Reset target after submission
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
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

          {/* ADDED: Dropdown to select a target overlay or create a new one */}
          <div className="space-y-1.5">
            <Label htmlFor="target-overlay">Target</Label>
            <Select onValueChange={(value) => setTargetId(value === 'new' ? null : value)} disabled={activeOverlays.length === 0} defaultValue="new">
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
