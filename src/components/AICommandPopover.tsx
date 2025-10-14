// src/components/AICommandPopover.tsx

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2 } from "lucide-react";

// --- FIX 1: Add 'children' to the props interface ---
interface AICommandPopoverProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  children: React.ReactNode;
}

// --- FIX 2: Accept 'children' as a prop ---
export const AICommandPopover = ({ onSubmit, isProcessing, children }: AICommandPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    onSubmit(text.trim());
    setText("");
    setOpen(false);
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
              Describe the overlay you want to create.
            </p>
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