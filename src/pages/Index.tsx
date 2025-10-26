// src/pages/Index.tsx

import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VideoCanvas } from "@/components/VideoCanvas";
import { FloatingLogo } from "@/components/FloatingLogo";
import { FloatingControlsPanel } from "@/components/FloatingControlsPanel";
import { InstructionsDialog } from "@/components/InstructionsDialog";
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
import { useLog } from "@/context/LogContext"; // KEEP
import { useDebug } from "@/context/DebugContext"; // KEEP
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRecordingSession } from "@/hooks/useRecordingSession";
import {
  DraggableBrowser,
  BrowserOverlayState,
} from "@/components/DraggableBrowser";
import { SavedSessionsPanel } from "@/components/SavedSessionsPanel";
import { RecordingSession } from "@/types/editor";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, Info, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button"; // FIXED: Missing Button import
import { DEFAULT_LAYOUT_STATE as DLAYOUT } from "@/types/caption";
import { FloatingAssetSearch } from "@/components/FloatingAssetSearch"; // <-- ADD
import { AssetResult } from "@/components/AssetLibrary"; // <-- ADD

const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateFileId = () => `file-${Date.now()}`;
const generateBrowserId = () => `browser-${Date.now()}`;

// --- MISSING DEFAULT DEFINITION ---
const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: "Inter",
  fontSize: 32,
  color: "#FFFFFF",
  backgroundColor: "rgba(0,0,0,0.8)",
  position: { x: 50, y: 50 },
  shape: "rounded",
  animation: "fade",
  outline: false,
  shadow: true,
  bold: false,
  italic: false,
  underline: false,
  rotation: 0,
  border: false,
  borderColor: "#FFFFFF",
  borderWidth: 2,
  width: 60,
};

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  // HOISTED HOOKS: MUST BE CALLED AT THE TOP LEVEL
  const recording = useRecordingSession();
  const { log } = useLog(); // HOOK CALL
  const { setDebugInfo } = useDebug(); // HOOK CALL

  // --- DEVICE/CONNECTION STATE ---
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<
    string | undefined
  >(undefined);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<
    string | undefined
  >(undefined);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);

  // --- UI & WINDOW STATE ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFsSidebarOpen, setIsFsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);
  const [activeHtmlOverlay, setActiveHtmlOverlay] =
    useState<GeneratedOverlay | null>(null);
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const [allSessions, setAllSessions] = useLocalStorage<RecordingSession[]>(
    "gaki-recorded-sessions",
    []
  );
  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>(
    "gaki-saved-overlays",
    []
  );

  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- LAYOUT STATE ---
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(DLAYOUT.mode);
  const [cameraShape, setCameraShape] = useState<CameraShape>(
    DLAYOUT.cameraShape
  );
  const [splitRatio, setSplitRatio] = useState(DLAYOUT.splitRatio);
  const [pipPosition, setPipPosition] = useState(DLAYOUT.pipPosition);
  const [pipSize, setPipSize] = useState(DLAYOUT.pipSize);
  const [customMaskUrl, setCustomMaskUrl] = useState<string | undefined>(
    undefined
  );
  const [aiButtonPosition, setAiButtonPosition] = useState({ x: 90, y: 90 });

  // --- CAPTION/OVERLAY STATE ---
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(
    DEFAULT_CAPTION_STYLE
  );
  const [dynamicStyle, setDynamicStyle] = useState("none");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [browserOverlays, setBrowserOverlays] = useState<BrowserOverlayState[]>(
    []
  );
  const [fileOverlays, setFileOverlays] = useState<FileOverlayState[]>([]);
  const [activeOverlays, setActiveOverlays] = useState<GeneratedOverlay[]>([]);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [isAiModeEnabled, setIsAiModeEnabled] = useState(true);
  const [promptHistory, setPromptHistory] = useState<string[]>([]); // Keep this for potential use

  // --- VIDEO EFFECTS STATE ---
  const [videoFilter, setVideoFilter] = useState("none");
  const [blankCanvasColor, setBlankCanvasColor] = useState("#1A1A1A");
  const [backgroundEffect, setBackgroundEffect] = useState<
    "none" | "blur" | "image"
  >("none");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  );
  const [isAutoFramingEnabled, setIsAutoFramingEnabled] = useState(false);
  const [zoomSensitivity, setZoomSensitivity] = useState(4.0);
  const [trackingSpeed, setTrackingSpeed] = useState(0.08);
  const [isBeautifyEnabled, setIsBeautifyEnabled] = useState(false);
  const [isLowLightEnabled, setIsLowLightEnabled] = useState(false);
  const [isNeonEdgeEnabled, setIsNeonEdgeEnabled] = useState(false);
  const [neonIntensity, setNeonIntensity] = useState(20);
  const [neonColor, setNeonColor] = useState("cyan");

  const [dynamicLayout, setDynamicLayout] = useState<{
    isActive: boolean;
    mode: "split-vertical" | "split-horizontal" | "pip";
    target: {
      id: string;
      type: string;
      content: any;
      layout: GeneratedLayout;
    } | null;
  }>({
    isActive: false,
    mode: "split-vertical",
    target: null,
  });

  // --- HANDLERS (useCallback and helpers) ---

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
      // Snapshots the current (reset) state
      if (recording.isRecording) takeSnapshot();
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
    // Snapshots the current (new dynamic) state
    if (recording.isRecording) takeSnapshot();
  };

  // ... (getFileType function remains the same)
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

  const handleAddFile = useCallback(
    (file: File) => {
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
      if (recording.isRecording) recording.recordFileOverlay(newOverlay);
    },
    [recording.isRecording]
  );

  useEffect(() => {
    // ... (event listeners for drag/drop/paste remain the same)
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
        if (recording.isRecording) recording.recordBrowserOverlay(newBrowser);
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
  }, [handleAddFile, fileOverlays, recording.isRecording]);

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
    // NOTE: Removal during recording is implicitly handled by the continuous snapshot (it will disappear from the list of active overlays)
  };

  const handleFileLayoutChange = (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => {
    setFileOverlays((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updatedOverlay = { ...o, layout: { ...o.layout, ...layout } };
          if (recording.isRecording)
            recording.recordFileOverlay(updatedOverlay);
          return updatedOverlay;
        }
        return o;
      })
    );
  };

  const handleLayoutModeChange = (mode: LayoutMode) => {
    // Deactivate any active dynamic layout when a global layout is chosen
    setDynamicLayout({ isActive: false, mode: "split-vertical", target: null });
    // Set the global layout mode
    setLayoutMode(mode);
    if (recording.isRecording) {
      // ADDED: Record change
      recording.recordLayoutChange({
        mode,
        cameraShape,
        splitRatio,
        pipPosition,
        pipSize,
      });
    }
  };

  const handleDeselectAll = () => {
    setSelectedBrowserId(null);
    setSelectedFileId(null);
  };

  const handleAssetSelect = async (asset: AssetResult) => {
    // 1. Fetch the asset from its URL
    try {
      const response = await fetch(asset.downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
      }
      const blob = await response.blob();

      // 2. Create a new File object from the blob
      const file = new File([blob], asset.fileName, { type: asset.type });

      // 3. Use your *existing* handleAddFile function to add it to the canvas
      handleAddFile(file); // handleAddFile already exists in your Index.tsx
    } catch (error) {
      console.error("Failed to add asset:", error);
      toast.error(`Failed to add asset: ${(error as Error).message}`);
    }
  };

  // --- END OF FILE HANDLING SECTION ---

  const handleCaptionLayoutChange = useCallback(
    (newLayout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }) => {
      setCaptionStyle((prev) => {
        const updatedStyle = {
          ...prev,
          position: newLayout.position ?? prev.position,
          width: newLayout.size?.width ?? prev.width,
        };
        if (recording.isRecording) recording.recordCaptionStyle(updatedStyle);
        return updatedStyle;
      });
    },
    [recording.isRecording, recording.recordCaptionStyle]
  );

  const processTranscript = useCallback(
    // ... (processTranscript remains the same, but remove `isRecording` check from `handleLayoutChange` below)
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
            prev.map((overlay) => {
              const updatedOverlay =
                overlay.id === targetId
                  ? { ...overlay, name, htmlContent, preview: "" }
                  : overlay;
              if (overlay.id === targetId && recording.isRecording) {
                // ADDED: Record the resulting overlay state
                recording.recordHtmlOverlay(updatedOverlay);
              }
              return updatedOverlay;
            })
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
          setActiveOverlays((prev) => {
            const newOverlays = [...prev, newOverlay];
            if (recording.isRecording) recording.recordHtmlOverlay(newOverlay);
            return newOverlays;
          });
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
    [
      isAiModeEnabled,
      isProcessingAi,
      log,
      setDebugInfo,
      activeOverlays,
      recording.isRecording,
      recording.recordHtmlOverlay,
    ]
  );

  const handleLayoutChange = (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => {
    setActiveOverlays((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updatedOverlay = {
            ...o,
            layout: { ...o.layout, [key]: value },
          };
          if (recording.isRecording)
            recording.recordHtmlOverlay(updatedOverlay);
          return updatedOverlay;
        }
        return o;
      })
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
        if (recording.isRecording) recording.recordBrowserOverlay(newBrowser);
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
  }, [
    selectedBrowserId,
    recording.isRecording,
    recording.recordBrowserOverlay,
  ]);

  const handleRemoveBrowser = (id: string) => {
    setBrowserOverlays((prev) => prev.filter((b) => b.id !== id));
    // NOTE: Removal during recording is implicitly handled by the continuous snapshot
  };

  const handleBrowserUrlChange = (id: string, url: string) => {
    setBrowserOverlays((prev) =>
      prev.map((b) => (b.id === id ? { ...b, url } : b))
    );
    // NOTE: URL change is not keyframed currently, only layout
  };

  const handleBrowserLayoutChange = (
    id: string,
    layout: Partial<BrowserOverlayState["layout"]>
  ) => {
    setBrowserOverlays((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updatedOverlay = { ...b, layout: { ...b.layout, ...layout } };
          if (recording.isRecording)
            recording.recordBrowserOverlay(updatedOverlay);
          return updatedOverlay;
        }
        return b;
      })
    );
  };

  const handleRemoveOverlay = (id: string) => {
    setActiveOverlays((prev) => prev.filter((o) => o.id !== id));
    toast.info("Overlay removed from canvas.");
    // NOTE: Removal during recording is implicitly handled by the continuous snapshot
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

  const handleAddSavedOverlay = (overlay: GeneratedOverlay) => {
    const newActiveOverlay: GeneratedOverlay = {
      ...overlay,
      id: generateOverlayId(),
      layout: {
        position: { x: 50, y: 50 },
        size: { width: 40, height: 40 },
        zIndex: 10,
        rotation: 0,
      },
      preview: "",
    };
    setActiveOverlays((prev) => [...prev, newActiveOverlay]);
    if (recording.isRecording) recording.recordHtmlOverlay(newActiveOverlay);
  };

  const handleDeleteSavedOverlay = (id: string) => {
    setSavedOverlays((prev) => prev.filter((o) => o.id !== id));
  };

  const handleToggleFullscreen = () => setIsFullscreen((prev) => !prev);
  useEffect(() => {
    if (isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen(); // Safari
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen(); // IE11
      }
    } else if (document.fullscreenElement) {
      // FIX: Only attempt to exit if we are currently in fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // MOUSE ACTIVITY EFFECT
  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseActive(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 2500); // Hide cursor after 2.5 seconds
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  const sidebarProps = {
    style: captionStyle,
    onStyleChange: setCaptionStyle,
    dynamicStyle: dynamicStyle,
    onDynamicStyleChange: setDynamicStyle,
    blankCanvasColor: blankCanvasColor,
    onBlankCanvasColorChange: setBlankCanvasColor,
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

  // ----------------------------------------------------------------------
  // --- RECORDING SNAPSHOT LOGIC ---
  // ----------------------------------------------------------------------

  // Snapshots the entire screen state (called on interval and user interaction)
  const takeSnapshot = useCallback(() => {
    if (!recording.isRecording) return;

    // 1. HTML Overlays
    activeOverlays.forEach((overlay) => {
      recording.recordHtmlOverlay(overlay);
    });

    // 2. File Overlays
    fileOverlays.forEach((overlay) => {
      recording.recordFileOverlay(overlay);
    });

    // 3. Browser Overlays
    browserOverlays.forEach((overlay) => {
      recording.recordBrowserOverlay(overlay);
    });

    // 4. Caption Style
    recording.recordCaptionStyle(captionStyle);

    // 5. Global Layout
    recording.recordLayoutChange({
      mode: layoutMode,
      cameraShape,
      splitRatio,
      pipPosition,
      pipSize,
    });
  }, [
    recording,
    activeOverlays,
    fileOverlays,
    browserOverlays,
    captionStyle,
    layoutMode,
    cameraShape,
    splitRatio,
    pipPosition,
    pipSize,
  ]);

  // Use a separate useEffect for the snapshot interval
  useEffect(() => {
    if (recording.isRecording) {
      // Set up snapshot interval (e.g., every 250ms)
      frameIntervalRef.current = setInterval(takeSnapshot, 250);
    } else if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // Cleanup on unmount or recording stop
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [recording.isRecording, takeSnapshot]);

  const handleDeleteSession = useCallback(
    (id: string) => {
      setAllSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setAllSessions]
  );

  // NEW WRAPPER for VideoCanvas prop (Simplified)
  const handleRecordingToggle = useCallback(
    async (
      isCurrentlyRecording: boolean,
      stream: MediaStream,
      containerSize: { width: number; height: number }
    ) => {
      if (!isCurrentlyRecording) {
        // 1. Start the recording session
        await recording.startRecording(canvasRef.current as HTMLCanvasElement);
        toast.info("Recording started!");
      } else {
        // 2. Stop the recording session
        const session = await recording.stopRecording(
          containerSize.width,
          containerSize.height,
          {
            dynamicStyle,
            videoFilter,
            backgroundEffect,
            backgroundImageUrl,
          }
        );
        setAllSessions((prev) => [session, ...prev]);
        toast.success("Recording saved and ready for editing!");
        setTimeout(() => {
          navigate(`/edit/${session.id}`);
        }, 50);
      }
    },
    [
      recording,
      canvasRef,
      setAllSessions,
      navigate,
      dynamicStyle,
      videoFilter,
      backgroundEffect,
      backgroundImageUrl,
    ]
  );

  return (
    <div
      ref={mainContainerRef}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative",
        !isMouseActive && "cursor-none"
      )}
    >
      <FloatingControlsPanel isMouseActive={isMouseActive} {...sidebarProps} />
      {/* -------------------- TOP UI LAYER (Logo and Floating Panel Trigger) -------------------- */}
      <div className="fixed top-6 left-6 z-[2015] transition-opacity duration-300">
        <FloatingLogo />
      </div>
      {/* ADDED: Top Right Corner - Theme and Info Buttons ONLY */}
      <div className="fixed top-6 right-6 z-[2015] flex items-center gap-2 transition-opacity duration-300">
        <FloatingAssetSearch onAssetSelect={handleAssetSelect} />
        <Button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 shadow-lg backdrop-blur-sm border-2 hover:scale-105 transition-transform duration-200"
          title="Toggle Theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <InstructionsDialog />
      </div>

      {/* -------------------- SIDEBARS AND PANELS -------------------- */}
      <SavedSessionsPanel
        sessions={allSessions}
        onDeleteSession={handleDeleteSession}
        isOpen={showSessionsPanel}
        onClose={() => setShowSessionsPanel(false)}
      />

      {/* -------------------- MAIN CANVAS -------------------- */}
      <VideoCanvas
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isFsSidebarOpen={isFsSidebarOpen}
        onFsSidebarToggle={setIsFsSidebarOpen}
        blankCanvasColor={blankCanvasColor}
        onOpenSessions={() => setShowSessionsPanel(true)}
        onOpenSettings={() => setShowFloatingPanel(!showFloatingPanel)}
        isMouseActive={isMouseActive}
        // Media/Audio/Video Controls
        isAudioOn={isAudioOn}
        onAudioToggle={setIsAudioOn}
        isVideoOn={isVideoOn}
        onVideoToggle={setIsVideoOn}
        selectedVideoDevice={selectedVideoDevice}
        onVideoDeviceSelect={setSelectedVideoDevice}
        selectedAudioDevice={selectedAudioDevice}
        onAudioDeviceSelect={setSelectedAudioDevice}
        // Recording
        isRecording={recording.isRecording}
        onRecordingToggle={handleRecordingToggle as any}
        canvasRef={canvasRef}
        onRecordingComplete={() => {}}
        // AI & Overlays
        isAiModeEnabled={isAiModeEnabled}
        onAiModeToggle={setIsAiModeEnabled}
        isProcessingAi={isProcessingAi}
        onProcessTranscript={processTranscript}
        generatedOverlays={activeOverlays}
        onOverlayLayoutChange={handleLayoutChange}
        onRemoveOverlay={handleRemoveOverlay}
        onPreviewGenerated={() => {}} // Placeholder: You'd implement the real preview generation here
        aiButtonPosition={aiButtonPosition}
        onAiButtonPositionChange={setAiButtonPosition}
        browserOverlays={browserOverlays}
        onRemoveBrowser={handleRemoveBrowser}
        onBrowserUrlChange={handleBrowserUrlChange}
        onBrowserLayoutChange={handleBrowserLayoutChange}
        selectedBrowserId={selectedBrowserId}
        setSelectedBrowserId={setSelectedBrowserId}
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
        // Caption Controls
        captionsEnabled={captionsEnabled}
        onCaptionsToggle={setCaptionsEnabled}
        liveCaptionStyle={captionStyle}
        dynamicStyle={dynamicStyle}
        onCaptionLayoutChange={handleCaptionLayoutChange}
        // Layout & Style
        layoutMode={layoutMode}
        cameraShape={cameraShape}
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
        // All other effect props
        {...sidebarProps}
      />
    </div>
  );
};

export default Index;
