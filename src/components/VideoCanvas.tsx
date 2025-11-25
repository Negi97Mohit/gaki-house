// src/components/VideoCanvas.tsx

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Mic,
  MicOff,
  Webcam,
  VideoOff,
  ScreenShare,
  Square,
  ChevronUp,
  Check,
  Circle,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Video,
  X,
  Expand,
  Shrink,
  Library,
  Frame,
  Monitor,
  Paintbrush,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDeepgramSpeech } from "@/hooks/useDeepgramSpeech";
import { useVideoStreams } from "@/hooks/useVideoStreams";
import { Rnd } from "react-rnd";
import {
  GeneratedOverlay,
  GeneratedLayout,
  LayoutMode,
  CameraShape,
  CaptionStyle,
  FileOverlayState,
  TextOverlayState,
  SceneTransition,
  CanvasLayoutState,
  CanvasSectionCameraState,
} from "@/types/caption";
import {
  DraggableFileViewer,
  FileRenderer,
} from "@/components/DraggableFileViewer";
import { LayoutControls } from "@/components/LayoutControls";
import { CameraRenderer } from "@/components/CameraRenderer";
import { AICommandPopover } from "@/components/AICommandPopover";
import { CaptionRenderer } from "@/components/CaptionRenderer";
import { generatePreview } from "@/lib/preview";
import { DynamicLayoutPicker } from "./DynamicLayoutPicker";
import {
  DraggableBrowser,
  BrowserOverlayState,
} from "@/components/DraggableBrowser";
import { AssetResult } from "@/components/AssetLibrary";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useTheme } from "next-themes";
import { DraggableTextOverlay } from "@/components/DraggableTextOverlay";
import { TextEditingToolbar } from "@/components/TextEditingToolbar";
import { ASPECT_RATIOS } from "@/lib/backgrounds";
import { CanvasHoverToolbar } from "@/components/CanvasHoverToolbar";
import { CanvasGridLayout } from "@/components/CanvasGridLayout";
import { SnapGuideLine } from "@/components/SnapGuideLine";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
// --- UPDATED COMPONENT ---
export const HtmlOverlayRenderer: React.FC<{
  htmlContent: string;
  theme: string | undefined;
}> = ({ htmlContent, theme }) => {
  const colorScheme = theme === "dark" ? "dark" : "light";
  const transparentStyle = `
    <style>
      html {
        color-scheme: ${colorScheme};
      }
      html, body {
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    </style>
  `;
  const finalHtml = htmlContent.replace(
    "</head>",
    `${transparentStyle}</head>`
  );

  return (
    <iframe
      srcDoc={finalHtml}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        pointerEvents: "none",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
      sandbox="allow-scripts allow-same-origin"
      title="ai-generated-overlay"
    />
  );
};

