import React, { useRef, useEffect } from "react";
import { cn } from "@/shared/lib/utils";

interface VideoPlayerProps {
  stream: MediaStream | null;
  className?: string;
  style?: React.CSSProperties;
  muted?: boolean;
  onVideoElementReady?: (video: HTMLVideoElement) => void;
  onVideoElementUnmount?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { stream, className, style, muted = true } = props;
  const videoRef = useRef<HTMLVideoElement>(null);

  const { onVideoElementReady, onVideoElementUnmount } = props;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      videoElement.srcObject = stream;
      if (onVideoElementReady) {
        onVideoElementReady(videoElement);
      }
    }
    
    return () => {
      // Safely notify that video element is cleaning up to stop stream hooks
      if (onVideoElementUnmount) {
        onVideoElementUnmount();
      }
    };
  }, [stream, onVideoElementReady, onVideoElementUnmount]);

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
