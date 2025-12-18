// src/hooks/useCameraEffects.ts
import { useEffect, useRef, useState } from "react";
import {
  FaceDetector,
  FilesetResolver,
  ImageSegmenter,
  ImageSegmenterResult,
} from "@mediapipe/tasks-vision";

interface UseCameraEffectsProps {
  videoElement: HTMLVideoElement | null;
  isSegmentationEnabled: boolean;
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
let imageSegmenter: ImageSegmenter | null = null;

const createVisionTask = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  return vision;
};

const initializeFaceDetector = async (vision: any) => {
  if (faceDetector) return faceDetector;
  try {
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

const initializeImageSegmenter = async (vision: any) => {
  if (imageSegmenter) return imageSegmenter;
  try {
    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
    return imageSegmenter;
  } catch (err) {
    console.error("[useCameraEffects] ImageSegmenter init failed:", err);
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
  const facePositionRef = useRef<FacePosition | null>(null);

  const [isSegmentationReady, setIsSegmentationReady] = useState(false);
  const [isFaceDetectionReady, setIsFaceDetectionReady] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Initialize Tasks
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const vision = await createVisionTask();

      if (isSegmentationEnabled && isMounted) {
        const segmenter = await initializeImageSegmenter(vision);
        if (segmenter && isMounted) setIsSegmentationReady(true);
      }

      if (isFaceTrackingEnabled && isMounted) {
        const detector = await initializeFaceDetector(vision);
        if (detector && isMounted) setIsFaceDetectionReady(true);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [isSegmentationEnabled, isFaceTrackingEnabled]);

  // Process Frames
  useEffect(() => {
    if (!videoElement) return;

    const processFrame = async () => {
      if (videoElement.readyState >= 2) {
        // Only process if time has advanced
        if (videoElement.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = videoElement.currentTime;
          const timestamp = performance.now();

          // 1. Segmentation
          if (isSegmentationEnabled && isSegmentationReady && imageSegmenter) {
            imageSegmenter.segmentForVideo(
              videoElement,
              timestamp,
              (result: ImageSegmenterResult) => {
                if (
                  canvasRef.current &&
                  result.confidenceMasks &&
                  result.confidenceMasks.length > 0
                ) {
                  const mask = result.confidenceMasks[0];
                  // If utilizing GPU (which we requested), getting data might require conversion
                  // But callbacks usually provide Float32Array on CPU in current JS API
                  // If use GPU backing, we need to handle it. 
                  // For simplicity in this integration, we assume standard array access.

                  // Note: mask.getAsFloat32Array() is the standard method
                  const maskData = mask.getAsFloat32Array();
                  const width = mask.width;
                  const height = mask.height;

                  // We need to draw this to our canvas
                  const canvas = canvasRef.current;
                  if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                  }

                  const ctx = canvas.getContext("2d");
                  if (ctx) {
                    // Create ImageData
                    const imageData = ctx.createImageData(width, height);
                    const data = imageData.data;

                    for (let i = 0; i < maskData.length; i++) {
                      // maskData is 0.0 to 1.0 probability of person
                      const val = Math.round(maskData[i] * 255);
                      const idx = i * 4;
                      // Encode into Red channel for the shader
                      data[idx] = val;     // R
                      data[idx + 1] = val; // G
                      data[idx + 2] = val; // B
                      data[idx + 3] = 255; // Alpha (always opaque, we use color for value)
                    }
                    ctx.putImageData(imageData, 0, 0);
                  }
                }
              }
            );
          }

          // 2. Face Detection
          if (
            isFaceTrackingEnabled &&
            isFaceDetectionReady &&
            faceDetector
          ) {
            const detections = faceDetector.detectForVideo(
              videoElement,
              timestamp
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
    isSegmentationEnabled,
    isFaceTrackingEnabled,
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