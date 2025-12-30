import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { DebugProvider } from "./context/DebugContext";
import { LogProvider } from "./context/LogContext";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import Loader from "@/shared/ui/Loader";
import { StyleSync } from "@/features/caption/ui/StyleSync";
import { StreamControls } from "./components/StreamControls";

// Lazy Load Pages
const Index = lazy(() => import("./pages/Index"));
const EditPage = lazy(() => import("./pages/Edit"));
const RemoteCamera = lazy(() => import("./pages/RemoteCamera"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const [showLoader, setShowLoader] = useState(true); // ✅ Start visible

  // Cursor inactivity logic (your existing)
  useEffect(() => {
    const handleActivity = () => {
      document.body.classList.remove("cursor-inactive");
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        document.body.classList.add("cursor-inactive");
      }, 5000);
    };
    window.addEventListener("mousemove", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, []);

  // ✅ Loader logic (runs after everything fully loads)
  useEffect(() => {
    const handleWindowLoad = () => {
      // keep loader for 2.5s after load
      setTimeout(() => {
        setShowLoader(false);
      }, 2000);
    };

    // If window already loaded (for hot reloads)
    if (document.readyState === "complete") {
      handleWindowLoad();
    } else {
      window.addEventListener("load", handleWindowLoad);
      return () => window.removeEventListener("load", handleWindowLoad);
    }
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <LogProvider>
          <DebugProvider>
            <StyleSync />
            <ThemeProvider
              attribute="class"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              {/* ✅ Loader always visible at start (Global) */}
              <Loader visible={showLoader} />

              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Suspense fallback={<Loader visible={true} />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/edit/:sessionId" element={<EditPage />} />
                      <Route path="/remote-cam" element={<RemoteCamera />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </DebugProvider>
        </LogProvider>
      </QueryClientProvider>
      <StreamControls />
    </>
  );
};

export default App;
