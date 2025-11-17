// src/hooks/useCameraEffects.ts
import { useEffect, useRef, useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
// --- ADDED: Imports for new FaceDetector ---
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
// --- REMOVED: Old FaceDetection ---

interface UseCameraEffectsProps {
  videoElement: HTMLVideoElement | null;
  isBackgroundRemovalEnabled: boolean;
  backgroundType: "none" | "blur" | "image";
  backgroundImageUrl?: string;
  isFaceTrackingEnabled: boolean; // This prop will now enable *both* detection types
}

interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// --- Helper to initialize the new detector ---
let faceDetector: FaceDetector | null = null;
// --- THIS IS THE CORRECTED LINE ---
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
    console.log("[useCameraEffects] FaceDetector initialized successfully.");
    return faceDetector;
  } catch (err) {
    console.error(
      "[useCameraEffects] Face detector initialization error:",
      err
    );
    return null;
  }
};
// --- End Helper ---

export const useCameraEffects = ({
  videoElement,
  isBackgroundRemovalEnabled,
  backgroundType,
  backgroundImageUrl,
  isFaceTrackingEnabled, // This will enable detection
}: UseCameraEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  // --- MODIFIED: Ref for new detector type ---
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  // --- END MODIFIED ---
  const [facePosition, setFacePosition] = useState<FacePosition | null>(null);
  const [isSegmentationReady, setIsSegmentationReady] = useState(false);
  const [isFaceDetectionReady, setIsFaceDetectionReady] = useState(false);
  const animationFrameRef = useRef<number>();

  // Initialize MediaPipe Selfie Segmentation (No changes)
  useEffect(() => {
    if (!isBackgroundRemovalEnabled || backgroundType === "none") {
      setIsSegmentationReady(false);
      return;
    }

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    selfieSegmentation.setOptions({
      modelSelection: 1, // 0 for general, 1 for landscape
      selfieMode: true,
    });

    selfieSegmentation.onResults((results) => {
      if (!canvasRef.current || !videoElement) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      ctx.save();

      // Draw background
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

      // Draw segmentation mask
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Draw the person
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
  ]); // Added videoElement

  // --- MODIFIED: Initialize MediaPipe Face Detector (new API) ---
  useEffect(() => {
    if (!isFaceTrackingEnabled) {
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
        faceDetectorRef.current = null;
      }
      setIsFaceDetectionReady(false);
      return;
    }

    let isMounted = true;
    const init = async () => {
      const detector = await initializeFaceDetector();
      if (isMounted && detector) {
        faceDetectorRef.current = detector;
        setIsFaceDetectionReady(true);
      }
    };

    init();

    return () => {
      isMounted = false;
      // Note: We don't close the shared detector here,
      // it will be closed if isFaceTrackingEnabled becomes false.
    };
  }, [isFaceTrackingEnabled]);
  // --- END MODIFIED ---

  // --- MODIFIED: Process video frames with new FaceDetector ---
  useEffect(() => {
    if (!videoElement) return;

    let lastVideoTime = -1;

    const processFrame = async () => {
      if (videoElement.readyState >= 2) {
        const currentTime = videoElement.currentTime;

        // Run segmentation
        if (isSegmentationReady && segmentationRef.current) {
          await segmentationRef.current.send({ image: videoElement });
        }

        // Run face detection (if ready and new frame)
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
              // --- CONVERT PIXELS TO 0-100 PERCENTAGE ---
              // This is what CameraRenderer expects
              setFacePosition({
                x:
                  ((bbox.originX + bbox.width / 2) / videoElement.videoWidth) *
                  100,
                y:
                  ((bbox.originY + bbox.height / 2) /
                    videoElement.videoHeight) *
                  100,
                width: (bbox.width / videoElement.videoWidth) * 100,
                height: (bbox.height / videoElement.videoHeight) * 100,
              });
            } else {
              setFacePosition(null);
            }
          } else {
            setFacePosition(null);
          }
        } else if (!isFaceDetectionReady) {
          setFacePosition(null);
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement, isSegmentationReady, isFaceDetectionReady]); // Removed dependencies, they are handled by their own useEffects

  return {
    processedCanvas: canvasRef.current,
    facePosition,
    isReady: isSegmentationReady || isFaceDetectionReady,
  };
};
