import React from "react";
import { Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ASPECT_RATIOS } from "@/lib/backgrounds";

interface PipBackgroundMenuProps {
  showAspectRatio?: boolean;
  cameraAspectRatio: string;
  onCameraAspectRatioChange: (ratio: string) => void;
  customAspectRatio: string;
  onCustomAspectRatioChange: (ratio: string) => void;
  onEnterPipMode?: () => void;
}

export const PipBackgroundMenu: React.FC<PipBackgroundMenuProps> = ({
  showAspectRatio = true,
  cameraAspectRatio,
  onCameraAspectRatioChange,
  customAspectRatio,
  onCustomAspectRatioChange,
  onEnterPipMode,
}) => {
  const handleAspectRatioSelect = (ratioId: string) => {
    onCameraAspectRatioChange(ratioId);
    // Trigger PiP mode when selecting an aspect ratio (except "free")
    if (ratioId !== "free" && onEnterPipMode) {
      onEnterPipMode();
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-background/60"
          title="Aspect Ratio"
        >
          <Image className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="start"
          className="z-[var(--z-text-toolbar)] w-56 max-h-[400px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {showAspectRatio && (
            <>
              <DropdownMenuLabel className="text-xs font-semibold">
                Aspect Ratio
              </DropdownMenuLabel>
              {ASPECT_RATIOS.map((ratio) => (
                <DropdownMenuCheckboxItem
                  key={ratio.id}
                  checked={cameraAspectRatio === ratio.id}
                  onClick={() => handleAspectRatioSelect(ratio.id)}
                  className="text-sm"
                >
                  {ratio.name}
                </DropdownMenuCheckboxItem>
              ))}
              {cameraAspectRatio === "custom" && (
                <div className="p-2">
                  <Input
                    type="text"
                    placeholder="e.g., 21:9"
                    value={customAspectRatio}
                    onChange={(e) => onCustomAspectRatioChange(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
