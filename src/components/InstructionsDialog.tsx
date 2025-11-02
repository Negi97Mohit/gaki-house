// src/components/InstructionsDialog.tsx

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export const InstructionsDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-md hover:bg-muted hover:text-primary transition-colors"
        title="How to use"
      >
        <Info className="h-4 w-4" />
        <span className="sr-only">Show Instructions</span>
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-[520px] rounded-xl p-4">
      <DialogHeader className="mb-1">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          How to Use <span className="text-primary">gaki</span>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 text-[13px] text-muted-foreground leading-snug max-h-[55vh] overflow-y-auto pr-1">
        <section>
          <h4 className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
            ✨ AI Overlays
          </h4>
          <p>
            Click the purple sparkles button or speak commands when “AI Mode” is on. 
            The AI can create or update overlays from scratch.
          </p>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1">
            🎨 Video Effects & Layouts
          </h4>
          <p>
            Use “Video Effects” in the sidebar and layout controls (top right of video) 
            to change your look.
          </p>
          <ul className="mt-1 list-disc list-inside space-y-0.5">
            <li><strong>Filters:</strong> Apply camera color filters.</li>
            <li><strong>Layouts:</strong> Switch between PiP and Split Screen modes.</li>
          </ul>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1">
            ✍️ Live Captions
          </h4>
          <p>
            Toggle captions from the top toolbar. Customize them in the left sidebar.
          </p>
          <ul className="mt-1 list-disc list-inside space-y-0.5">
            <li><strong>Dynamic Styles:</strong> Word-by-word animations like Karaoke or Pop Up.</li>
            <li><strong>Static Styles:</strong> Adjust font, color, size, and background.</li>
          </ul>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1">
            🌐 Browser (WIP)
          </h4>
          <p>
            Press <strong>/</strong> to open a draggable browser window in your video.
          </p>
        </section>
      </div>
    </DialogContent>
  </Dialog>
);
