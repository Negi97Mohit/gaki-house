import { create } from "zustand";
interface MouseState {
  isMouseActive: boolean;
  setMouseActive: (isActive: boolean) => void;
}

export const useMouseStore = create<MouseState>((set) => ({
  isMouseActive: true,
  setMouseActive: (isMouseActive) => set({ isMouseActive }),
}));

interface UiState {
  isFullscreen: boolean;
  isFsSidebarOpen: boolean;
  showSettings: boolean;
  showSessionsPanel: boolean;
  showAnimationLibrary: boolean;
  isChatbotOpen: boolean;

  // Actions - support both direct set and toggle function
  setFullscreen: (isFullscreen: boolean) => void;
  setFsSidebarOpen: (isOpen: boolean) => void;
  setShowSettings: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  setShowSessionsPanel: (
    isOpen: boolean | ((prev: boolean) => boolean),
  ) => void;
  setShowAnimationLibrary: (
    isOpen: boolean | ((prev: boolean) => boolean),
  ) => void;
  setChatbotOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  isFullscreen: false,
  isFsSidebarOpen: false,
  showSettings: false,
  showSessionsPanel: false,
  showAnimationLibrary: false,
  isChatbotOpen: false,

  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setFsSidebarOpen: (isFsSidebarOpen) => set({ isFsSidebarOpen }),
  setShowSettings: (showSettings) =>
    set((state) => ({
      showSettings:
        typeof showSettings === "function"
          ? showSettings(state.showSettings)
          : showSettings,
    })),
  setShowSessionsPanel: (showSessionsPanel) =>
    set((state) => ({
      showSessionsPanel:
        typeof showSessionsPanel === "function"
          ? showSessionsPanel(state.showSessionsPanel)
          : showSessionsPanel,
    })),
  setShowAnimationLibrary: (showAnimationLibrary) =>
    set((state) => ({
      showAnimationLibrary:
        typeof showAnimationLibrary === "function"
          ? showAnimationLibrary(state.showAnimationLibrary)
          : showAnimationLibrary,
    })),
  setChatbotOpen: (isChatbotOpen) =>
    set((state) => ({
      isChatbotOpen:
        typeof isChatbotOpen === "function"
          ? isChatbotOpen(state.isChatbotOpen)
          : isChatbotOpen,
    })),
}));
