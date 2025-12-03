// src/hooks/useCameraEffects.ts
import { useEffect, useRef, useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

interface UseCameraEffectsProps {
  videoElement: HTMLVideoElement | null;
  isSegmentationEnabled: boolean; // Renamed from isBackgroundRemovalEnabled
  isFaceTrackingEnabled: boolean;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
}

interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

let faceDetector: FaceDetector | null = null;

const initializeFaceDetector = async () => {
  if (faceDetector) return faceDetector;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
    });
    return faceDetector;
  } catch (err) {
    console.error("[useCameraEffects] FaceDetector init failed:", err);
    return null;
  }
};

export const useCameraEffects = ({
  videoElement,
  isSegmentationEnabled,
  isFaceTrackingEnabled,
  onUserPositionChange,
}: UseCameraEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const facePositionRef = useRef<FacePosition | null>(null);

  const [isSegmentationReady, setIsSegmentationReady] = useState(false);
  const [isFaceDetectionReady, setIsFaceDetectionReady] = useState(false);
  const animationFrameRef = useRef<number>();

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Initialize Segmentation (Only if enabled)
  useEffect(() => {
    if (!isSegmentationEnabled) {
      setIsSegmentationReady(false);
      return;
    }

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    selfieSegmentation.setOptions({ modelSelection: 1, selfieMode: true });

    selfieSegmentation.onResults((results) => {
      if (!canvasRef.current || !videoElement) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (canvas.width !== videoElement.videoWidth) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
      }

      // Draw mask for use in shaders
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvas.width,
        canvas.height
      );
    });

    segmentationRef.current = selfieSegmentation;
    setIsSegmentationReady(true);

    return () => {
      selfieSegmentation.close();
      segmentationRef.current = null;
      setIsSegmentationReady(false);
    };
  }, [isSegmentationEnabled, videoElement]);

  // Initialize Face Detector
  useEffect(() => {
    if (!isFaceTrackingEnabled) {
      setIsFaceDetectionReady(false);
      return;
    }

    let isMounted = true;
    initializeFaceDetector().then((detector) => {
      if (isMounted && detector) {
        faceDetectorRef.current = detector;
        setIsFaceDetectionReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isFaceTrackingEnabled]);

  // Process Frames
  useEffect(() => {
    if (!videoElement) return;
    let lastVideoTime = -1;

    const processFrame = async () => {
      if (videoElement.readyState >= 2) {
        const currentTime = videoElement.currentTime;

        if (isSegmentationReady && segmentationRef.current) {
          try {
            await segmentationRef.current.send({ image: videoElement });
          } catch (e) {}
        }

        if (
          isFaceDetectionReady &&
          faceDetectorRef.current &&
          currentTime !== lastVideoTime
        ) {
          lastVideoTime = currentTime;
          const detections = faceDetectorRef.current.detectForVideo(
            videoElement,
            performance.now()
          );

          if (detections.detections && detections.detections.length > 0) {
            const detection = detections.detections[0];
            const bbox = detection.boundingBox;
            if (bbox && videoElement.videoWidth > 0) {
              const centerX =
                ((bbox.originX + bbox.width / 2) / videoElement.videoWidth) *
                100;
              const centerY =
                ((bbox.originY + bbox.height / 2) / videoElement.videoHeight) *
                100;
              facePositionRef.current = {
                x: centerX,
                y: centerY,
                width: (bbox.width / videoElement.videoWidth) * 100,
                height: (bbox.height / videoElement.videoHeight) * 100,
              };
              if (onUserPositionChange)
                onUserPositionChange({ x: centerX, y: centerY });
            }
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    videoElement,
    isSegmentationReady,
    isFaceDetectionReady,
    onUserPositionChange,
  ]);

  return {
    processedCanvas: canvasRef.current,
    facePositionRef,
    isReady: isSegmentationReady || isFaceDetectionReady,
  };
};
