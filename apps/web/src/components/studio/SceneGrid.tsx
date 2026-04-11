import React from "react";
import { useSceneStore } from "../../store/useSceneStore";
import { EmptySlot } from "./EmptySlot";

export const SceneGrid = () => {
  const { activeSceneId, scenes } = useSceneStore();

  const activeScene = scenes.find((s) => s.id === activeSceneId);

  if (!activeScene) return null;

  // Determine grid columns based on source count for a clean responsive look
  const gridClass =
    activeScene.sources.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={`grid gap-4 w-full h-full p-4 ${gridClass}`}>
      {activeScene.sources.map((source) => {
        if (source.type === "empty") {
          return <EmptySlot key={source.id} />;
        }

        if (source.type === "camera") {
          return (
            <div
              key={source.id}
              className="w-full h-full bg-black rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center"
            >
              <span className="text-gray-400">Live Camera Feed Goes Here</span>
            </div>
          );
        }

        if (source.type === "screen") {
          return (
            <div
              key={source.id}
              className="w-full h-full bg-black rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center"
            >
              <span className="text-blue-400">Screen Share Feed Goes Here</span>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
