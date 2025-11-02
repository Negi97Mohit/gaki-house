// src/pages/Index.tsx

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { VideoCanvas } from "@/components/VideoCanvas";
import { FloatingLogo } from "@/components/FloatingLogo";
import { FloatingControlsPanel } from "@/components/FloatingControlsPanel";
import { InstructionsDialog } from "@/components/InstructionsDialog";
import { DraggableTextOverlay } from "@/components/DraggableTextOverlay";
import { Type, SlidersHorizontal, Info, Sun, Moon } from "lucide-react";
import { zIndex } from "@/lib/zIndex";
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  GeneratedLayout,
  TextOverlayState,
  FileOverlayState,
  FileType,
  SceneState,
  SceneTransition,
  TransitionType,
  DEFAULT_LAYOUT_STATE,
} from "@/types/caption";
import { processCommandWithAgent, updateOverlay } from "@/lib/ai";
import { toast } from "sonner";
import { useLog } from "@/context/LogContext";
import { useDebug } from "@/context/DebugContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRecordingSession } from "@/hooks/useRecordingSession";
import {
  DraggableBrowser,
  BrowserOverlayState,
} from "@/components/DraggableBrowser";
import { SavedSessionsPanel } from "@/components/SavedSessionsPanel";
import { RecordingSession } from "@/types/editor";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { FloatingAssetSearch } from "@/components/FloatingAssetSearch";
import { AssetResult } from "@/components/AssetLibrary";
import { SceneTabs } from "@/components/SceneTabs";
import { TransitionPopover } from "@/components/TransitionPopover";

