// src/pages/Index.tsx

import { useState, useCallback, useRef, useEffect } from "react";
import { VideoCanvas } from "@/components/VideoCanvas";
import { LeftSidebar } from "@/components/LeftSidebar";
import { TopToolbar } from "@/components/TopToolbar";
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  DEFAULT_LAYOUT_STATE,
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

const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateBrowserId = () => `browser-${Date.now()}`;

const Index = () => {
  const [browserOverlays, setBrowserOverlays] = useState<BrowserOverlayState[]>(
    []
  );
  const [activeHtmlOverlay, setActiveHtmlOverlay] =
    useState<GeneratedOverlay | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [activeOverlays, setActiveOverlays] = useState<GeneratedOverlay[]>([]);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>(
    "gaki-saved-overlays",
    []
  );
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

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

      setActiveOverlays((prev) =>
        prev.map((o) => (o.id === id ? overlayWithPreview : o))
      );

      setSavedOverlays((prevSaved) => {
        const existingSavedIndex = prevSaved.findIndex(
          (saved) => saved.id === overlayWithPreview.id
        );

        if (existingSavedIndex !== -1) {
          const newSavedOverlays = [...prevSaved];
          newSavedOverlays[existingSavedIndex] = overlayWithPreview;
          return newSavedOverlays;
        } else {
          toast.info(`"${overlayWithPreview.name}" saved to your overlays.`);
          return [overlayWithPreview, ...prevSaved];
        }
      });
    },
    [activeOverlays, setActiveOverlays, setSavedOverlays]
  );

  const handleAddSavedOverlay = (overlay: GeneratedOverlay) => {
    const newActiveOverlay = {
      ...overlay,
      id: generateOverlayId(),
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
      className="h-screen flex flex-col bg-background overflow-hidden"
    >
      <div className="relative flex-1">
        {/* The VideoCanvas now fills the entire space */}
        <div className="flex h-full overflow-hidden">
          <VideoCanvas
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={setIsSidebarOpen}
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
            onLayoutModeChange={setLayoutMode}
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
          />
        </div>

        {/* The TopToolbar is positioned absolutely on top */}
        {!isFullscreen && (
          <div className="absolute top-0 left-0 w-full z-50">
            <TopToolbar
              captionsEnabled={captionsEnabled}
              onCaptionsToggle={setCaptionsEnabled}
              isAiModeEnabled={isAiModeEnabled}
              onAiModeToggle={setIsAiModeEnabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
