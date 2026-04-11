import { useState, useRef, useEffect, useCallback } from "react";

export const useIndexUI = () => {
  // State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSceneTabsHidden, setIsSceneTabsHidden] = useState(true);
  const [isFsSidebarOpen, setIsFsSidebarOpen] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(false);
  const [showSessionsPanel, setShowSessionsPanelRaw] = useState(false);
  const [showAnimationLibrary, setShowAnimationLibraryRaw] = useState(false);
  const [showSettings, setShowSettingsRaw] = useState(false);
  const [isChatbotOpen, setIsChatbotOpenRaw] = useState(false);

  // Toggle-aware setters
  const setShowSessionsPanel = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setShowSessionsPanelRaw(prev => typeof value === 'function' ? value(prev) : value);
  }, []);

  const setShowAnimationLibrary = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setShowAnimationLibraryRaw(prev => typeof value === 'function' ? value(prev) : value);
  }, []);

  const setShowSettings = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setShowSettingsRaw(prev => typeof value === 'function' ? value(prev) : value);
  }, []);

  const setIsChatbotOpen = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsChatbotOpenRaw(prev => typeof value === 'function' ? value(prev) : value);
  }, []);

  // Refs
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // Mouse Proximity & Activity Effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Scene Tabs Proximity (Left side)
      const threshold = 50;
      if (window.innerWidth - e.clientX <= threshold) {
        setIsSceneTabsHidden(false);
      } else if (window.innerWidth - e.clientX > 300) {
        setIsSceneTabsHidden(true);
      }

      // General Mouse Activity
      setIsMouseActive(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => setIsMouseActive(false), 3000);

      // Bottom Nav Proximity
      const bottomProximity = 120;
      const hideThreshold = 200;
      const distanceFromBottom = window.innerHeight - e.clientY;

      if (distanceFromBottom <= bottomProximity) {
        setIsBottomNavVisible(true);
      } else if (distanceFromBottom > hideThreshold) {
        setIsBottomNavVisible(false);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return {
    isFullscreen,
    isSceneTabsHidden,
    setIsSceneTabsHidden,
    isFsSidebarOpen,
    setIsFsSidebarOpen,
    isMouseActive,
    isBottomNavVisible,
    showSessionsPanel,
    setShowSessionsPanel,
    showAnimationLibrary,
    setShowAnimationLibrary,
    showSettings,
    setShowSettings,
    isChatbotOpen,
    setIsChatbotOpen,
    mainContainerRef,
    canvasRef,
    handleToggleFullscreen,
  };
};
