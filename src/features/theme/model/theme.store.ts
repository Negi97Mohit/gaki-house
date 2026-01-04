import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "default" | "ocean" | "forest" | "sunset";
export type ThemeMode = "light" | "dark";

interface ThemeState {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "default",
      mode: "dark",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme, get().mode);
      },
      setMode: (mode) => {
        set({ mode });
        applyTheme(get().theme, mode);
      },
      toggleMode: () => {
        const newMode = get().mode === "dark" ? "light" : "dark";
        set({ mode: newMode });
        applyTheme(get().theme, newMode);
      },
    }),
    {
      name: "app-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme, state.mode);
        }
      },
    }
  )
);

function applyTheme(theme: ThemeName, mode: ThemeMode) {
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove("theme-default", "theme-ocean", "theme-forest", "theme-sunset");
  root.classList.remove("dark", "light");
  
  // Apply new theme and mode
  root.classList.add(`theme-${theme}`);
  if (mode === "dark") {
    root.classList.add("dark");
  }
}

// Theme metadata for UI
export const themes: Record<ThemeName, { name: string; colors: { light: string; dark: string } }> = {
  default: {
    name: "Default",
    colors: { light: "#fbbf24", dark: "#facc15" }, // Yellow/Gold
  },
  ocean: {
    name: "Ocean",
    colors: { light: "#0ea5e9", dark: "#38bdf8" }, // Blue
  },
  forest: {
    name: "Forest",
    colors: { light: "#22c55e", dark: "#4ade80" }, // Green
  },
  sunset: {
    name: "Sunset",
    colors: { light: "#f97316", dark: "#fb923c" }, // Orange
  },
};
