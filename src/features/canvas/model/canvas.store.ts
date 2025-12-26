import { create } from 'zustand';

export interface CanvasState {
    viewport: { x: number; y: number; scale: number };
    sceneSize: { width: number; height: number };
    containerSize: { width: number; height: number };

    // Actions
    setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
    setSceneSize: (size: { width: number; height: number }) => void;
    setContainerSize: (size: { width: number; height: number }) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
    viewport: { x: 0, y: 0, scale: 1 },
    sceneSize: { width: 0, height: 0 },
    containerSize: { width: 0, height: 0 },

    setViewport: (v) => set((state) => ({ viewport: { ...state.viewport, ...v } })),
    setSceneSize: (v) => set({ sceneSize: v }),
    setContainerSize: (v) => set({ containerSize: v }),
}));
