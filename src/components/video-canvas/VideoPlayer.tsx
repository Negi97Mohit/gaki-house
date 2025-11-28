import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  stream: MediaStream | null;
  className?: string;
  style?: React.CSSProperties;
  muted?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  className,
  style,
  muted = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={cn("w-full h-full object-cover", className)}
      style={style}
    />
  );
};
