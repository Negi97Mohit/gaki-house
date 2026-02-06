import React, { useRef, useEffect } from "react";
import { OpacityPattern } from "@/features/canvas/hooks/useCameraOpacity";

interface CameraOpacityOverlayProps {
  cameraStream: MediaStream | null;
  opacity: number; // 0–100
  pattern: OpacityPattern;
}

function getMaskImage(pattern: OpacityPattern): string | undefined {
  switch (pattern) {
    case "uniform":
      return undefined;
    case "left-to-right":
      return "linear-gradient(to right, black, transparent)";
    case "right-to-left":
      return "linear-gradient(to left, black, transparent)";
    case "top-to-bottom":
      return "linear-gradient(to bottom, black, transparent)";
    case "bottom-to-top":
      return "linear-gradient(to top, black, transparent)";
    case "center-to-edge":
      return "radial-gradient(ellipse at center, black 20%, transparent 80%)";
    case "edge-to-center":
      return "radial-gradient(ellipse at center, transparent 20%, black 80%)";
    case "diagonal-tl-br":
      return "linear-gradient(to bottom right, black, transparent)";
    case "diagonal-tr-bl":
      return "linear-gradient(to bottom left, black, transparent)";
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
