import React from "react";
import { Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { Label } from "@/shared/ui/label";
import { ColorPicker } from "@/shared/ui/color-picker";
import { usePreviewMode } from "./dynamic/core/PreviewModeContext";

interface LayoutSettingsCtrlProps {
  backgroundColor: string;
  onUpdate: (key: string, value: string) => void;
}

export const LayoutSettingsCtrl: React.FC<LayoutSettingsCtrlProps> = ({
  backgroundColor,
  onUpdate,
}) => {
  const isPreview = usePreviewMode();

  // Don't render any controls in preview mode
  if (isPreview) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="fixed bottom-4 right-4 z-50 p-3 bg-black text-white rounded-full shadow-xl hover:scale-105 transition-transform">
          <Settings className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end" side="top">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Layout Settings</h4>
          <div className="space-y-2">
            <Label>Background Color</Label>
            <ColorPicker
              value={backgroundColor}
              onChange={(color) => onUpdate("backgroundColor", color)}
              variant="inline"
              showGradients={true}
              showAlpha={false}
              label="Background"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};