import React, { useRef, useEffect } from "react";
import { VideoPlayer } from "@/features/canvas/ui/VideoPlayer";
import { CameraOpacityOverlay } from "@/features/canvas/ui/CameraOpacityOverlay";
import { OpacityToolbar } from "@/features/canvas/ui/OpacityToolbar";
import { useCameraOpacity } from "@/features/canvas/hooks/useCameraOpacity";

interface ScreenShareGridSectionProps {
  stream: MediaStream;
  cameraStream?: MediaStream | null;
  displayMode?: "cover" | "fit" | "stretch" | "center";
}

/**
 * Renders a screen share inside a grid panel with an optional
 * camera opacity overlay and a compact toolbar positioned at the
 * bottom-center of the panel.
 */
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
    <div className="relative w-full h-full overflow-hidden">
      {/* Screen share video */}
      <VideoPlayer
        stream={stream}
        muted
        className="w-full h-full"
        style={{ objectFit }}
      />

      {/* Camera opacity overlay */}
      {cameraOpacity.isEnabled && cameraStream && (
        <CameraOpacityOverlay
          cameraStream={cameraStream}
          opacity={cameraOpacity.opacity}
          pattern={cameraOpacity.pattern}
        />
      )}

      {/* Compact toolbar inside the panel */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2"
        style={{ zIndex: "var(--z-floating-controls, 50)" }}
      >
        <OpacityToolbar
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
