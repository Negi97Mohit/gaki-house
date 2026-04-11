import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@caption-cam/ui/dialog";
import { Button } from "@caption-cam/ui/button";
import { useStreamStore } from "@/stores/stream.store";

export const FatalErrorDialog = () => {
  const { fatalError, setFatalError } = useStreamStore();
  const isOpen = !!fatalError;

  const handleHardReset = () => {
    // 1. Clear State
    setFatalError(null);

    // 2. Clear Storage (removes potentially corrupted configs)
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log("Local/Session storage cleared.");
    } catch (e) {
      console.error("Failed to clear storage:", e);
    }

    // 3. Force Reload
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && setFatalError(null)}>
      <DialogContent className="sm:max-w-md bg-destructive/5 border-destructive/20">
        <DialogHeader>
          <div className="flex items-center gap-3 text-destructive mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl">
              Stream Connection Failed
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            The streaming engine has encountered a persistent error loop. This
            usually happens due to a system resource conflict or a corrupted
            configuration.
          </p>

          <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-xs font-mono text-muted-foreground break-all max-h-32 overflow-y-auto">
            {fatalError || "Unknown Error"}
          </div>

          <p className="text-sm font-medium">
            We recommend a hard reset to restore functionality.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setFatalError(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleHardReset}
              className="gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Hard Reset App
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
