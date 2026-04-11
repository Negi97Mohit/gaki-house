// src/hooks/useAutoFraming.ts
import { useEffect, useRef, useState } from "react";

interface FaceDetection {
  boundingBox: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
  categories: Array<{ score: number }>;
}

interface AutoFramingResult {
  transform: {
    scale: number;
    translateX: number;
    translateY: number;
  };
  isDetecting: boolean;
  confidence: number | null;
  error: string | null;
}

export function useAutoFraming(
  videoElement: HTMLVideoElement | null,
  isEnabled: boolean,
  zoomSensitivity: number = 1.0,
  trackingSpeed: number = 0.3
): AutoFramingResult {
  const [isDetecting, setIsDetecting] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const faceDetectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const lastVideoTimeRef = useRef(-1);

  const currentScaleRef = useRef(1);
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);

  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  // Initialize MediaPipe Face Detector
  useEffect(() => {
    let mounted = true;

    async function initDetector() {
      if (!isEnabled) return;

      try {
        // Dynamically import MediaPipe
        const { FaceDetector, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        if (!mounted) return;

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );

        if (!mounted) return;

        faceDetectorRef.current = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });

        setIsDetecting(true);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize face detector:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize");
        setIsDetecting(false);
      }
    }

    initDetector();

    return () => {
      mounted = false;
      faceDetectorRef.current = null;
    };
  }, [isEnabled]);

  // Detect faces and update transform
  useEffect(() => {
    if (!isEnabled || !videoElement || !faceDetectorRef.current) {
      // Reset transform when disabled
      if (!isEnabled) {
        currentScaleRef.current = 1;
        currentXRef.current = 0;
        currentYRef.current = 0;
        setTransform({ scale: 1, translateX: 0, translateY: 0 });
      }
      return;
    }

    let active = true;

    function detectFace() {
      if (!active || !videoElement || !faceDetectorRef.current) return;

      const currentTime = videoElement.currentTime;

      if (
        currentTime !== lastVideoTimeRef.current &&
        videoElement.videoWidth > 0
      ) {
        lastVideoTimeRef.current = currentTime;

        try {
          const detections = faceDetectorRef.current.detectForVideo(
            videoElement,
            performance.now()
          );

          if (detections?.detections?.length > 0) {
            const detection: FaceDetection = detections.detections[0];
            const box = detection.boundingBox;

            // Update confidence
            setConfidence(detection.categories[0].score);

            // Calculate face center
            const faceCenterX = box.originX + box.width / 2;
            const faceCenterY = box.originY + box.height / 2;
            const videoCenterX = videoElement.videoWidth / 2;
            const videoCenterY = videoElement.videoHeight / 2;

            // Calculate offset from center
            const offsetX =
              (videoCenterX - faceCenterX) / videoElement.videoWidth;
            const offsetY =
              (videoCenterY - faceCenterY) / videoElement.videoHeight;

            const targetX = offsetX * 50 * trackingSpeed;
            const targetY = offsetY * 50 * trackingSpeed;

            // Smooth transition
            currentXRef.current +=
              (targetX - currentXRef.current) * trackingSpeed;
            currentYRef.current +=
              (targetY - currentYRef.current) * trackingSpeed;

            // Auto-zoom based on face size
            const faceSize = Math.max(box.width, box.height);
            const targetSize =
              Math.max(videoElement.videoWidth, videoElement.videoHeight) *
              0.35;
            const targetScale = Math.min(
              1.8,
              Math.max(1, (targetSize / faceSize) * zoomSensitivity)
            );

            currentScaleRef.current +=
              (targetScale - currentScaleRef.current) * 0.05;

            setTransform({
              scale: currentScaleRef.current,
              translateX: currentXRef.current,
              translateY: currentYRef.current,
            });
          } else {
            // No face detected - smoothly return to normal
            setConfidence(null);
            currentScaleRef.current += (1 - currentScaleRef.current) * 0.05;
            currentXRef.current *= 0.9;
            currentYRef.current *= 0.9;

            setTransform({
              scale: currentScaleRef.current,
              translateX: currentXRef.current,
              translateY: currentYRef.current,
            });
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectFace);
    }

    detectFace();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isEnabled, videoElement, zoomSensitivity, trackingSpeed]);

  return {
    transform,
    isDetecting,
    confidence,
    error,
  };
}
