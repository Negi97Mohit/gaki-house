import React from "react";
import { Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePreviewMode } from "./dynamic/core/PreviewModeContext";

interface LayoutSettingsCtrlProps {
  backgroundColor: string;
  // textColor prop removed from interface
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
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bgColor"
                type="color"
                className="w-10 h-10 p-1 cursor-pointer"
                value={backgroundColor}
                onChange={(e) => onUpdate("backgroundColor", e.target.value)}
              />
              <Input
                type="text"
                className="flex-1"
                value={backgroundColor}
                onChange={(e) => onUpdate("backgroundColor", e.target.value)}
              />
            </div>
          </div>
          {/* Text Color Control Removed */}
        </div>
      </PopoverContent>
    </Popover>
  );
};

