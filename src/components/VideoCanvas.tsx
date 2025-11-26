// src/components/VideoCanvas.tsx

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Rnd } from "react-rnd";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  CanvasSectionState,
  DEFAULT_CAMERA_STATE,
} from "@/types/caption";
import { useDeepgramSpeech } from "@/hooks/useDeepgramSpeech";
import { useVideoStreams } from "@/hooks/useVideoStreams";
import { ScreenShare, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraRenderer } from "@/components/CameraRenderer";
import { AICommandPopover } from "@/components/AICommandPopover";
import { DynamicLayoutPicker } from "./DynamicLayoutPicker";
import { AssetResult } from "@/components/AssetLibrary";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ASPECT_RATIOS } from "@/lib/backgrounds";
import { CanvasHoverToolbar } from "@/components/CanvasHoverToolbar";
import { CanvasGridLayout } from "@/components/CanvasGridLayout";
import { SnapGuideLine } from "@/components/SnapGuideLine";
import { GuideLine, OverlayElement } from "@/hooks/useSnapGuides";
import { InteractiveGridSection } from "@/components/InteractiveGridSection";
import { DynamicContentRenderer } from "@/components/video-canvas/DynamicContentRenderer";
import { PipWindow } from "@/components/video-canvas/PipWindow";
import { OverlayLayer } from "@/components/video-canvas/OverlayLayer";
import { BrowserOverlayState } from "./DraggableBrowser";

// --- Types & Interfaces ---

interface VideoCanvasProps {
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
    key: "position" | "size" | "rotation",
    value: any
  ) => void;
  onRemoveOverlay: (id: string) => void;
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
  sidebarProps: any; // Kept as any for brevity, fully typed in original
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
    session: import("@/types/editor").RecordingSession
  ) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  blankCanvasColor: string;
  hasAiPopoverAutoOpenedRef: React.RefObject<boolean>;
  onCanvasBackgroundAssetSelect: (asset: AssetResult) => void;
  onAiPopoverAutoClose?: () => void;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  canvasAspectRatio: string;
}

// --- Helpers ---

const VideoPlayer: React.FC<{
  stream: MediaStream | null;
  className?: string;
  style?: React.CSSProperties;
}> = ({ stream, className, style }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={className}
      style={style}
    />
  );
};

const getNumericAspectRatio = (
  shape: CameraShape,
  ratioId: string,
  customRatio: string
): number | boolean => {
  if (shape === "circle") return 1;
  if (ratioId === "custom") {
    const [w, h] = customRatio.split(":").map(Number);
    return w && h ? w / h : false;
  }
  if (ratioId && ratioId !== "auto") {
    const option = ASPECT_RATIOS.find((r) => r.id === ratioId);
    if (option && option.value > 0) {
      return option.value;
    }
  }
  return false;
};

const getCanvasAspectRatioStyle = (
  aspectRatio: string,
  customAspectRatio: string
): React.CSSProperties => {
  let ratioValue: string | number = "auto";

  if (aspectRatio === "custom") {
    ratioValue = customAspectRatio || "auto";
  } else {
    const option = ASPECT_RATIOS.find((r) => r.id === aspectRatio);
    if (option && option.value > 0) {
      ratioValue = option.value;
    }
  }

  return {
    aspectRatio: String(ratioValue),
    width: "100%",
    height: "100%",
    margin: "auto",
    objectFit: "contain",
  };
};

// --- Main Component ---

