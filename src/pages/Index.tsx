// src/pages/Index.tsx

import { useState, useCallback } from "react";
import { VideoCanvas } from "@/components/VideoCanvas";
import { LeftSidebar } from "@/components/LeftSidebar";
import { TopToolbar } from "@/components/TopToolbar";
import { CaptionStyle, GeneratedOverlay, LayoutMode, CameraShape, DEFAULT_LAYOUT_STATE } from "@/types/caption";
import { processCommandWithAgent } from "@/lib/ai";
import { toast } from "sonner";
import { useLog } from "@/context/LogContext";
import { useDebug } from "@/context/DebugContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const generateOverlayId = () => `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const Index = () => {
  // State for the new HTML overlay system
  const [activeHtmlOverlay, setActiveHtmlOverlay] = useState<GeneratedOverlay | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [activeOverlays, setActiveOverlays] = useState<GeneratedOverlay[]>([]);
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  // ADDED: State for saved overlays using localStorage for persistence
  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>('gaki-saved-overlays', []);

  // Existing states for UI controls
  const [liveCaptionStyle, setLiveCaptionStyle] = useState<React.CSSProperties>({});
  const [videoFilter, setVideoFilter] = useState<string>('none');
  const [aiButtonPosition, setAiButtonPosition] = useState({ x: 92, y: 85 });
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({
    fontFamily: "Inter", fontSize: 24, color: "#FFFFFF", backgroundColor: "rgba(0, 0, 0, 0.8)",
    position: { x: 50, y: 85 }, shape: "rounded", animation: "fade", outline: false, shadow: true,
    bold: false, italic: false, underline: false, width: 80, height: 10,
  });
  const [backgroundEffect, setBackgroundEffect] = useState<'none' | 'blur' | 'image'>('none');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [isAutoFramingEnabled, setIsAutoFramingEnabled] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(384);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | undefined>(undefined);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | undefined>(undefined);
  const [isAiModeEnabled, setIsAiModeEnabled] = useState(true);
  const [zoomSensitivity, setZoomSensitivity] = useState(4.0);
  const [trackingSpeed, setTrackingSpeed] = useState(0.07);
  const [isBeautifyEnabled, setIsBeautifyEnabled] = useState(false);
  const [isLowLightEnabled, setIsLowLightEnabled] = useState(false);
  const [dynamicStyle, setDynamicStyle] = useState('none');
  const [isNeonEdgeEnabled, setIsNeonEdgeEnabled] = useState(false);
  const [neonIntensity, setNeonIntensity] = useState(3);
  const [neonColor, setNeonColor] = useState('cyan');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(DEFAULT_LAYOUT_STATE.mode);
  const [cameraShape, setCameraShape] = useState<CameraShape>(DEFAULT_LAYOUT_STATE.cameraShape);
  const [splitRatio, setSplitRatio] = useState(DEFAULT_LAYOUT_STATE.splitRatio);
  const [pipPosition, setPipPosition] = useState(DEFAULT_LAYOUT_STATE.pipPosition);
  const [pipSize, setPipSize] = useState(DEFAULT_LAYOUT_STATE.pipSize);
  const [customMaskUrl, setCustomMaskUrl] = useState<string | undefined>(undefined);

  const { log } = useLog();
  const { setDebugInfo } = useDebug();

  const handleCaptionLayoutChange = useCallback((newLayout: { position?: { x: number; y: number }, size?: { width: number, height: number } }) => {
    setCaptionStyle(prev => ({
      ...prev,
      position: newLayout.position ?? prev.position,
      width: newLayout.size?.width ?? prev.width,
      height: newLayout.size?.height ?? prev.height,
    }));
  }, []);

  // MODIFIED: This function now handles targeting existing overlays
  const processTranscript = useCallback(async (transcript: string, targetId: string | null = null) => {
    if (!isAiModeEnabled || isProcessingAi) return;

    const currentHistory = [...promptHistory, transcript];
    setPromptHistory(currentHistory);

    log('TRANSCRIPT', 'Processing command', { transcript, targetId });
    setDebugInfo(prev => ({ ...prev, rawTranscript: transcript, aiResponse: null, error: null }));
    const thinkingToast = toast.loading("AI is creating...");
    setIsProcessingAi(true);
    
    // If targeting an existing overlay, prepend context for the AI
    const finalPrompt = targetId 
      ? `CONTEXT: The user wants to modify the overlay named "${activeOverlays.find(o => o.id === targetId)?.name}".\n\nINSTRUCTION: ${transcript}` 
      : transcript;

    try {
      // MODIFIED: The AI now returns an object with a name and htmlContent
      const { name, htmlContent } = await processCommandWithAgent(finalPrompt);
      log('AI_RESPONSE', `Agent HTML received for "${name}"`, htmlContent);
      
      const newOverlay: GeneratedOverlay = {
        id: generateOverlayId(),
        name, // Use the name from the AI
        htmlContent,
        layout: { position: { x: 50, y: 50 }, size: { width: 40, height: 40 }, zIndex: 10 },
        preview: "", // Start with an empty preview
      };

      setActiveOverlays(prev => [...prev, newOverlay]);
      toast.success(`AI generated "${name}".`);

    } catch (error) {
      log('ERROR', 'Error in processTranscript', error);
      setDebugInfo(prev => ({ ...prev, error: "AI command processing failed." }));
      toast.error("AI command failed: " + (error as Error).message);
    } finally {
      setIsProcessingAi(false);
      toast.dismiss(thinkingToast);
    }
  }, [isAiModeEnabled, isProcessingAi, log, setDebugInfo, promptHistory, activeOverlays]);

  const handleLayoutChange = (id: string, key: 'position' | 'size', value: any) => {
    setActiveOverlays(prev => 
      prev.map(o => o.id === id ? { ...o, layout: { ...o.layout, [key]: value } } : o)
    );
  };

  const handleRemoveOverlay = (id: string) => {
    setActiveOverlays(prev => prev.filter(o => o.id !== id));
    toast.info("Overlay removed from canvas.");
  };

  const handleCustomMaskUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setCustomMaskUrl(result);
        toast.success("Custom camera mask uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  // ADDED: Handler to save the generated preview to the saved overlays state
  const handlePreviewGenerated = useCallback((id: string, previewDataUrl: string) => {
    if (!previewDataUrl) return;
    
    const newOverlay = activeOverlays.find(o => o.id === id);
    if (newOverlay && !savedOverlays.some(so => so.id === newOverlay.id)) {
        const overlayToSave = { ...newOverlay, preview: previewDataUrl };
        setSavedOverlays(prev => [overlayToSave, ...prev.filter(so => so.id !== overlayToSave.id)]);
        toast.info(`"${overlayToSave.name}" saved to your overlays.`);
    }
  }, [activeOverlays, savedOverlays, setSavedOverlays]);

  // ADDED: Handler to add a saved overlay back to the active canvas
  const handleAddSavedOverlay = (overlay: GeneratedOverlay) => {
    const newActiveOverlay = {
        ...overlay,
        id: generateOverlayId(),
        layout: { position: { x: 50, y: 50 }, size: { width: 40, height: 40 }, zIndex: 10 }
    };
    setActiveOverlays(prev => [...prev, newActiveOverlay]);
  };

  // ADDED: Handler to delete an overlay from the saved list
  const handleDeleteSavedOverlay = (id: string) => {
    setSavedOverlays(prev => prev.filter(o => o.id !== id));
    toast.success("Saved overlay deleted.");
  };

  const isMinimized = isSidebarCollapsed && !isHoveringSidebar;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopToolbar
        captionsEnabled={captionsEnabled} onCaptionsToggle={setCaptionsEnabled}
        isSidebarVisible={!isSidebarCollapsed} onSidebarToggle={() => setIsSidebarCollapsed(prev => !prev)}
        isAiModeEnabled={isAiModeEnabled} onAiModeToggle={setIsAiModeEnabled}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          style={captionStyle} onStyleChange={setCaptionStyle}
          dynamicStyle={dynamicStyle} onDynamicStyleChange={setDynamicStyle}
          width={isMinimized ? 64 : sidebarWidth} isCollapsed={isMinimized}
          onResize={setSidebarWidth} onMouseEnter={() => setIsHoveringSidebar(true)} onMouseLeave={() => setIsHoveringSidebar(false)}
          backgroundEffect={backgroundEffect} onBackgroundEffectChange={setBackgroundEffect}
          backgroundImageUrl={backgroundImageUrl} onBackgroundImageUrlChange={setBackgroundImageUrl}
          isAutoFramingEnabled={isAutoFramingEnabled} onAutoFramingChange={setIsAutoFramingEnabled}
          // UPDATED: Pass the new state and handlers
          savedOverlays={savedOverlays} 
          onAddSavedOverlay={handleAddSavedOverlay} 
          onDeleteSavedOverlay={handleDeleteSavedOverlay}
          zoomSensitivity={zoomSensitivity} onZoomSensitivityChange={setZoomSensitivity}
          trackingSpeed={trackingSpeed} onTrackingSpeedChange={setTrackingSpeed}
          isBeautifyEnabled={isBeautifyEnabled} onBeautifyToggle={setIsBeautifyEnabled}
          isLowLightEnabled={isLowLightEnabled} onLowLightToggle={setIsLowLightEnabled}
          videoFilter={videoFilter}
          onVideoFilterChange={setVideoFilter}
          isNeonEdgeEnabled={isNeonEdgeEnabled}
          onNeonEdgeToggle={setIsNeonEdgeEnabled}
          neonIntensity={neonIntensity}
          onNeonIntensityChange={setNeonIntensity}
          neonColor={neonColor}
          onNeonColorChange={setNeonColor}
        />
        <VideoCanvas
          captionsEnabled={captionsEnabled} backgroundEffect={backgroundEffect} backgroundImageUrl={backgroundImageUrl}
          isAutoFramingEnabled={isAutoFramingEnabled} onProcessTranscript={processTranscript}
          generatedHtmlOverlay={activeHtmlOverlay} onOverlayLayoutChange={handleLayoutChange}
          onRemoveOverlay={handleRemoveOverlay}
          generatedOverlays={activeOverlays}
          // ADDED: Pass the preview handler down
          onPreviewGenerated={handlePreviewGenerated}
          liveCaptionStyle={{ ...liveCaptionStyle, ...captionStyle }}
          dynamicStyle={dynamicStyle}
          onCaptionLayoutChange={handleCaptionLayoutChange}
          videoFilter={videoFilter}
          isAudioOn={isAudioOn} onAudioToggle={setIsAudioOn}
          isVideoOn={isVideoOn} onVideoToggle={setIsVideoOn}
          isRecording={isRecording} onRecordingToggle={setIsRecording}
          selectedAudioDevice={selectedAudioDevice} onAudioDeviceSelect={setSelectedAudioDevice}
          selectedVideoDevice={selectedVideoDevice} onVideoDeviceSelect={setSelectedVideoDevice}
          zoomSensitivity={zoomSensitivity} trackingSpeed={trackingSpeed}
          isBeautifyEnabled={isBeautifyEnabled} isLowLightEnabled={isLowLightEnabled}
          layoutMode={layoutMode} cameraShape={cameraShape}
          isNeonEdgeEnabled={isNeonEdgeEnabled}
          neonIntensity={neonIntensity}
          neonColor={neonColor}
          splitRatio={splitRatio} pipPosition={pipPosition} pipSize={pipSize}
          onLayoutModeChange={setLayoutMode} onCameraShapeChange={setCameraShape}
          onSplitRatioChange={setSplitRatio} onPipPositionChange={setPipPosition} onPipSizeChange={setPipSize}
          customMaskUrl={customMaskUrl} onCustomMaskUpload={handleCustomMaskUpload}
          aiButtonPosition={aiButtonPosition} onAiButtonPositionChange={setAiButtonPosition}
          isProcessingAi={isProcessingAi}
        />
      </div>
    </div>
  );
};

export default Index;
