// src/components/InstructionsDialog.tsx
import React from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Info,
  Sparkles,
  Type,
  Film,
  Captions,
  LayoutGrid,
  Library,
  Plus,
  Globe,
  Search,
} from "lucide-react";

interface InstructionsDialogProps {
  renderTrigger?: (onClick: () => void) => React.ReactNode;
}

export const InstructionsDialog: React.FC<InstructionsDialogProps> = ({ renderTrigger }) => {
  const [open, setOpen] = React.useState(false);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="How to use"
    >
      <Info className="h-5 w-5" />
      <span className="sr-only">Show Instructions</span>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {renderTrigger ? renderTrigger(() => setOpen(true)) : defaultTrigger}
      </DialogTrigger>

    <DialogContent className="sm:max-w-[520px] rounded-xl p-4">
      <DialogHeader className="mb-1">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          How to Use <span className="text-primary">gaki</span>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-3 text-[13px] text-muted-foreground leading-snug max-h-[60vh] overflow-y-auto pr-2">
        <section>
          <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Overlays
          </h4>
          <p>
            Click the ✨ button or speak commands when **AI Mode** is on to
            create and update overlays.
          </p>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Film className="h-4 w-4 text-primary" />
            Scene Management
          </h4>
          <p>
            Use the **tabs at the top** to switch scenes. Click the icon between
            tabs to set custom transitions.
          </p>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Captions className="h-4 w-4 text-primary" />
            Live Captions
          </h4>
          <p>
            Toggle audio (🎤) and captions (👁️) from the top toolbar. Customize
            all styles (font, color, dynamic animations) in the main settings
            panel (⚙️).
          </p>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4 text-primary" />
            Layouts & Effects
          </h4>
          <p>
            Change scene layouts (PiP, Split) and camera shapes from the bottom
            control bar. All video filters and effects are in the main settings
            panel (⚙️).
          </p>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-primary" />
            Adding Elements
          </h4>
          <ul className="list-disc list-outside space-y-1 pl-5">
            <li>
              Use the **top-right buttons** to add text (
              <Type className="inline h-3 w-3" />) or search for assets (
              <Search className="inline h-3 w-3" />
              ).
            </li>
            <li>
              Press <strong>/ (slash key)</strong> to quickly add a browser
              window (<Globe className="inline h-3 w-3" />
              ).
            </li>
            <li>**Drag & Drop** files directly onto the canvas.</li>
          </ul>
        </section>

        <div className="border-t border-border" />

        <section>
          <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
            <Library className="h-4 w-4 text-primary" />
            Recording & Editing
          </h4>
          <p>
            Press the red circle (🔴) to record. Find your saved sessions and
            open the editor from the **Library** (📚) button.
          </p>
        </section>
      </div>
    </DialogContent>
  </Dialog>
);
};
