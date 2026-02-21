import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { DebugProvider } from "./context/DebugContext";
import { LogProvider } from "./context/LogContext";
import { AuthProvider } from "./pages/platform/context/AuthContext";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import Loader from "@/shared/ui/Loader";
import { StyleSync } from "@/features/caption/ui/StyleSync";
import { useThemeStore } from "@/features/theme";
import { useUiStore } from "@/stores/ui.store";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));

const RemoteCamera = lazy(() => import("./pages/RemoteCamera"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Platform pages
const PlatformLayout = lazy(() => import("./pages/platform/PlatformLayout").then(m => ({ default: m.PlatformLayout })));
const PlatformHome = lazy(() => import("./pages/platform/pages/HomePage").then(m => ({ default: m.HomePage })));
const PlatformBrowse = lazy(() => import("./pages/platform/pages/BrowsePage").then(m => ({ default: m.BrowsePage })));
const PlatformStream = lazy(() => import("./pages/platform/pages/StreamPage").then(m => ({ default: m.StreamPage })));
const PlatformProfile = lazy(() => import("./pages/platform/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const PlatformFollowing = lazy(() => import("./pages/platform/pages/FollowingPage").then(m => ({ default: m.FollowingPage })));
const PlatformSearch = lazy(() => import("./pages/platform/pages/SearchPage").then(m => ({ default: m.SearchPage })));
const PlatformSettings = lazy(() => import("./pages/platform/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const PlatformClips = lazy(() => import("./pages/platform/pages/ClipsPage").then(m => ({ default: m.ClipsPage })));

// Mobile pages
const MobileLayout = lazy(() => import("./pages/Mobile/MobileLayout").then(m => ({ default: m.MobileLayout })));
const MobileHome = lazy(() => import("./pages/Mobile/pages/MobileHomePage").then(m => ({ default: m.MobileHomePage })));
const MobileBrowse = lazy(() => import("./pages/Mobile/pages/MobileBrowsePage").then(m => ({ default: m.MobileBrowsePage })));
const MobileStream = lazy(() => import("./pages/Mobile/pages/MobileStreamPage").then(m => ({ default: m.MobileStreamPage })));
const MobileClips = lazy(() => import("./pages/Mobile/pages/MobileClipsPage").then(m => ({ default: m.MobileClipsPage })));
const MobileProfile = lazy(() => import("./pages/Mobile/pages/MobileProfilePage").then(m => ({ default: m.MobileProfilePage })));
const MobileSearch = lazy(() => import("./pages/Mobile/pages/MobileSearchPage").then(m => ({ default: m.MobileSearchPage })));
const MobileSettings = lazy(() => import("./pages/Mobile/pages/MobileSettingsPage").then(m => ({ default: m.MobileSettingsPage })));
const MobileStudio = lazy(() => import("./pages/Mobile/pages/MobileStudioPage").then(m => ({ default: m.MobileStudioPage })));
const MobileFollowing = lazy(() => import("./pages/Mobile/pages/MobileFollowingPage").then(m => ({ default: m.MobileFollowingPage })));

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
                <AuthProvider>
                  <Suspense fallback={<Loader visible={true} />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/platform" element={<PlatformLayout />}>
                        <Route index element={<PlatformHome />} />
                        <Route path="browse" element={<PlatformBrowse />} />
                        <Route path="browse/:category" element={<PlatformBrowse />} />
                        <Route path="stream/:username" element={<PlatformStream />} />
                        <Route path="profile/:username" element={<PlatformProfile />} />
                        <Route path="following" element={<PlatformFollowing />} />
                        <Route path="search" element={<PlatformSearch />} />
                        <Route path="settings" element={<PlatformSettings />} />
                        <Route path="clips" element={<PlatformClips />} />
                      </Route>
                      {/* Mobile routes */}
                      <Route path="/m" element={<MobileLayout />}>
                        <Route index element={<MobileHome />} />
                        <Route path="browse" element={<MobileBrowse />} />
                        <Route path="browse/:category" element={<MobileBrowse />} />
                        <Route path="stream/:username" element={<MobileStream />} />
                        <Route path="studio" element={<MobileStudio />} />
                        <Route path="following" element={<MobileFollowing />} />
                        <Route path="clips" element={<MobileClips />} />
                        <Route path="profile/:username" element={<MobileProfile />} />
                        <Route path="search" element={<MobileSearch />} />
                        <Route path="settings" element={<MobileSettings />} />
                      </Route>
                      <Route path="/remote-cam" element={<RemoteCamera />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AuthProvider>
              </Router>
            </TooltipProvider>
          </DebugProvider>
        </LogProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
