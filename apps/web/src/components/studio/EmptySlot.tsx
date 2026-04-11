import React from "react";
import { Plus, Camera, MonitorUp } from "lucide-react";
import { useSceneStore, SourceType } from "../../store/useSceneStore";

export const EmptySlot = () => {
  const addSource = useSceneStore((state) => state.addSourceToActiveScene);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-gray-600 rounded-xl bg-gray-900/50 hover:bg-gray-800/50 transition-colors group">
      <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Plus className="w-8 h-8" />
          <span className="font-medium">Empty Slot</span>
        </div>
      </div>

      {/* Hover Menu */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => addSource("camera")}
          className="flex flex-col items-center gap-2 p-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Camera className="w-6 h-6" />
          <span className="text-sm">Camera</span>
        </button>
        <button
          onClick={() => addSource("screen")}
          className="flex flex-col items-center gap-2 p-4 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <MonitorUp className="w-6 h-6" />
          <span className="text-sm">Screen</span>
        </button>
      </div>
    </div>
  );
};
