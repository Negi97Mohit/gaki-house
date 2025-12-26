import {
    LayoutMode,
    CameraShape,
    CaptionStyle,
    FileOverlayState,
    TextOverlayState,
    SceneTransition,
    CanvasLayoutState,
    CanvasSectionCameraState,
    GeneratedOverlay,
    GeneratedLayout,
} from "@/types/caption";
import { AssetResult } from "@/components/AssetLibrary";
import { BrowserOverlayState } from "@/features/canvas/ui/DraggableBrowser";
import { RecordingSession } from "@/types/editor";

export interface VideoCanvasProps {
    sceneId: string;
    isTransitioningIn?: boolean;
    isTransitioningOut?: boolean;
    transition?: SceneTransition | null;
    captionsEnabled: boolean;
    onStyleChange: (style: any) => void;
    onCaptionsToggle: (on: boolean) => void;
    isAiModeEnabled: boolean;
    onAiModeToggle: (on: boolean) => void;
    backgroundEffect: "none" | "blur" | "image";
    backgroundImageUrl: string | null;
    isAutoFramingEnabled: boolean;
    onProcessTranscript: (transcript: string, targetId: string | null) => void;
    generatedOverlays: GeneratedOverlay[];
    onOverlayLayoutChange: (
        id: string,
        key: "position" | "size" | "rotation" | "isBehindUser",
        value: any
    ) => void;
    onRemoveOverlay: (id: string) => void;
    onUpdateOverlayMetadata?: (id: string, metadata: any) => void;
    liveCaptionStyle: CaptionStyle;
    dynamicStyle: string;
    videoFilter: string;
    isAudioOn: boolean;
    onAudioToggle: (on: boolean) => void;
    isVideoOn: boolean;
    onVideoToggle: (on: boolean) => void;
    isRecording: boolean;
    onRecordingToggle: (
        on: boolean,
        stream: MediaStream,
        size: { width: number; height: number }
    ) => void;
    selectedAudioDevice: string | undefined;
    onAudioDeviceSelect: (deviceId: string) => void;
    selectedVideoDevice: string | undefined;
    onVideoDeviceSelect: (deviceId: string) => void;
    audioDevices: MediaDeviceInfo[];
    videoDevices: MediaDeviceInfo[];
    zoomSensitivity: number;
    trackingSpeed: number;
    isBeautifyEnabled: boolean;
    isLowLightEnabled: boolean;
    layoutMode: LayoutMode;
    textOverlays: TextOverlayState[];
    onRemoveTextOverlay: (id: string) => void;
    onTextLayoutChange: (
        id: string,
        layout: Partial<TextOverlayState["layout"]>
    ) => void;
    onTextStyleChange: (
        id: string,
        style: Partial<TextOverlayState["style"]>
    ) => void;
    onTextContentChange: (id: string, content: string) => void;
    selectedTextId: string | null;
    setSelectedTextId: (id: string | null) => void;
    cameraShape: CameraShape;
    splitRatio: number;
    pipPosition: { x: number; y: number };
    pipSize: { width: number; height: number };
    onLayoutModeChange: (mode: LayoutMode) => void;
    onCameraShapeChange: (shape: CameraShape) => void;
    onSplitRatioChange: (ratio: number) => void;
    onPipPositionChange: (position: { x: number; y: number }) => void;
    onPipSizeChange: (size: { width: number; height: number }) => void;
    customMaskUrl?: string;
    onCustomMaskUpload?: (file: File) => void;
    aiButtonPosition: { x: number; y: number };
    onAiButtonPositionChange: (position: { x: number; y: number }) => void;
    onCaptionLayoutChange: (layout: {
        position?: { x: number; y: number };
        size?: { width: number; height: number };
    }) => void;
    isNeonEdgeEnabled: boolean;
    neonIntensity: number;
    neonColor: string;
    isProcessingAi: boolean;
    onPreviewGenerated: (id: string, dataUrl: string) => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    isFsSidebarOpen: boolean;
    onFsSidebarToggle: (open: boolean | ((prev: boolean) => boolean)) => void;
    portalContainer?: HTMLElement | null | ((node: HTMLDivElement) => void);
    browserOverlays: BrowserOverlayState[];
    onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
    screenShareMode: "off" | "screen" | "canvas";
    onScreenShareModeChange: (mode: "off" | "screen" | "canvas") => void;
    onSectionCameraSettingsChange: (
        sectionId: string,
        settings: Partial<CanvasSectionCameraState>
    ) => void;
    onSetSectionDefault?: (sectionId: string) => void;
    activeSequenceId?: string | null;
    onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
    canvasLayout: CanvasLayoutState | null;
    onCanvasLayoutChange?: (layout: CanvasLayoutState) => void;
    onRemoveBrowser: (id: string) => void;
    onBrowserUrlChange: (id: string, url: string) => void;
    onCanvasBackgroundUpload: (file: File) => void;
    onBrowserLayoutChange: (
        id: string,
        layout: Partial<BrowserOverlayState["layout"]>
    ) => void;
    sidebarProps: any;
    selectedBrowserId: string | null;
    setSelectedBrowserId: (id: string | null) => void;
    fileOverlays: FileOverlayState[];
    onRemoveFile: (id: string) => void;
    onFileLayoutChange: (
        id: string,
        layout: Partial<FileOverlayState["layout"]>
    ) => void;
    selectedFileId: string | null;
    setSelectedFileId: (id: string | null) => void;
    onInternalDragStart: () => void;
    onInternalDragStop: () => void;
    onDeselectAll: () => void;
    dynamicLayout: {
        isActive: boolean;
        mode: "split-vertical" | "split-horizontal" | "pip";
        target: {
            id: string;
            type: string;
            content: any;
            layout: GeneratedLayout;
        } | null;
    };
    onSetDynamicLayout: (
        target: { id: string; type: string },
        mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
    ) => void;
    isMouseActive: boolean;
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    onRecordingComplete: (
        session: RecordingSession
    ) => void;
    onOpenSessions: () => void;
    onOpenSettings: () => void;
    blankCanvasColor: string;
    hasAiPopoverAutoOpenedRef: React.RefObject<boolean>;
    onCanvasBackgroundAssetSelect: (asset: AssetResult) => void;
    onAiPopoverAutoClose?: () => void;
    pipBorder?: { color: string; width: number };
    pipShadow?: { blur: number; color: string };
    onPipRotationChange?: (rotation: number) => void;
    pipRotation?: number;
    canvasAspectRatio: string;
    selectedGeneratedId?: string | null;
    setSelectedGeneratedId?: (id: string | null) => void;
    onBannerDoubleClick?: (id: string, e: React.MouseEvent) => void;
    remoteStream?: MediaStream | null;
    editingBannerText?: {
        overlayId: string;
        field: "name" | "tagline";
        currentText: string;
        style: React.CSSProperties;
    } | null;
    onBannerTextStyleChange?: (style: React.CSSProperties) => void;
    onBannerTextClose?: () => void;
    isChatbotOpen?: boolean;
    onChatbotToggle?: (open: boolean | ((prev: boolean) => boolean)) => void;
}
