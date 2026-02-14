import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { DebugProvider } from "./context/DebugContext";
import { LogProvider } from "./context/LogContext";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import Loader from "@/shared/ui/Loader";
import { StyleSync } from "@/features/caption/ui/StyleSync";
import { useThemeStore } from "@/features/theme";
import { useUiStore } from "@/stores/ui.store";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));

const RemoteCamera = lazy(() => import("./pages/RemoteCamera"));
const SecondaryPage = lazy(() => import("./pages/SecondaryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Initialize theme from persisted store on app load
function ThemeInitializer() {
  const theme = useThemeStore((s) => s.theme);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-default", "theme-ocean", "theme-forest", "theme-sunset", "dark", "light");
    root.classList.add(`theme-${theme}`);
    if (mode === "dark") {
      root.classList.add("dark");
    }
  }, [theme, mode]);

  return null;
}

const App = () => {
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [isElectron, setIsElectron] = useState(false);

  // Detect Electron Environment
  useEffect(() => {
    const checkElectron = window.navigator.userAgent
      .toLowerCase()
      .includes("electron");
    setIsElectron(checkElectron);
  }, []);

  // Cursor inactivity logic
  useEffect(() => {
    const handleActivity = () => {
      document.body.classList.remove("cursor-inactive");
      useUiStore.getState().setMouseActive(true);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        document.body.classList.add("cursor-inactive");
        useUiStore.getState().setMouseActive(false);
      }, 5000);
    };
    window.addEventListener("mousemove", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  // Loader logic
  useEffect(() => {
    const handleWindowLoad = () => {
      setTimeout(() => {
        setShowLoader(false);
      }, 2000);
    };

    if (document.readyState === "complete") {
      handleWindowLoad();
    } else {
      window.addEventListener("load", handleWindowLoad);
      return () => window.removeEventListener("load", handleWindowLoad);
    }
  }, []);

  // Choose the correct Router based on environment
  // Electron needs HashRouter (file://), Web uses BrowserRouter (https://)
  const Router = isElectron ? HashRouter : BrowserRouter;

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <LogProvider>
          <DebugProvider>
            <StyleSync />
            <ThemeInitializer />
            <Loader visible={showLoader} />

            <TooltipProvider>
              <Toaster />
              <Sonner />
              {/* Router is now dynamic */}
              <Router>
                <Suspense fallback={<Loader visible={true} />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/secondary" element={<SecondaryPage />} />
                    <Route path="/remote-cam" element={<RemoteCamera />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </TooltipProvider>
          </DebugProvider>
        </LogProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
