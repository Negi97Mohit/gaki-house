import { create } from 'zustand';
import { LayoutMode, CameraShape } from '@/types/caption';

interface CanvasState {
    layoutMode: LayoutMode;
    cameraShape: CameraShape;
    splitRatio: number;
    pipPosition: { x: number; y: number };
    pipSize: { width: number; height: number };
    activeTransition: string;
    isTransitioning: boolean;

    // Dynamic layout state for resizing/drag
    dynamicLayout: any;

    // Actions
    setLayoutMode: (mode: LayoutMode) => void;
    setCameraShape: (shape: CameraShape) => void;
    setSplitRatio: (ratio: number) => void;
    setPipPosition: (position: { x: number; y: number }) => void;
    setPipSize: (size: { width: number; height: number }) => void;
    setActiveTransition: (transition: string) => void;
    setIsTransitioning: (isTransitioning: boolean) => void;
    setDynamicLayout: (layout: any) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
    layoutMode: 'pip',
    cameraShape: 'circle',
    splitRatio: 50,
    pipPosition: { x: 20, y: 20 }, // Default position
    pipSize: { width: 300, height: 200 }, // Default size
    activeTransition: 'fade',
    isTransitioning: false,

    dynamicLayout: null, // Default null or object

    setLayoutMode: (layoutMode) => set({ layoutMode }),
    setCameraShape: (cameraShape) => set({ cameraShape }),
    setSplitRatio: (splitRatio) => set({ splitRatio }),
    setPipPosition: (pipPosition) => set({ pipPosition }),
    setPipSize: (pipSize) => set({ pipSize }),
    setActiveTransition: (activeTransition) => set({ activeTransition }),
    setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
    setDynamicLayout: (dynamicLayout) => set({ dynamicLayout }),
}));
