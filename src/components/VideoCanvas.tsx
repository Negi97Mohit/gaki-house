// src/components/VideoCanvas.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Monitor, // <-- Added
  Paintbrush, // <-- Added
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
  BrowserOverlayState,
  TextOverlayState,
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
import { DraggableBrowser } from "@/components/DraggableBrowser";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useTheme } from "next-themes";
import { DraggableTextOverlay } from "@/components/DraggableTextOverlay";
import { TextEditingToolbar } from "@/components/TextEditingToolbar";

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
    target: { id: string; type: "html" },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => void;
  containerSize: { width: number; height: number };
  portalContainer?: HTMLElement | null;
  isSpacePressed: boolean; // <-- Added
}> = ({
  overlay,
  onLayoutChange,
  onRemoveOverlay,
  onPreviewGenerated,
  onSetDynamicLayout,
  containerSize,
  portalContainer,
  isSpacePressed, // <-- Added
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
  const xPx =
    (containerSize.width * overlay.layout.position.x) / 100 - widthPx / 2;
  const yPx =
    (containerSize.height * overlay.layout.position.y) / 100 - heightPx / 2;

  const [isResizing, setIsResizing] = useState(false);
  return (
    <Rnd
      size={{ width: widthPx, height: heightPx }}
      position={{ x: xPx, y: yPx }}
      onDragStop={(e, d) => {
        const newX = ((d.x + widthPx / 2) / containerSize.width) * 100;
        const newY = ((d.y + heightPx / 2) / containerSize.height) * 100;
        onLayoutChange(overlay.id, "position", { x: newX, y: newY });
      }}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setIsResizing(false);
        const newWidthPercent =
          (parseInt(ref.style.width, 10) / containerSize.width) * 100;
        const newHeightPercent =
          (parseInt(ref.style.height, 10) / containerSize.height) * 100;
        const newX =
          ((pos.x + parseInt(ref.style.width, 10) / 2) / containerSize.width) *
          100;
        const newY =
          ((pos.y + parseInt(ref.style.height, 10) / 2) /
            containerSize.height) *
          100;
        onLayoutChange(overlay.id, "position", { x: newX, y: newY });
        onLayoutChange(overlay.id, "size", {
          width: newWidthPercent,
          height: newHeightPercent,
        });
      }}
      bounds="parent"
      minWidth={50}
      minHeight={50}
      enableResizing={!isSpacePressed} // <-- Updated
      disableDragging={isFullscreen || isSpacePressed} // <-- Updated
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
          transform: `rotate(${
            isResizing ? 0 : overlay.layout.rotation || 0
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
          portalContainer={portalContainer}
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
              className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all pointer-events-auto z-50 cursor-alias"
              style={{
                transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
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
  portalContainer: HTMLElement | null;
  browserOverlays: BrowserOverlayState[];
  onRemoveBrowser: (id: string) => void;
  onBrowserUrlChange: (id: string, url: string) => void;
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
  blankCanvasColor: string; // <-- Added
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

export const VideoCanvas = (props: VideoCanvasProps) => {
  const {
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
    dynamicLayout,
    onDeselectAll,
    blankCanvasColor,
    textOverlays,
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
    canvasRef,
    ...rest
  } = props;
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Pan and Zoom State
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const sceneRef = useRef<HTMLDivElement>(null);

  const [screenShareMode, setScreenShareMode] = useState<
    "off" | "screen" | "canvas"
  >("off"); // <-- Updated
  const [pipContent, setPipContent] = useState<"camera" | "share">("camera"); // <-- Updated

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
    isScreenSharing: screenShareMode === "screen", // <-- Updated
    selectedCameraDevice: selectedVideoDevice,
    selectedAudioDevice: selectedAudioDevice,
    onScreenShareEnd: () => setScreenShareMode("off"), // <-- Updated
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const splitDividerRef = useRef<HTMLDivElement>(null);
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioStreamForSpeech, setAudioStreamForSpeech] =
    useState<MediaStream | null>(null);
  const [fullTranscript, setFullTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const transcriptTimerRef = useRef<NodeJS.Timeout>();
  const fsSidebarContainerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(fsSidebarContainerRef, () => {
    if (isFsSidebarOpen) {
      onFsSidebarToggle(false);
    }
  });

  // --- Key Handlers ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (
      e.key === " " &&
      !e.ctrlKey &&
      !e.metaKey &&
      target.tagName !== "INPUT" &&
      target.tagName !== "TEXTAREA"
    ) {
      e.preventDefault(); // Prevent page scroll
      setIsSpacePressed(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === " ") {
      setIsSpacePressed(false);
      setIsPanning(false); // Stop panning when space is released
    }
  }, []);

  // --- Wheel Handler ---
  const handleWheel = useCallback((e: WheelEvent) => {
    const container = canvasContainerRef.current;
    if (!container) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setViewport((prev) => {
      const delta = e.deltaY * -0.005;
      const newScale = Math.max(0.1, Math.min(5, prev.scale + delta));

      const mouseSceneX = mouseX / prev.scale - prev.x;
      const mouseSceneY = mouseY / prev.scale - prev.y;

      const newX = mouseX / newScale - mouseSceneX;
      const newY = mouseY / newScale - mouseSceneY;
      console.log("[Viewport Wheel]", { scale: newScale, x: newX, y: newY });
      return { scale: newScale, x: newX, y: newY };
    });
  }, []);

  // --- Reset View Handler ---
  const handleResetView = useCallback(() => {
    setViewport({ scale: 1, x: 0, y: 0 });
    console.log("[Viewport Reset]", { scale: 1, x: 0, y: 0 });
  }, []);

  // --- Attach Listeners ---
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleKeyDown, handleKeyUp, handleWheel]);

  // --- Pan Mouse Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSpacePressed) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = (e.clientX - panStartRef.current.x) / viewport.scale;
    const dy = (e.clientY - panStartRef.current.y) / viewport.scale;

    setViewport((prev) => ({
      scale: prev.scale,
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    console.log("[Viewport Pan]", { x: viewport.x + dx, y: viewport.y + dy });
    panStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleFinalTranscript = useCallback(
    (text: string) => {
      clearTimeout(transcriptTimerRef.current);

      setFullTranscript(text);
      setInterimTranscript("");

      rest.onProcessTranscript(text, null);

      transcriptTimerRef.current = setTimeout(() => {
        setFullTranscript("");
      }, 4000);
    },
    [rest.onProcessTranscript]
  );

  const { startRecognition, stopRecognition } = useDeepgramSpeech({
    onFinalTranscript: handleFinalTranscript,
    onPartialTranscript: setInterimTranscript,
    stream: audioStreamForSpeech,
  });

  useEffect(() => {
    if (audioStreamForSpeech) {
      startRecognition();
    } else {
      stopRecognition();
      if (!isAudioOn) {
        setFullTranscript("");
        setInterimTranscript("");
      }
    }
  }, [audioStreamForSpeech, isAudioOn, startRecognition, stopRecognition]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
        setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
      } catch (err) {
        toast.error(
          "Could not access camera or microphone. Please check permissions."
        );
      }
    };
    getDevices();
  }, []);

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

  const handleStartRecording = () => {
    const outputStream = new MediaStream();

    if (screenShareMode === "screen" && screenStream) {
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      if (screenVideoTrack) outputStream.addTrack(screenVideoTrack.clone());
    }

    if (isVideoOn && cameraStream) {
      const cameraVideoTrack = cameraStream.getVideoTracks()[0];
      if (cameraVideoTrack) outputStream.addTrack(cameraVideoTrack.clone());
    }

    if (isAudioOn) {
      if (
        screenShareMode === "screen" &&
        screenStream?.getAudioTracks().length > 0
      ) {
        const screenAudioTrack = screenStream.getAudioTracks()[0];
        if (screenAudioTrack) outputStream.addTrack(screenAudioTrack.clone());
      } else if (cameraStream?.getAudioTracks().length > 0) {
        const cameraAudioTrack = cameraStream.getAudioTracks()[0];
        if (cameraAudioTrack) outputStream.addTrack(cameraAudioTrack.clone());
      }
    }

    if (outputStream.getTracks().length === 0) {
      toast.error("No stream available to record.");
      return;
    }

    recordedChunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(outputStream, {
      mimeType: "video/webm; codecs=vp9",
    });
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gaki-recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Recording downloaded!");
    };
    mediaRecorderRef.current.start();
    onRecordingToggle(true, cameraStream as MediaStream, containerSize);
    toast.info("Recording started!");
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording")
      mediaRecorderRef.current.stop();
    onRecordingToggle(false, cameraStream as MediaStream, containerSize);
  };

  // Updated handler
  const handleShareModeChange = (mode: "off" | "screen" | "canvas") => {
    setScreenShareMode(mode);
  };

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

  useEffect(() => {
    let dedicatedAudioStream: MediaStream | null = null;

    const manageAudioStream = async () => {
      if (isAudioOn) {
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
          onAudioToggle(false);
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
  }, [isAudioOn, selectedAudioDevice, onAudioToggle]);

  const handlePipDragStop = (e: any, d: { x: number; y: number }) => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let newX = (d.x / rect.width) * 100;
    let newY = (d.y / rect.height) * 100;

    const pipWidthPercent = rest.pipSize.width;
    const pipHeightPercent = rest.pipSize.height;
    if (newX < SNAP_THRESHOLD) newX = 2;
    if (newX > 100 - pipWidthPercent - SNAP_THRESHOLD)
      newX = 98 - pipWidthPercent;
    if (newY < SNAP_THRESHOLD) newY = 2;
    if (newY > 100 - pipHeightPercent - SNAP_THRESHOLD)
      newY = 98 - pipHeightPercent;

    rest.onPipPositionChange({ x: newX, y: newY });
  };

  const handlePipResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: any
  ) => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newWidth = (parseInt(ref.style.width, 10) / rect.width) * 100;
    const newHeight = (parseInt(ref.style.height, 10) / rect.height) * 100;
    const newX = (position.x / rect.width) * 100;
    const newY = (position.y / rect.height) * 100;

    rest.onPipSizeChange({
      width: Math.max(10, Math.min(50, newWidth)),
      height: Math.max(10, Math.min(50, newHeight)),
    });
    rest.onPipPositionChange({ x: newX, y: newY });
  };

  const getCameraShapeStyle = () => {
    const baseStyle: React.CSSProperties = { overflow: "hidden" };
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

  const videoFilterString = getVideoFilterStyle();

  const renderCamera = (
    className?: string,
    style?: React.CSSProperties,
    isPip: boolean = false
  ) => (
    <div
      className={cn(
        "w-full h-full",
        className,
        isPip && rest.cameraShape === "circle" && "aspect-square"
      )}
      style={getCameraShapeStyle()}
    >
      {rest.backgroundEffect !== "none" ||
      rest.isAutoFramingEnabled ||
      isNeonEdgeEnabled ||
      videoFilterString !== "none" ? (
        <CameraRenderer
          stream={cameraStream}
          backgroundEffect={rest.backgroundEffect}
          backgroundImageUrl={rest.backgroundImageUrl}
          isAutoFramingEnabled={rest.isAutoFramingEnabled}
          zoomSensitivity={rest.zoomSensitivity}
          trackingSpeed={rest.trackingSpeed}
          className="w-full h-full"
          style={{ ...style }}
          videoFilter={videoFilterString}
          isNeonEdgeEnabled={isNeonEdgeEnabled}
          neonIntensity={neonIntensity}
          neonColor={neonColor}
        />
      ) : (
        <VideoPlayer
          stream={cameraStream}
          className="w-full h-full object-cover"
          style={{ ...style, filter: videoFilterString }}
        />
      )}
    </div>
  );

  // Updated renderScreen function
  const renderScreen = (className?: string) => {
    if (screenShareMode === "screen" && screenStream) {
      return (
        <VideoPlayer
          stream={screenStream}
          className={cn("w-full h-full object-cover", className)}
        />
      );
    }

    if (screenShareMode === "canvas") {
      return (
        <div
          className="w-full h-full"
          style={{ backgroundColor: blankCanvasColor }}
        />
      );
    }

    // Fallback / 'off' state
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
            {renderCamera()}
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
              [isVertical ? "height" : "width"]: `${
                (1 - dynamicSplitRatio) * 100
              }%`,
            }}
          >
            {renderCamera()}
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
      }
      return style;
    };

    if (rest.layoutMode === "solo") {
      return (
        <div className="w-full h-full relative" style={getBackgroundStyle()}>
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
          <div className="relative w-full h-full">{renderCamera()}</div>
        </div>
      );
    }

    // Updated main content check
    const mainIsCamera =
      (pipContent === "share" && screenShareMode !== "off") ||
      screenShareMode === "off";
    const mainContent = mainIsCamera ? renderCamera() : renderScreen();
    // Updated pip content check
    const pipVideo =
      pipContent === "camera"
        ? renderCamera("cursor-move", {}, true)
        : renderScreen("cursor-move");

    const pipSizePx = {
      width: (containerSize.width * rest.pipSize.width) / 100,
      height: (containerSize.height * rest.pipSize.height) / 100,
    };
    const pipPositionPx = {
      x: (containerSize.width * rest.pipPosition.x) / 100,
      y: (containerSize.height * rest.pipPosition.y) / 100,
    };

    // Updated pip display check
    const pipContentEl = screenShareMode !== "off" &&
      isVideoOn &&
      cameraStream &&
      containerSize.width > 0 && (
        <Rnd
          size={pipSizePx}
          position={pipPositionPx}
          minWidth={containerSize.width * 0.1}
          minHeight={containerSize.height * 0.1}
          maxWidth={containerSize.width * 0.5}
          maxHeight={containerSize.height * 0.5}
          bounds="parent"
          onDragStop={handlePipDragStop}
          onResizeStop={handlePipResizeStop}
          className="pointer-events-auto"
          style={{ zIndex: 210 }}
        >
          <div className="w-full h-full relative group">
            {pipVideo}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={
                () =>
                  setPipContent(pipContent === "camera" ? "share" : "camera") // Updated state name
              }
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </Rnd>
      );

    const contentWithBackground = (
      <div className="w-full h-full relative" style={getBackgroundStyle()}>
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
                [isVertical ? "height" : "width"]: `${
                  (1 - rest.splitRatio) * 100
                }%`,
              }}
            >
              {isVideoOn && cameraStream ? (
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
                  <div className="relative w-full h-full">{renderCamera()}</div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Webcam className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Camera Off</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return contentWithBackground;
    }
  };

  const handleCanvasClick = () => {
    if (!isSpacePressed) {
      onDeselectAll();
    }
  };

  const filteredHtmlOverlays = dynamicLayout.isActive
    ? generatedOverlays.filter((o) => o.id !== dynamicLayout.target?.id)
    : generatedOverlays;
  const filteredFileOverlays = dynamicLayout.isActive
    ? fileOverlays.filter((o) => o.id !== dynamicLayout.target?.id)
    : fileOverlays;
  const filteredBrowserOverlays = dynamicLayout.isActive
    ? browserOverlays.filter((o) => o.id !== dynamicLayout.target?.id)
    : browserOverlays;
  const shouldRenderCaptionOverlay =
    !dynamicLayout.isActive || dynamicLayout.target?.type !== "caption";

  return (
    <div
      ref={canvasContainerRef}
      className={cn(
        "flex-1 relative bg-neutral-900 rounded-lg overflow-hidden border border-border/40",
        isFullscreen &&
          "fixed inset-0 w-screen h-screen z-[2000] rounded-none border-none",
        !isMouseActive && isFullscreen && "cursor-none",
        isPanning ? "cursor-grabbing" : isSpacePressed ? "cursor-grab" : ""
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Scene Wrapper */}
      <div
        ref={sceneRef}
        className="w-full h-full"
        style={{
          transform: `scale(${viewport.scale}) translate(${viewport.x}px, ${viewport.y}px)`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
        onClick={isSpacePressed ? undefined : handleCanvasClick}
      >
        {renderContent()}
        <canvas
          ref={props.canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 100 }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 220 }}
        >
          <div className="w-full h-full relative">
            {filteredHtmlOverlays.map((overlay) => (
              <DraggableOverlay
                key={overlay.id}
                overlay={overlay}
                onSetDynamicLayout={onSetDynamicLayout}
                onLayoutChange={rest.onOverlayLayoutChange}
                onRemoveOverlay={rest.onRemoveOverlay}
                onPreviewGenerated={onPreviewGenerated}
                containerSize={containerSize}
                portalContainer={portalContainer}
                isSpacePressed={isSpacePressed}
              />
            ))}
            {filteredBrowserOverlays.map((browser) => (
              <div
                key={`browser-wrapper-${browser.id}`}
                style={{ pointerEvents: isSpacePressed ? "none" : "auto" }}
              >
                <DraggableBrowser
                  key={browser.id}
                  overlay={browser}
                  viewport={viewport}
                  canvasContainerRef={canvasContainerRef}
                  onSetDynamicLayout={onSetDynamicLayout}
                  onRemove={onRemoveBrowser}
                  onUrlChange={onBrowserUrlChange}
                  onLayoutChange={onBrowserLayoutChange}
                  containerSize={containerSize}
                  isSelected={selectedBrowserId === browser.id}
                  onInternalDragStart={onInternalDragStart}
                  onInternalDragStop={onInternalDragStop}
                  onSelect={setSelectedBrowserId}
                />
              </div>
            ))}
            {filteredFileOverlays.map((file) => (
              <div
                key={`file-wrapper-${file.id}`}
                style={{ pointerEvents: isSpacePressed ? "none" : "auto" }}
              >
              <DraggableFileViewer
                  key={file.id}
                  overlay={file}
                  viewport={viewport}
                  onSetDynamicLayout={onSetDynamicLayout}
                  onRemove={onRemoveFile}
                  onLayoutChange={onFileLayoutChange}
                  containerSize={containerSize}
                  isSelected={selectedFileId === file.id}
                  onInternalDragStart={onInternalDragStart}
                  onInternalDragStop={onInternalDragStop}
                  onSelect={setSelectedFileId}
                  canvasContainerRef={canvasContainerRef}
                />
              </div>
            ))}
            {(() => {
              const captionText = (
                fullTranscript +
                " " +
                interimTranscript
              ).trim();
              const captionStyle = liveCaptionStyle;
              if (
                !captionsEnabled ||
                !captionText ||
                containerSize.width === 0 ||
                !shouldRenderCaptionOverlay
              )
                return null;

              const captionRef = React.createRef<HTMLDivElement>();

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
              const widthPx = (containerSize.width * currentWidthPercent) / 100;
              const xPx =
                (containerSize.width * captionStyle.position.x) / 100 -
                widthPx / 2;
              const yPx =
                (containerSize.height * captionStyle.position.y) / 100;

              return (
                <Rnd
                  size={{
                    width: widthPx,
                    height: "auto",
                  }}
                  position={{
                    x: xPx,
                    y: yPx,
                  }}
                  onDragStop={(e, d) => {
                    const newCenterX =
                      ((d.x + widthPx / 2) / containerSize.width) * 100;
                    const newCenterY = (d.y / containerSize.height) * 100;

                    onCaptionLayoutChange({
                      position: {
                        x: newCenterX,
                        y: newCenterY,
                      },
                    });
                  }}
                  onResizeStop={(e, direction, ref, delta, pos) => {
                    const newWidthPx = parseInt(ref.style.width, 10);
                    const newHeightPx = parseInt(ref.style.height, 10);
                    const newWidthPercent =
                      (newWidthPx / containerSize.width) * 100;

                    const newCenterX =
                      ((pos.x + newWidthPx / 2) / containerSize.width) * 100;
                    const newCenterY = (pos.y / containerSize.height) * 100;

                    onCaptionLayoutChange({
                      position: {
                        x: newCenterX,
                        y: newCenterY,
                      },
                      size: {
                        width: newWidthPercent,
                        height: (newHeightPx / containerSize.height) * 100,
                      },
                    });
                  }}
                  bounds="parent"
                  className="group pointer-events-auto border-2 border-transparent hover:border-primary border-dashed"
                  style={{ zIndex: 999 }}
                  minWidth={containerSize.width * 0.2}
                  disableDragging={isSpacePressed} // <-- Updated
                  enableResizing={
                    !isSpacePressed // <-- Updated
                      ? {
                          left: true,
                          right: true,
                          top: false,
                          bottom: false,
                          topLeft: false,
                          topRight: false,
                          bottomLeft: false,
                          bottomRight: false,
                        }
                      : false
                  }
                >
                  <div
                    ref={captionRef}
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
                      className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50 cursor-alias"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </div>
                  </div>
                </Rnd>
              );
            })()}
          </div>
        </div>
        {/*
         Container for all draggable overlays.
         This MUST be INSIDE sceneRef to pan and zoom with the canvas.
        */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 220 }}
        >
          <div className="w-full h-full relative">
            {filteredHtmlOverlays.map((overlay) => (
              <DraggableOverlay
                key={overlay.id}
                overlay={overlay}
                onSetDynamicLayout={onSetDynamicLayout}
                onLayoutChange={rest.onOverlayLayoutChange}
                onRemoveOverlay={rest.onRemoveOverlay}
                onPreviewGenerated={onPreviewGenerated}
                containerSize={containerSize}
                portalContainer={portalContainer}
                isSpacePressed={isSpacePressed}
              />
            ))}
            {filteredBrowserOverlays.map((browser) => (
              <div
                key={`browser-wrapper-${browser.id}`}
                style={{ pointerEvents: isSpacePressed ? "none" : "auto" }}
              >
              <DraggableBrowser
                  key={browser.id}
                  overlay={browser}
                  viewport={viewport}
                  onSetDynamicLayout={onSetDynamicLayout}
                  onRemove={onRemoveBrowser}
                  onUrlChange={onBrowserUrlChange}
                  onLayoutChange={onBrowserLayoutChange}
                  containerSize={containerSize}
                  isSelected={selectedBrowserId === browser.id}
                  onInternalDragStart={onInternalDragStart}
                  onInternalDragStop={onInternalDragStop}
                  onSelect={setSelectedBrowserId}
                  canvasContainerRef={canvasContainerRef}
                />
              </div>
            ))}
            {filteredFileOverlays.map((file) => (
              <div
                key={`file-wrapper-${file.id}`}
                style={{ pointerEvents: isSpacePressed ? "none" : "auto" }}
              >
              <DraggableFileViewer
                  key={file.id}
                  overlay={file}
                  viewport={viewport}
                  onSetDynamicLayout={onSetDynamicLayout}
                  onRemove={onRemoveFile}
                  onLayoutChange={onFileLayoutChange}
                  containerSize={containerSize}
                  isSelected={selectedFileId === file.id}
                  onInternalDragStart={onInternalDragStart}
                  onInternalDragStop={onInternalDragStop}
                  onSelect={setSelectedFileId}
                  canvasContainerRef={canvasContainerRef}
                />
              </div>
            ))}
            {(() => {
              const captionText = (
                fullTranscript +
                " " +
                interimTranscript
              ).trim();
              const captionStyle = liveCaptionStyle;
              if (
                !captionsEnabled ||
                !captionText ||
                containerSize.width === 0 ||
                !shouldRenderCaptionOverlay
              )
                return null;

              const captionRef = React.createRef<HTMLDivElement>();

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
              const widthPx = (containerSize.width * currentWidthPercent) / 100;
              const xPx =
                (containerSize.width * captionStyle.position.x) / 100 -
                widthPx / 2;
              const yPx =
                (containerSize.height * captionStyle.position.y) / 100;

              return (
                <Rnd
                  size={{
                    width: widthPx,
                    height: "auto",
                  }}
                  position={{
                    x: xPx,
                    y: yPx,
                  }}
                  onDragStop={(e, d) => {
                    const newCenterX =
                      ((d.x + widthPx / 2) / containerSize.width) * 100;
                    const newCenterY = (d.y / containerSize.height) * 100;

                    onCaptionLayoutChange({
                      position: {
                        x: newCenterX,
                        y: newCenterY,
                      },
                    });
                  }}
                  onResizeStop={(e, direction, ref, delta, pos) => {
                    const newWidthPx = parseInt(ref.style.width, 10);
                    const newHeightPx = parseInt(ref.style.height, 10);
                    const newWidthPercent =
                      (newWidthPx / containerSize.width) * 100;

                    const newCenterX =
                      ((pos.x + newWidthPx / 2) / containerSize.width) * 100;
                    const newCenterY = (pos.y / containerSize.height) * 100;

                    onCaptionLayoutChange({
                      position: {
                        x: newCenterX,
                        y: newCenterY,
                      },
                      size: {
                        width: newWidthPercent,
                        height: (newHeightPx / containerSize.height) * 100,
                      },
                    });
                  }}
                  bounds="parent"
                  className="group pointer-events-auto border-2 border-transparent hover:border-primary border-dashed"
                  style={{ zIndex: 999 }}
                  minWidth={containerSize.width * 0.2}
                  disableDragging={isSpacePressed} // <-- Updated
                  enableResizing={
                    !isSpacePressed // <-- Updated
                      ? {
                          left: true,
                          right: true,
                          top: false,
                          bottom: false,
                          topLeft: false,
                          topRight: false,
                          bottomLeft: false,
                          bottomRight: false,
                        }
                      : false
                  }
                >
                  <div
                    ref={captionRef}
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
                      className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50 cursor-alias"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </div>
                  </div>
                </Rnd>
              );
            })()}
            {textOverlays
              .filter(
                (o) =>
                  !dynamicLayout.isActive ||
                  dynamicLayout.target?.id !== o.id ||
                  dynamicLayout.target?.type !== "text"
              )
              .map((textOverlay) => (
                <div
                  key={`text-wrapper-${textOverlay.id}`}
                  style={{ pointerEvents: isSpacePressed ? "none" : "auto" }}
                >
                  <DraggableTextOverlay
                    key={textOverlay.id}
                    overlay={textOverlay}
                    onLayoutChange={onTextLayoutChange}
                    onStyleChange={onTextStyleChange}
                    onContentChange={onTextContentChange}
                    onRemove={onRemoveTextOverlay}
                    containerSize={containerSize}
                    isSelected={selectedTextId === textOverlay.id}
                    onSelect={(id) => {
                      onDeselectAll();
                      setSelectedTextId(id);
                    }}
                    onInternalDragStart={onInternalDragStart}
                    onInternalDragStop={onInternalDragStop}
                    isSpacePressed={isSpacePressed}
                    containerRef={canvasContainerRef}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
      {/* End Scene Wrapper */}

      {/* AI Button stays outside sceneRef to remain fixed */}
      {containerSize.width > 0 && (
        <Rnd
          style={{ zIndex: 1000 }}
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
          disableDragging={isSpacePressed} // <-- Updated
          enableResizing={false}
          className={cn(
            "pointer-events-auto z-[1010] transition-opacity duration-300",
            isMouseActive || !isFullscreen ? "opacity-100" : "opacity-0"
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

      {/* Bottom Controls - stays outside sceneRef to remain fixed */}
      <div
        className={cn(
          "absolute bottom-6 left-1/2 -translate-x-1/2 z-[1010] transition-opacity duration-300 ease-in-out",
          isMouseActive ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md border rounded-full px-4 py-2 shadow-lg">
          {/* Mic Button & Dropdown */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={() => onAudioToggle(!isAudioOn)}
            >
              {isAudioOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5 text-red-500" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {audioDevices.map((device, i) => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onAudioDeviceSelect(device.deviceId)}
                  >
                    {device.deviceId === selectedAudioDevice && (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {device.label || `Microphone ${i + 1}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-px h-8 bg-border" />
          {/* Video Button & Dropdown */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={() => onVideoToggle(!isVideoOn)}
            >
              {isVideoOn ? (
                <Webcam className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5 text-red-500" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {videoDevices.map((device, i) => (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onVideoDeviceSelect(device.deviceId)}
                  >
                    {device.deviceId === selectedVideoDevice && (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    {device.label || `Camera ${i + 1}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-px h-8 bg-border" />
          {/* --- Updated Share Button --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-10 w-10 transition-colors",
                  screenShareMode !== "off" && "bg-primary/20 text-primary"
                )}
                title="Share Content"
              >
                <ScreenShare className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleShareModeChange("screen")}>
                <Monitor className="w-4 h-4 mr-2" />
                Share Screen
                {screenShareMode === "screen" && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShareModeChange("canvas")}>
                <Paintbrush className="w-4 h-4 mr-2" />
                Blank Canvas
                {screenShareMode === "canvas" && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </DropdownMenuItem>
              {screenShareMode !== "off" && (
                <DropdownMenuItem
                  className="text-red-500"
                  onClick={() => handleShareModeChange("off")}
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop Sharing
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* --- End Updated Share Button --- */}
          <div className="w-px h-8 bg-border" />
          {/* Library Button */}
          <Button
            size="icon"
            variant="outline"
            className={cn(
              "relative rounded-full shadow-lg backdrop-blur-sm border-2 hover:scale-105 transition-transform duration-200 h-10 w-10"
            )}
            onClick={onOpenSessions}
            title="Your Recordings"
          >
            <Library className="w-5 h-5" />
          </Button>
          <div className="w-px h-8 bg-border" />
          {/* Record Button */}
          <Button
            size="icon"
            className={cn(
              "rounded-full h-12 w-12 transition-colors",
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/90"
            )}
            onClick={() => {
              // Ensure containerSize and cameraStream are valid before calling
              if (
                containerSize.width > 0 &&
                containerSize.height > 0 &&
                cameraStream
              ) {
                onRecordingToggle(
                  isRecording,
                  cameraStream as MediaStream,
                  containerSize
                );
              } else {
                toast.error(
                  "Cannot start recording: stream or dimensions not ready."
                );
              }
            }}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            {isRecording ? (
              <Square className="h-6 w-6" />
            ) : (
              <Circle className="h-6 w-6 fill-current" />
            )}
          </Button>
          <div className="w-px h-8 bg-border" />
          {/* Layout Controls */}
          <LayoutControls {...rest} portalContainer={portalContainer} />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={handleResetView} // Ensure handleResetView exists or remove onClick if not needed
            title="Reset View"
          >
            <Frame className="h-5 w-5" />
          </Button>
          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <Shrink className="h-5 w-5" />
            ) : (
              <Expand className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
