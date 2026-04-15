import React, { useMemo, useEffect } from 'react';
import { InteractionManager } from './InteractionManager';
import { CoordinateSync } from './CoordinateSync';

interface DesktopInteractionEngineProps {
  selectedIds: string[];
  containerSize: { width: number; height: number };
  viewportScale?: number;
  onOverlayLayoutChange?: (id: string, key: "position" | "size" | "rotation", value: any) => void;
  // This kernel hook mimics what OBS uses for IPC bridging
  updateOverlayNative?: (id: string, bounds: any) => void;
}

export const DesktopInteractionEngine: React.FC<DesktopInteractionEngineProps> = ({
  selectedIds,
  containerSize,
  viewportScale = 1,
  onOverlayLayoutChange,
  updateOverlayNative,
}) => {
  // We use the new async CoordinateSync for Desktop!
  const syncEngine = useMemo(() => {
    return new CoordinateSync((id, key, value) => {
      if (updateOverlayNative) {
        // Native OBS layout format might expect { position: {x,y}, size: {width,height}, rotation }
        // For simplicity, we pass an object with just the changed key, which OBS handles via partial updates
        updateOverlayNative(id, { [key]: value });
      }
    });
  }, [updateOverlayNative]);
  
  // Example "dual-path system" as requested in Phase 4 planning:
  // We want immediately responsive smooth visuals via InteractionManager,
  // and async RAF-throttled synced IPC packets.

  return (
    <InteractionManager
      selectedIds={selectedIds}
      containerSize={containerSize}
      viewportScale={viewportScale}
      onOverlayLayoutChange={onOverlayLayoutChange}
      // This guarantees 60FPS UI + throttled 60FPS stream to backend
      onOverlayLayoutSync={(id, key, value) => {
        syncEngine.enqueueUpdate(id, key, value);
      }}
    />
  );
};
