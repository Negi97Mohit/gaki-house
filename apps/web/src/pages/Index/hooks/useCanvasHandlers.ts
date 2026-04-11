// Single responsibility: derive all event handler callbacks from canvas state values and setters.
import { useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { CaptionStyle } from "@caption-cam/core/types/caption";
import type { useCanvasState } from "./useCanvasState";

type CanvasState = ReturnType<typeof useCanvasState>;

export function useCanvasHandlers(state: CanvasState) {
  useEffect(() => {
    console.log("[useCanvasHandlers] mounted");
  }, []);

  const {
    activeScene,
    setAudioOn,
    setVideoOn,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedScreenSourceId,
    setScreenShareMode,
    setLayoutMode,
    setCameraShape,
    setSplitRatio,
    setPipPosition,
    setPipSize,
    setCustomMaskUrl,
    setActiveOverlays,
    setTextOverlays,
    setFileOverlays,
    setBrowserOverlays,
    setCanvasLayout,
    setBackgroundEffect,
    setBackgroundImageUrl,
    setBlankCanvasColor,
    setVideoFilter,
    setCaptionStyle,
    setDynamicStyle,
    setAiModeEnabled,
    setCaptionsEnabled,
    setPipRotation,
    setPipBorder,
    setPipShadow,
    setCameraAspectRatio,
    setCustomAspectRatio,
    setActiveInteractiveFilter,
    setFilterIntensity,
    setFilterColor,
    setFilterTarget,
    setIsAutoFramingEnabled,
    setIsBeautifyEnabled,
    setIsLowLightEnabled,
    setIsNeonEdgeEnabled,
    setNeonIntensity,
    setNeonColor,
    setCameraBackground,
    setCustomBackgroundUrl,
    setZoomSensitivity,
    setTrackingSpeed,
    setIsFaceTrackingEnabled,
    setCanvasAspectRatio,
    setEmptyGridPanels,
    selectedBrowserId,
    setSelectedBrowserId,
    selectedFileId,
    setSelectedFileId,
    selectedTextId,
    setSelectedTextId,
    selectedGeneratedId,
    setSelectedGeneratedId,
    deselectAll,
  } = state;

  const updateActiveScene = useCallback(
    (updater: (scene: any) => any) => {
      console.log("[useCanvasHandlers] updateActiveScene called");
      const n = updater(activeScene);
      const a = activeScene;

      if (n.isAudioOn !== a.isAudioOn) setAudioOn(n.isAudioOn ?? false);
      if (n.isVideoOn !== a.isVideoOn) setVideoOn(n.isVideoOn ?? false);
      if (
        n.selectedAudioDevice !== a.selectedAudioDevice &&
        n.selectedAudioDevice
      )
        setSelectedAudioDevice(n.selectedAudioDevice);
      if (
        n.selectedVideoDevice !== a.selectedVideoDevice &&
        n.selectedVideoDevice
      )
        setSelectedVideoDevice(n.selectedVideoDevice);
      if (
        n.selectedScreenSourceId !== a.selectedScreenSourceId &&
        n.selectedScreenSourceId
      )
        setSelectedScreenSourceId(n.selectedScreenSourceId);
      if (n.screenShareMode !== a.screenShareMode)
        setScreenShareMode(n.screenShareMode ?? "off");
      if (n.layoutMode !== a.layoutMode) setLayoutMode(n.layoutMode ?? "solo");
      if (n.cameraShape !== a.cameraShape)
        setCameraShape(n.cameraShape ?? "rectangle");
      if (n.splitRatio !== a.splitRatio) setSplitRatio(n.splitRatio ?? 0.5);
      if (n.pipPosition !== a.pipPosition)
        setPipPosition(n.pipPosition ?? { x: 75, y: 75 });
      if (n.customMaskUrl !== a.customMaskUrl)
        setCustomMaskUrl(n.customMaskUrl);
      if (n.activeOverlays !== a.activeOverlays)
        setActiveOverlays(n.activeOverlays ?? []);
      if (n.textOverlays !== a.textOverlays)
        setTextOverlays(n.textOverlays ?? []);
      if (n.fileOverlays !== a.fileOverlays)
        setFileOverlays(n.fileOverlays ?? []);
      if (n.browserOverlays !== a.browserOverlays)
        setBrowserOverlays(n.browserOverlays ?? []);
      if (n.emptyGridPanels !== a.emptyGridPanels)
        setEmptyGridPanels(n.emptyGridPanels ?? []);
      if (n.canvasLayout !== a.canvasLayout)
        setCanvasLayout(n.canvasLayout ?? null);
      if (n.backgroundEffect !== a.backgroundEffect)
        setBackgroundEffect(n.backgroundEffect ?? "none");
      if (n.backgroundImageUrl !== a.backgroundImageUrl)
        setBackgroundImageUrl(n.backgroundImageUrl ?? null);
      if (n.blankCanvasColor !== a.blankCanvasColor)
        setBlankCanvasColor(n.blankCanvasColor ?? "#000000");
      if (n.videoFilter !== a.videoFilter)
        setVideoFilter(n.videoFilter ?? "none");
      if (n.captionStyle !== a.captionStyle && n.captionStyle)
        setCaptionStyle(n.captionStyle);
      if (n.dynamicStyle !== a.dynamicStyle)
        setDynamicStyle(n.dynamicStyle ?? "none");
      if (n.isAiModeEnabled !== a.isAiModeEnabled)
        setAiModeEnabled(n.isAiModeEnabled ?? false);
      if (n.captionsEnabled !== a.captionsEnabled)
        setCaptionsEnabled(n.captionsEnabled ?? true);
      if (n.pipRotation !== a.pipRotation) setPipRotation(n.pipRotation ?? 0);
      if (n.pipBorder !== a.pipBorder)
        setPipBorder(n.pipBorder ?? { color: "#FFFFFF", width: 0 });
      if (n.pipShadow !== a.pipShadow)
        setPipShadow(n.pipShadow ?? { blur: 0, color: "rgba(0,0,0,0.5)" });
      if (n.cameraAspectRatio !== a.cameraAspectRatio)
        setCameraAspectRatio(n.cameraAspectRatio ?? "16:9");
      if (n.customAspectRatio !== a.customAspectRatio)
        setCustomAspectRatio(n.customAspectRatio ?? "");
      if (n.activeInteractiveFilter !== a.activeInteractiveFilter)
        setActiveInteractiveFilter(n.activeInteractiveFilter ?? "none");
      if (n.filterIntensity !== a.filterIntensity)
        setFilterIntensity(n.filterIntensity ?? 0.5);
      if (n.filterColor !== a.filterColor)
        setFilterColor(n.filterColor ?? "#000000");
      if (n.filterTarget !== a.filterTarget)
        setFilterTarget(n.filterTarget ?? "both");
      if (n.isAutoFramingEnabled !== a.isAutoFramingEnabled)
        setIsAutoFramingEnabled(n.isAutoFramingEnabled ?? false);
      if (n.isBeautifyEnabled !== a.isBeautifyEnabled)
        setIsBeautifyEnabled(n.isBeautifyEnabled ?? false);
      if (n.isLowLightEnabled !== a.isLowLightEnabled)
        setIsLowLightEnabled(n.isLowLightEnabled ?? false);
      if (n.isNeonEdgeEnabled !== a.isNeonEdgeEnabled)
        setIsNeonEdgeEnabled(n.isNeonEdgeEnabled ?? false);
      if (n.neonIntensity !== a.neonIntensity)
        setNeonIntensity(n.neonIntensity ?? 50);
      if (n.neonColor !== a.neonColor) setNeonColor(n.neonColor ?? "#00FFFF");
      if (n.cameraBackground !== a.cameraBackground)
        setCameraBackground(n.cameraBackground ?? "none");
      if (n.customBackgroundUrl !== a.customBackgroundUrl)
        setCustomBackgroundUrl(n.customBackgroundUrl ?? null);
      if (n.zoomSensitivity !== a.zoomSensitivity)
        setZoomSensitivity(n.zoomSensitivity ?? 0.5);
      if (n.trackingSpeed !== a.trackingSpeed)
        setTrackingSpeed(n.trackingSpeed ?? 0.5);
      if (n.isFaceTrackingEnabled !== a.isFaceTrackingEnabled)
        setIsFaceTrackingEnabled(n.isFaceTrackingEnabled ?? false);
      if (n.canvasAspectRatio !== a.canvasAspectRatio)
        setCanvasAspectRatio(n.canvasAspectRatio ?? "16:9");
    },
    [
      activeScene,
      setAudioOn,
      setVideoOn,
      setSelectedAudioDevice,
      setSelectedVideoDevice,
      setSelectedScreenSourceId,
      setScreenShareMode,
      setLayoutMode,
      setCameraShape,
      setSplitRatio,
      setPipPosition,
      setCustomMaskUrl,
      setActiveOverlays,
      setTextOverlays,
      setFileOverlays,
      setBrowserOverlays,
      setCanvasLayout,
      setBackgroundEffect,
      setBackgroundImageUrl,
      setBlankCanvasColor,
      setVideoFilter,
      setCaptionStyle,
      setDynamicStyle,
      setAiModeEnabled,
      setCaptionsEnabled,
      setPipRotation,
      setPipBorder,
      setPipShadow,
      setCameraAspectRatio,
      setCustomAspectRatio,
      setActiveInteractiveFilter,
      setFilterIntensity,
      setFilterColor,
      setFilterTarget,
      setIsAutoFramingEnabled,
      setIsBeautifyEnabled,
      setIsLowLightEnabled,
      setIsNeonEdgeEnabled,
      setNeonIntensity,
      setNeonColor,
      setCameraBackground,
      setCustomBackgroundUrl,
      setZoomSensitivity,
      setTrackingSpeed,
      setIsFaceTrackingEnabled,
      setCanvasAspectRatio,
      setEmptyGridPanels,
    ],
  );

  const updateSceneProperty = useCallback(
    (key: string, value: any) => {
      console.log(`[useCanvasHandlers] updateSceneProperty: ${key}`);
      const map: Record<string, (v: any) => void> = {
        isAudioOn: setAudioOn,
        isVideoOn: setVideoOn,
        selectedAudioDevice: setSelectedAudioDevice,
        selectedVideoDevice: setSelectedVideoDevice,
        selectedScreenSourceId: setSelectedScreenSourceId,
        screenShareMode: setScreenShareMode,
        layoutMode: setLayoutMode,
        cameraShape: setCameraShape,
        splitRatio: setSplitRatio,
        pipPosition: setPipPosition,
        pipSize: setPipSize,
        customMaskUrl: setCustomMaskUrl,
        activeOverlays: setActiveOverlays,
        textOverlays: setTextOverlays,
        canvasLayout: setCanvasLayout,
        captionStyle: setCaptionStyle,
        dynamicStyle: setDynamicStyle,
        isAiModeEnabled: setAiModeEnabled,
        captionsEnabled: setCaptionsEnabled,
        pipRotation: setPipRotation,
        pipBorder: setPipBorder,
        pipShadow: setPipShadow,
        cameraAspectRatio: setCameraAspectRatio,
        customAspectRatio: setCustomAspectRatio,
        activeInteractiveFilter: setActiveInteractiveFilter,
        filterIntensity: setFilterIntensity,
        filterColor: setFilterColor,
        filterTarget: setFilterTarget,
        isAutoFramingEnabled: setIsAutoFramingEnabled,
        isBeautifyEnabled: setIsBeautifyEnabled,
        isLowLightEnabled: setIsLowLightEnabled,
        isNeonEdgeEnabled: setIsNeonEdgeEnabled,
        neonIntensity: setNeonIntensity,
        neonColor: setNeonColor,
        cameraBackground: setCameraBackground,
        customBackgroundUrl: setCustomBackgroundUrl,
        zoomSensitivity: setZoomSensitivity,
        trackingSpeed: setTrackingSpeed,
        isFaceTrackingEnabled: setIsFaceTrackingEnabled,
        canvasAspectRatio: setCanvasAspectRatio,
        videoFilter: setVideoFilter,
        backgroundEffect: setBackgroundEffect,
        backgroundImageUrl: setBackgroundImageUrl,
        blankCanvasColor: setBlankCanvasColor,
      };
      if (map[key]) {
        map[key](value);
      } else {
        console.warn(
          `[useCanvasHandlers] updateSceneProperty: Unhandled key "${key}"`,
        );
      }
    },
    [
      setAudioOn,
      setVideoOn,
      setSelectedAudioDevice,
      setSelectedVideoDevice,
      setSelectedScreenSourceId,
      setScreenShareMode,
      setLayoutMode,
      setCameraShape,
      setSplitRatio,
      setPipPosition,
      setPipSize,
      setCustomMaskUrl,
      setActiveOverlays,
      setTextOverlays,
      setCanvasLayout,
      setCaptionStyle,
      setDynamicStyle,
      setAiModeEnabled,
      setCaptionsEnabled,
      setPipRotation,
      setPipBorder,
      setPipShadow,
      setCameraAspectRatio,
      setCustomAspectRatio,
      setActiveInteractiveFilter,
      setFilterIntensity,
      setFilterColor,
      setFilterTarget,
      setIsAutoFramingEnabled,
      setIsBeautifyEnabled,
      setIsLowLightEnabled,
      setIsNeonEdgeEnabled,
      setNeonIntensity,
      setNeonColor,
      setCameraBackground,
      setCustomBackgroundUrl,
      setZoomSensitivity,
      setTrackingSpeed,
      setIsFaceTrackingEnabled,
      setCanvasAspectRatio,
      setVideoFilter,
      setBackgroundEffect,
      setBackgroundImageUrl,
      setBlankCanvasColor,
    ],
  );

  // Simple passthrough handlers
  const handleSetIsAudioOn = (val: boolean) => setAudioOn(val);
  const handleSetIsVideoOn = (val: boolean) => setVideoOn(val);
  const handleSetSelectedAudioDevice = (val: string) =>
    setSelectedAudioDevice(val);
  const handleSetSelectedVideoDevice = (val: string) =>
    setSelectedVideoDevice(val);
  const handleSetScreenShareMode = (val: "off" | "screen" | "canvas") => {
    setScreenShareMode(val);
    setLayoutMode(val !== "off" ? "pip" : "solo");
  };
  const handleSetCaptionStyle = (val: CaptionStyle) => setCaptionStyle(val);

  const handleCustomMaskUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string")
        setCustomMaskUrl(e.target.result);
      toast.success("Custom camera mask uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasBackgroundUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please upload an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    setBackgroundEffect("image");
    setBackgroundImageUrl(url);
    toast.success("Custom canvas background uploaded!");
  };

  const selectionWrapper = useMemo(
    () => ({
      selectedBrowserId,
      setSelectedBrowserId,
      selectedFileId,
      setSelectedFileId,
      selectedTextId,
      setSelectedTextId,
      selectedGeneratedId,
      setSelectedGeneratedId,
      handleDeselectAll: deselectAll,
    }),
    [
      selectedBrowserId,
      selectedFileId,
      selectedTextId,
      selectedGeneratedId,
      setSelectedBrowserId,
      setSelectedFileId,
      setSelectedTextId,
      setSelectedGeneratedId,
      deselectAll,
    ],
  );

  return {
    updateActiveScene,
    updateSceneProperty,
    handleSetIsAudioOn,
    handleSetIsVideoOn,
    handleSetSelectedAudioDevice,
    handleSetSelectedVideoDevice,
    handleSetScreenShareMode,
    handleSetCaptionStyle,
    handleCustomMaskUpload,
    handleCanvasBackgroundUpload,
    selectionWrapper,
  };
}