const generateTextOverlayId = () =>
  `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateFileId = () => `file-${Date.now()}`;
const generateBrowserId = () => `browser-${Date.now()}`;
const generateSceneId = () => `scene-${Date.now()}`;
const generateTransitionId = () => `trans-${Date.now()}`;

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

// --- NEW DEFAULT SCENE ---
const createDefaultScene = (name: string): SceneState => ({
  id: generateSceneId(),
  name,
  textOverlays: [],
  browserOverlays: [],
  fileOverlays: [],
  activeOverlays: [],
  selectedVideoDevice: undefined,
  selectedAudioDevice: undefined,
  isAudioOn: false,
  isVideoOn: false,
  captionsEnabled: true,
  screenShareMode: "off",
  isAiModeEnabled: true,
  aiButtonPosition: { x: 90, y: 90 },
  // Styles
  captionStyle: DEFAULT_CAPTION_STYLE,
  dynamicStyle: "none",
  // Layout
  layoutMode: DEFAULT_LAYOUT_STATE.mode,
  cameraShape: DEFAULT_LAYOUT_STATE.cameraShape,
  splitRatio: DEFAULT_LAYOUT_STATE.splitRatio,
  pipPosition: DEFAULT_LAYOUT_STATE.pipPosition,
  pipSize: DEFAULT_LAYOUT_STATE.pipSize,
  customMaskUrl: undefined,
  videoFilter: "none",
  blankCanvasColor: "#1A1A1A",
  backgroundEffect: "none",
  backgroundImageUrl: null,
  isAutoFramingEnabled: false,
  zoomSensitivity: 4.0,
  trackingSpeed: 0.08,
  isBeautifyEnabled: false,
  isLowLightEnabled: false,
  isNeonEdgeEnabled: false,
  neonIntensity: 20,
  neonColor: "cyan",
});

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const recording = useRecordingSession();
  const { log } = useLog();
  const { setDebugInfo } = useDebug();

  // --- SCENE STATE ---
  const [scenes, setScenes] = useState<SceneState[]>(() => [
    createDefaultScene("Scene 1"),
  ]);
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0].id);
  const [sceneTransitions, setSceneTransitions] = useState<SceneTransition[]>(
    []
  );
  const [activeTransition, setActiveTransition] =
    useState<SceneTransition | null>(null);

  // Memoized getter for the active scene's state
  const activeScene = useMemo(
    () => scenes.find((s) => s.id === activeSceneId)!,
    [scenes, activeSceneId]
  );

  // --- DEVICE/CONNECTION STATE ---
  // --- UI & WINDOW STATE ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFsSidebarOpen, setIsFsSidebarOpen] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

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
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  // --- DYNAMIC LAYOUT (Global) ---
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

  // --- SCENE MANAGEMENT ---

  // Helper function to update the active scene
  const updateActiveScene = useCallback(
    (updates: (scene: SceneState) => SceneState) => {
      setScenes((prevScenes) =>
        prevScenes.map((scene) => {
          if (scene.id === activeSceneId) {
            return updates(scene);
          }
          return scene;
        })
      );
    },
    [activeSceneId]
  );

  const handleAddScene = () => {
    const newScene = createDefaultScene(`Scene ${scenes.length + 1}`);
    const newScenes = [...scenes, newScene];

    // Create a default transition for the scene before it
    if (scenes.length > 0) {
      const prevSceneId = scenes[scenes.length - 1].id;
      const newTransition: SceneTransition = {
        id: generateTransitionId(),
        fromSceneId: prevSceneId,
        toSceneId: newScene.id,
        type: "none",
        durationMs: 300,
        easing: "ease-in-out",
        overlayEnabled: false,
      };
      setSceneTransitions((prev) => [...prev, newTransition]);
    }

    setScenes(newScenes);
    setActiveSceneId(newScene.id); // Switch to the new scene
  };

  const handleSceneSelect = (sceneId: string) => {
    if (sceneId === activeSceneId) return;
    setActiveSceneId(sceneId);
    handleDeselectAll(); // Deselect overlays when changing scenes
  };

  const handleTransitionClick = (transition: SceneTransition) => {
    setActiveTransition(transition);
  };

  const handleTransitionChange = (
    transitionId: string,
    updates: Partial<SceneTransition>
  ) => {
    setSceneTransitions((prev) =>
      prev.map((t) => (t.id === transitionId ? { ...t, ...updates } : t))
    );
  };

  const handleSceneClose = (sceneId: string) => {
    if (scenes.length <= 1) {
      toast.error("Cannot delete the last scene");
      return;
    }

    // Remove the scene
    const newScenes = scenes.filter((s) => s.id !== sceneId);
    setScenes(newScenes);

    // Remove transitions related to this scene
    setSceneTransitions((prev) =>
      prev.filter((t) => t.fromSceneId !== sceneId && t.toSceneId !== sceneId)
    );

    // Switch to another scene if the active one was deleted
    if (activeSceneId === sceneId) {
      setActiveSceneId(newScenes[0].id);
    }
  };

  const handleSceneReorder = (fromIndex: number, toIndex: number) => {
    const newScenes = [...scenes];
    const [moved] = newScenes.splice(fromIndex, 1);
    newScenes.splice(toIndex, 0, moved);
    setScenes(newScenes);
  };

  const handleSceneRename = (sceneId: string, newName: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, name: newName } : scene
      )
    );
  };

  // --- HANDLERS (useCallback and helpers) ---

  const handleSetDynamicLayout = (
    target: {
      id: string;
      type: "html" | "file" | "browser" | "caption" | "text";
    },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => {
    if (!activeScene) return;
    let targetOverlay: any = null;

    if (target.type === "html") {
      targetOverlay = activeScene.activeOverlays.find(
        (o) => o.id === target.id
      );
    } else if (target.type === "file") {
      targetOverlay = activeScene.fileOverlays.find((o) => o.id === target.id);
    } else if (target.type === "browser") {
      targetOverlay = activeScene.browserOverlays.find(
        (o) => o.id === target.id
      );
    } else if (target.type === "caption") {
      targetOverlay = {
        id: "live-caption",
        type: "caption",
        layout: activeScene.captionStyle,
      };
    }
    if (target.type === "text") {
      targetOverlay = activeScene.textOverlays.find((o) => o.id === target.id);
    }
    if (mode === "reset") {
      setDynamicLayout({
        isActive: false,
        mode: "split-vertical",
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

  const getFileType = (file: File): FileType => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    if (fileType.startsWith("audio/")) return "audio";
    if (fileType === "application/pdf") return "pdf";
    if (fileType.startsWith("text/")) return "text";
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
      if (!file || !activeSceneId) return;
      const newOverlay: FileOverlayState = {
        id: generateFileId(),
        file: file,
        fileName: file.name,
        fileType: getFileType(file),
        fileUrl: URL.createObjectURL(file),
        layout: {
          position: { x: 50, y: 50 },
          size: { width: 35, height: 45 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
        },
      };

      updateActiveScene((scene) => {
        const updatedOverlays = [...scene.fileOverlays, newOverlay];
        // Record the new overlay
        if (recording.isRecording) {
          recording.recordFileOverlay(newOverlay);
        }
        return { ...scene, fileOverlays: updatedOverlays };
      });

      toast.info(`Added file: ${file.name}`);
    },
    [activeSceneId, recording, updateActiveScene]
  );

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
      if (e.clipboardData?.files?.length > 0) {
        Array.from(e.clipboardData.files).forEach(handleAddFile);
        return;
      }
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
            zIndex: zIndex.draggableElement,
            rotation: 0,
          },
        };
        updateActiveScene((scene) => {
          const updatedOverlays = [...scene.browserOverlays, newBrowser];
          if (recording.isRecording) {
            recording.recordBrowserOverlay(newBrowser);
          }
          return { ...scene, browserOverlays: updatedOverlays };
        });
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
      scenes.forEach((scene) => {
        scene.fileOverlays.forEach((o) => URL.revokeObjectURL(o.fileUrl));
      });
    };
  }, [handleAddFile, scenes]);

  const isDraggingInternally = useRef(false);
  const handleInternalDragStart = () => {
    isDraggingInternally.current = true;
  };
  const handleInternalDragStop = () => {
    isDraggingInternally.current = false;
  };
  const handleRemoveFile = (id: string) => {
    updateActiveScene((scene) => {
      const overlayToRemove = scene.fileOverlays.find((o) => o.id === id);
      if (overlayToRemove) {
        URL.revokeObjectURL(overlayToRemove.fileUrl);
      }
      return {
        ...scene,
        fileOverlays: scene.fileOverlays.filter((o) => o.id !== id),
      };
    });
  };

  const handleFileLayoutChange = (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      fileOverlays: scene.fileOverlays.map((o) => {
        if (o.id === id) {
          const updatedOverlay = { ...o, layout: { ...o.layout, ...layout } };
          if (recording.isRecording)
            recording.recordFileOverlay(updatedOverlay);
          return updatedOverlay;
        }
        return o;
      }),
    }));
  };

  // --- SCENE-AWARE LAYOUT HANDLERS ---
  const createScenePropertyHandler = <K extends keyof SceneState>(key: K) => {
    return (value: SceneState[K]) => {
      updateActiveScene((scene) => {
        const updatedScene = { ...scene, [key]: value };
        // Check if this property is part of the layout group
        if (
          [
            "layoutMode",
            "cameraShape",
            "splitRatio",
            "pipPosition",
            "pipSize",
          ].includes(key as string)
        ) {
          if (recording.isRecording) {
            recording.recordLayoutChange({
              mode: updatedScene.layoutMode,
              cameraShape: updatedScene.cameraShape,
              splitRatio: updatedScene.splitRatio,
              pipPosition: updatedScene.pipPosition,
              pipSize: updatedScene.pipSize,
            });
          }
        }
        return updatedScene;
      });
    };
  };

  // --- SCENE-AWARE HANDLERS ---
  const handleSetIsAudioOn = createScenePropertyHandler("isAudioOn");
  const handleSetIsVideoOn = createScenePropertyHandler("isVideoOn");
  const handleSetSelectedVideoDevice = createScenePropertyHandler(
    "selectedVideoDevice"
  );
  const handleSetSelectedAudioDevice = createScenePropertyHandler(
    "selectedAudioDevice"
  );
  const handleSetCaptionStyle = createScenePropertyHandler("captionStyle");
  const handleSetDynamicStyle = createScenePropertyHandler("dynamicStyle");
  const handleSetCaptionsEnabled =
    createScenePropertyHandler("captionsEnabled");
  const handleSetAiButtonPosition =
    createScenePropertyHandler("aiButtonPosition");
  const handleSetScreenShareMode =
    createScenePropertyHandler("screenShareMode");
  const handleSetIsAiModeEnabled =
    createScenePropertyHandler("isAiModeEnabled");
  const handleAddTextOverlay = () => {
    const newTextOverlay: TextOverlayState = {
      id: generateTextOverlayId(),
      content: "Edit Text...",
      style: { ...activeScene.captionStyle, position: { x: 50, y: 50 } }, // Use global caption style
      layout: {
        position: { x: 50, y: 50 },
        size: { width: 30, height: 10 },
        zIndex: zIndex.draggableElement,
        rotation: 0,
      },
    };

    updateActiveScene((scene) => {
      const updatedOverlays = [...scene.textOverlays, newTextOverlay];
      // Note: Text overlays are static elements, not recorded in session yet
      return { ...scene, textOverlays: updatedOverlays };
    });

    handleDeselectAll();
    setSelectedTextId(newTextOverlay.id);
    toast.info("Text element added. Click to edit!");
  };

  const handleRemoveTextOverlay = (id: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.filter((o) => o.id !== id),
    }));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleTextLayoutChange = (
    id: string,
    layout: Partial<TextOverlayState["layout"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) => {
        if (o.id === id) {
          return { ...o, layout: { ...o.layout, ...layout } };
        }
        return o;
      }),
    }));
  };

  const handleTextStyleChange = (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) => {
        if (o.id === id) {
          return { ...o, style: { ...o.style, ...style } };
        }
        return o;
      }),
    }));
  };

  const handleTextContentChange = (id: string, content: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) => {
        if (o.id === id) {
          return { ...o, content };
        }
        return o;
      }),
    }));
  };

  const handleDeselectAll = () => {
    setSelectedBrowserId(null);
    setSelectedFileId(null);
    setSelectedTextId(null);
  };

  const handleAssetSelect = async (asset: AssetResult) => {
    try {
      const response = await fetch(asset.downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
      }
      const blob = await response.blob();
      const file = new File([blob], asset.fileName, { type: asset.type });
      handleAddFile(file);
    } catch (error) {
      console.error("Failed to add asset:", error);
      toast.error(`Failed to add asset: ${(error as Error).message}`);
    }
  };

  const handleCaptionLayoutChange = useCallback(
    (newLayout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }) => {
      const updatedStyle = {
        ...activeScene.captionStyle,
        position: newLayout.position ?? activeScene.captionStyle.position,
        width: newLayout.size?.width ?? activeScene.captionStyle.width,
      };
      handleSetCaptionStyle(updatedStyle);
      // Record the *global* caption style
      if (recording.isRecording) recording.recordCaptionStyle(updatedStyle);
    },
    [recording, handleSetCaptionStyle]
  );

  const processTranscript = useCallback(
    async (transcript: string, targetId: string | null = null) => {
      if (!activeScene.isAiModeEnabled || isProcessingAi || !activeScene)
        return;
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
          const existingOverlay = activeScene.activeOverlays.find(
            (o) => o.id === targetId
          );
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

          updateActiveScene((scene) => ({
            ...scene,
            activeOverlays: scene.activeOverlays.map((o) => {
              if (o.id === targetId) {
                const updated = { ...o, name, htmlContent, preview: "" };
                if (recording.isRecording) recording.recordHtmlOverlay(updated);
                return updated;
              }
              return o;
            }),
          }));
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

          updateActiveScene((scene) => {
            const updatedOverlays = [...scene.activeOverlays, newOverlay];
            if (recording.isRecording) {
              recording.recordHtmlOverlay(newOverlay);
            }
            return { ...scene, activeOverlays: updatedOverlays };
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
      isProcessingAi,
      log,
      setDebugInfo,
      activeScene,
      recording,
      updateActiveScene,
    ]
  );

  const handleOverlayLayoutChange = (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      activeOverlays: scene.activeOverlays.map((o) => {
        if (o.id === id) {
          const updated = { ...o, layout: { ...o.layout, [key]: value } };
          if (recording.isRecording) recording.recordHtmlOverlay(updated);
          return updated;
        }
        return o;
      }),
    }));
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
            zIndex: zIndex.draggableElement,
            rotation: 0,
          },
        };
        updateActiveScene((scene) => {
          const updatedOverlays = [...scene.browserOverlays, newBrowser];
          if (recording.isRecording) {
            recording.recordBrowserOverlay(newBrowser);
          }
          return { ...scene, browserOverlays: updatedOverlays };
        });
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
  }, [selectedBrowserId, recording, updateActiveScene]);

  const handleRemoveBrowser = (id: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      browserOverlays: scene.browserOverlays.filter((b) => b.id !== id),
    }));
  };

  const handleBrowserUrlChange = (id: string, url: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      browserOverlays: scene.browserOverlays.map((b) =>
        b.id === id ? { ...b, url } : b
      ),
    }));
  };

  const handleBrowserLayoutChange = (
    id: string,
    layout: Partial<BrowserOverlayState["layout"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      browserOverlays: scene.browserOverlays.map((b) => {
        if (b.id === id) {
          const updated = { ...b, layout: { ...b.layout, ...layout } };
          if (recording.isRecording) recording.recordBrowserOverlay(updated);
          return updated;
        }
        return b;
      }),
    }));
  };

  const handleRemoveOverlay = (id: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      activeOverlays: scene.activeOverlays.filter((o) => o.id !== id),
    }));
    toast.info("Overlay removed from canvas.");
  };

  const handleCustomMaskUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        createScenePropertyHandler("customMaskUrl")(result);
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
        zIndex: zIndex.draggableElement,
        rotation: 0,
      },
      preview: "",
    };
    updateActiveScene((scene) => {
      const updatedOverlays = [...scene.activeOverlays, newActiveOverlay];
      if (recording.isRecording) {
        recording.recordHtmlOverlay(newActiveOverlay);
      }
      return { ...scene, activeOverlays: updatedOverlays };
    });
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
        (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen();
      }
    } else if (document.fullscreenElement) {
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
      }, 2500);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  // --- Sidebar Props ---
  const sidebarProps = {
    // --- GLOBAL STYLES ---
    style: activeScene.captionStyle,
    onStyleChange: handleSetCaptionStyle,
    dynamicStyle: activeScene.dynamicStyle,
    onDynamicStyleChange: handleSetDynamicStyle,

    // --- SCENE-SPECIFIC STYLES ---
    blankCanvasColor: activeScene.blankCanvasColor,
    onBlankCanvasColorChange: createScenePropertyHandler("blankCanvasColor"),
    backgroundEffect: activeScene.backgroundEffect,
    onBackgroundEffectChange: createScenePropertyHandler("backgroundEffect"),
    backgroundImageUrl: activeScene.backgroundImageUrl,
    onBackgroundImageUrlChange:
      createScenePropertyHandler("backgroundImageUrl"),
    isAutoFramingEnabled: activeScene.isAutoFramingEnabled,
    onAutoFramingChange: createScenePropertyHandler("isAutoFramingEnabled"),
    zoomSensitivity: activeScene.zoomSensitivity,
    onZoomSensitivityChange: createScenePropertyHandler("zoomSensitivity"),
    trackingSpeed: activeScene.trackingSpeed,
    onTrackingSpeedChange: createScenePropertyHandler("trackingSpeed"),
    isBeautifyEnabled: activeScene.isBeautifyEnabled,
    onBeautifyToggle: createScenePropertyHandler("isBeautifyEnabled"),
    isLowLightEnabled: activeScene.isLowLightEnabled,
    onLowLightToggle: createScenePropertyHandler("isLowLightEnabled"),
    videoFilter: activeScene.videoFilter,
    onVideoFilterChange: createScenePropertyHandler("videoFilter"),
    isNeonEdgeEnabled: activeScene.isNeonEdgeEnabled,
    onNeonEdgeToggle: createScenePropertyHandler("isNeonEdgeEnabled"),
    neonIntensity: activeScene.neonIntensity,
    onNeonIntensityChange: createScenePropertyHandler("neonIntensity"),
    neonColor: activeScene.neonColor,
    onNeonColorChange: createScenePropertyHandler("neonColor"),

    // --- GLOBAL SAVED ASSETS ---
    savedOverlays: savedOverlays,
    onAddSavedOverlay: handleAddSavedOverlay,
    onDeleteSavedOverlay: handleDeleteSavedOverlay,
  };

  // ----------------------------------------------------------------------
  // --- RECORDING SNAPSHOT LOGIC ---
  // ----------------------------------------------------------------------
  const takeSnapshot = useCallback(() => {
    if (!recording.isRecording) return;
    if (!activeScene) return; // Guard clause

    // 1. HTML Overlays
    activeScene.activeOverlays.forEach((overlay) => {
      recording.recordHtmlOverlay(overlay);
    });

    // 2. File Overlays
    activeScene.fileOverlays.forEach((overlay) => {
      recording.recordFileOverlay(overlay);
    });

    // 3. Browser Overlays
    activeScene.browserOverlays.forEach((overlay) => {
      recording.recordBrowserOverlay(overlay);
    });

    // Note: Text overlays are static and not recorded in session yet

    // 5. Global Live Caption Style
    recording.recordCaptionStyle(activeScene.captionStyle);

    // 6. Scene Layout
    recording.recordLayoutChange({
      mode: activeScene.layoutMode,
      cameraShape: activeScene.cameraShape,
      splitRatio: activeScene.splitRatio,
      pipPosition: activeScene.pipPosition,
      pipSize: activeScene.pipSize,
    });
  }, [recording, activeScene]);

  // Use a separate useEffect for the snapshot interval
  useEffect(() => {
    if (recording.isRecording) {
      frameIntervalRef.current = setInterval(takeSnapshot, 250);
    } else if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
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
            dynamicStyle: activeScene.dynamicStyle,
            videoFilter: activeScene.videoFilter, // Pass active scene's filter
            backgroundEffect: activeScene.backgroundEffect,
            backgroundImageUrl: activeScene.backgroundImageUrl,
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
      setAllSessions,
      navigate,
      activeScene, // Depends on active scene for settings
    ]
  );

  if (!activeScene) {
    // This should theoretically never happen if scenes[0] is set
    return <div>Loading...</div>;
  }

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

      {/* --- SCENE TABS --- */}
      <SceneTabs
        scenes={scenes}
        activeSceneId={activeSceneId}
        transitions={sceneTransitions}
        onSceneSelect={handleSceneSelect}
        onSceneAdd={handleAddScene}
        onTransitionClick={handleTransitionClick}
        onSceneClose={handleSceneClose}
        onSceneReorder={handleSceneReorder}
        onSceneRename={handleSceneRename}
      />

      {/* ADDED: Top Right Corner - Theme and Info Buttons ONLY */}
      <div className="fixed top-6 right-6 z-[2015] flex items-center gap-2 transition-opacity duration-300">
        <Button
          onClick={handleAddTextOverlay}
          size="icon"
          variant="outline"
          className="rounded-full h-10 w-10 shadow-lg backdrop-blur-sm border-2 hover:scale-105 transition-transform duration-200"
          title="Add Text"
        >
          <Type className="h-5 w-5" />
        </Button>
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

      {/* --- TRANSITION POPOVER --- */}
      <TransitionPopover
        transition={activeTransition}
        onClose={() => setActiveTransition(null)}
        onTransitionChange={handleTransitionChange}
      />

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
        dynamicLayout={dynamicLayout}
        blankCanvasColor={activeScene.blankCanvasColor}
        onOpenSessions={() => setShowSessionsPanel(true)}
        onOpenSettings={() => setShowFloatingPanel(!showFloatingPanel)}
        isMouseActive={isMouseActive}
        // Media/Audio/Video Controls
        isAudioOn={activeScene.isAudioOn}
        onAudioToggle={handleSetIsAudioOn}
        isVideoOn={activeScene.isVideoOn}
        onVideoToggle={handleSetIsVideoOn}
        selectedVideoDevice={activeScene.selectedVideoDevice}
        onVideoDeviceSelect={handleSetSelectedVideoDevice}
        selectedAudioDevice={activeScene.selectedAudioDevice}
        onAudioDeviceSelect={handleSetSelectedAudioDevice}
        // Recording
        isRecording={recording.isRecording}
        onRecordingToggle={handleRecordingToggle}
        canvasRef={canvasRef}
        onRecordingComplete={() => {}}
        // AI & Overlays (from active scene)
        isAiModeEnabled={activeScene.isAiModeEnabled}
        onAiModeToggle={handleSetIsAiModeEnabled}
        isProcessingAi={isProcessingAi}
        onProcessTranscript={processTranscript}
        generatedOverlays={activeScene.activeOverlays}
        onOverlayLayoutChange={handleOverlayLayoutChange}
        onRemoveOverlay={handleRemoveOverlay}
        onPreviewGenerated={() => {}}
        aiButtonPosition={activeScene.aiButtonPosition}
        onAiButtonPositionChange={handleSetAiButtonPosition}
        browserOverlays={activeScene.browserOverlays}
        onRemoveBrowser={handleRemoveBrowser}
        onBrowserUrlChange={handleBrowserUrlChange}
        onBrowserLayoutChange={handleBrowserLayoutChange}
        selectedBrowserId={selectedBrowserId}
        setSelectedBrowserId={setSelectedBrowserId}
        fileOverlays={activeScene.fileOverlays}
        onRemoveFile={handleRemoveFile}
        onFileLayoutChange={handleFileLayoutChange}
        selectedFileId={selectedFileId}
        setSelectedFileId={setSelectedFileId}
        onInternalDragStart={handleInternalDragStart}
        onInternalDragStop={handleInternalDragStop}
        onDeselectAll={handleDeselectAll}
        onSetDynamicLayout={handleSetDynamicLayout}
        screenShareMode={activeScene.screenShareMode}
        onScreenShareModeChange={handleSetScreenShareMode}
        // Caption Controls (Global)
        captionsEnabled={activeScene.captionsEnabled}
        onCaptionsToggle={handleSetCaptionsEnabled}
        liveCaptionStyle={activeScene.captionStyle}
        onStyleChange={handleSetCaptionStyle}
        dynamicStyle={activeScene.dynamicStyle}
        onCaptionLayoutChange={handleCaptionLayoutChange}
        portalContainer={null}
        // Layout & Style (from active scene)
        layoutMode={activeScene.layoutMode}
        cameraShape={activeScene.cameraShape}
        splitRatio={activeScene.splitRatio}
        pipPosition={activeScene.pipPosition}
        pipSize={activeScene.pipSize}
        onLayoutModeChange={createScenePropertyHandler("layoutMode")}
        onCameraShapeChange={createScenePropertyHandler("cameraShape")}
        onSplitRatioChange={createScenePropertyHandler("splitRatio")}
        onPipPositionChange={createScenePropertyHandler("pipPosition")}
        onPipSizeChange={createScenePropertyHandler("pipSize")}
        customMaskUrl={activeScene.customMaskUrl}
        onCustomMaskUpload={handleCustomMaskUpload}
        // Text Overlays (from active scene)
        textOverlays={activeScene.textOverlays}
        onRemoveTextOverlay={handleRemoveTextOverlay}
        onTextLayoutChange={handleTextLayoutChange}
        onTextStyleChange={handleTextStyleChange}
        onTextContentChange={handleTextContentChange}
        selectedTextId={selectedTextId}
        setSelectedTextId={setSelectedTextId}
        // All other effect props (from active scene)
        videoFilter={activeScene.videoFilter}
        backgroundEffect={activeScene.backgroundEffect}
        backgroundImageUrl={activeScene.backgroundImageUrl}
        isAutoFramingEnabled={activeScene.isAutoFramingEnabled}
        zoomSensitivity={activeScene.zoomSensitivity}
        trackingSpeed={activeScene.trackingSpeed}
        isBeautifyEnabled={activeScene.isBeautifyEnabled}
        isLowLightEnabled={activeScene.isLowLightEnabled}
        isNeonEdgeEnabled={activeScene.isNeonEdgeEnabled}
        neonIntensity={activeScene.neonIntensity}
        neonColor={activeScene.neonColor}
        // Pass sidebar props object for the floating panel
        sidebarProps={sidebarProps}
      />
    </div>
  );
};

export default Index;
