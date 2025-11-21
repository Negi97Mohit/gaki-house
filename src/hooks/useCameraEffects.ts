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

// --- Helper to initialize the new detector ---
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

  const [facePosition, setFacePosition] = useState<FacePosition | null>(null);
  const [isSegmentationReady, setIsSegmentationReady] = useState(false);
  const [isFaceDetectionReady, setIsFaceDetectionReady] = useState(false);
  const animationFrameRef = useRef<number>();
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize MediaPipe Selfie Segmentation
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
      modelSelection: 1,
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

      // --- Calculate User Centroid (Segment Fallback) ---
      // Only run this if Face Tracking is OFF (to avoid double reporting)
      if (onUserPositionChange && !isFaceTrackingEnabled) {
        if (!analysisCanvasRef.current) {
          analysisCanvasRef.current = document.createElement("canvas");
          analysisCanvasRef.current.width = 64;
          analysisCanvasRef.current.height = 48;
        }
        const ac = analysisCanvasRef.current;
        const actx = ac.getContext("2d", { willReadFrequently: true });

        if (actx) {
          actx.clearRect(0, 0, ac.width, ac.height);
          actx.drawImage(results.segmentationMask, 0, 0, ac.width, ac.height);

          const frame = actx.getImageData(0, 0, ac.width, ac.height);
          const data = frame.data;
          let sumX = 0;
          let sumY = 0;
          let count = 0;

          for (let i = 3; i < data.length; i += 4) {
            const alpha = data[i];
            if (alpha > 100) {
              const pixelIdx = (i - 3) / 4;
              const x = pixelIdx % ac.width;
              const y = Math.floor(pixelIdx / ac.width);
              sumX += x;
              sumY += y;
              count++;
            }
          }

          if (count > 20) {
            const centerX = (sumX / count / ac.width) * 100;
            const centerY = (sumY / count / ac.height) * 100;
            onUserPositionChange({ x: centerX, y: centerY });
          }
        }
      }
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
    isFaceTrackingEnabled, // Added dependency
  ]);

  // Initialize MediaPipe Face Detector
  useEffect(() => {
    if (!isFaceTrackingEnabled) {
      if (faceDetectorRef.current) {
        // We don't close shared detector, just stop using it locally
        // faceDetectorRef.current.close();
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
    };
  }, [isFaceTrackingEnabled]);

  // Process video frames
  useEffect(() => {
    if (!videoElement) return;

    let lastVideoTime = -1;

    const processFrame = async () => {
      if (videoElement.readyState >= 2) {
        const currentTime = videoElement.currentTime;

        // Run segmentation (only if enabled)
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
              // Calculate Center Percentage
              const centerX =
                ((bbox.originX + bbox.width / 2) / videoElement.videoWidth) *
                100;
              const centerY =
                ((bbox.originY + bbox.height / 2) / videoElement.videoHeight) *
                100;

              setFacePosition({
                x: centerX,
                y: centerY,
                width: (bbox.width / videoElement.videoWidth) * 100,
                height: (bbox.height / videoElement.videoHeight) * 100,
              });

              // --- FIX: Broadcast Position for Sequencer ---
              if (onUserPositionChange) {
                onUserPositionChange({ x: centerX, y: centerY });
              }
              // ---------------------------------------------
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
  }, [
    videoElement,
    isSegmentationReady,
    isFaceDetectionReady,
    onUserPositionChange,
  ]);

  return {
    processedCanvas: canvasRef.current,
    facePosition,
    isReady: isSegmentationReady || isFaceDetectionReady,
  };
};
