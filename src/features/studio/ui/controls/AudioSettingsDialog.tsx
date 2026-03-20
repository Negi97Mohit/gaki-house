import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
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
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Audio Settings</DialogTitle>
        </DialogHeader>
        <AudioMixerPanel />
      </DialogContent>
    </Dialog>
  );
};
