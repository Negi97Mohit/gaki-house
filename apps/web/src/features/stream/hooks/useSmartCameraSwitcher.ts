import { useEffect, useRef, useState } from "react";
import { SceneState } from "@gaki/core/types/caption";
import { toast } from "sonner";

interface UseSmartCameraSwitcherProps {
  scenes: SceneState[];
  activeSceneId: string;
  onSceneSelect: (sceneId: string) => void;
  isEnabled: boolean;
  remoteStream?: MediaStream | null;
  videoDevices?: MediaDeviceInfo[];
}

interface CameraStream {
  deviceId: string;
  stream: MediaStream;
  videoElement: HTMLVideoElement;
  isActive: boolean;
  landmarker: any; // Each camera gets its own landmarker instance
}

// Iris landmark indices in MediaPipe FaceLandmarker
const LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];
const RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];

// Eye corner landmarks for gaze calculation
const LEFT_EYE_OUTER = 33;
const LEFT_EYE_INNER = 133;
const RIGHT_EYE_OUTER = 362;
const RIGHT_EYE_INNER = 263;

/**
 * Calculates if the user is looking at the camera based on iris position.
 * Returns a value between 0 (not looking) and 1 (directly looking).
 */
function calculateGazeScore(landmarks: any[]): number {
  if (!landmarks || landmarks.length < 478) return 0;

  // Calculate left iris center
  let leftIrisCenterX = 0;
  for (const idx of LEFT_IRIS_INDICES) {
    leftIrisCenterX += landmarks[idx].x;
  }
  leftIrisCenterX /= LEFT_IRIS_INDICES.length;

  // Calculate right iris center
  let rightIrisCenterX = 0;
  for (const idx of RIGHT_IRIS_INDICES) {
    rightIrisCenterX += landmarks[idx].x;
  }
  rightIrisCenterX /= RIGHT_IRIS_INDICES.length;

  // Get eye corner positions
  const leftOuter = landmarks[LEFT_EYE_OUTER].x;
  const leftInner = landmarks[LEFT_EYE_INNER].x;
  const rightOuter = landmarks[RIGHT_EYE_OUTER].x;
  const rightInner = landmarks[RIGHT_EYE_INNER].x;

  // Calculate normalized iris position
  const leftEyeWidth = Math.abs(leftInner - leftOuter);
  const rightEyeWidth = Math.abs(rightInner - rightOuter);

  if (leftEyeWidth < 0.001 || rightEyeWidth < 0.001) return 0;

  const leftIrisPos = (leftIrisCenterX - leftOuter) / leftEyeWidth;
  const rightIrisPos = (rightIrisCenterX - rightOuter) / rightEyeWidth;
  const avgIrisPos = (leftIrisPos + rightIrisPos) / 2;

  const centeredness = 1 - Math.abs(avgIrisPos - 0.5) * 2;

  if (avgIrisPos < 0.3 || avgIrisPos > 0.7) {
    return 0;
  }

  return Math.max(0, centeredness);
}

function getSceneDeviceId(
  scene: SceneState,
  videoDevices: MediaDeviceInfo[]
): string | null {
  if (scene.selectedVideoDevice) {
    return scene.selectedVideoDevice;
  }
  if (videoDevices.length > 0) {
    return videoDevices[0].deviceId;
  }
  return null;
}

// Helper to create a new FaceLandmarker instance
async function createLandmarker(): Promise<any> {
  const { FaceLandmarker, FilesetResolver } = await import(
    "@mediapipe/tasks-vision"
  );

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}