export const DraggableOverlay: React.FC<{
  overlay: GeneratedOverlay;
  onLayoutChange: (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => void;
  onRemoveOverlay: (id: string) => void;
  onPreviewGenerated: (id: string, dataUrl: string) => void;
  onSetDynamicLayout: (
    target: { id: string; type: string },
    mode: "pip" | "reset" | "split-horizontal" | "split-vertical"
  ) => void;
  containerSize: { width: number; height: number };
  portalContainer?: HTMLElement | null;
}> = ({
  overlay,
  onLayoutChange,
  onRemoveOverlay,
  onPreviewGenerated,
  onSetDynamicLayout,
  containerSize,
  portalContainer,
}) => {
    const { theme } = useTheme();
    const elementRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (overlay.preview === "" && elementRef.current) {
        const timer = setTimeout(async () => {
          if (elementRef.current) {
            const previewDataUrl = await generatePreview(elementRef.current);
            if (previewDataUrl) {
              onPreviewGenerated(overlay.id, previewDataUrl);
            }
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }, [overlay.id, overlay.preview, onPreviewGenerated]);

    const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (!elementRef.current) return;
      const box = elementRef.current.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const centerY = box.top + box.height / 2;
      const startAngle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const initialRotation = overlay.layout.rotation || 0;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentAngle =
          Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
          (180 / Math.PI);
        const angleDiff = currentAngle - startAngle;
        onLayoutChange(overlay.id, "rotation", initialRotation + angleDiff);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    if (!containerSize.width || !containerSize.height) return null;

    const isFullscreen =
      overlay.layout.size.width >= 99.5 && overlay.layout.size.height >= 99.5;

    const widthPx = (containerSize.width * overlay.layout.size.width) / 100;
    const heightPx = (containerSize.height * overlay.layout.size.height) / 100;
    // --- REFACTOR: Removed center-point logic ---
    const xPx = (containerSize.width * overlay.layout.position.x) / 100;
    const yPx = (containerSize.height * overlay.layout.position.y) / 100;
    // --- END REFACTOR ---

    const [isResizing, setIsResizing] = useState(false);
    return (
      <Rnd
        size={{ width: widthPx, height: heightPx }}
        position={{ x: xPx, y: yPx }}
        onDragStop={(e, d) => {
          // --- REFACTOR: Convert from top-left pixel to top-left percentage ---
          let newX = (d.x / containerSize.width) * 100;
          let newY = (d.y / containerSize.height) * 100;

          // Boundary Enforcement
          newX = Math.max(0, Math.min(newX, 100 - overlay.layout.size.width));
          newY = Math.max(0, Math.min(newY, 100 - overlay.layout.size.height));
          // --- END REFACTOR ---
          onLayoutChange(overlay.id, "position", { x: newX, y: newY });
        }}
        onResizeStart={() => setIsResizing(true)}
        onResizeStop={(e, direction, ref, delta, pos) => {
          setIsResizing(false);
          // --- REFACTOR: Convert from top-left pixel to top-left percentage ---
          let newWidthPercent =
            (parseInt(ref.style.width, 10) / containerSize.width) * 100;
          let newHeightPercent =
            (parseInt(ref.style.height, 10) / containerSize.height) * 100;
          let newX = (pos.x / containerSize.width) * 100;
          let newY = (pos.y / containerSize.height) * 100;

          // Boundary Enforcement
          newWidthPercent = Math.min(newWidthPercent, 100 - newX);
          newHeightPercent = Math.min(newHeightPercent, 100 - newY);
          // --- END REFACTOR ---

          onLayoutChange(overlay.id, "position", { x: newX, y: newY });
          onLayoutChange(overlay.id, "size", {
            width: newWidthPercent,
            height: newHeightPercent,
          });
        }}
        bounds="parent"
        minWidth={50}
        minHeight={50}
        enableResizing={!isFullscreen}
        disableDragging={isFullscreen}
        className="group pointer-events-auto"
        style={{ zIndex: overlay.layout.zIndex }}
      >
        <div
          ref={elementRef}
          className={cn(
            "w-full h-full relative border-2 border-dashed border-transparent transition-colors",
            !isFullscreen && "group-hover:border-primary",
            isFullscreen && "pointer-events-none"
          )}
          style={{
            transform: `rotate(${isResizing ? 0 : overlay.layout.rotation || 0
              }deg)`,
            transition: isResizing ? "none" : "transform 0.1s ease-in-out",
          }}
        >
          <div
            className={cn(
              "w-full h-full overflow-hidden",
              isFullscreen && "pointer-events-none"
            )}
          >
            <HtmlOverlayRenderer
              key={theme}
              htmlContent={overlay.htmlContent}
              theme={theme}
            />
          </div>
          <DynamicLayoutPicker
            onSelectLayout={(mode) =>
              onSetDynamicLayout({ id: overlay.id, type: "html" }, mode)
            }
            portalContainer={
              typeof portalContainer === "function" ? undefined : portalContainer
            }
          />
          {!isFullscreen && (
            <>
              <button
                onClick={() => onRemoveOverlay(overlay.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all pointer-events-auto z-50"
                style={{
                  transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                }}
              >
                <X className="w-4 h-4" />
              </button>
              <div
                onMouseDown={handleRotationStart}
                className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all pointer-events-auto cursor-alias"
                style={{
                  transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                  zIndex: "var(--z-draggable-element-active)",
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </div>
            </>
          )}
        </div>
      </Rnd>
    );
  };

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
  sidebarProps: {
    style: CaptionStyle;
    onStyleChange: (style: CaptionStyle) => void;
    dynamicStyle: string;
    onDynamicStyleChange: (styleId: string) => void;
    backgroundEffect: "none" | "blur" | "image";
    onBackgroundEffectChange: (effect: "none" | "blur" | "image") => void;
    backgroundImageUrl: string | null;
    onBackgroundImageUrlChange: (url: string | null) => void;
    blankCanvasColor: string;
    onBlankCanvasColorChange: (color: string) => void;
    isAutoFramingEnabled: boolean;
    onAutoFramingChange: (enabled: boolean) => void;
    savedOverlays: GeneratedOverlay[];
    onAddSavedOverlay: (overlay: GeneratedOverlay) => void;
    onDeleteSavedOverlay: (id: string) => void;
    videoFilter: string;
    onVideoFilterChange: (filter: string) => void;
    isBeautifyEnabled: boolean;
    onBeautifyToggle: (enabled: boolean) => void;
    isLowLightEnabled: boolean;
    onLowLightToggle: (enabled: boolean) => void;
    isNeonEdgeEnabled: boolean;
    neonIntensity: number;
    neonColor: string;
    onNeonEdgeToggle: (enabled: boolean) => void;
    onNeonIntensityChange: (intensity: number) => void;
    onNeonColorChange: (color: string) => void;
    zoomSensitivity: number;
    onZoomSensitivityChange: (value: number) => void;
    trackingSpeed: number;
    onTrackingSpeedChange: (value: number) => void;
    cameraBackground: "none" | "blur" | "image";
    onCameraBackgroundChange: (background: "none" | "blur" | "image") => void;
    onCustomBackgroundUpload: (file: File) => void;
    cameraAspectRatio: string;
    onCameraAspectRatioChange: (ratio: string) => void;
    canvasAspectRatio: string;
    onCanvasAspectRatioChange: (ratio: string) => void;
    customAspectRatio: string;
    onCustomAspectRatioChange: (ratio: string) => void;
    isFaceTrackingEnabled: boolean;
    onFaceTrackingToggle: (enabled: boolean) => void;
    pipBorder?: { color: string; width: number };
    onPipBorderChange: (border: { color: string; width: number }) => void;
    pipShadow?: { blur: number; color: string };
    onPipShadowChange: (shadow: { blur: number; color: string }) => void;
    activeInteractiveFilter:
    | "none"
    | "neon-edge"
    | "hologram"
    | "pixel"
    | "comic"
    | "ascii"
    | "thermal"
    | "mirror"
    | "kaleidoscope"
    | "oil-paint"
    | "sketch"
    | "prism"
    | "vhs"
    | "infrared"
    | "xray"
    | "cyberpunk";
    onInteractiveFilterChange: (
      filter:
        | "none"
        | "neon-edge"
        | "hologram"
        | "pixel"
        | "comic"
        | "ascii"
        | "thermal"
        | "mirror"
        | "kaleidoscope"
        | "oil-paint"
        | "sketch"
        | "prism"
        | "vhs"
        | "infrared"
        | "xray"
        | "cyberpunk"
    ) => void;
    filterIntensity: number;
    onFilterIntensityChange: (intensity: number) => void;
    filterColor: string;
    onFilterColorChange: (color: string) => void;
    filterTarget: "both" | "background" | "person";
    onFilterTargetChange: (target: "both" | "background" | "person") => void;
  };
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
  // --- ADDED ---
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  canvasAspectRatio: string;
  // --- END ADDED ---
}

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

// --- NEW HELPER COMPONENT FOR DYNAMIC LAYOUTS ---
const DynamicLayoutRenderer: React.FC<{
  target: { type: string; content: any };
  theme: string | undefined;
  fullTranscript: string;
  interimTranscript: string;
  sidebarProps: any;
}> = ({ target, theme, fullTranscript, interimTranscript, sidebarProps }) => {
  switch (target.type) {
    case "html":
      return (
        <HtmlOverlayRenderer
          htmlContent={target.content.htmlContent}
          theme={theme}
        />
      );
    case "file":
      return <FileRenderer overlay={target.content} />;
    case "browser":
      return (
        <iframe
          src={target.content.url}
          className="w-full h-full border-none"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      );
    case "caption":
      const captionText = (fullTranscript + " " + interimTranscript).trim();
      if (!captionText)
        return (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <p>No speech detected.</p>
          </div>
        );
      return (
        <CaptionRenderer
          activeStyleId={sidebarProps.dynamicStyle}
          captionStyle={sidebarProps.style}
          text={captionText}
          fullTranscript={fullTranscript}
          interimTranscript={interimTranscript}
          baseStyle={{
            fontFamily: sidebarProps.style.fontFamily,
            fontSize: `${sidebarProps.style.fontSize}px`,
            color: sidebarProps.style.color,
            textShadow: sidebarProps.style.shadow
              ? "2px 2px 4px rgba(0,0,0,0.5)"
              : "none",
            backgroundColor: sidebarProps.style.backgroundColor,
            border: sidebarProps.style.border
              ? `${sidebarProps.style.borderWidth}px solid ${sidebarProps.style.borderColor}`
              : "none",
            fontWeight: sidebarProps.style.bold ? "bold" : "normal",
            fontStyle: sidebarProps.style.italic ? "italic" : "normal",
            textDecoration: sidebarProps.style.underline ? "underline" : "none",
          }}
        />
      );
    default:
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p>Unsupported content type</p>
        </div>
      );
  }
};

const SNAP_THRESHOLD = 5;
// --- REFACTOR: Helper now converts top-left pixel to top-left percentage ---
const calculatePercentagePosition = (
  pixelX: number,
  pixelY: number,
  containerSize: { width: number; height: number }
): { x: number; y: number } | null => {
  if (
    !containerSize.width ||
    !containerSize.height ||
    containerSize.width <= 0 ||
    containerSize.height <= 0
  ) {
    return null;
  }
  const percentageX = (pixelX / containerSize.width) * 100;
  const percentageY = (pixelY / containerSize.height) * 100;
  return { x: percentageX, y: percentageY };
};
// --- END REFACTOR ---

// --- ADDED: Helper function ---
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
  return false; // Return false for "auto" or default
};
// --- END ADDED ---

// --- ADDED: Aspect Ratio Helper ---
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
    // If ratio is auto, it fills. If it's set, it will letterbox.
    objectFit: "contain",
  };
};

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
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const captionRndRef = useRef<Rnd | null>(null); // <-- ADD THIS REF
  // --- NEW: Scene size state for stable positioning ---
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const [activeSnapGuides, setActiveSnapGuides] = useState<GuideLine[]>([]);
  const [pipContent, setPipContent] = useState<"camera" | "share">("camera");

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
  const pipRndRef = useRef<Rnd | null>(null); // ADDED
  const { cameraStream, screenStream } = useVideoStreams({
    isCameraOn: isVideoOn,
    isAudioOn: isAudioOn,
    isScreenSharing: screenShareMode === "screen",
    selectedCameraDevice: selectedVideoDevice,
    selectedAudioDevice: selectedAudioDevice,
    onScreenShareEnd: () => onScreenShareModeChange("off"),
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const splitDividerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const captionRef = React.createRef<HTMLDivElement>(); // This ref is for the caption rotation
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
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
        // Optional: you could put the old zoom logic here if you want
        // it to work in other modes, but for now we'll do nothing.
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      // Get PiP size to offset the cursor (so cursor is at center of PiP)
      const pipWidthPx = (containerSize.width * props.pipSize.width) / 100;
      const pipHeightPx = (containerSize.height * props.pipSize.height) / 100;
      // --- REFACTOR: Use top-left logic ---
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      // 2. Convert to percentages
      const newXPercent = (mouseX / containerSize.width) * 100;
      const newYPercent = (mouseY / containerSize.height) * 100;

      // 3. Set the PiP position
      props.onPipPositionChange({
        x: Math.max(0, Math.min(newXPercent, 100 - props.pipSize.width)),
        y: Math.max(0, Math.min(newYPercent, 100 - props.pipSize.height)),
      });
      // --- END REFACTOR ---

      // 4. If not already sharing, switch to blank canvas (which triggers PiP)
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

  // --- Attach Listeners ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  const handleFinalTranscript = useCallback((text: string) => {
    console.log(`[VideoCanvas] Received Final Transcript: "${text}"`);
    clearTimeout(transcriptTimerRef.current);

    setFullTranscript(text);
    setInterimTranscript("");

    // Captions now work independently - AI processing only via manual commands

    transcriptTimerRef.current = setTimeout(() => {
      setFullTranscript("");
    }, 4000);
  }, []);

  const handlePartialTranscript = useCallback((text: string) => {
    console.log(`[VideoCanvas] Received Partial Transcript: "${text}"`);
    setInterimTranscript(text);
  }, []);

  const { startRecognition, stopRecognition } = useDeepgramSpeech({
    onFinalTranscript: handleFinalTranscript,
    onPartialTranscript: handlePartialTranscript,
    stream: audioStreamForSpeech,
  });

  useEffect(() => {
    console.log(`[VideoCanvas] Caption Effect [Scene: ${sceneId}]`, {
      isAudioOn,
      captionsEnabled,
    });
    if (audioStreamForSpeech && captionsEnabled) {
      console.log(`[VideoCanvas] Starting recognition for Scene ${sceneId}`);
      startRecognition();
    } else {
      console.log(`[VideoCanvas] Stopping recognition for Scene ${sceneId}`);
      stopRecognition();
    }
    return () => {
      console.log(
        `[VideoCanvas] CLEANUP: Stopping recognition for Scene ${sceneId}`
      );
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

  // --- ResizeObserver for canvasContainerRef ---
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

  // --- NEW: ResizeObserver for sceneRef (aspect-ratio container) ---
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

  const handlePipDragStop = (e: any, d: { x: number; y: number }) => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // --- REFACTOR: Calculate TOP-LEFT position, not center ---
    const pipWidthPercent = rest.pipSize.width;
    const pipHeightPercent =
      rest.cameraShape === "circle"
        ? (rest.pipSize.width * containerSize.width) / containerSize.height
        : rest.pipSize.height;

    // Convert top-left pixel to top-left percentage
    let newX = (d.x / rect.width) * 100;
    let newY = (d.y / rect.height) * 100;
    // --- END REFACTOR ---

    // --- REFACTOR: Snapping logic now works with top-left position ---
    if (newX < SNAP_THRESHOLD) newX = 2;
    if (newX > 100 - pipWidthPercent - SNAP_THRESHOLD)
      newX = 98 - pipWidthPercent;
    if (newY < SNAP_THRESHOLD) newY = 2;
    if (newY > 100 - pipHeightPercent - SNAP_THRESHOLD)
      newY = 98 - pipHeightPercent;

    // Boundary Enforcement
    newX = Math.max(0, Math.min(newX, 100 - pipWidthPercent));
    newY = Math.max(0, Math.min(newY, 100 - pipHeightPercent));
    // --- END REFACTOR ---

    rest.onPipPositionChange({ x: newX, y: newY });
  };

  // --- ADDED: PiP Rotation Handler ---
  const handlePipRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log(`[VideoCanvas PiP] handleRotationStart FIRED`); // DEBUG
    e.stopPropagation();
    onInternalDragStart();

    const selfElement = pipRndRef.current?.getSelfElement();
    if (!selfElement) return;

    const box = selfElement.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    // const initialRotation = props.pipRotation || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      console.log(`[VideoCanvas PiP] handleMouseMove`); // DEBUG
      const currentAngle =
        Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
        (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      // rest.onPipRotationChange(initialRotation + angleDiff);
    };

    const handleMouseUp = () => {
      console.log(`[VideoCanvas PiP] handleMouseUp`); // DEBUG
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onInternalDragStop();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  // --- END ADDED ---

  const handlePipResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: any // position is top-left (x, y)
  ) => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const newWidthPx = parseInt(ref.style.width, 10);
    let newWidth = (newWidthPx / rect.width) * 100;

    const currentAspectRatio = getNumericAspectRatio(
      rest.cameraShape,
      props.sidebarProps.cameraAspectRatio,
      props.sidebarProps.customAspectRatio
    );

    let newHeight =
      currentAspectRatio && typeof currentAspectRatio === "number"
        ? (newWidthPx / currentAspectRatio / rect.height) * 100
        : (parseInt(ref.style.height, 10) / rect.height) * 100;

    // --- REFACTOR: Calculate TOP-LEFT position from top-left and new size ---
    let newX = (position.x / rect.width) * 100;
    let newY = (position.y / rect.height) * 100;
    // --- END REFACTOR ---

    // Boundary Enforcement
    newX = Math.max(0, Math.min(newX, 100 - newWidth));
    newY = Math.max(0, Math.min(newY, 100 - newHeight));
    newWidth = Math.min(newWidth, 100 - newX);
    newHeight = Math.min(newHeight, 100 - newY);
    // --- END REFACTOR ---

    rest.onPipSizeChange({
      width: Math.max(10, Math.min(100, newWidth)),
      height: Math.max(10, Math.min(100, newHeight)),
    });
    // --- REFACTOR: Save the new TOP-LEFT position ---
    rest.onPipPositionChange({ x: newX, y: newY });
  };

  const getCameraShapeStyle = () => {
    // --- MODIFIED: This function now adds border and shadow ---
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
      console.log(`[VideoCanvas] Managing audio stream for Scene ${sceneId}`, {
        isAudioOn: props.isAudioOn,
      });
      if (props.isAudioOn) {
        try {
          const constraints: MediaStreamConstraints = {
            audio: selectedAudioDevice
              ? { deviceId: { exact: selectedAudioDevice } }
              : true,
          };
          console.log(`[VideoCanvas] Requesting dedicated audio stream...`);
          dedicatedAudioStream = await navigator.mediaDevices.getUserMedia(
            constraints
          );
          console.log(
            `[VideoCanvas] Dedicated audio stream aquired for Scene ${sceneId}`
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
        console.log(
          `[VideoCanvas] Audio is OFF. Cleaning up old stream for Scene ${sceneId}.`
        );
        if (audioStreamForSpeech) {
          audioStreamForSpeech.getTracks().forEach((track) => track.stop());
          setAudioStreamForSpeech(null);
        }
      }
    };

    manageAudioStream();

    return () => {
      console.log(
        `[VideoCanvas] CLEANUP: Stopping dedicated audio stream for Scene ${sceneId}`
      );
      if (dedicatedAudioStream) {
        dedicatedAudioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [props.isAudioOn, selectedAudioDevice, props.onAudioToggle, sceneId]);

  const videoFilterString = getVideoFilterStyle();

  const renderCamera = (
    className?: string,
    style?: React.CSSProperties,
    isPip: boolean = false,
    cameraShape?: CameraShape
  ) => {
    return (
      <div
        className={cn(
          "w-full h-full",
          className
          // --- REMOVED: aspect-square logic ---
        )}
        style={{ ...getCameraShapeStyle(), ...style }} // <-- Only shape/border/shadow style
      >
        <CameraRenderer
          stream={cameraStream}
          className="w-full h-full"
          portalContainer={
            typeof portalContainer === "function" ? undefined : portalContainer
          }
          style={{ ...style }}
          // --- Video/Stream Props ---
          videoFilter={videoFilterString}
          customBackgroundUrl={rest.backgroundImageUrl} // Note: This might be sidebarProps.backgroundImageUrl
          // --- Toolbar Props: State ---
          pipBorder={props.sidebarProps.pipBorder}
          pipShadow={props.sidebarProps.pipShadow}
          isAutoFramingEnabled={rest.isAutoFramingEnabled} // This seems to be from root props
          isBeautifyEnabled={props.sidebarProps.isBeautifyEnabled}
          isLowLightEnabled={props.sidebarProps.isLowLightEnabled}
          isNeonEdgeEnabled={isNeonEdgeEnabled} // From root props
          neonIntensity={neonIntensity} // From root props
          neonColor={neonColor} // From root props
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
          zoomSensitivity={rest.zoomSensitivity} // From root props
          trackingSpeed={rest.trackingSpeed} // From root props
          cameraBackground={props.sidebarProps.cameraBackground}
          // --- MODIFIED: Pass the sidebar props directly ---
          cameraAspectRatio={props.sidebarProps.cameraAspectRatio}
          customAspectRatio={props.sidebarProps.customAspectRatio}
          // --- END MODIFIED ---
          isFaceTrackingEnabled={props.sidebarProps.isFaceTrackingEnabled}
          // --- Toolbar Props: Handlers ---
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
          // --- Original Props (for background effect) ---
          backgroundEffect={rest.backgroundEffect}
          backgroundImageUrl={rest.backgroundImageUrl}
        />
      </div>
    );
  };

  const renderScreen = (className?: string) => {
    // --- NEW: Canvas Grid Layout Logic ---
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
    // --- END NEW ---

    // FIX: Show blank canvas when in 'canvas' mode
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

    // Only show "Select share source" when explicitly off
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
    // --- MOVED UP: Define mainContent first ---
    const mainIsCamera =
      (pipContent === "share" && props.screenShareMode !== "off") ||
      props.screenShareMode === "off";
    const mainContent = mainIsCamera
      ? renderCamera(undefined, undefined, false, rest.cameraShape)
      : renderScreen();
    // --- END MOVED UP ---

    if (dynamicLayout.isActive && dynamicLayout.target) {
      if (dynamicLayout.mode === "pip") {
        const pipSizePx = {
          width: (containerSize.width * dynamicPipSize.width) / 100,
          height: (containerSize.height * dynamicPipSize.height) / 100,
        };
        const pipPositionPx = {
          x: (containerSize.width * dynamicPipPosition.x) / 100,
          y: (containerSize.height * dynamicPipPosition.y) / 100,
        };

        return (
          <div className="w-full h-full relative bg-black">
            {mainContent}
            <Rnd
              size={pipSizePx}
              position={pipPositionPx}
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
              <DynamicLayoutRenderer
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
            <DynamicLayoutRenderer
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
              [isVertical ? "height" : "width"]: `${(1 - dynamicSplitRatio) * 100
                }%`,
            }}
          >
            {mainContent}
          </div>
        </div>
      );
    }

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
        // Don't set solid color if image is intended
        style.backgroundColor = blankCanvasColor;
      }
      return style;
    };

    if (rest.layoutMode === "solo") {
      return (
        <div className="w-full h-full relative" style={getBackgroundStyle()}>
          {/* --- MODIFIED: Pass cameraShape --- */}
          <div className="relative w-full h-full">
            {renderCamera(undefined, undefined, false, rest.cameraShape)}
          </div>
        </div>
      );
    }

    const pipVideoStyle = getCameraShapeStyle();

    // --- MODIFIED: This is where the core fix is ---
    const currentAspectRatio = getNumericAspectRatio(
      rest.cameraShape,
      props.sidebarProps.cameraAspectRatio,
      props.sidebarProps.customAspectRatio
    );

    const pipWidthPx = (containerSize.width * rest.pipSize.width) / 100;
    const pipHeightPx =
      currentAspectRatio && typeof currentAspectRatio === "number"
        ? pipWidthPx / currentAspectRatio // Derive height from width
        : (containerSize.height * rest.pipSize.height) / 100; // Fallback to state height

    const pipSizePx = {
      width: pipWidthPx,
      height: pipHeightPx,
    };
    // --- END MODIFICATION ---

    // --- REFACTOR: Calculate TOP-LEFT pixel position ---
    const pipPositionPx = {
      x: (containerSize.width * rest.pipPosition.x) / 100,
      y: (containerSize.height * rest.pipPosition.y) / 100,
    };
    // --- END REFACTOR ---

    // --- ADDED: Conditional resize handles for circle shape ---
    const circleResizeHandles = {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    };
    const defaultResizeHandles = {
      ...circleResizeHandles,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
      topLeft: true,
    };
    // --- END ADDED ---

    const pipContentEl =
      props.screenShareMode !== "off" &&
        containerSize.width > 0 &&
        !props.canvasLayout ? (
        <Rnd
          ref={pipRndRef}
          key={`pip-${sceneId}-${rest.pipPosition.x}-${rest.pipPosition.y}-${rest.pipSize.width}-${rest.pipSize.height}`}
          size={pipSizePx}
          position={pipPositionPx}
          minWidth={containerSize.width * 0.1}
          // --- MODIFIED: Set minHeight based on aspect ratio ---
          minHeight={
            currentAspectRatio && typeof currentAspectRatio === "number"
              ? (containerSize.width * 0.1) / currentAspectRatio
              : containerSize.height * 0.1
          }
          cancel=".rotate-handle"
          // --- END MODIFICATION ---
          maxWidth={containerSize.width * (100 - rest.pipPosition.x)}
          maxHeight={containerSize.height * (100 - rest.pipPosition.y)}
          // --- MODIFIED: Lock aspect ratio based on helper function ---
          lockAspectRatio={currentAspectRatio ? currentAspectRatio : false}
          // --- END MODIFICATION ---
          enableResizing={
            rest.cameraShape === "circle"
              ? circleResizeHandles
              : defaultResizeHandles
          }
          bounds="parent"
          onDragStop={handlePipDragStop}
          onResizeStop={handlePipResizeStop}
          className="pointer-events-auto"
          style={{
            zIndex: "var(--z-video-pip)",
            ...pipVideoStyle,
            // transform: `rotate(${rest.pipRotation || 0}deg)`,
          }}
        >
          <div
            className="w-full h-full relative group"
            style={{
              overflow: "hidden",
              // transform: `rotate(${props.pipRotation || 0}deg)`,
              transformOrigin: "center center",
              borderRadius: "inherit",
            }}
          >
            {/* This inner div is no longer responsible for border/shape */}
            {pipContent === "camera"
              ? // --- MODIFIED: Pass cameraShape ---
              renderCamera("cursor-move", {}, true, rest.cameraShape)
              : renderScreen("cursor-move")}
            <div className="absolute inset-0 w-full h-full border-2 border-primary border-dashed rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            <Button
              size="icon"
              variant="secondary"
              // style={{ transform: `rotate(-${props.pipRotation || 0}deg)` }}
              onClick={() =>
                setPipContent(pipContent === "camera" ? "share" : "camera")
              }
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {/* --- ADDED: PiP Rotation Handle --- */}
            <div
              onMouseDown={handlePipRotationStart}
              className={cn(
                "rotate-handle absolute -bottom-3 -left-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center transition-all hover:scale-110 cursor-alias",
                "opacity-0 group-hover:opacity-100"
              )}
              style={{
                // transform: `rotate(-${props.pipRotation || 0}deg)`,
                zIndex: "var(--z-draggable-element-active)",
              }}
            >
              <RotateCcw className="w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </Rnd>
      ) : null;

    const contentWithBackground = (
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
          {mainContent}
        </div>
        {pipContentEl}
      </div>
    );

    switch (rest.layoutMode) {
      case "pip":
        return contentWithBackground;
      case "split-vertical":
      case "split-horizontal":
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
                [isVertical ? "height" : "width"]: `${(1 - rest.splitRatio) * 100
                  }%`,
              }}
            >
              <div
                className="w-full h-full relative"
                style={getBackgroundStyle()}
              >
                {rest.backgroundEffect === "image" &&
                  rest.backgroundImageUrl && (
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
      default:
        return contentWithBackground;
    }
  };

  const handleCanvasClick = () => {
    onDeselectAll();
  };
  const allOverlays = useMemo((): OverlayElement[] => {
    const overlays: OverlayElement[] = [];
    textOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout, type: 'text' }));
    browserOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout, type: 'browser' }));
    fileOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout, type: 'file' }));
    generatedOverlays.forEach(o => overlays.push({ id: o.id, layout: o.layout, type: 'generated' }));
    return overlays;
  }, [textOverlays, browserOverlays, fileOverlays, generatedOverlays]);

  const filteredHtmlOverlays = dynamicLayout.isActive
    ? generatedOverlays.filter((o) => o.id !== dynamicLayout.target?.id)
    : generatedOverlays;
  const filteredFileOverlays = dynamicLayout.isActive
    ? fileOverlays.filter((o) => o.id !== dynamicLayout.target?.id)
    : fileOverlays;

  const filteredTextOverlays = dynamicLayout.isActive
    ? textOverlays.filter((o) => o.id !== dynamicLayout.target?.id)
    : textOverlays;

  const filteredBrowserOverlays = dynamicLayout.isActive
    ? browserOverlays.filter((o) => o.id !== dynamicLayout.target?.id)
    : browserOverlays;
  const shouldRenderCaptionOverlay =
    !dynamicLayout.isActive || dynamicLayout.target?.type !== "caption";

  // --- FIXED ANIMATION LOGIC ---
  const getAnimationClass = () => {
    if (!transition || transition.type === "none") {
      console.log("[VideoCanvas Animation] No transition");
      return "opacity-100";
    }

    console.log("[VideoCanvas Animation] State:", {
      sceneId: props.sceneId,
      transitionType: transition.type,
      isTransitioningIn,
      isTransitioningOut,
      fromScene: transition.fromSceneId,
      toScene: transition.toSceneId,
    });

    const isNewScene = transition.toSceneId === props.sceneId;

    if (isTransitioningOut) {
      console.log(
        "[VideoCanvas Animation] Scene transitioning OUT:",
        props.sceneId
      );
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
      console.log(
        "[VideoCanvas Animation] Scene transitioning IN:",
        props.sceneId
      );
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

    console.log(
      "[VideoCanvas Animation] Scene visible (no animation):",
      props.sceneId
    );
    return "opacity-100";
  };

  const getAnimationStyles = (): React.CSSProperties => {
    if (!transition) return {};

    const styles: React.CSSProperties = {
      animationDuration: `${transition.durationMs}ms`,
      animationTimingFunction: isTransitioningIn
        ? transition.animationIn
        : transition.animationOut,
      animationFillMode: "forwards",
    };

    if (isTransitioningIn) {
      styles.zIndex = 2;
    } else if (isTransitioningOut) {
      styles.zIndex = 1;
    }

    console.log("[VideoCanvas Animation] Styles:", styles);

    return styles;
  };

  return (
    <div
      ref={canvasContainerRef}
      // --- MODIFIED: Added flex wrapper for aspect ratio ---
      className={cn(
        "absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center", // Added flex
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
        onClick={handleCanvasClick}
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
        {/* Overlays Below Video Layer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: "var(--z-overlays-below-video)" }}
        >
          <div className="w-full h-full relative">
            {containerSize.width > 0 &&
              filteredHtmlOverlays
                .filter((o) => o.layout.layerOrder === "below-video")
                .map((overlay) => (
                  <DraggableOverlay
                    key={overlay.id}
                    overlay={overlay}
                    onSetDynamicLayout={onSetDynamicLayout}
                    onLayoutChange={rest.onOverlayLayoutChange}
                    onRemoveOverlay={rest.onRemoveOverlay}
                    onPreviewGenerated={onPreviewGenerated}
                    containerSize={containerSize}
                    portalContainer={
                      typeof portalContainer === "function"
                        ? null
                        : portalContainer
                    }
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}
            {sceneSize.width > 0 &&
              sceneSize.height > 0 &&
              filteredBrowserOverlays
                .filter(
                  (o) =>
                    (o.layout as GeneratedLayout).layerOrder === "below-video"
                )
                .map((browser) => (
                  <DraggableBrowser
                    key={`${sceneId}-${browser.id}`}
                    overlay={browser}
                    viewport={viewport}
                    onSetDynamicLayout={onSetDynamicLayout}
                    onRemove={onRemoveBrowser}
                    onUrlChange={onBrowserUrlChange}
                    onLayoutChange={onBrowserLayoutChange}
                    sceneSize={sceneSize}
                    isSelected={selectedBrowserId === browser.id}
                    onInternalDragStart={onInternalDragStart}
                    onInternalDragStop={onInternalDragStop}
                    onSelect={setSelectedBrowserId}
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}
            {sceneSize.width > 0 &&
              sceneSize.height > 0 &&
              filteredFileOverlays
                .filter(
                  (o) =>
                    (o.layout as GeneratedLayout).layerOrder === "below-video"
                )
                .map((file) => (
                  <DraggableFileViewer
                    key={`${sceneId}-${file.id}`}
                    overlay={file}
                    viewport={viewport}
                    onSetDynamicLayout={onSetDynamicLayout}
                    onRemove={onRemoveFile}
                    onLayoutChange={onFileLayoutChange}
                    sceneSize={sceneSize}
                    isSelected={selectedFileId === file.id}
                    onInternalDragStart={onInternalDragStart}
                    onInternalDragStop={onInternalDragStop}
                    onSelect={setSelectedFileId}
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}
            {sceneSize.width > 0 &&
              sceneSize.height > 0 &&
              filteredTextOverlays
                .filter(
                  (o) =>
                    (o.layout as GeneratedLayout).layerOrder === "below-video"
                )
                .map((textOverlay) => (
                  <DraggableTextOverlay
                    key={`${sceneId}-${textOverlay.id}`}
                    overlay={textOverlay}
                    onLayoutChange={onTextLayoutChange}
                    onStyleChange={onTextStyleChange}
                    onContentChange={onTextContentChange}
                    onRemove={onRemoveTextOverlay}
                    sceneSize={sceneSize}
                    containerRef={sceneRef}
                    isSelected={selectedTextId === textOverlay.id}
                    onSelect={setSelectedTextId}
                    onInternalDragStart={onInternalDragStart}
                    onInternalDragStop={onInternalDragStop}
                    isSpacePressed={isSpacePressed}
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}
          </div>
        </div>

        {/* Overlays Above Video Layer (Default) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: "var(--z-overlays-above-video)" }}
        >
          <div className="w-full h-full relative">
            {containerSize.width > 0 &&
              filteredHtmlOverlays
                .filter(
                  (o) =>
                    !o.layout.layerOrder ||
                    o.layout.layerOrder === "above-video" ||
                    o.layout.layerOrder === "auto"
                )
                .map((overlay) => (
                  <DraggableOverlay
                    key={overlay.id}
                    overlay={overlay}
                    onSetDynamicLayout={onSetDynamicLayout}
                    onLayoutChange={rest.onOverlayLayoutChange}
                    onRemoveOverlay={rest.onRemoveOverlay}
                    onPreviewGenerated={onPreviewGenerated}
                    containerSize={containerSize}
                    portalContainer={
                      typeof portalContainer === "function"
                        ? null
                        : portalContainer
                    }
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}
            {sceneSize.width > 0 &&
              sceneSize.height > 0 &&
              filteredBrowserOverlays
                .filter(
                  (o) =>
                    !(o.layout as GeneratedLayout).layerOrder ||
                    (o.layout as GeneratedLayout).layerOrder ===
                    "above-video" ||
                    (o.layout as GeneratedLayout).layerOrder === "auto"
                )
                .map((browser) => (
                  <DraggableBrowser
                    key={`${sceneId}-${browser.id}`}
                    overlay={browser}
                    viewport={viewport}
                    onSetDynamicLayout={onSetDynamicLayout}
                    onRemove={onRemoveBrowser}
                    onUrlChange={onBrowserUrlChange}
                    onLayoutChange={onBrowserLayoutChange}
                    sceneSize={sceneSize}
                    isSelected={selectedBrowserId === browser.id}
                    onInternalDragStart={onInternalDragStart}
                    onInternalDragStop={onInternalDragStop}
                    onSelect={setSelectedBrowserId}
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}
            {sceneSize.width > 0 &&
              sceneSize.height > 0 &&
              filteredFileOverlays
                .filter(
                  (o) =>
                    !(o.layout as GeneratedLayout).layerOrder ||
                    (o.layout as GeneratedLayout).layerOrder ===
                    "above-video" ||
                    (o.layout as GeneratedLayout).layerOrder === "auto"
                )
                .map((file) => (
                  <DraggableFileViewer
                    key={`${sceneId}-${file.id}`}
                    overlay={file}
                    viewport={viewport}
                    onSetDynamicLayout={onSetDynamicLayout}
                    onRemove={onRemoveFile}
                    onLayoutChange={onFileLayoutChange}
                    sceneSize={sceneSize}
                    isSelected={selectedFileId === file.id}
                    onInternalDragStart={onInternalDragStart}
                    onInternalDragStop={onInternalDragStop}
                    onSelect={setSelectedFileId}
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}
            {sceneSize.width > 0 &&
              sceneSize.height > 0 &&
              filteredTextOverlays
                .filter(
                  (o) =>
                    !(o.layout as GeneratedLayout).layerOrder ||
                    (o.layout as GeneratedLayout).layerOrder ===
                    "above-video" ||
                    (o.layout as GeneratedLayout).layerOrder === "auto"
                )
                .map((textOverlay) => (
                  <DraggableTextOverlay
                    key={`${sceneId}-${textOverlay.id}`}
                    overlay={textOverlay}
                    onLayoutChange={onTextLayoutChange}
                    onStyleChange={onTextStyleChange}
                    onContentChange={onTextContentChange}
                    onRemove={onRemoveTextOverlay}
                    sceneSize={sceneSize}
                    containerRef={sceneRef}
                    isSelected={selectedTextId === textOverlay.id}
                    onSelect={setSelectedTextId}
                    onInternalDragStart={onInternalDragStart}
                    onInternalDragStop={onInternalDragStop}
                    isSpacePressed={isSpacePressed}
                    allOverlays={allOverlays}
                    onSnapGuidesChange={setActiveSnapGuides}
                  />
                ))}

            {/* --- MODIFIED: Add containerSize check --- */}
            {containerSize.width > 0 &&
              (() => {
                const captionText = (
                  fullTranscript +
                  " " +
                  interimTranscript
                ).trim();
                const captionStyle = liveCaptionStyle;
                if (
                  !captionsEnabled ||
                  containerSize.width === 0 ||
                  !shouldRenderCaptionOverlay ||
                  !captionText // <-- ADD THIS CHECK
                )
                  return null;

                const handleCaptionRotationStart = (
                  e: React.MouseEvent<HTMLDivElement>
                ) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!captionRef.current) return;
                  const box = captionRef.current.getBoundingClientRect();
                  const centerX = box.left + box.width / 2;
                  const centerY = box.top + box.height / 2;
                  const startAngle =
                    Math.atan2(e.clientY - centerY, e.clientX - centerX) *
                    (180 / Math.PI);
                  const initialRotation = captionStyle.rotation || 0;

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const currentAngle =
                      Math.atan2(
                        moveEvent.clientY - centerY,
                        moveEvent.clientX - centerX
                      ) *
                      (180 / Math.PI);
                    const angleDiff = currentAngle - startAngle;
                    props.onStyleChange({
                      ...captionStyle,
                      rotation: initialRotation + angleDiff,
                    });
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                };

                const currentWidthPercent = captionStyle.width || 80;
                const widthPx =
                  (containerSize.width * currentWidthPercent) / 100;
                // --- REFACTOR: Use top-left logic ---
                const xPx =
                  (containerSize.width * captionStyle.position.x) / 100;
                const yPx =
                  (containerSize.height * captionStyle.position.y) / 100;
                // --- END REFACTOR ---

                return (
                  <Rnd
                    ref={captionRndRef}
                    size={{
                      width: widthPx,
                      height: "auto",
                    }}
                    position={{
                      x: xPx,
                      y: yPx,
                    }}
                    onDragStop={(e, d) => {
                      // --- FIX: Use the ref to get real dimensions for boundary checking ---
                      if (
                        !captionRndRef.current ||
                        !containerSize.width ||
                        !containerSize.height
                      )
                        return;

                      const selfElement =
                        captionRndRef.current.getSelfElement();
                      if (!selfElement) return;

                      const currentWidthPx = selfElement.offsetWidth;
                      const currentHeightPx = selfElement.offsetHeight;

                      // Clamp pixel values
                      const clampedX = Math.max(
                        0,
                        Math.min(d.x, containerSize.width - currentWidthPx)
                      );
                      const clampedY = Math.max(
                        0,
                        Math.min(d.y, containerSize.height - currentHeightPx)
                      );

                      // Convert clamped pixel values to percentages
                      const newPositionPercent = calculatePercentagePosition(
                        clampedX,
                        clampedY,
                        containerSize
                      );
                      if (newPositionPercent) {
                        onCaptionLayoutChange({
                          position: newPositionPercent,
                        });
                      }
                      // --- END FIX ---
                    }}
                    onResizeStop={(e, direction, ref, delta, pos) => {
                      // --- FIX: Use correct boundary logic, only update width ---
                      if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

                      const newWidthPx = parseInt(ref.style.width, 10);

                      const newPositionPercent = calculatePercentagePosition(
                        pos.x,
                        pos.y,
                        sceneSize
                      );
                      let newWidthPercent =
                        (newWidthPx / containerSize.width) * 100;

                      if (newPositionPercent) {
                        // Boundary Enforcement
                        newWidthPercent = Math.min(
                          newWidthPercent,
                          100 - newPositionPercent.x
                        );
                      }

                      if (newPositionPercent) {
                        // Update position
                        onCaptionLayoutChange({
                          position: newPositionPercent,
                          size: {
                            width: newWidthPercent,
                            height: 0, // Height is auto, send 0 or undefined
                          },
                        });
                        // Update the style's width property which controls the Rnd size
                        props.onStyleChange({
                          ...props.liveCaptionStyle,
                          width: newWidthPercent,
                        });
                      }
                      // --- END FIX ---
                    }}
                    bounds="parent"
                    className="group pointer-events-auto border-2 border-transparent hover:border-primary border-dashed"
                    style={{ zIndex: "var(--z-caption)" }}
                    minWidth={containerSize.width * 0.2}
                    disableDragging={false}
                    enableResizing={{
                      left: true,
                      right: true,
                      top: false,
                      bottom: false,
                      topLeft: false,
                      topRight: false,
                      bottomLeft: false,
                      bottomRight: false,
                    }}
                  >
                    <div
                      ref={captionRef}
                      // ref={captionRef} // This ref was for the inner div, but we need the Rnd ref
                      className="w-full h-full relative"
                      style={{
                        transform: `rotate(${captionStyle.rotation || 0}deg)`,
                      }}
                    >
                      <DynamicLayoutPicker
                        onSelectLayout={(mode) =>
                          onSetDynamicLayout(
                            { id: "live-caption", type: "caption" },
                            mode as
                            | "split-horizontal"
                            | "split-vertical"
                            | "pip"
                            | "reset"
                          )
                        }
                      />
                      <CaptionRenderer
                        activeStyleId={dynamicStyle}
                        captionStyle={captionStyle}
                        text={captionText}
                        fullTranscript={fullTranscript}
                        interimTranscript={interimTranscript}
                        baseStyle={{
                          fontFamily: captionStyle.fontFamily,
                          fontSize: `${captionStyle.fontSize}px`,
                          color: captionStyle.color,
                          textShadow: captionStyle.shadow
                            ? "2px 2px 4px rgba(0,0,0,0.5)"
                            : "none",
                          backgroundColor: captionStyle.backgroundColor,
                          border: captionStyle.border
                            ? `${captionStyle.borderWidth}px solid ${captionStyle.borderColor}`
                            : "none",
                          fontWeight: captionStyle.bold ? "bold" : "normal",
                          fontStyle: captionStyle.italic ? "italic" : "normal",
                          textDecoration: captionStyle.underline
                            ? "underline"
                            : "none",
                        }}
                      />
                      <div
                        onMouseDown={handleCaptionRotationStart}
                        className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto cursor-alias"
                        style={{ zIndex: "var(--z-draggable-element-active)" }}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </div>
                    </div>
                  </Rnd>
                );
              })()}
          </div>
        </div>
      </div>

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
      )
      }
      {/* Snap Guide Lines - Always Rendered */}
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