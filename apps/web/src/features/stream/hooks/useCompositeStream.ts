// src/hooks/useCompositeStream.ts
import { useEffect, useState } from 'react';

interface UseCompositeStreamProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isEnabled: boolean;
  frameRate?: number;
}

/**
 * Hook that captures the final composed canvas output as a MediaStream
 * This creates a "virtual camera" from the GAKI canvas composition
 */
export const useCompositeStream = ({
  canvasRef,
  isEnabled,
  frameRate = 30,
}: UseCompositeStreamProps) => {
  const [compositeStream, setCompositeStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isEnabled || !canvasRef.current) {
      // Clean up stream if disabled
      if (compositeStream) {
        compositeStream.getTracks().forEach(track => track.stop());
        setCompositeStream(null);
      }
      return;
    }

    const canvas = canvasRef.current;
    
    try {
      // Capture stream directly from the canvas
      // This canvas should contain the full composed scene
      const stream = canvas.captureStream(frameRate);
      setCompositeStream(stream);
      
      // Log stream tracks
} catch (error) {
      console.error('[VirtualCamera] Failed to capture stream:', error);
    }

    return () => {
      if (compositeStream) {
        compositeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [canvasRef.current, isEnabled, frameRate]);

  return {
    compositeStream,
    isReady: !!compositeStream,
  };
};
