// src/pages/index/components/MainCanvasArea.tsx
import React, { memo } from "react";
import { VideoCanvas } from "@/features/canvas/ui/CanvasView";
import { SceneState, SceneTransition } from "@/types/caption";
import { AmbientBackground } from "@/features/stream/ui/AmbientBackground";

// Memoize VideoCanvas to prevent unnecessary re-renders
const MemoizedVideoCanvas = memo(VideoCanvas);

// Partial scene type for canvas container compatibility
// Allows most fields to be optional but keeps required structure
export type PartialSceneState = Partial<SceneState> & { id?: string };

interface MainCanvasAreaProps {
  activeScene: PartialSceneState;
  previousScene: PartialSceneState | null;
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
      {/* Ambient Background - Always visible behind everything */}
      <AmbientBackground className="z-0" />
      
      {previousScene && previousSceneProps && (
        <div
          className="absolute inset-0 w-full h-full z-10"
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

      <div className="absolute inset-0 z-10">
        <MemoizedVideoCanvas
          key={`active-scene-canvas-${activeScene.id}`}
          {...activeSceneProps}
          {...globalCanvasProps}
          isTransitioningIn={isTransitioning}
          transition={activeTransition}
        />
      </div>
    </div>
  );
};
