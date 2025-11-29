// src/hooks/useCameraEffects.ts
import { useEffect, useRef, useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

interface UseCameraEffectsProps {
  videoElement: HTMLVideoElement | null;
  isBackgroundRemovalEnabled: boolean;
  backgroundType: "none" | "blur" | "image";
  backgroundImageUrl?: string;
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
    console.log("[useCameraEffects] Initializing FaceDetector model...");
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
    console.log("[useCameraEffects] FaceDetector ready.");
    return faceDetector;
  } catch (err) {
    console.error("[useCameraEffects] FaceDetector init failed:", err);
    return null;
  }
};

export const useCameraEffects = ({
  videoElement,
  isBackgroundRemovalEnabled,
  backgroundType,
  backgroundImageUrl,
  isFaceTrackingEnabled,
  onUserPositionChange,
}: UseCameraEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const faceDetectorRef = useRef<FaceDetector | null>(null);

  // CHANGED: Ref for position to avoid re-renders
  const facePositionRef = useRef<FacePosition | null>(null);

  const [isSegmentationReady, setIsSegmentationReady] = useState(false);
  const [isFaceDetectionReady, setIsFaceDetectionReady] = useState(false);
  const animationFrameRef = useRef<number>();
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Initialize Segmentation
  useEffect(() => {
    if (!isBackgroundRemovalEnabled || backgroundType === "none") {
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

      if (
        canvas.width !== videoElement.videoWidth ||
        canvas.height !== videoElement.videoHeight
      ) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
      }

      ctx.save();
      if (backgroundType === "blur") {
        ctx.filter = "blur(10px)";
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
      } else if (backgroundType === "image" && backgroundImageUrl) {
        const bgImage = new Image();
        bgImage.src = backgroundImageUrl;
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvas.width,
        canvas.height
      );
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    });

    segmentationRef.current = selfieSegmentation;
    setIsSegmentationReady(true);

    return () => {
      selfieSegmentation.close();
      segmentationRef.current = null;
      setIsSegmentationReady(false);
    };
  }, [
    isBackgroundRemovalEnabled,
    backgroundType,
    backgroundImageUrl,
    videoElement,
  ]);

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
          await segmentationRef.current.send({ image: videoElement });
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

              // Write to REF, do NOT trigger state update
              facePositionRef.current = {
                x: centerX,
                y: centerY,
                width: (bbox.width / videoElement.videoWidth) * 100,
                height: (bbox.height / videoElement.videoHeight) * 100,
              };

              // Broadcast position if needed (e.g. for grid sequencer)
              if (onUserPositionChange) {
                onUserPositionChange({ x: centerX, y: centerY });
              }
            } else {
              facePositionRef.current = null;
            }
          } else {
            facePositionRef.current = null;
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
    facePositionRef, // Returning REF
    isReady: isSegmentationReady || isFaceDetectionReady,
  };
};
