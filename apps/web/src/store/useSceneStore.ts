import { create } from "zustand";

export type SourceType = "camera" | "screen" | "empty" | "unsupported";

export interface SceneSource {
  id: string;
  name: string;
  type: SourceType;
  // This will hold our translated OBS coordinates (in percentages)
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Scene {
  id: string;
  name: string;
  sources: SceneSource[];
}

interface SceneStore {
  activeSceneId: string | null;
  scenes: Scene[];
  setActiveScene: (sceneId: string) => void;
  addSourceToActiveScene: (type: SourceType) => void;
  removeSource: (sourceId: string) => void;
  loadScenes: (scenes: Scene[], setAsActive?: string) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  activeSceneId: "default-scene",
  scenes: [
    {
      id: "default-scene",
      name: "Main Layout",
      sources: [
        { id: "slot-1", name: "Camera Slot", type: "empty" },
        { id: "slot-2", name: "Screen Slot", type: "empty" },
      ],
    },
  ],

  setActiveScene: (sceneId) => set({ activeSceneId: sceneId }),

  addSourceToActiveScene: (type) =>
    set((state) => {
      const activeSceneIndex = state.scenes.findIndex(
        (s) => s.id === state.activeSceneId,
      );
      if (activeSceneIndex === -1) return state;

      const updatedScenes = [...state.scenes];
      const firstEmptyIndex = updatedScenes[activeSceneIndex].sources.findIndex(
        (s) => s.type === "empty",
      );

      const newSource: SceneSource = {
        id: `source-${Date.now()}`,
        name: `New ${type}`,
        type,
      };

      // Replace an empty slot if one exists, otherwise append to the end
      if (firstEmptyIndex !== -1) {
        updatedScenes[activeSceneIndex].sources[firstEmptyIndex] = newSource;
      } else {
        updatedScenes[activeSceneIndex].sources.push(newSource);
      }

      return { scenes: updatedScenes };
    }),

  removeSource: (sourceId) =>
    set((state) => {
      const activeSceneIndex = state.scenes.findIndex(
        (s) => s.id === state.activeSceneId,
      );
      if (activeSceneIndex === -1) return state;

      const updatedScenes = [...state.scenes];
      // Keep everything except the source we want to remove
      updatedScenes[activeSceneIndex].sources = updatedScenes[
        activeSceneIndex
      ].sources.filter((s) => s.id !== sourceId);

      return { scenes: updatedScenes };
    }),

  loadScenes: (newScenes, setAsActive) =>
    set(() => ({
      scenes: newScenes,
      // Default to the explicitly requested scene, or the first one in the new array
      activeSceneId: setAsActive || newScenes[0]?.id || null,
    })),
}));