export const useSmartCameraSwitcher = ({
  scenes,
  activeSceneId,
  onSceneSelect,
  isEnabled,
  remoteStream,
  videoDevices = [],
}: UseSmartCameraSwitcherProps) => {
  const [isDetectorReady, setIsDetectorReady] = useState(false);
  const streamsRef = useRef<Map<string, CameraStream>>(new Map());
  const lastSwitchTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number>(0);

  // Track timestamps per camera to ensure monotonic increase
  const lastTimestampRef = useRef<Map<string, number>>(new Map());

  // Map device IDs to scene IDs
  const deviceToSceneRef = useRef<Map<string, string>>(new Map());

  // Scoring map
  const focusScoresRef = useRef<Map<string, number>>(new Map());

  // 1. Manage Streams and Landmarkers for all unique cameras
  useEffect(() => {
    if (!isEnabled) {
      // Cleanup
      streamsRef.current.forEach((s) => {
        if (s.deviceId !== "remote-peer") {
          s.stream.getTracks().forEach((t) => t.stop());
        }
        if (s.landmarker?.close) {
          s.landmarker.close();
        }
      });
      streamsRef.current.clear();
      focusScoresRef.current.clear();
      deviceToSceneRef.current.clear();
      lastTimestampRef.current.clear();
      setIsDetectorReady(false);
      return;
    }

    const uniqueDevices = new Map<string, string>();
    scenes.forEach((scene) => {
      const deviceId = getSceneDeviceId(scene, videoDevices);
      if (deviceId && !uniqueDevices.has(deviceId)) {
        uniqueDevices.set(deviceId, scene.id);
      }
    });

    deviceToSceneRef.current = uniqueDevices;

    console.log(
      "[SmartSwitch] 🔍 Devices to track:",
      Array.from(uniqueDevices.keys()).map((d) => d.substring(0, 8) + "...")
    );

    const setupStreams = async () => {
      // Remove unused streams
      for (const [deviceId, camera] of streamsRef.current.entries()) {
        if (!uniqueDevices.has(deviceId)) {
          console.log(`[SmartSwitch] 🛑 Stopping: ${deviceId.substring(0, 8)}...`);
          if (deviceId !== "remote-peer") {
            camera.stream.getTracks().forEach((t) => t.stop());
          }
          if (camera.landmarker?.close) {
            camera.landmarker.close();
          }
          streamsRef.current.delete(deviceId);
          focusScoresRef.current.delete(deviceId);
          lastTimestampRef.current.delete(deviceId);
        }
      }

      // Add new streams with their own landmarker
      for (const [deviceId] of uniqueDevices) {
        if (!streamsRef.current.has(deviceId)) {
          try {
            let stream: MediaStream | null = null;

            if (deviceId === "remote-peer") {
              if (remoteStream) {
                stream = remoteStream;
                console.log("[SmartSwitch] 📱 Found Remote Stream");
              }
            } else {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: { exact: deviceId },
                  width: 640,
                  height: 480,
                },
                audio: false,
              });
              console.log(`[SmartSwitch] ✅ Camera: ${deviceId.substring(0, 8)}...`);
            }

            if (stream) {
              const video = document.createElement("video");
              video.srcObject = stream;
              video.muted = true;
              await video.play().catch(() => { });

              // Create dedicated landmarker for this camera
              const landmarker = await createLandmarker();

              streamsRef.current.set(deviceId, {
                deviceId,
                stream,
                videoElement: video,
                isActive: true,
                landmarker,
              });

              lastTimestampRef.current.set(deviceId, 0);

              console.log(`[SmartSwitch] 🔌 Ready: ${deviceId.substring(0, 8)}...`);
            }
          } catch (e) {
            console.warn(`[SmartSwitch] Could not setup ${deviceId.substring(0, 8)}...`, e);
          }
        }
      }

      if (streamsRef.current.size > 0) {
        setIsDetectorReady(true);
        console.log("[SmartSwitch] ✅ Eye Gaze Detection Ready");
      }
    };

    setupStreams();
  }, [isEnabled, scenes, remoteStream, videoDevices]);

  // 2. Detection Loop - Process one camera per frame to avoid conflicts
  useEffect(() => {
    if (!isEnabled || !isDetectorReady) {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      return;
    }

    const cameraIds = Array.from(streamsRef.current.keys());
    let currentCameraIndex = 0;

    const detect = async () => {
      if (cameraIds.length === 0) {
        frameIdRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = Date.now();

      // Process one camera per frame (round-robin) to avoid timestamp conflicts
      const deviceId = cameraIds[currentCameraIndex];
      currentCameraIndex = (currentCameraIndex + 1) % cameraIds.length;

      const camera = streamsRef.current.get(deviceId);
      if (!camera) {
        frameIdRef.current = requestAnimationFrame(detect);
        return;
      }

      const video = camera.videoElement;
      const landmarker = camera.landmarker;

      if (video.readyState >= 2 && !video.paused && landmarker) {
        try {
          // Ensure strictly increasing timestamp for this camera
          let timestamp = now;
          const lastTs = lastTimestampRef.current.get(deviceId) || 0;
          if (timestamp <= lastTs) {
            timestamp = lastTs + 1;
          }
          lastTimestampRef.current.set(deviceId, timestamp);

          const result = landmarker.detectForVideo(video, timestamp);

          if (result.faceLandmarks && result.faceLandmarks.length > 0) {
            const landmarks = result.faceLandmarks[0];
            const gazeScore = calculateGazeScore(landmarks);

            const sceneId = deviceToSceneRef.current.get(deviceId);
            const sceneName = scenes.find((s) => s.id === sceneId)?.name;

            if (gazeScore > 0.5) {
              const currentScore =
                (focusScoresRef.current.get(deviceId) || 0) + gazeScore;
              focusScoresRef.current.set(deviceId, currentScore);

              console.log(
                `[SmartSwitch] 👁️ ${sceneName} - Gaze: ${gazeScore.toFixed(2)}, Total: ${currentScore.toFixed(2)}`
              );

              // Check if we should switch
              if (currentScore > 5 && now - lastSwitchTimeRef.current > 2000) {
                const targetScene = scenes.find((s) => s.id === sceneId);
                if (targetScene && targetScene.id !== activeSceneId) {
                  console.log(`[SmartSwitch] 🎬 CUT TO: ${targetScene.name}`);
                  toast.success(`Auto-switched to ${targetScene.name}`, {
                    duration: 1500,
                  });
                  onSceneSelect(targetScene.id);
                  lastSwitchTimeRef.current = now;
                  focusScoresRef.current.clear();
                }
              }
            } else {
              const currentScore = focusScoresRef.current.get(deviceId) || 0;
              focusScoresRef.current.set(deviceId, Math.max(0, currentScore - 0.5));
            }
          } else {
            const currentScore = focusScoresRef.current.get(deviceId) || 0;
            focusScoresRef.current.set(deviceId, Math.max(0, currentScore - 0.3));
          }
        } catch (e) {
          // Silently handle errors - the landmarker may need reset
          console.warn(`[SmartSwitch] Detection error:`, e);
        }
      }

      frameIdRef.current = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [isEnabled, isDetectorReady, scenes, activeSceneId, onSceneSelect]);

  return { isDetectorReady };
};
