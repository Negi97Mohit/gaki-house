import React, { useEffect } from "react";
import { useSceneStore } from "../../store/useSceneStore";
import { useHardwareStore } from "../../store/useHardwareStore";
import { EmptySlot } from "./EmptySlot";
import { LiveVideo } from "./LiveVideo"; // NEW IMPORT

export const AbsoluteSceneWrapper = () => {
  const { activeSceneId, scenes } = useSceneStore();
  const activeScene = scenes.find((s) => s.id === activeSceneId);

  // NEW: Pull the hardware stream and the start function
  const { activeCameraStream, startCamera } = useHardwareStore();

  // Boot up the camera as soon as the studio layout mounts
  useEffect(() => {
    startCamera();
  }, [startCamera]);

  if (!activeScene) return null;

  return (
    <div className="relative w-full h-full bg-gray-950 overflow-hidden border-2 border-gray-800 rounded-xl aspect-video shadow-2xl">
      {activeScene.sources.map((source) => {
        const positionStyle: React.CSSProperties = source.position
          ? {
              position: "absolute",
              left: `${source.position.x}%`,
              top: `${source.position.y}%`,
              width: `${source.position.width}%`,
              height: `${source.position.height}%`,
            }
          : {
              position: "absolute",
              left: "10%",
              top: "10%",
              width: "80%",
              height: "80%",
            };

        return (
          <div
            key={source.id}
            style={positionStyle}
            className="group relative border border-gray-700/50 hover:border-blue-500 hover:z-50 transition-colors shadow-lg overflow-hidden bg-black"
          >
            <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-700">
              {source.name}
            </div>

            {source.type === "empty" && <EmptySlot />}

            {/* NEW: Render the physical stream if it exists, otherwise show a loading state */}
            {source.type === "camera" &&
              (activeCameraStream ? (
                <LiveVideo stream={activeCameraStream} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900 animate-pulse">
                  <span className="text-2xl mb-2">📷</span>
                  <span className="text-xs text-gray-400">
                    Initializing Camera...
                  </span>
                </div>
              ))}

            {source.type === "screen" && (
              <div className="w-full h-full flex flex-col items-center justify-center text-blue-500/80 bg-gray-900">
                <span className="text-2xl mb-2">💻</span>
                <span className="text-xs text-blue-600/60 mt-1">
                  Awaiting DisplayMedia
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
