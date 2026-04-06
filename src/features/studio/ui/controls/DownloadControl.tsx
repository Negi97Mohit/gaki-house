// Single responsibility: download desktop app dialog and its trigger button.
import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";

interface DownloadControlProps {
  isElectron: boolean;
}

const DOWNLOADS = {
  windows:
    "https://github.com/Negi97Mohit/gakiVersion/releases/download/v1.0.0/Gaki-House-of-Video-Creation-0.0.0.exe",
  mac: "#",
  linux: "#",
};

export const DownloadControl: React.FC<DownloadControlProps> = ({ isElectron }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("[DownloadControl] mounted");
  }, []);

  if (isElectron) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-sm bg-background/70 dark:bg-background/50 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-6 overflow-hidden">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-medium tracking-tight">
              Download for Desktop
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-6 py-6">
            <a
              href={DOWNLOADS.windows}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-foreground/80 group-hover:text-foreground transition-colors"
                  fill="currentColor"
                >
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Windows</div>
                <div className="text-[10px] text-muted-foreground">.exe</div>
              </div>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <ShortcutTooltip label="Download Desktop App">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 text-primary hover:text-primary transition-all duration-200"
          onClick={() => setIsOpen(true)}
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </ShortcutTooltip>
    </>
  );
};
