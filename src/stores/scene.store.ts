import { create } from 'zustand';
import { GeneratedOverlay, TextOverlayState, FileOverlayState, CaptionStyle } from '@/types/caption';

interface SceneState {
    customMaskUrl: string | undefined;
    activeOverlays: GeneratedOverlay[];

    textOverlays: TextOverlayState[];
    fileOverlays: FileOverlayState[];
    browserOverlays: any[]; // TODO: Import BrowserOverlayState
    canvasLayout: any; // TODO: Import CanvasLayoutState

    backgroundEffect: 'none' | 'blur' | 'image';
    backgroundImageUrl: string | undefined;
    videoFilter: string | undefined;
    captionStyle: CaptionStyle;
    dynamicStyle: any;

    isAiModeEnabled: boolean;
    captionsEnabled: boolean;

    // Previous Scene for transitions
    previousScene: SceneState | null; // Self-referential type might be tricky in pure interface, but recursive works

    // Selection State
    selectedBrowserId: string | null;
    selectedFileId: string | null;
    selectedTextId: string | null;
    selectedGeneratedId: string | null;

    // Undo/Redo state
    canUndo: boolean;
    canRedo: boolean;

    // Actions
    setCustomMaskUrl: (url: string | undefined) => void;
    setActiveOverlays: (overlays: GeneratedOverlay[]) => void;

    setTextOverlays: (overlays: TextOverlayState[]) => void;
    setFileOverlays: (overlays: FileOverlayState[]) => void;
    setBrowserOverlays: (overlays: any[]) => void;
    setCanvasLayout: (layout: any) => void;

    setBackgroundEffect: (effect: 'none' | 'blur' | 'image') => void;
    setBackgroundImageUrl: (url: string | undefined) => void;
    setVideoFilter: (filter: string | undefined) => void;
    setCaptionStyle: (style: CaptionStyle) => void;
    setDynamicStyle: (style: any) => void;

    setAiModeEnabled: (enabled: boolean) => void;
    setCaptionsEnabled: (enabled: boolean) => void;

    setPreviousScene: (scene: SceneState | null) => void;

    setSelectedBrowserId: (id: string | null) => void;
    setSelectedFileId: (id: string | null) => void;
    setSelectedTextId: (id: string | null) => void;
    setSelectedGeneratedId: (id: string | null) => void;
    deselectAll: () => void;

    setCanUndo: (canUndo: boolean) => void;
    setCanRedo: (canRedo: boolean) => void;

    triggerUndo: () => void;
    triggerRedo: () => void;
    triggerReset: () => void;
}

export const useSceneStore = create<SceneState>((set) => ({
    customMaskUrl: undefined,
    activeOverlays: [],

    textOverlays: [],
    fileOverlays: [],
    browserOverlays: [],
    canvasLayout: null,

    backgroundEffect: 'none',
    backgroundImageUrl: undefined,
    videoFilter: undefined,
    captionStyle: {} as CaptionStyle,
    dynamicStyle: {},

    isAiModeEnabled: false,
    captionsEnabled: true,

    previousScene: null,

    selectedBrowserId: null,
    selectedFileId: null,
    selectedTextId: null,
    selectedGeneratedId: null,

    canUndo: false,
    canRedo: false,

    setCustomMaskUrl: (customMaskUrl) => set({ customMaskUrl }),
    setActiveOverlays: (activeOverlays) => set({ activeOverlays }),

    setTextOverlays: (textOverlays) => set({ textOverlays }),
    setFileOverlays: (fileOverlays) => set({ fileOverlays }),
    setBrowserOverlays: (browserOverlays) => set({ browserOverlays }),
    setCanvasLayout: (canvasLayout) => set({ canvasLayout }),

    setBackgroundEffect: (backgroundEffect) => set({ backgroundEffect }),
    setBackgroundImageUrl: (backgroundImageUrl) => set({ backgroundImageUrl }),
    setVideoFilter: (videoFilter) => set({ videoFilter }),
    setCaptionStyle: (captionStyle) => set({ captionStyle }),
    setDynamicStyle: (dynamicStyle) => set({ dynamicStyle }),

    setAiModeEnabled: (isAiModeEnabled) => set({ isAiModeEnabled }),
    setCaptionsEnabled: (captionsEnabled) => set({ captionsEnabled }),

    setPreviousScene: (previousScene) => set({ previousScene }),

    setSelectedBrowserId: (selectedBrowserId) => set({ selectedBrowserId }),
    setSelectedFileId: (selectedFileId) => set({ selectedFileId }),
    setSelectedTextId: (selectedTextId) => set({ selectedTextId }),
    setSelectedGeneratedId: (selectedGeneratedId) => set({ selectedGeneratedId }),
    deselectAll: () => set({
        selectedBrowserId: null,
        selectedFileId: null,
        selectedTextId: null,
        selectedGeneratedId: null
    }),

    setCanUndo: (canUndo) => set({ canUndo }),
    setCanRedo: (canRedo) => set({ canRedo }),

    triggerUndo: () => { },
    triggerRedo: () => { },
    triggerReset: () => { },
}));
