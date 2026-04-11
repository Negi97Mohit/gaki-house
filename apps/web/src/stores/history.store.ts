import { create } from "zustand";
import type { ObsOverlayState } from "@caption-cam/core/types/caption";

const DEFAULT_MAX = 50;

function cloneSnapshot(s: ObsOverlayState[]): ObsOverlayState[] {
  // structuredClone is available in modern Electron/Chromium and preserves numbers/strings/objects.
  // Fallback keeps it serializable.
  try {
    // eslint-disable-next-line no-undef
    return structuredClone(s);
  } catch {
    return JSON.parse(JSON.stringify(s)) as ObsOverlayState[];
  }
}

export interface HistoryState {
  past: ObsOverlayState[][];
  future: ObsOverlayState[][];
  max: number;

  canUndo: boolean;
  canRedo: boolean;

  setMax: (max: number) => void;
  clear: () => void;

  /**
   * Push a snapshot of overlays BEFORE a mutating action.
   * Do not call this on every drag tick   call once on drag/resize start or end.
   */
  pushHistory: (current: ObsOverlayState[]) => void;

  /** Returns the restored snapshot, or null if no-op */
  undo: (current: ObsOverlayState[]) => ObsOverlayState[] | null;
  /** Returns the restored snapshot, or null if no-op */
  redo: (current: ObsOverlayState[]) => ObsOverlayState[] | null;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  max: DEFAULT_MAX,

  canUndo: false,
  canRedo: false,

  setMax: (max) =>
    set((state) => {
      const safeMax = Math.max(1, Math.floor(max));
      const trimmedPast =
        state.past.length > safeMax
          ? state.past.slice(state.past.length - safeMax)
          : state.past;
      return {
        max: safeMax,
        past: trimmedPast,
        canUndo: trimmedPast.length > 0,
      };
    }),

  clear: () =>
    set({
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    }),

  pushHistory: (current) =>
    set((state) => {
      const nextPast = [...state.past, cloneSnapshot(current)];
      const trimmedPast =
        nextPast.length > state.max
          ? nextPast.slice(nextPast.length - state.max)
          : nextPast;
      return {
        past: trimmedPast,
        future: [],
        canUndo: trimmedPast.length > 0,
        canRedo: false,
      };
    }),

  undo: (current) => {
    const { past, future } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    const newFuture = [cloneSnapshot(current), ...future];
    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: newFuture.length > 0,
    });
    return cloneSnapshot(previous);
  },

  redo: (current) => {
    const { past, future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, cloneSnapshot(current)];
    const trimmedPast =
      newPast.length > get().max
        ? newPast.slice(newPast.length - get().max)
        : newPast;
    set({
      past: trimmedPast,
      future: newFuture,
      canUndo: trimmedPast.length > 0,
      canRedo: newFuture.length > 0,
    });
    return cloneSnapshot(next);
  },
}));

