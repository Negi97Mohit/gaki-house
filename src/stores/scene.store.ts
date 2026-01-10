import { create } from 'zustand';
import { GeneratedOverlay, TextOverlayState, FileOverlayState, CaptionStyle, SceneState as GlobalSceneState } from '@/types/caption';

interface SceneState {
    customMaskUrl: string | undefined;
    activeOverlays: GeneratedOverlay[];

    textOverlays: TextOverlayState[];
    fileOverlays: FileOverlayState[];
    browserOverlays: any[]; // TODO: Import BrowserOverlayState
    canvasLayout: any; // TODO: Import CanvasLayoutState

    backgroundEffect: 'none' | 'blur' | 'image';
    backgroundImageUrl: string | undefined;
    blankCanvasColor: string;
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

    // Added State
    pipRotation: number;
    pipBorder: { color: string; width: number };
    pipShadow: { blur: number; color: string };
    cameraAspectRatio: string;
    customAspectRatio: string;
    activeInteractiveFilter: GlobalSceneState['activeInteractiveFilter'];
    filterIntensity: number;
    filterColor: string;
    filterTarget: "both" | "background" | "person";
    isAutoFramingEnabled: boolean;
    isBeautifyEnabled: boolean;
    isLowLightEnabled: boolean;
    isNeonEdgeEnabled: boolean;
    neonIntensity: number;
    neonColor: string;
    cameraBackground: "none" | "blur" | "image";
    customBackgroundUrl: string | null;
    zoomSensitivity: number;
    trackingSpeed: number;
    isFaceTrackingEnabled: boolean;
    canvasAspectRatio: string;

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
    setBlankCanvasColor: (color: string) => void;
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

    // Added Actions
    setPipRotation: (rotation: number) => void;
    setPipBorder: (border: { color: string; width: number }) => void;
    setPipShadow: (shadow: { blur: number; color: string }) => void;
    setCameraAspectRatio: (ratio: string) => void;
    setCustomAspectRatio: (ratio: string) => void;
    setActiveInteractiveFilter: (filter: GlobalSceneState['activeInteractiveFilter']) => void;
    setFilterIntensity: (intensity: number) => void;
    setFilterColor: (color: string) => void;
    setFilterTarget: (target: "both" | "background" | "person") => void;
    setIsAutoFramingEnabled: (enabled: boolean) => void;
    setIsBeautifyEnabled: (enabled: boolean) => void;
    setIsLowLightEnabled: (enabled: boolean) => void;
    setIsNeonEdgeEnabled: (enabled: boolean) => void;
    setNeonIntensity: (intensity: number) => void;
    setNeonColor: (color: string) => void;
    setCameraBackground: (bg: "none" | "blur" | "image") => void;
    setCustomBackgroundUrl: (url: string | null) => void;
    setZoomSensitivity: (sensitivity: number) => void;
    setTrackingSpeed: (speed: number) => void;
    setIsFaceTrackingEnabled: (enabled: boolean) => void;
    setCanvasAspectRatio: (ratio: string) => void;

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
    blankCanvasColor: "#000000",
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
    setBlankCanvasColor: (blankCanvasColor) => set({ blankCanvasColor }),
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

    // Added fields
    pipRotation: 0,
    pipBorder: { color: "#FFFFFF", width: 0 },
    pipShadow: { blur: 0, color: "rgba(0,0,0,0.5)" },
    cameraAspectRatio: "16:9",
    customAspectRatio: "",
    activeInteractiveFilter: "none",
    filterIntensity: 0.5,
    filterColor: "#000000",
    filterTarget: "both",
    isAutoFramingEnabled: false,
    isBeautifyEnabled: false,
    isLowLightEnabled: false,
    isNeonEdgeEnabled: false,
    neonIntensity: 50,
    neonColor: "#00FFFF",
    cameraBackground: "none",
    customBackgroundUrl: null,
    zoomSensitivity: 0.5,
    trackingSpeed: 0.5,
    isFaceTrackingEnabled: false,
    canvasAspectRatio: "16:9",

    setPipRotation: (pipRotation) => set({ pipRotation }),
    setPipBorder: (pipBorder) => set({ pipBorder }),
    setPipShadow: (pipShadow) => set({ pipShadow }),
    setCameraAspectRatio: (cameraAspectRatio) => set({ cameraAspectRatio }),
    setCustomAspectRatio: (customAspectRatio) => set({ customAspectRatio }),
    setActiveInteractiveFilter: (activeInteractiveFilter) => set({ activeInteractiveFilter }),
    setFilterIntensity: (filterIntensity) => set({ filterIntensity }),
    setFilterColor: (filterColor) => set({ filterColor }),
    setFilterTarget: (filterTarget) => set({ filterTarget }),
    setIsAutoFramingEnabled: (isAutoFramingEnabled) => set({ isAutoFramingEnabled }),
    setIsBeautifyEnabled: (isBeautifyEnabled) => set({ isBeautifyEnabled }),
    setIsLowLightEnabled: (isLowLightEnabled) => set({ isLowLightEnabled }),
    setIsNeonEdgeEnabled: (isNeonEdgeEnabled) => set({ isNeonEdgeEnabled }),
    setNeonIntensity: (neonIntensity) => set({ neonIntensity }),
    setNeonColor: (neonColor) => set({ neonColor }),
    setCameraBackground: (cameraBackground) => set({ cameraBackground }),
    setCustomBackgroundUrl: (customBackgroundUrl) => set({ customBackgroundUrl }),
    setZoomSensitivity: (zoomSensitivity) => set({ zoomSensitivity }),
    setTrackingSpeed: (trackingSpeed) => set({ trackingSpeed }),
    setIsFaceTrackingEnabled: (isFaceTrackingEnabled) => set({ isFaceTrackingEnabled }),
    setCanvasAspectRatio: (canvasAspectRatio) => set({ canvasAspectRatio }),

    triggerUndo: () => { },
    triggerRedo: () => { },
    triggerReset: () => { },
}));
