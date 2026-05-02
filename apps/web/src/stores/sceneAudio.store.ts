import { create } from "zustand";
import { SceneAudioTrack } from "@gaki/core/types/caption";

interface SceneInfo {
  id: string;
  name: string;
}

interface SceneAudioState {
  /** All audio tracks (global pool, filtered by assignedSceneIds) */
  tracks: SceneAudioTrack[];
  /** Scene metadata for assignment UI */
  scenes: SceneInfo[];
  /** Currently active scene ID */
  activeSceneId: string;

  // Actions
  setScenes: (scenes: SceneInfo[]) => void;
  setActiveSceneId: (id: string) => void;
  addTrack: (track: SceneAudioTrack) => void;
  updateTrack: (id: string, patch: Partial<SceneAudioTrack>) => void;
  removeTrack: (id: string) => void;

  /** Get tracks visible in the current active scene */
  getTracksForScene: (sceneId: string) => SceneAudioTrack[];
}

export const useSceneAudioStore = create<SceneAudioState>((set, get) => ({
  tracks: [],
  scenes: [],
  activeSceneId: "",

  setScenes: (scenes) => set({ scenes }),
  setActiveSceneId: (id) => set({ activeSceneId: id }),

  addTrack: (track) =>
    set((s) => ({ tracks: [...s.tracks, track] })),

  updateTrack: (id, patch) =>
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  removeTrack: (id) =>
    set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) })),

  getTracksForScene: (sceneId) => {
    const { tracks } = get();
    return tracks.filter(
      (t) => t.assignedSceneIds.length === 0 || t.assignedSceneIds.includes(sceneId)
    );
  },
}));