export const VideoCanvas = (props: VideoCanvasProps) => {
  const {
    sceneId,
    isTransitioningIn,
    isTransitioningOut,
    transition,
    generatedOverlays,
    isVideoOn,
    isAudioOn,
    selectedVideoDevice,
    selectedAudioDevice,
    onVideoDeviceSelect,
    onAudioDeviceSelect,
    onVideoToggle,
    onAudioToggle,
    aiButtonPosition,
    onAiButtonPositionChange,
    onCaptionLayoutChange,
    isNeonEdgeEnabled,
    neonIntensity,
    neonColor,
    onPreviewGenerated,
    isFullscreen,
    onToggleFullscreen,
    isFsSidebarOpen,
    onFsSidebarToggle,
    isAiModeEnabled,
    onAiModeToggle,
    captionsEnabled,
    onCaptionsToggle,
    liveCaptionStyle,
    dynamicStyle,
    videoFilter,
    portalContainer,
    browserOverlays,
    onRemoveBrowser,
    onBrowserUrlChange,
    onBrowserLayoutChange,
    selectedBrowserId,
    setSelectedBrowserId,
    fileOverlays,
    onRemoveFile,
    onFileLayoutChange,
    selectedFileId,
    setSelectedFileId,
    onSetDynamicLayout,
    onInternalDragStart,
    onInternalDragStop,
    dynamicLayout = {
      isActive: false,
      mode: "split-vertical",
      target: null,
    },
    onDeselectAll,
    blankCanvasColor,
    textOverlays,
    onGridAssetSelect,
    screenShareMode,
    onScreenShareModeChange,
    onRemoveTextOverlay,
    onTextLayoutChange,
    onTextStyleChange,
    onTextContentChange,
    selectedTextId,
    setSelectedTextId,
    isMouseActive,
    onOpenSessions,
    onOpenSettings,
    isRecording,
    onRecordingToggle,
    onCanvasBackgroundUpload,
    canvasRef,
    hasAiPopoverAutoOpenedRef,
    canvasAspectRatio,
    ...rest
  } = props;

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Pan and Zoom State
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });

  // Canvas hover state
  const [isCanvasHovered, setIsCanvasHovered] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  // New: Scene size state for stable positioning
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const [activeSnapGuides, setActiveSnapGuides] = useState<GuideLine[]>([]);

  const [dynamicSplitRatio, setDynamicSplitRatio] = useState(0.5);
  const [isDraggingDynamicSplitter, setIsDraggingDynamicSplitter] =
    useState(false);
  const [dynamicPipPosition, setDynamicPipPosition] = useState({
    x: 75,
    y: 75,
  });
  const [dynamicPipSize, setDynamicPipSize] = useState({
    width: 30,
    height: 30,
  });

  const { cameraStream, screenStream } = useVideoStreams({
    isCameraOn: isVideoOn,
    isAudioOn: isAudioOn,
    isScreenSharing: screenShareMode === "screen",
    selectedCameraDevice: selectedVideoDevice,
    selectedAudioDevice: selectedAudioDevice,
    onScreenShareEnd: () => onScreenShareModeChange("off"),
  });

  const splitDividerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const [audioStreamForSpeech, setAudioStreamForSpeech] =
    useState<MediaStream | null>(null);
  const [fullTranscript, setFullTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const transcriptTimerRef = useRef<NodeJS.Timeout>();

  const fsSidebarContainerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(fsSidebarContainerRef, () => {
    if (props.isFsSidebarOpen) {
      props.onFsSidebarToggle(false);
    }
  });

  // --- Wheel Handler ---
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const container = sceneRef.current;
      if (!container) return;
      // Only trigger this new logic if we're in solo mode
      if (props.layoutMode !== "solo") {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newXPercent = (mouseX / containerSize.width) * 100;
      const newYPercent = (mouseY / containerSize.height) * 100;

      props.onPipPositionChange({
        x: Math.max(0, Math.min(newXPercent, 100 - props.pipSize.width)),
        y: Math.max(0, Math.min(newYPercent, 100 - props.pipSize.height)),
      });

      // Switch to blank canvas if not already sharing
      if (props.screenShareMode === "off") {
        props.onScreenShareModeChange("canvas");
      }
    },
    [
      props.onPipPositionChange,
      props.pipSize,
      props.screenShareMode,
      props.onScreenShareModeChange,
      props.layoutMode,
      containerSize,
    ]
  );

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  const handleFinalTranscript = useCallback((text: string) => {
    clearTimeout(transcriptTimerRef.current);
    setFullTranscript(text);
    setInterimTranscript("");
    transcriptTimerRef.current = setTimeout(() => {
      setFullTranscript("");
    }, 4000);
  }, []);

  const handlePartialTranscript = useCallback((text: string) => {
    setInterimTranscript(text);
  }, []);

  const { startRecognition, stopRecognition } = useDeepgramSpeech({
    onFinalTranscript: handleFinalTranscript,
    onPartialTranscript: handlePartialTranscript,
    stream: audioStreamForSpeech,
  });

  useEffect(() => {
    if (audioStreamForSpeech && captionsEnabled) {
      startRecognition();
    } else {
      stopRecognition();
    }
    return () => {
      stopRecognition();
      setFullTranscript("");
      setInterimTranscript("");
    };
  }, [
    audioStreamForSpeech,
    isAudioOn,
    captionsEnabled,
    startRecognition,
    stopRecognition,
    sceneId,
  ]);

  // --- ResizeObservers ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const updateSize = () => {
      if (container) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();
    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const updateSceneSize = () => {
      if (scene) {
        setSceneSize({
          width: scene.clientWidth,
          height: scene.clientHeight,
        });
      }
    };
    const resizeObserver = new ResizeObserver(updateSceneSize);
    resizeObserver.observe(scene);
    updateSceneSize();
    return () => resizeObserver.disconnect();
  }, []);

  // --- Splitter Logic ---
  const handleSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  useEffect(() => {
    if (!isDraggingSplitter) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = canvasContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let ratio: number;
      if (rest.layoutMode === "split-vertical") {
        ratio = (e.clientY - rect.top) / rect.height;
      } else {
        ratio = (e.clientX - rect.left) / rect.width;
      }
      ratio = Math.max(0.2, Math.min(0.8, ratio));
      rest.onSplitRatioChange(ratio);
    };
    const handleMouseUp = () => setIsDraggingSplitter(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSplitter, rest.layoutMode, rest.onSplitRatioChange]);

  useEffect(() => {
    if (!isDraggingDynamicSplitter) return;
    const handleMouseMove = (e: MouseEvent) => {
      const container = canvasContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let ratio: number;
      if (dynamicLayout.mode === "split-vertical") {
        ratio = (e.clientY - rect.top) / rect.height;
      } else {
        ratio = (e.clientX - rect.left) / rect.width;
      }
      setDynamicSplitRatio(Math.max(0.2, Math.min(0.8, ratio)));
    };
    const handleMouseUp = () => setIsDraggingDynamicSplitter(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDynamicSplitter, dynamicLayout.mode]);

  const getCameraShapeStyle = () => {
    const baseStyle: React.CSSProperties = {
      overflow: "hidden",
      transition: "all 0.3s ease",
    };

    if (rest.pipBorder && rest.pipBorder.width > 0) {
      baseStyle.border = `${rest.pipBorder.width}px solid ${rest.pipBorder.color}`;
    }

    if (rest.pipShadow && rest.pipShadow.blur > 0) {
      baseStyle.boxShadow = `0 0 ${rest.pipShadow.blur}px ${rest.pipShadow.color}`;
    }

    if (rest.customMaskUrl) {
      return {
        ...baseStyle,
        maskImage: `url(${rest.customMaskUrl})`,
        WebkitMaskImage: `url(${rest.customMaskUrl})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      };
    }
    switch (rest.cameraShape) {
      case "circle":
        return { ...baseStyle, borderRadius: "50%" };
      case "rounded":
        return { ...baseStyle, borderRadius: "16px" };
      case "rectangle":
      default:
        return { ...baseStyle, borderRadius: "0" };
    }
  };

  const getVideoFilterStyle = (): string => {
    const filters: string[] = [];
    if (videoFilter && videoFilter !== "none") filters.push(videoFilter);
    if (rest.isBeautifyEnabled)
      filters.push("blur(0.5px) saturate(1.1) brightness(1.05)");
    if (rest.isLowLightEnabled) filters.push("brightness(1.3) contrast(1.15)");
    return filters.length > 0 ? filters.join(" ") : "none";
  };

  useEffect(() => {
    let dedicatedAudioStream: MediaStream | null = null;
    const manageAudioStream = async () => {
      if (props.isAudioOn) {
        try {
          const constraints: MediaStreamConstraints = {
            audio: selectedAudioDevice
              ? { deviceId: { exact: selectedAudioDevice } }
              : true,
          };
          dedicatedAudioStream = await navigator.mediaDevices.getUserMedia(
            constraints
          );
          setAudioStreamForSpeech(dedicatedAudioStream);
        } catch (err) {
          console.error(
            "Failed to get dedicated audio stream for captions:",
            err
          );
          toast.error("Could not access microphone for captions.");
          props.onAudioToggle(false);
        }
      } else {
        if (audioStreamForSpeech) {
          audioStreamForSpeech.getTracks().forEach((track) => track.stop());
          setAudioStreamForSpeech(null);
        }
      }
    };
    manageAudioStream();
    return () => {
      if (dedicatedAudioStream) {
        dedicatedAudioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [props.isAudioOn, selectedAudioDevice, props.onAudioToggle, sceneId]);

  const videoFilterString = getVideoFilterStyle();

  // --- RENDER FUNCTIONS ---

  const renderCamera = (
    className?: string,
    style?: React.CSSProperties,
    isPip: boolean = false,
    cameraShape?: CameraShape
  ) => {
    return (
      <div
        className={cn("w-full h-full", className)}
        style={{ ...getCameraShapeStyle(), ...style }}
      >
        <CameraRenderer
          stream={cameraStream}
          className="w-full h-full"
          portalContainer={
            typeof portalContainer === "function" ? undefined : portalContainer
          }
          style={{ ...style }}
          videoFilter={videoFilterString}
          customBackgroundUrl={rest.backgroundImageUrl}
          pipBorder={props.sidebarProps.pipBorder}
          pipShadow={props.sidebarProps.pipShadow}
          isAutoFramingEnabled={rest.isAutoFramingEnabled}
          isBeautifyEnabled={props.sidebarProps.isBeautifyEnabled}
          isLowLightEnabled={props.sidebarProps.isLowLightEnabled}
          isNeonEdgeEnabled={isNeonEdgeEnabled}
          neonIntensity={neonIntensity}
          neonColor={neonColor}
          activeInteractiveFilter={props.sidebarProps.activeInteractiveFilter}
          onInteractiveFilterChange={
            props.sidebarProps.onInteractiveFilterChange
          }
          filterIntensity={props.sidebarProps.filterIntensity}
          onFilterIntensityChange={props.sidebarProps.onFilterIntensityChange}
          filterColor={props.sidebarProps.filterColor}
          onFilterColorChange={props.sidebarProps.onFilterColorChange}
          filterTarget={props.sidebarProps.filterTarget}
          onFilterTargetChange={props.sidebarProps.onFilterTargetChange}
          zoomSensitivity={rest.zoomSensitivity}
          trackingSpeed={rest.trackingSpeed}
          cameraBackground={props.sidebarProps.cameraBackground}
          cameraAspectRatio={props.sidebarProps.cameraAspectRatio}
          customAspectRatio={props.sidebarProps.customAspectRatio}
          isFaceTrackingEnabled={props.sidebarProps.isFaceTrackingEnabled}
          onPipBorderChange={props.sidebarProps.onPipBorderChange}
          onPipShadowChange={props.sidebarProps.onPipShadowChange}
          onAutoFramingChange={props.sidebarProps.onAutoFramingChange}
          onBeautifyToggle={props.sidebarProps.onBeautifyToggle}
          onLowLightToggle={props.sidebarProps.onLowLightToggle}
          onVideoFilterChange={props.sidebarProps.onVideoFilterChange}
          onNeonEdgeToggle={props.sidebarProps.onNeonEdgeToggle}
          onNeonIntensityChange={props.sidebarProps.onNeonIntensityChange}
          onNeonEdgeColorChange={props.sidebarProps.onNeonColorChange}
          onZoomSensitivityChange={props.sidebarProps.onZoomSensitivityChange}
          onTrackingSpeedChange={props.sidebarProps.onTrackingSpeedChange}
          onCameraBackgroundChange={props.sidebarProps.onCameraBackgroundChange}
          onCustomBackgroundUpload={props.sidebarProps.onCustomBackgroundUpload}
          onCameraAspectRatioChange={
            props.sidebarProps.onCameraAspectRatioChange
          }
          onCustomAspectRatioChange={
            props.sidebarProps.onCustomAspectRatioChange
          }
          onFaceTrackingToggle={props.sidebarProps.onFaceTrackingToggle}
          backgroundEffect={rest.backgroundEffect}
          backgroundImageUrl={rest.backgroundImageUrl}
          onUserPositionChange={props.onUserPositionChange}
          videoDevices={props.videoDevices}
          selectedDeviceId={props.sidebarProps.selectedDeviceId} // Assume sidebarProps carries this
          onCameraDeviceChange={props.onVideoDeviceSelect}
        />
      </div>
    );
  };

  const renderScreen = (className?: string) => {
    if (props.screenShareMode === "canvas" && props.canvasLayout) {
      return (
        <CanvasGridLayout
          layout={props.canvasLayout}
          cameraStream={cameraStream}
          screenStream={screenStream}
          fileOverlays={fileOverlays}
          textOverlays={textOverlays}
          blankCanvasColor={blankCanvasColor}
          backgroundImageUrl={props.backgroundImageUrl}
          onSectionContentChange={(sectionId, content) => {
            if (props.onCanvasLayoutChange) {
              const updatedSections = props.canvasLayout!.sections.map((s) =>
                s.id === sectionId ? { ...s, content } : s
              );
              props.onCanvasLayoutChange({
                ...props.canvasLayout!,
                sections: updatedSections,
              });
            }
          }}
          layoutMode={rest.layoutMode}
          cameraShape={rest.cameraShape}
          pipSize={rest.pipSize}
          pipBorder={rest.pipBorder}
          pipShadow={rest.pipShadow}
          onGridAssetSelect={onGridAssetSelect}
          onSectionCameraSettingsChange={props.onSectionCameraSettingsChange}
          backgroundEffect={props.backgroundEffect}
          onLayoutUpdate={props.onCanvasLayoutChange}
          onSetSectionDefault={props.onSetSectionDefault}
          activeSequenceId={props.activeSequenceId}
          onUserPositionChange={props.onUserPositionChange}
          videoDevices={props.videoDevices}
        />
      );
    }

    if (props.screenShareMode === "canvas") {
      if (rest.backgroundEffect === "image" && rest.backgroundImageUrl) {
        return (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${rest.backgroundImageUrl})` }}
          />
        );
      }
      return (
        <div
          className="w-full h-full"
          style={{ backgroundColor: blankCanvasColor }}
        />
      );
    }

    if (props.screenShareMode === "screen" && screenStream) {
      return (
        <VideoPlayer
          stream={screenStream}
          className={cn("w-full h-full object-cover", className)}
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground bg-black">
        <div>
          <ScreenShare className="w-16 h-16 mx-auto mb-2" />
          <p className="text-sm">Select a share source</p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // NOTE: This main content logic is for when NOT in dynamic split mode.
    // Dynamic mode uses DynamicContentRenderer.

    const mainIsCamera =
      props.screenShareMode === "off" ||
      (props.screenShareMode !== "off" && props.layoutMode === "pip"); // Simplified for PiP case
    // Wait, original logic: if screen share is off, main is camera.
    // If screen share is on AND mode is pip, typically screen is main, camera is pip.
    // But let's check original logic:
    // const mainIsCamera = (pipContent === "share" && props.screenShareMode !== "off") || props.screenShareMode === "off";
    // Since we moved PipWindow state inside PipWindow, we need to determine main content here based on props.

    // Standard behavior: If sharing screen, Screen is Main, Camera is PiP.
    // If NOT sharing screen, Camera is Main (Solo).
    const isScreenSharing = props.screenShareMode !== "off";

    const mainContent = isScreenSharing
      ? renderScreen()
      : renderCamera(undefined, undefined, false, rest.cameraShape);

    // --- DYNAMIC LAYOUT (Split/PiP via AI or manual selection) ---
    if (dynamicLayout.isActive && dynamicLayout.target) {
      if (dynamicLayout.mode === "pip") {
        return (
          <div className="w-full h-full relative bg-black">
            {mainContent}
            <Rnd
              size={{
                width: (containerSize.width * dynamicPipSize.width) / 100,
                height: (containerSize.height * dynamicPipSize.height) / 100,
              }}
              position={{
                x: (containerSize.width * dynamicPipPosition.x) / 100,
                y: (containerSize.height * dynamicPipPosition.y) / 100,
              }}
              minWidth={150}
              minHeight={150}
              bounds="parent"
              onDragStop={(e, d) => {
                setDynamicPipPosition({
                  x: (d.x / containerSize.width) * 100,
                  y: (d.y / containerSize.height) * 100,
                });
              }}
              onResizeStop={(e, dir, ref, delta, pos) => {
                setDynamicPipSize({
                  width:
                    (parseInt(ref.style.width, 10) / containerSize.width) * 100,
                  height:
                    (parseInt(ref.style.height, 10) / containerSize.height) *
                    100,
                });
                setDynamicPipPosition({
                  x: (pos.x / containerSize.width) * 100,
                  y: (pos.y / containerSize.height) * 100,
                });
              }}
              className="pointer-events-auto border-2 border-primary shadow-lg rounded-lg overflow-hidden"
            >
              <DynamicContentRenderer
                target={dynamicLayout.target}
                theme={theme}
                fullTranscript={fullTranscript}
                interimTranscript={interimTranscript}
                sidebarProps={props.sidebarProps}
              />
            </Rnd>
          </div>
        );
      }

      const isVertical = dynamicLayout.mode === "split-vertical";
      return (
        <div
          className={cn(
            "w-full h-full flex bg-black",
            isVertical ? "flex-col" : "flex-row"
          )}
        >
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              [isVertical ? "height" : "width"]: `${dynamicSplitRatio * 100}%`,
            }}
          >
            <DynamicContentRenderer
              target={dynamicLayout.target}
              theme={theme}
              fullTranscript={fullTranscript}
              interimTranscript={interimTranscript}
              sidebarProps={props.sidebarProps}
            />
          </div>
          <div
            className={cn(
              "bg-border hover:bg-primary transition-colors flex items-center justify-center group z-10",
              isVertical
                ? "h-2 w-full cursor-row-resize"
                : "w-2 h-full cursor-col-resize"
            )}
            onMouseDown={() => setIsDraggingDynamicSplitter(true)}
          >
            <div
              className={cn(
                "bg-primary/50 group-hover:bg-primary rounded-full transition-colors",
                isVertical ? "w-12 h-1" : "w-1 h-12"
              )}
            />
          </div>
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              [isVertical ? "height" : "width"]: `${
                (1 - dynamicSplitRatio) * 100
              }%`,
            }}
          >
            {mainContent}
          </div>
        </div>
      );
    }

    // --- STANDARD LAYOUTS ---
    const getBackgroundStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {};
      if (rest.backgroundEffect === "blur") {
        style.backdropFilter = "blur(10px)";
        style.WebkitBackdropFilter = "blur(10px)";
      }
      if (rest.backgroundEffect === "image" && rest.backgroundImageUrl) {
        style.backgroundImage = `url(${rest.backgroundImageUrl})`;
        style.backgroundSize = "cover";
        style.backgroundPosition = "center";
      } else if (rest.backgroundEffect !== "image") {
        style.backgroundColor = blankCanvasColor;
      }
      return style;
    };

    // Solo Mode
    if (rest.layoutMode === "solo") {
      return (
        <div className="w-full h-full relative" style={getBackgroundStyle()}>
          <div className="relative w-full h-full">
            {renderCamera(undefined, undefined, false, rest.cameraShape)}
          </div>
        </div>
      );
    }

    // Standard Split Mode
    if (
      rest.layoutMode === "split-vertical" ||
      rest.layoutMode === "split-horizontal"
    ) {
      const isVertical = rest.layoutMode === "split-vertical";
      return (
        <div
          className={cn(
            "w-full h-full flex",
            isVertical ? "flex-col" : "flex-row"
          )}
        >
          <div
            className="relative bg-black flex items-center justify-center overflow-hidden"
            style={{
              [isVertical ? "height" : "width"]: `${rest.splitRatio * 100}%`,
            }}
          >
            {renderScreen()}
          </div>
          <div
            ref={splitDividerRef}
            className={cn(
              "bg-border hover:bg-primary transition-colors flex items-center justify-center group",
              isVertical
                ? "h-2 w-full cursor-row-resize"
                : "w-2 h-full cursor-col-resize"
            )}
            onMouseDown={handleSplitterMouseDown}
          >
            <div
              className={cn(
                "bg-primary/50 group-hover:bg-primary rounded-full transition-colors",
                isVertical ? "w-12 h-1" : "w-1 h-12"
              )}
            />
          </div>
          <div
            className="relative bg-black flex items-center justify-center overflow-hidden"
            style={{
              [isVertical ? "height" : "width"]: `${
                (1 - rest.splitRatio) * 100
              }%`,
            }}
          >
            <div
              className="w-full h-full relative"
              style={getBackgroundStyle()}
            >
              {rest.backgroundEffect === "image" && rest.backgroundImageUrl && (
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `url(${rest.backgroundImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}
              <div className="relative w-full h-full">
                {renderCamera(undefined, undefined, false, rest.cameraShape)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // PiP Mode (Default Fallback)
    return (
      <div className="w-full h-full relative" style={getBackgroundStyle()}>
        <div
          className="relative w-full h-full"
          style={
            rest.backgroundEffect === "blur"
              ? {
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }
              : {}
          }
        >
          {isScreenSharing
            ? renderScreen()
            : renderCamera(undefined, undefined, false, rest.cameraShape)}
        </div>

        {/* PiP Window */}
        {isScreenSharing && containerSize.width > 0 && !props.canvasLayout && (
          <PipWindow
            sceneId={sceneId}
            containerSize={containerSize}
            pipPosition={rest.pipPosition}
            pipSize={rest.pipSize}
            cameraShape={rest.cameraShape}
            pipBorder={rest.pipBorder}
            pipShadow={rest.pipShadow}
            customMaskUrl={rest.customMaskUrl}
            screenShareMode={props.screenShareMode}
            pipRotation={rest.pipRotation}
            onPipPositionChange={rest.onPipPositionChange}
            onPipSizeChange={rest.onPipSizeChange}
            onInternalDragStart={onInternalDragStart}
            onInternalDragStop={onInternalDragStop}
            renderContent={renderCamera}
            renderScreen={renderScreen}
            currentAspectRatio={getNumericAspectRatio(
              rest.cameraShape,
              props.sidebarProps.cameraAspectRatio,
              props.sidebarProps.customAspectRatio
            )}
          />
        )}
      </div>
    );
  };

  // --- Animation Logic ---
  const getAnimationClass = () => {
    if (!transition || transition.type === "none") return "opacity-100";
    const isNewScene = transition.toSceneId === props.sceneId;
    if (isTransitioningOut) {
      switch (transition.type) {
        case "dissolve":
          return "animate-dissolve-out";
        case "slide":
          return isNewScene
            ? "animate-slide-out-to-right"
            : "animate-slide-out-to-left";
        default:
          return "animate-dissolve-out";
      }
    }
    if (isTransitioningIn) {
      switch (transition.type) {
        case "dissolve":
          return "animate-dissolve-in";
        case "slide":
          return isNewScene
            ? "animate-slide-in-from-right"
            : "animate-slide-in-from-left";
        default:
          return "animate-dissolve-in";
      }
    }
    return "opacity-100";
  };

  const getAnimationStyles = (): React.CSSProperties => {
    if (!transition) return {};
    return {
      animationDuration: `${transition.durationMs}ms`,
      animationTimingFunction: isTransitioningIn
        ? transition.animationIn
        : transition.animationOut,
      animationFillMode: "forwards",
      zIndex: isTransitioningIn ? 2 : 1,
    };
  };

  // --- Component Tree ---

  const allOverlays: OverlayElement[] = useMemo(() => {
    const overlays: OverlayElement[] = [];
    textOverlays.forEach((o) =>
      overlays.push({ id: o.id, layout: o.layout, type: "text" })
    );
    browserOverlays.forEach((o) =>
      overlays.push({ id: o.id, layout: o.layout, type: "browser" })
    );
    fileOverlays.forEach((o) =>
      overlays.push({ id: o.id, layout: o.layout, type: "file" })
    );
    generatedOverlays.forEach((o) =>
      overlays.push({ id: o.id, layout: o.layout, type: "generated" })
    );
    return overlays;
  }, [textOverlays, browserOverlays, fileOverlays, generatedOverlays]);

  return (
    <div
      ref={canvasContainerRef}
      className={cn(
        "absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center",
        getAnimationClass(),
        !isMouseActive && isFullscreen && "cursor-none"
      )}
      style={{
        ...getAnimationStyles(),
        pointerEvents: isTransitioningOut ? "none" : "auto",
      }}
    >
      <div
        ref={sceneRef}
        className="relative overflow-hidden"
        style={{
          ...getCanvasAspectRatioStyle(
            props.sidebarProps.canvasAspectRatio,
            props.sidebarProps.customAspectRatio
          ),
          willChange: "transform",
        }}
        onClick={onDeselectAll}
        onMouseEnter={() => setIsCanvasHovered(true)}
        onMouseLeave={() => setIsCanvasHovered(false)}
      >
        <CanvasHoverToolbar
          blankCanvasColor={blankCanvasColor}
          onBlankCanvasColorChange={props.sidebarProps.onBlankCanvasColorChange}
          onCanvasBackgroundUpload={onCanvasBackgroundUpload}
          onCanvasBackgroundAssetSelect={props.onCanvasBackgroundAssetSelect}
          isVisible={isCanvasHovered}
          canvasLayout={props.canvasLayout}
          onCanvasLayoutChange={props.onCanvasLayoutChange}
          activeSequenceId={props.activeSequenceId}
        />

        {renderContent()}

        <canvas
          ref={props.canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 100 }}
        />

        {/* Overlays Below Video */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: "var(--z-overlays-below-video)" }}
        >
          <OverlayLayer
            layerOrder="below-video"
            sceneId={sceneId}
            containerSize={sceneSize}
            viewport={viewport}
            htmlOverlays={generatedOverlays}
            browserOverlays={browserOverlays}
            fileOverlays={fileOverlays}
            textOverlays={textOverlays}
            activeDynamicTargetId={
              dynamicLayout.isActive ? dynamicLayout.target?.id : undefined
            }
            onSetDynamicLayout={onSetDynamicLayout}
            onOverlayLayoutChange={rest.onOverlayLayoutChange}
            onRemoveOverlay={rest.onRemoveOverlay}
            onPreviewGenerated={onPreviewGenerated}
            portalContainer={
              typeof portalContainer === "function" ? null : portalContainer
            }
            allOverlays={allOverlays}
            onSnapGuidesChange={setActiveSnapGuides}
            onRemoveBrowser={onRemoveBrowser}
            onBrowserUrlChange={onBrowserUrlChange}
            onBrowserLayoutChange={onBrowserLayoutChange}
            selectedBrowserId={selectedBrowserId}
            onSelectBrowser={setSelectedBrowserId}
            onRemoveFile={onRemoveFile}
            onFileLayoutChange={onFileLayoutChange}
            selectedFileId={selectedFileId}
            onSelectFile={setSelectedFileId}
            onTextLayoutChange={onTextLayoutChange}
            onTextStyleChange={onTextStyleChange}
            onTextContentChange={onTextContentChange}
            onRemoveTextOverlay={onRemoveTextOverlay}
            containerRef={sceneRef}
            selectedTextId={selectedTextId}
            onSelectText={setSelectedTextId}
            isSpacePressed={isSpacePressed}
            onInternalDragStart={onInternalDragStart}
            onInternalDragStop={onInternalDragStop}
          />
        </div>

        {/* Overlays Above Video */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: "var(--z-overlays-above-video)" }}
        >
          <OverlayLayer
            layerOrder="above-video"
            sceneId={sceneId}
            containerSize={sceneSize}
            viewport={viewport}
            htmlOverlays={generatedOverlays}
            browserOverlays={browserOverlays}
            fileOverlays={fileOverlays}
            textOverlays={textOverlays}
            activeDynamicTargetId={
              dynamicLayout.isActive ? dynamicLayout.target?.id : undefined
            }
            onSetDynamicLayout={onSetDynamicLayout}
            onOverlayLayoutChange={rest.onOverlayLayoutChange}
            onRemoveOverlay={rest.onRemoveOverlay}
            onPreviewGenerated={onPreviewGenerated}
            portalContainer={
              typeof portalContainer === "function" ? null : portalContainer
            }
            allOverlays={allOverlays}
            onSnapGuidesChange={setActiveSnapGuides}
            onRemoveBrowser={onRemoveBrowser}
            onBrowserUrlChange={onBrowserUrlChange}
            onBrowserLayoutChange={onBrowserLayoutChange}
            selectedBrowserId={selectedBrowserId}
            onSelectBrowser={setSelectedBrowserId}
            onRemoveFile={onRemoveFile}
            onFileLayoutChange={onFileLayoutChange}
            selectedFileId={selectedFileId}
            onSelectFile={setSelectedFileId}
            onTextLayoutChange={onTextLayoutChange}
            onTextStyleChange={onTextStyleChange}
            onTextContentChange={onTextContentChange}
            onRemoveTextOverlay={onRemoveTextOverlay}
            containerRef={sceneRef}
            selectedTextId={selectedTextId}
            onSelectText={setSelectedTextId}
            isSpacePressed={isSpacePressed}
            onInternalDragStart={onInternalDragStart}
            onInternalDragStop={onInternalDragStop}
          />
        </div>
      </div>

      {/* AI Popover Trigger */}
      {containerSize.width > 0 && (
        <Rnd
          style={{ zIndex: "var(--z-ai-popover-trigger)" }}
          cancel=".aicp-content"
          size={{ width: 64, height: 64 }}
          position={{
            x: (aiButtonPosition.x / 100) * containerSize.width - 32,
            y: (aiButtonPosition.y / 100) * containerSize.height - 32,
          }}
          onDragStop={(e, d) => {
            const newX = ((d.x + 32) / containerSize.width) * 100;
            const newY = ((d.y + 32) / containerSize.height) * 100;
            onAiButtonPositionChange({ x: newX, y: newY });
          }}
          bounds="parent"
          disableDragging={false}
          enableResizing={false}
          className={cn(
            "pointer-events-auto transition-opacity duration-300",
            props.isMouseActive || !isFullscreen ? "opacity-100" : "opacity-0"
          )}
        >
          <AICommandPopover
            onSubmit={rest.onProcessTranscript}
            isProcessing={props.isProcessingAi}
            activeOverlays={generatedOverlays}
            isFullscreen={isFullscreen}
            isAiModeEnabled={isAiModeEnabled}
            onAiModeToggle={onAiModeToggle}
            captionsEnabled={captionsEnabled}
            onCaptionsToggle={onCaptionsToggle}
            portalContainer={canvasContainerRef.current}
            hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
            onAutoClose={props.onAiPopoverAutoClose}
          >
            <Button
              size="icon"
              className="rounded-full h-16 w-16 shadow-lg bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-8 w-8" />
            </Button>
          </AICommandPopover>
        </Rnd>
      )}

      {/* Snap Guide Lines */}
      {activeSnapGuides.map((guide, index) => (
        <SnapGuideLine
          key={index}
          axis={guide.axis}
          position={guide.position}
          containerSize={sceneSize}
          type={guide.type}
        />
      ))}
    </div>
  );
};
