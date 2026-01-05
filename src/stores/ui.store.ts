import { create } from 'zustand';

interface UiState {
    isMouseActive: boolean;
    isFullscreen: boolean;
    isFsSidebarOpen: boolean;
    showSettings: boolean;
    showSessionsPanel: boolean;
    showAnimationLibrary: boolean;
    isChatbotOpen: boolean;

    // Actions
    setMouseActive: (isActive: boolean) => void;
    setFullscreen: (isFullscreen: boolean) => void;
    setFsSidebarOpen: (isOpen: boolean) => void;
    setShowSettings: (isOpen: boolean) => void;
    setShowSessionsPanel: (isOpen: boolean) => void;
    setShowAnimationLibrary: (isOpen: boolean) => void;
    setChatbotOpen: (isOpen: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    isMouseActive: true,
    isFullscreen: false,
    isFsSidebarOpen: false,
    showSettings: false,
    showSessionsPanel: false,
    showAnimationLibrary: false,
    isChatbotOpen: false,

    setMouseActive: (isMouseActive) => set({ isMouseActive }),
    setFullscreen: (isFullscreen) => set({ isFullscreen }),
    setFsSidebarOpen: (isFsSidebarOpen) => set({ isFsSidebarOpen }),
    setShowSettings: (showSettings) => set({ showSettings }),
    setShowSessionsPanel: (showSessionsPanel) => set({ showSessionsPanel }),
    setShowAnimationLibrary: (showAnimationLibrary) => set({ showAnimationLibrary }),
    setChatbotOpen: (isChatbotOpen) => set({ isChatbotOpen }),
}));
