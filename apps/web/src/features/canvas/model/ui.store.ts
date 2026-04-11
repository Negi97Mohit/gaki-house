import { create } from 'zustand';

interface UIState {
    isCanvasHovered: boolean;
    isSpacePressed: boolean;
    isDraggingDynamicSplitter: boolean;
    dynamicSplitRatio: number;
    dynamicPipPosition: { x: number; y: number };
    dynamicPipSize: { width: number; height: number };

    // Actions
    setIsCanvasHovered: (hovered: boolean) => void;
    setIsSpacePressed: (pressed: boolean) => void;
    setIsDraggingDynamicSplitter: (isDragging: boolean) => void;
    setDynamicSplitRatio: (ratio: number) => void;
    setDynamicPipPosition: (pos: { x: number; y: number }) => void;
    setDynamicPipSize: (size: { width: number; height: number }) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isCanvasHovered: false,
    isSpacePressed: false,
    isDraggingDynamicSplitter: false,
    dynamicSplitRatio: 0.5,
    dynamicPipPosition: { x: 75, y: 75 },
    dynamicPipSize: { width: 30, height: 30 },

    setIsCanvasHovered: (v) => set({ isCanvasHovered: v }),
    setIsSpacePressed: (v) => set({ isSpacePressed: v }),
    setIsDraggingDynamicSplitter: (v) => set({ isDraggingDynamicSplitter: v }),
    setDynamicSplitRatio: (v) => set({ dynamicSplitRatio: v }),
    setDynamicPipPosition: (v) => set({ dynamicPipPosition: v }),
    setDynamicPipSize: (v) => set({ dynamicPipSize: v }),
}));
