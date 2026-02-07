import React from "react";
import { VideoPlayer } from "@/features/canvas/ui/VideoPlayer";
import { CameraOpacityOverlay } from "@/features/canvas/ui/CameraOpacityOverlay";
import { PanelOpacityToolbar } from "@/features/canvas/ui/PanelOpacityToolbar";
import { useCameraOpacity } from "@/features/canvas/hooks/useCameraOpacity";

interface ScreenShareGridSectionProps {
  stream: MediaStream;
  cameraStream?: MediaStream | null;
  displayMode?: "cover" | "fit" | "stretch" | "center";
}

export const ScreenShareGridSection: React.FC<ScreenShareGridSectionProps> = ({
  stream,
  cameraStream,
  displayMode = "cover",
}) => {
  const cameraOpacity = useCameraOpacity();

  const objectFit: React.CSSProperties["objectFit"] =
    displayMode === "fit"
      ? "contain"
      : displayMode === "stretch"
      ? "fill"
      : displayMode === "center"
      ? "none"
      : "cover";

  return (
    <div className="relative w-full h-full overflow-hidden group/panel-opacity">
      <VideoPlayer
        stream={stream}
        muted
        className="w-full h-full"
        style={{ objectFit }}
      />

      {cameraOpacity.isEnabled && cameraStream && (
        <CameraOpacityOverlay
          cameraStream={cameraStream}
          opacity={cameraOpacity.opacity}
          pattern={cameraOpacity.pattern}
        />
      )}

      {/* Compact toolbar – appears on hover */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/panel-opacity:opacity-100 transition-opacity duration-300"
        style={{ zIndex: 50 }}
      >
        <PanelOpacityToolbar
          isEnabled={cameraOpacity.isEnabled}
          opacity={cameraOpacity.opacity}
          pattern={cameraOpacity.pattern}
          onToggle={cameraOpacity.toggle}
          onOpacityChange={cameraOpacity.setOpacity}
          onPatternChange={cameraOpacity.setPattern}
        />
      </div>
    </div>
  );
};
