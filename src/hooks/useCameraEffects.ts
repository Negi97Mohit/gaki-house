// src/hooks/useCameraEffects.ts
import { useEffect, useRef, useState } from 'react';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { FaceDetection } from '@mediapipe/face_detection';

interface UseCameraEffectsProps {
  videoElement: HTMLVideoElement | null;
  isBackgroundRemovalEnabled: boolean;
  backgroundType: 'none' | 'blur' | 'image';
  backgroundImageUrl?: string;
  isFaceTrackingEnabled: boolean;
}

interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useCameraEffects = ({
  videoElement,
  isBackgroundRemovalEnabled,
  backgroundType,
  backgroundImageUrl,
  isFaceTrackingEnabled,
}: UseCameraEffectsProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentationRef = useRef<SelfieSegmentation | null>(null);
  const faceDetectionRef = useRef<FaceDetection | null>(null);
  const [facePosition, setFacePosition] = useState<FacePosition | null>(null);
  const [isSegmentationReady, setIsSegmentationReady] = useState(false);
  const [isFaceDetectionReady, setIsFaceDetectionReady] = useState(false);
  const animationFrameRef = useRef<number>();

  // Initialize MediaPipe Selfie Segmentation
  useEffect(() => {
    if (!isBackgroundRemovalEnabled || backgroundType === 'none') {
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
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      ctx.save();

      // Draw background
      if (backgroundType === 'blur') {
        ctx.filter = 'blur(10px)';
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';
      } else if (backgroundType === 'image' && backgroundImageUrl) {
        const bgImage = new Image();
        bgImage.src = backgroundImageUrl;
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Draw segmentation mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

      // Draw the person
      ctx.globalCompositeOperation = 'source-over';
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
  }, [isBackgroundRemovalEnabled, backgroundType, backgroundImageUrl]);

  // Initialize MediaPipe Face Detection
  useEffect(() => {
    if (!isFaceTrackingEnabled) {
      setIsFaceDetectionReady(false);
      return;
    }

    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: 'short',
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results) => {
      if (results.detections && results.detections.length > 0) {
        const detection = results.detections[0];
        const bbox = detection.boundingBox;
        
        setFacePosition({
          x: bbox.xCenter * 100,
          y: bbox.yCenter * 100,
          width: bbox.width * 100,
          height: bbox.height * 100,
        });
      }
    });

    faceDetectionRef.current = faceDetection;
    setIsFaceDetectionReady(true);

    return () => {
      faceDetection.close();
      faceDetectionRef.current = null;
      setIsFaceDetectionReady(false);
    };
  }, [isFaceTrackingEnabled]);

  // Process video frames
  useEffect(() => {
    if (!videoElement) return;

    const processFrame = async () => {
      if (videoElement.readyState >= 2) {
        if (isSegmentationReady && segmentationRef.current) {
          await segmentationRef.current.send({ image: videoElement });
        }
        
        if (isFaceDetectionReady && faceDetectionRef.current) {
          await faceDetectionRef.current.send({ image: videoElement });
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
  }, [videoElement, isSegmentationReady, isFaceDetectionReady]);

  return {
    processedCanvas: canvasRef.current,
    facePosition,
    isReady: isSegmentationReady || isFaceDetectionReady,
  };
};
