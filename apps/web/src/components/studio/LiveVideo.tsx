import React, { useEffect, useRef } from "react";

interface LiveVideoProps {
  stream: MediaStream;
}

export const LiveVideo: React.FC<LiveVideoProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted // Always mute local video previews to prevent horrific audio feedback loops!
      className="w-full h-full object-cover"
    />
  );
};
