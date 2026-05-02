// Single responsibility: download desktop app dialog and its trigger button.
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";

interface DownloadControlProps {
  isElectron: boolean;
}

interface ReleaseLinks {
  windows: string;
  mac: string;
}

const FALLBACK_URL = "https://github.com/Negi97Mohit/gaki/releases/latest";

export const DownloadControl: React.FC<DownloadControlProps> = ({ isElectron }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<ReleaseLinks | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestRelease() {
      try {
        const res = await fetch("https://api.github.com/repos/Negi97Mohit/gaki/releases/latest");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        let winUrl = FALLBACK_URL;
        let macUrl = FALLBACK_URL;
        
        for (const asset of data.assets) {
          if (asset.name.endsWith('.exe')) winUrl = asset.browser_download_url;
          if (asset.name.endsWith('.dmg')) macUrl = asset.browser_download_url;
        }
        
        setLinks({ windows: winUrl, mac: macUrl });
      } catch (err) {
        console.error("[DownloadControl] Failed to fetch latest release:", err);
        setLinks({ windows: FALLBACK_URL, mac: FALLBACK_URL });
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen && !links) {
      fetchLatestRelease();
    }
  }, [isOpen, links]);

  if (isElectron) return null;

  return (
    <>
      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            console.log("[DownloadControl] Dismiss overlay clicked");
            setIsOpen(false);
          }}
        >
          <div 
            className="relative w-[90vw] sm:max-w-sm bg-background/90 dark:bg-background/80 backdrop-blur-3xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
            <div className="flex flex-col gap-1 pb-4">
              <h2 className="text-lg font-medium tracking-tight">Download for Desktop</h2>
            </div>

            <div className="flex justify-center gap-6 py-6 min-h-[120px]">
              {isLoading ? (
                <div className="flex items-center justify-center w-full text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  <a
                    href={links?.windows || FALLBACK_URL}
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-foreground/80 group-hover:text-foreground transition-colors">
                      <svg viewBox="0 0 24 24" className="w-10 h-10" fill="currentColor">
                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Windows</div>
                      <div className="text-[10px] text-muted-foreground">.exe</div>
                    </div>
                  </a>

                  <a
                    href={links?.mac || FALLBACK_URL}
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-foreground/80 group-hover:text-foreground transition-colors">
                       <svg viewBox="0 0 384 512" className="w-10 h-10" fill="currentColor">
                         <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.6 9.8 244.6 0 286.2 0 336 21 386.6c20.3 49 53 103.5 106.6 103.5 33.7 0 54.4-19 96.5-19 40.5 0 58.7 19.3 95 19.3 54.2 0 81.3-48.4 102.5-98.8 6.5-16.7 13-33.5 18-50-38.3-15.5-68.5-47-70.9-88.9zm-136.2-121c21.8-27.4 36-64 30.6-99-31.2 1.4-67.4 20-89 45-19.8 23-38 60-31 96 32.7 1.5 64.6-17.6 89.4-42z"/>
                       </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">macOS</div>
                      <div className="text-[10px] text-muted-foreground">.dmg</div>
                    </div>
                  </a>
                </>
              )}
            </div>
            
            <Button
               variant="ghost"
               className="w-full mt-2"
               onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>,
        document.body
      )}

      <ShortcutTooltip label="Download Desktop App">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 text-primary hover:text-primary transition-all duration-200"
          type="button"
          onClick={() => {
            console.log("[DownloadControl] Button strictly clicked!");
            setIsOpen(true);
          }}
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      </ShortcutTooltip>
    </>
  );
};
