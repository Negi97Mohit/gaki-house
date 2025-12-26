import { create } from 'zustand';

interface CanvasState {
    viewport: { x: number; y: number; scale: number };
    isCanvasHovered: boolean;
    isSpacePressed: boolean;
    sceneSize: { width: number; height: number };
    containerSize: { width: number; height: number };
    isDraggingDynamicSplitter: boolean;
    dynamicSplitRatio: number;
    dynamicPipPosition: { x: number; y: number };
    dynamicPipSize: { width: number; height: number };

    // Actions
    setViewport: (viewport: Partial<CanvasState['viewport']>) => void;
    setIsCanvasHovered: (hovered: boolean) => void;
    setIsSpacePressed: (pressed: boolean) => void;
    setSceneSize: (size: { width: number; height: number }) => void;
    setContainerSize: (size: { width: number; height: number }) => void;
    setIsDraggingDynamicSplitter: (isDragging: boolean) => void;
    setDynamicSplitRatio: (ratio: number) => void;
    setDynamicPipPosition: (pos: { x: number; y: number }) => void;
    setDynamicPipSize: (size: { width: number; height: number }) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
    viewport: { x: 0, y: 0, scale: 1 },
    isCanvasHovered: false,
    isSpacePressed: false,
    sceneSize: { width: 0, height: 0 },
    containerSize: { width: 0, height: 0 },
    isDraggingDynamicSplitter: false,
    dynamicSplitRatio: 0.5,
    dynamicPipPosition: { x: 75, y: 75 },
    dynamicPipSize: { width: 30, height: 30 },

    setViewport: (v) => set((state) => ({ viewport: { ...state.viewport, ...v } })),
    setIsCanvasHovered: (v) => set({ isCanvasHovered: v }),
    setIsSpacePressed: (v) => set({ isSpacePressed: v }),
    setSceneSize: (v) => set({ sceneSize: v }),
    setContainerSize: (v) => set({ containerSize: v }),
    setIsDraggingDynamicSplitter: (v) => set({ isDraggingDynamicSplitter: v }),
    setDynamicSplitRatio: (v) => set({ dynamicSplitRatio: v }),
    setDynamicPipPosition: (v) => set({ dynamicPipPosition: v }),
    setDynamicPipSize: (v) => set({ dynamicPipSize: v }),
}));
