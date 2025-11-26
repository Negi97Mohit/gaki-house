// src/pages/index/components/MainCanvasArea.tsx
import React, { memo } from "react";
import { VideoCanvas } from "@/components/VideoCanvas";
import { SceneState, SceneTransition } from "@/types/caption";

// Memoize VideoCanvas to prevent unnecessary re-renders
const MemoizedVideoCanvas = memo(VideoCanvas);

interface MainCanvasAreaProps {
  activeScene: SceneState;
  previousScene: SceneState | null;
  activeSceneProps: any;
  previousSceneProps: any;
  globalCanvasProps: any;
  isTransitioning: boolean;
  activeTransition: SceneTransition | null;
}

export const MainCanvasArea: React.FC<MainCanvasAreaProps> = ({
  activeScene,
  previousScene,
  activeSceneProps,
  previousSceneProps,
  globalCanvasProps,
  isTransitioning,
  activeTransition,
}) => {
  return (
    <div className="flex-1 relative overflow-hidden">
      {previousScene && previousSceneProps && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ display: isTransitioning ? "block" : "none" }}
        >
          <MemoizedVideoCanvas
            key="previous-scene-canvas"
            {...previousSceneProps}
            {...globalCanvasProps}
            isAudioOn={false}
            captionsEnabled={false}
            isTransitioningOut={isTransitioning}
            transition={activeTransition}
          />
        </div>
      )}

      <MemoizedVideoCanvas
        key="active-scene-canvas"
        {...activeSceneProps}
        {...globalCanvasProps}
        isTransitioningIn={isTransitioning}
        transition={activeTransition}
      />
    </div>
  );
};
