import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ThemeName,
  type ThemeMode,
  type ThemeConfig,
  type PlatformLayout,
  type AppFont,
  PLATFORM_LAYOUTS,
  APP_FONTS,
  DEFAULT_THEME,
} from "./theme.types";
import { themes } from "./theme.presets";

export {
  type ThemeName,
  type ThemeMode,
  type ThemeConfig,
  type PlatformLayout,
  type AppFont,
  PLATFORM_LAYOUTS,
  APP_FONTS,
  DEFAULT_THEME,
  themes,
};

interface ThemeState {
  theme: ThemeName;
  mode: ThemeMode;
  fontFamily: AppFont;
  platformLayout: PlatformLayout;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setFontFamily: (font: AppFont) => void;
  setPlatformLayout: (layout: PlatformLayout) => void;
}

function applyFont(font: AppFont) {
  document.documentElement.style.setProperty("--font-app", font);
  document.documentElement.style.fontFamily = `"${font}", system-ui, sans-serif`;
}

function applyTheme(theme: ThemeName, mode: ThemeMode) {
  const root = document.documentElement;
  const themeClasses = Object.keys(themes).map((t) => `theme-${t}`);
  root.classList.remove(...themeClasses, "dark", "light");
  root.classList.add(`theme-${theme}`);
  if (mode === "dark") root.classList.add("dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      mode: "dark",
      fontFamily: "geist-sans",
      platformLayout: "default",
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
      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        applyFont(fontFamily);
      },
      setPlatformLayout: (platformLayout) => set({ platformLayout }),
    }),
    {
      name: "app-theme",
      version: 3,
      // old saved theme names (iceQueen etc.) no longer exist
      migrate: (persisted: any) => ({
        ...persisted,
        theme: persisted?.theme in themes ? persisted.theme : DEFAULT_THEME,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const theme = state.theme in themes ? state.theme : DEFAULT_THEME;
          applyTheme(theme, state.mode);
          if (state.fontFamily) applyFont(state.fontFamily);
        }
      },
    },
  ),
);
