// src/components/AICommandPopover.tsx

import { useState, useEffect, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Send,
  Loader2,
  BrainCircuit,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GeneratedOverlay } from "@/types/caption";

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
  captionsEnabled,
  portalContainer,
  onCaptionsToggle,
}: AICommandPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const hasAutoOpenedRef = useRef(false);

  // Use a ref to store animation state to prevent resets on re-render
  const animationStateRef = useRef({
    currentExample: 0,
    currentChar: 0,
    isDeleting: false,
  });

  // Move examples to ref to prevent recreation on every render
  const examplesRef = useRef([
    "Create a countdown timer...",
    "Show my social media links...",
    "Add animated flames around the border...",
  ]);

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    onSubmit(text.trim(), targetId);
    setText("");
    setOpen(false);
    setTargetId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --- ADDED THIS HOOK BACK ---
  useEffect(() => {
    // Auto-open only once on initial mount
    if (!hasAutoOpenedRef.current) {
      const openTimer = setTimeout(() => {
        setOpen(true);
        hasAutoOpenedRef.current = true;
      }, 4000); // This delay waits for the button to load

      return () => clearTimeout(openTimer);
    }
  }, []); // Empty dependency array ensures this runs only once on mount
  // --- END OF ADDED BLOCK ---

  useEffect(() => {
    // Animation logic that runs when popover is open
    if (!open) {
      return;
    }

    // Reset animation state when the popover opens
    animationStateRef.current = {
      currentExample: 0,
      currentChar: 0,
      isDeleting: false,
    };

    const typeAnimation = () => {
      const state = animationStateRef.current;
      const current = examplesRef.current[state.currentExample];

      if (!state.isDeleting) {
        if (state.currentChar < current.length) {
          setPlaceholder(current.substring(0, state.currentChar + 1));
          state.currentChar++;
          typingTimeoutRef.current = setTimeout(typeAnimation, 100);
        } else {
          typingTimeoutRef.current = setTimeout(() => {
            state.isDeleting = true;
            typeAnimation();
          }, 2000);
        }
      } else {
        if (state.currentChar > 0) {
          setPlaceholder(current.substring(0, state.currentChar - 1));
          state.currentChar--;
          typingTimeoutRef.current = setTimeout(typeAnimation, 50);
        } else {
          state.isDeleting = false;
          state.currentExample =
            (state.currentExample + 1) % examplesRef.current.length;
          typingTimeoutRef.current = setTimeout(typeAnimation, 500);
        }
      }
    };

    // Start animation after popover is open
    const animationTimer = setTimeout(() => {
      textareaRef.current?.focus();
      typeAnimation();
    }, 300);

    // Cleanup function
    return () => {
      clearTimeout(animationTimer);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        container={portalContainer}
        align="end"
        className="w-96 p-4 aicp-content"
        style={{ zIndex: "var(--z-ai-popover-content)" }}
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

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={isAiModeEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => onAiModeToggle?.(!isAiModeEnabled)}
            >
              {isAiModeEnabled ? (
                <Sparkles className="w-4 h-4 mr-2" />
              ) : (
                <BrainCircuit className="w-4 h-4 mr-2" />
              )}
              AI Mode
            </Button>
            <Button
              variant={captionsEnabled ? "default" : "secondary"}
              size="sm"
              onClick={() => onCaptionsToggle?.(!captionsEnabled)}
            >
              {captionsEnabled ? (
                <Eye className="w-4 h-4 mr-2" />
              ) : (
                <EyeOff className="w-4 h-4 mr-2" />
              )}
              Captions
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target-overlay">Target</Label>
            <Select
              value={targetId || "new"}
              onValueChange={(value) =>
                setTargetId(value === "new" ? null : value)
              }
              disabled={activeOverlays.length === 0}
            >
              <SelectTrigger id="target-overlay">
                <SelectValue placeholder="Create New Overlay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Overlay</SelectItem>
                {activeOverlays.map((overlay) => (
                  <SelectItem key={overlay.id} value={overlay.id}>
                    {overlay.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            ref={textareaRef}
            placeholder={
              placeholder || "e.g., animated flames around the border..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              setText((prev) => prev + pasted);
              e.preventDefault(); // prevent Radix from blocking
            }}
            disabled={isProcessing}
            className="min-h-24 text-sm resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/50"
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
