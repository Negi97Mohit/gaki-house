import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@caption-cam/ui/dialog";
import { AudioMixerPanel } from "../panels/AudioMixerPanel";

interface AudioSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AudioSettingsDialog: React.FC<AudioSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] overflow-hidden bg-background/95 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl p-0">
        <div className="px-5 pt-5 pb-3">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold tracking-tight">Audio Settings</DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-5 pb-5 overflow-y-auto max-h-[70vh]">
          <AudioMixerPanel />
        </div>
      </DialogContent>
    </Dialog>
  );
};
