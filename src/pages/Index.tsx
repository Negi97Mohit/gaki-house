// src/pages/Index.tsx

import { useState, useCallback, useRef, useEffect } from "react";
import { VideoCanvas } from "@/components/VideoCanvas";
import { FloatingControls } from "@/components/FloatingControls";
import { FloatingLogo } from "@/components/FloatingLogo";
import { FloatingControlsPanel } from "@/components/FloatingControlsPanel";
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  DEFAULT_LAYOUT_STATE,
  GeneratedLayout,
  FileOverlayState,
  FileType,
} from "@/types/caption";
import { processCommandWithAgent, updateOverlay } from "@/lib/ai";
import { toast } from "sonner";
import { useLog } from "@/context/LogContext";
import { useDebug } from "@/context/DebugContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  DraggableBrowser,
  BrowserOverlayState,
} from "@/components/DraggableBrowser";
import { cn } from "@/lib/utils";

const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateFileId = () => `file-${Date.now()}`;
const generateBrowserId = () => `browser-${Date.now()}`;

const Index = () => {
  // ... (all your existing state hooks remain the same) ...
  const [browserOverlays, setBrowserOverlays] = useState<BrowserOverlayState[]>(
    []
  );

  const [dynamicLayout, setDynamicLayout] = useState<{
    isActive: boolean;
    mode: "split-vertical" | "split-horizontal" | "pip";
    target: {
      id: string;
      type: "html" | "file" | "browser" | "caption";
      content: any;
      layout: GeneratedLayout;
    } | null;
  }>({
    isActive: false,
    mode: "split-vertical",
    target: null,
  });

  const [fileOverlays, setFileOverlays] = useState<FileOverlayState[]>([]);
  const handleSetDynamicLayout = (
    target: { id: string; type: "html" | "file" | "browser" | "caption" },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => {
    let targetOverlay: any = null;

    if (target.type === "html") {
      targetOverlay = activeOverlays.find((o) => o.id === target.id);
    } else if (target.type === "file") {
      targetOverlay = fileOverlays.find((o) => o.id === target.id);
    } else if (target.type === "browser") {
      targetOverlay = browserOverlays.find((o) => o.id === target.id);
    } else if (target.type === "caption") {
      // For captions, we construct a temporary object
      targetOverlay = {
        id: "live-caption",
        type: "caption",
        layout: captionStyle,
      };
    }

    if (mode === "reset") {
      setDynamicLayout({
        isActive: false,
        mode: "split-vertical", // Reset to default
        target: null,
      });
      return;
    }

    if (!targetOverlay) return;

    setDynamicLayout({
      isActive: true,
      mode: mode,
      target: {
        ...target,
        content: targetOverlay,
        layout: targetOverlay.layout,
      },
    });
  };

  const [activeHtmlOverlay, setActiveHtmlOverlay] =
    useState<GeneratedOverlay | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [activeOverlays, setActiveOverlays] = useState<GeneratedOverlay[]>([]);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>(
    "gaki-saved-overlays",
    []
  );

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const getFileType = (file: File): FileType => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Prioritize MIME types
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    if (fileType.startsWith("audio/")) return "audio";
    if (fileType === "application/pdf") return "pdf";
    if (fileType.startsWith("text/")) return "text";

    // Fallback to file extensions for common code/text files
    const textExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
      ".py",
      ".html",
      ".css",
      ".scss",
      ".md",
      ".txt",
      ".csv",
      ".xml",
      ".yaml",
      ".yml",
      ".env",
    ];
    if (textExtensions.some((ext) => fileName.endsWith(ext))) {
      return "text";
    }

    return "unknown";
  };

  const handleAddFile = useCallback((file: File) => {
    if (!file) return;
    const newOverlay: FileOverlayState = {
      id: generateFileId(),
      file: file,
      fileName: file.name,
      fileType: getFileType(file),
      fileUrl: URL.createObjectURL(file),
      layout: {
        position: { x: 50, y: 50 },
        size: { width: 35, height: 45 },
        zIndex: 100,
        rotation: 0,
      },
    };
    setFileOverlays((prev) => [...prev, newOverlay]);
    toast.info(`Added file: ${file.name}`);
  }, []);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDraggingInternally.current) {
        isDraggingInternally.current = false;
        return;
      }
      if (e.dataTransfer?.files?.length) {
        Array.from(e.dataTransfer.files).forEach(handleAddFile);
      }
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Prioritize pasting files
      if (e.clipboardData?.files?.length > 0) {
        Array.from(e.clipboardData.files).forEach(handleAddFile);
        return;
      }
      // Fallback to pasting text as a URL
      const pastedText = e.clipboardData?.getData("text/plain");
      if (
        pastedText &&
        (pastedText.startsWith("http://") || pastedText.startsWith("https://"))
      ) {
        const newBrowser: BrowserOverlayState = {
          id: generateBrowserId(),
          url: pastedText,
          layout: {
            position: { x: 50, y: 50 },
            size: { width: 40, height: 50 },
            zIndex: 100,
            rotation: 0,
          },
        };
        setBrowserOverlays((prev) => [...prev, newBrowser]);
        toast.info("Browser window added from URL.");
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePaste);
      // Clean up object URLs to prevent memory leaks
      fileOverlays.forEach((o) => URL.revokeObjectURL(o.fileUrl));
    };
  }, [handleAddFile, fileOverlays]);

  const isDraggingInternally = useRef(false);
  const handleInternalDragStart = () => {
    isDraggingInternally.current = true;
  };
  const handleInternalDragStop = () => {
    isDraggingInternally.current = false;
  };
  const handleRemoveFile = (id: string) => {
    setFileOverlays((prev) => {
      const overlayToRemove = prev.find((o) => o.id === id);
      if (overlayToRemove) {
        URL.revokeObjectURL(overlayToRemove.fileUrl);
      }
      return prev.filter((o) => o.id !== id);
    });
  };

  const handleFileLayoutChange = (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => {
    setFileOverlays((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, layout: { ...o.layout, ...layout } } : o
      )
    );
  };

  const handleLayoutModeChange = (mode: LayoutMode) => {
    // Deactivate any active dynamic layout when a global layout is chosen
    setDynamicLayout({ isActive: false, mode: "split-vertical", target: null });
    // Set the global layout mode
    setLayoutMode(mode);
  };

  const handleDeselectAll = () => {
    setSelectedBrowserId(null);
    setSelectedFileId(null);
  };
  // --- END OF FILE HANDLING SECTION ---

  const [liveCaptionStyle, setLiveCaptionStyle] = useState<React.CSSProperties>(
    {}
  );
  const [videoFilter, setVideoFilter] = useState<string>("none");
  const [aiButtonPosition, setAiButtonPosition] = useState({ x: 92, y: 85 });
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({
    fontFamily: "Inter",
    fontSize: 24,
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    position: { x: 50, y: 85 },
    shape: "rounded",
    animation: "fade",
    outline: false,
    shadow: true,
    bold: false,
    italic: false,
    underline: false,
    width: 80,
    rotation: 0,
    border: false,
    borderColor: "#FFFFFF",
    borderWidth: 2,
  });
  const [backgroundEffect, setBackgroundEffect] = useState<
    "none" | "blur" | "image"
  >("none");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  );
  const [isAutoFramingEnabled, setIsAutoFramingEnabled] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<
    string | undefined
  >(undefined);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<
    string | undefined
  >(undefined);
  const [isAiModeEnabled, setIsAiModeEnabled] = useState(true);
  const [zoomSensitivity, setZoomSensitivity] = useState(4.0);
  const [trackingSpeed, setTrackingSpeed] = useState(0.07);
  const [isBeautifyEnabled, setIsBeautifyEnabled] = useState(false);
  const [isLowLightEnabled, setIsLowLightEnabled] = useState(false);
  const [dynamicStyle, setDynamicStyle] = useState("none");
  const [isNeonEdgeEnabled, setIsNeonEdgeEnabled] = useState(false);
  const [neonIntensity, setNeonIntensity] = useState(3);
  const [neonColor, setNeonColor] = useState("cyan");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(
    DEFAULT_LAYOUT_STATE.mode
  );
  const [cameraShape, setCameraShape] = useState<CameraShape>(
    DEFAULT_LAYOUT_STATE.cameraShape
  );
  const [splitRatio, setSplitRatio] = useState(DEFAULT_LAYOUT_STATE.splitRatio);
  const [pipPosition, setPipPosition] = useState(
    DEFAULT_LAYOUT_STATE.pipPosition
  );
  const [pipSize, setPipSize] = useState(DEFAULT_LAYOUT_STATE.pipSize);
  const [customMaskUrl, setCustomMaskUrl] = useState<string | undefined>(
    undefined
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFsSidebarOpen, setIsFsSidebarOpen] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // ... (all your existing handler functions and useEffect hooks remain the same) ...
  const { log } = useLog();
  const { setDebugInfo } = useDebug();

  const handleCaptionLayoutChange = useCallback(
    (newLayout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }) => {
      setCaptionStyle((prev) => ({
        ...prev,
        position: newLayout.position ?? prev.position,
        width: newLayout.size?.width ?? prev.width,
      }));
    },
    []
  );

  const processTranscript = useCallback(
    async (transcript: string, targetId: string | null = null) => {
      if (!isAiModeEnabled || isProcessingAi) return;
      setPromptHistory((prev) => [...prev, transcript]);
      log("TRANSCRIPT", "Processing command", { transcript, targetId });
      setDebugInfo((prev) => ({
        ...prev,
        rawTranscript: transcript,
        aiResponse: null,
        error: null,
      }));
      const thinkingToast = toast.loading(
        targetId ? "AI is updating..." : "AI is creating..."
      );
      setIsProcessingAi(true);
      try {
        if (targetId) {
          const existingOverlay = activeOverlays.find((o) => o.id === targetId);
          if (!existingOverlay) {
            throw new Error("Target overlay not found for update.");
          }
          log("AI_REQUEST", "Requesting overlay update", {
            existingHtml: existingOverlay.htmlContent,
            prompt: transcript,
          });
          const { name, htmlContent } = await updateOverlay(
            existingOverlay.htmlContent,
            transcript
          );
          log("AI_RESPONSE", `Agent HTML received for update on "${name}"`);
          setActiveOverlays((prev) =>
            prev.map((overlay) =>
              overlay.id === targetId
                ? { ...overlay, name, htmlContent, preview: "" }
                : overlay
            )
          );
          toast.success(`Updated overlay "${name}".`);
        } else {
          log("AI_REQUEST", "Requesting new overlay creation", {
            prompt: transcript,
          });
          const { name, htmlContent } = await processCommandWithAgent(
            transcript
          );
          log("AI_RESPONSE", `Agent HTML received for new overlay "${name}"`);
          const newOverlay: GeneratedOverlay = {
            id: generateOverlayId(),
            name,
            htmlContent,
            layout: {
              position: { x: 50, y: 50 },
              size: { width: 40, height: 40 },
              zIndex: 10,
              rotation: 0,
            },
            preview: "",
          };
          setActiveOverlays((prev) => [...prev, newOverlay]);
          toast.success(`AI generated "${name}".`);
        }
      } catch (error) {
        log("ERROR", "Error in processTranscript", error);
        setDebugInfo((prev) => ({
          ...prev,
          error: "AI command processing failed.",
        }));
        toast.error("AI command failed: " + (error as Error).message);
      } finally {
        setIsProcessingAi(false);
        toast.dismiss(thinkingToast);
      }
    },
    [isAiModeEnabled, isProcessingAi, log, setDebugInfo, activeOverlays]
  );

  const handleLayoutChange = (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => {
    setActiveOverlays((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, layout: { ...o.layout, [key]: value } } : o
      )
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const newBrowser: BrowserOverlayState = {
          id: generateBrowserId(),
          url: "https://www.google.com/search?igu=1",
          layout: {
            position: { x: 50, y: 50 },
            size: { width: 40, height: 50 },
            zIndex: 100,
            rotation: 0,
          },
        };
        setBrowserOverlays((prev) => [...prev, newBrowser]);
        toast.info("Browser window added.");
      }

      if (e.key === "Escape") {
        if (selectedBrowserId) {
          e.preventDefault();
          e.stopPropagation();
          handleRemoveBrowser(selectedBrowserId);
          setSelectedBrowserId(null);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBrowserId]);

  const handleRemoveBrowser = (id: string) => {
    setBrowserOverlays((prev) => prev.filter((b) => b.id !== id));
  };

  const handleBrowserUrlChange = (id: string, url: string) => {
    setBrowserOverlays((prev) =>
      prev.map((b) => (b.id === id ? { ...b, url } : b))
    );
  };

  const handleBrowserLayoutChange = (
    id: string,
    layout: Partial<BrowserOverlayState["layout"]>
  ) => {
    setBrowserOverlays((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, layout: { ...b.layout, ...layout } } : b
      )
    );
  };

  const handleRemoveOverlay = (id: string) => {
    setActiveOverlays((prev) => prev.filter((o) => o.id !== id));
    toast.info("Overlay removed from canvas.");
  };

  const handleCustomMaskUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setCustomMaskUrl(result);
        toast.success("Custom camera mask uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewGenerated = useCallback(
    (id: string, previewDataUrl: string) => {
      if (!previewDataUrl) return;

      const activeOverlay = activeOverlays.find((o) => o.id === id);
      if (!activeOverlay) return;

      const overlayWithPreview = { ...activeOverlay, preview: previewDataUrl };

      // 1. Update the preview URL for the overlay currently on the canvas
      setActiveOverlays((prev) =>
        prev.map((o) => (o.id === id ? overlayWithPreview : o))
      );

      // 2. Intelligently update or add the overlay to your saved library
      setSavedOverlays((prevSaved) => {
        const existingSavedIndex = prevSaved.findIndex(
          (saved) => saved.id === overlayWithPreview.id
        );

        if (existingSavedIndex !== -1) {
          // --- THIS IS THE UPDATE LOGIC ---
          // The overlay is already saved, so we replace it with the updated version.
          const newSavedOverlays = [...prevSaved];
          newSavedOverlays[existingSavedIndex] = overlayWithPreview;
          return newSavedOverlays;
        } else {
          // --- THIS IS THE NEW SAVE LOGIC ---
          // This is a new overlay being saved for the first time.
          toast.info(`"${overlayWithPreview.name}" saved to your overlays.`);
          return [overlayWithPreview, ...prevSaved];
        }
      });
    },
    [activeOverlays, setActiveOverlays, setSavedOverlays]
  );

  // --- THIS IS THE CORRECTED FUNCTION ---
  const handleAddSavedOverlay = (overlay: GeneratedOverlay) => {
    const newActiveOverlay = {
      ...overlay,
      id: generateOverlayId(), // This generates a NEW, UNIQUE ID for the instance on the canvas
      layout: {
        position: { x: 50, y: 50 },
        size: { width: 40, height: 40 },
        zIndex: 10,
        rotation: 0,
      },
    };
    setActiveOverlays((prev) => [...prev, newActiveOverlay]);
  };

  const handleDeleteSavedOverlay = (id: string) => {
    setSavedOverlays((prev) => prev.filter((o) => o.id !== id));
    toast.success("Saved overlay deleted.");
  };

  const handleToggleFullscreen = useCallback(() => {
    if (!mainContainerRef.current) return;
    if (!document.fullscreenElement) {
      mainContainerRef.current.requestFullscreen().catch((err) => {
        toast.error(`Fullscreen failed: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Inactivity detection for both mouse and keyboard
  useEffect(() => {
    const handleActivity = () => {
      setIsMouseActive(true);

      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }

      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 7000); // Hide after 3 seconds of inactivity
    };

    // Listen for both mouse and keyboard activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity); // <-- ADD THIS LINE

    // Initialize timeout
    handleActivity();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity); // <-- ADD THIS LINE
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []); // Dependency array is empty, runs only once

  const isMinimized = isSidebarCollapsed;

  const sidebarProps = {
    style: captionStyle,
    onStyleChange: setCaptionStyle,
    dynamicStyle: dynamicStyle,
    onDynamicStyleChange: setDynamicStyle,
    backgroundEffect: backgroundEffect,
    onBackgroundEffectChange: setBackgroundEffect,
    backgroundImageUrl: backgroundImageUrl,
    onBackgroundImageUrlChange: setBackgroundImageUrl,
    isAutoFramingEnabled: isAutoFramingEnabled,
    onAutoFramingChange: setIsAutoFramingEnabled,
    savedOverlays: savedOverlays,
    onAddSavedOverlay: handleAddSavedOverlay,
    onDeleteSavedOverlay: handleDeleteSavedOverlay,
    zoomSensitivity: zoomSensitivity,
    onZoomSensitivityChange: setZoomSensitivity,
    trackingSpeed: trackingSpeed,
    onTrackingSpeedChange: setTrackingSpeed,
    isBeautifyEnabled: isBeautifyEnabled,
    onBeautifyToggle: setIsBeautifyEnabled,
    isLowLightEnabled: isLowLightEnabled,
    onLowLightToggle: setIsLowLightEnabled,
    videoFilter: videoFilter,
    onVideoFilterChange: setVideoFilter,
    isNeonEdgeEnabled: isNeonEdgeEnabled,
    onNeonEdgeToggle: setIsNeonEdgeEnabled,
    neonIntensity: neonIntensity,
    onNeonIntensityChange: setNeonIntensity,
    neonColor: neonColor,
    onNeonColorChange: setNeonColor,
  };

  return (
    <div
      ref={mainContainerRef}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative",
        !isMouseActive && "cursor-none"
      )}
    >
      <div
        className={cn(
          "transition-opacity duration-300 relative z-[2010]",
          !isMouseActive && isFullscreen && "opacity-0 pointer-events-none"
        )}
      >
        <FloatingLogo />
        <FloatingControls
          captionsEnabled={captionsEnabled}
          onCaptionsToggle={setCaptionsEnabled}
          isAiModeEnabled={isAiModeEnabled}
          onAiModeToggle={setIsAiModeEnabled}
        />
        <FloatingControlsPanel
          style={captionStyle}
          onStyleChange={setCaptionStyle}
          dynamicStyle={dynamicStyle}
          onDynamicStyleChange={setDynamicStyle}
          backgroundEffect={backgroundEffect}
          onBackgroundEffectChange={setBackgroundEffect}
          isAutoFramingEnabled={isAutoFramingEnabled}
          onAutoFramingChange={setIsAutoFramingEnabled}
          isBeautifyEnabled={isBeautifyEnabled}
          onBeautifyToggle={setIsBeautifyEnabled}
          isLowLightEnabled={isLowLightEnabled}
          onLowLightToggle={setIsLowLightEnabled}
          videoFilter={videoFilter}
          onVideoFilterChange={setVideoFilter}
          isNeonEdgeEnabled={isNeonEdgeEnabled}
          onNeonEdgeToggle={setIsNeonEdgeEnabled}
          neonIntensity={neonIntensity}
          onNeonIntensityChange={setNeonIntensity}
          savedOverlays={savedOverlays}
          onAddSavedOverlay={handleAddSavedOverlay}
          onDeleteSavedOverlay={handleDeleteSavedOverlay}
          zoomSensitivity={zoomSensitivity}
          onZoomSensitivityChange={setZoomSensitivity}
          trackingSpeed={trackingSpeed}
          onTrackingSpeedChange={setTrackingSpeed}
          isMouseActive={isMouseActive}
        />
      </div>

      <VideoCanvas
        isFullscreen={isFullscreen}
        onStyleChange={setCaptionStyle}
        onToggleFullscreen={handleToggleFullscreen}
        isFsSidebarOpen={isFsSidebarOpen}
        onFsSidebarToggle={setIsFsSidebarOpen}
        isAiModeEnabled={isAiModeEnabled}
        onAiModeToggle={setIsAiModeEnabled}
        captionsEnabled={captionsEnabled}
        onCaptionsToggle={setCaptionsEnabled}
        sidebarProps={sidebarProps}
        backgroundEffect={backgroundEffect}
        backgroundImageUrl={backgroundImageUrl}
        isAutoFramingEnabled={isAutoFramingEnabled}
        onProcessTranscript={processTranscript}
        onOverlayLayoutChange={handleLayoutChange}
        onRemoveOverlay={handleRemoveOverlay}
        generatedOverlays={activeOverlays}
        onPreviewGenerated={handlePreviewGenerated}
        liveCaptionStyle={liveCaptionStyle}
        dynamicStyle={dynamicStyle}
        onCaptionLayoutChange={handleCaptionLayoutChange}
        videoFilter={videoFilter}
        isAudioOn={isAudioOn}
        onAudioToggle={setIsAudioOn}
        isVideoOn={isVideoOn}
        onVideoToggle={setIsVideoOn}
        isRecording={isRecording}
        onRecordingToggle={setIsRecording}
        selectedAudioDevice={selectedAudioDevice}
        onAudioDeviceSelect={setSelectedAudioDevice}
        selectedVideoDevice={selectedVideoDevice}
        onVideoDeviceSelect={setSelectedVideoDevice}
        zoomSensitivity={zoomSensitivity}
        trackingSpeed={trackingSpeed}
        isBeautifyEnabled={isBeautifyEnabled}
        isLowLightEnabled={isLowLightEnabled}
        layoutMode={layoutMode}
        cameraShape={cameraShape}
        isNeonEdgeEnabled={isNeonEdgeEnabled}
        neonIntensity={neonIntensity}
        neonColor={neonColor}
        splitRatio={splitRatio}
        pipPosition={pipPosition}
        pipSize={pipSize}
        onLayoutModeChange={handleLayoutModeChange}
        onCameraShapeChange={setCameraShape}
        onSplitRatioChange={setSplitRatio}
        onPipPositionChange={setPipPosition}
        onPipSizeChange={setPipSize}
        customMaskUrl={customMaskUrl}
        onCustomMaskUpload={handleCustomMaskUpload}
        aiButtonPosition={aiButtonPosition}
        onAiButtonPositionChange={setAiButtonPosition}
        isProcessingAi={isProcessingAi}
        portalContainer={mainContainerRef.current}
        onRemoveBrowser={handleRemoveBrowser}
        onBrowserUrlChange={handleBrowserUrlChange}
        onBrowserLayoutChange={handleBrowserLayoutChange}
        selectedBrowserId={selectedBrowserId}
        setSelectedBrowserId={setSelectedBrowserId}
        browserOverlays={browserOverlays}
        isMouseActive={isMouseActive}
        fileOverlays={fileOverlays}
        onRemoveFile={handleRemoveFile}
        onFileLayoutChange={handleFileLayoutChange}
        selectedFileId={selectedFileId}
        setSelectedFileId={setSelectedFileId}
        onInternalDragStart={handleInternalDragStart}
        onInternalDragStop={handleInternalDragStop}
        onDeselectAll={handleDeselectAll}
        onSetDynamicLayout={handleSetDynamicLayout}
        dynamicLayout={dynamicLayout}
      />
    </div>
  );
};

export default Index;
