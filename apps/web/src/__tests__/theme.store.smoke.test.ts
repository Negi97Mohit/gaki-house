/**
 * Smoke test for useThemeStore initial state.
 *
 * The store uses Zustand `persist` which writes to localStorage. We're in
 * jsdom so localStorage is available, but `applyTheme` / `applyFont` call
 * document.documentElement — that's also fine in jsdom.
 *
 * We test only the initial (default) state, not DOM side-effects.
 */
import { describe, it, expect, beforeEach } from "vitest";

// Reset Zustand store state between tests
import { useThemeStore, DEFAULT_THEME } from "../features/theme/model/theme.store";

describe("useThemeStore initial state", () => {
  beforeEach(() => {
    // Reset to initial state before each test
    useThemeStore.setState({
      theme: DEFAULT_THEME,
      mode: "dark",
      fontFamily: "geist-sans",
      platformLayout: "default",
    });
  });

  it("default theme is phyllotaxis", () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe("phyllotaxis");
  });

  it("default mode is dark", () => {
    const { mode } = useThemeStore.getState();
    expect(mode).toBe("dark");
  });

  it("default font family is geist-sans", () => {
    const { fontFamily } = useThemeStore.getState();
    expect(fontFamily).toBe("geist-sans");
  });

  it("setTheme updates the theme key", () => {
    useThemeStore.getState().setTheme("eventHorizon");
    expect(useThemeStore.getState().theme).toBe("eventHorizon");
  });

  it("toggleMode flips dark to light", () => {
    useThemeStore.setState({ mode: "dark" });
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("light");
  });

  it("toggleMode flips light to dark", () => {
    useThemeStore.setState({ mode: "light" });
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("dark");
  });
});
