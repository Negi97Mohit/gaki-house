import React, { useRef, useEffect } from "react";
import { OpacityPattern } from "@/features/canvas/hooks/useCameraOpacity";

interface CameraOpacityOverlayProps {
  cameraStream: MediaStream | null;
  opacity: number; // 0–100
  pattern: OpacityPattern;
}

/** 
 * Returns CSS mask for transparency patterns.
 * Uses alpha channel only - no color tinting, preserving true video colors.
 */
function getMaskImage(pattern: OpacityPattern): string | undefined {
  switch (pattern) {
    case "none":
    case "uniform":
      return undefined;
    case "left-to-right":
      return "linear-gradient(to right, rgba(0,0,0,1), rgba(0,0,0,0))";
    case "right-to-left":
      return "linear-gradient(to left, rgba(0,0,0,1), rgba(0,0,0,0))";
    case "top-to-bottom":
      return "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))";
    case "bottom-to-top":
      return "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))";
    case "center-to-edge":
      return "radial-gradient(ellipse at center, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 80%)";
    case "edge-to-center":
      return "radial-gradient(ellipse at center, rgba(0,0,0,0) 20%, rgba(0,0,0,1) 80%)";
    case "diagonal-tl-br":
      return "linear-gradient(to bottom right, rgba(0,0,0,1), rgba(0,0,0,0))";
    case "diagonal-tr-bl":
      return "linear-gradient(to bottom left, rgba(0,0,0,1), rgba(0,0,0,0))";
    default:
      return undefined;
  }
}

export const CameraOpacityOverlay: React.FC<CameraOpacityOverlayProps> = ({
  cameraStream,
  opacity,
  pattern,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (cameraStream) {
      video.srcObject = cameraStream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [cameraStream]);

  if (!cameraStream) return null;

  const maskImage = getMaskImage(pattern);

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        opacity: opacity / 100,
        ...(maskImage
          ? {
              WebkitMaskImage: maskImage,
              maskImage,
            }
          : {}),
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
    </div>
  );
};
