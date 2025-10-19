import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "next-themes";
import { DebugProvider } from "./context/DebugContext";
import { LogProvider } from "./context/LogContext";
import { useEffect, useRef } from "react"; // 👈 ADD THIS IMPORT

const queryClient = new QueryClient();

const App = () => {
  // --- ⬇️ ADD THIS ENTIRE SECTION ⬇️ ---
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      document.body.classList.remove('cursor-inactive');
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        document.body.classList.add('cursor-inactive');
      }, 2000);
    };
    window.addEventListener('mousemove', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);
  // --- ⬆️ END OF SECTION TO ADD ⬆️ ---

  return (
    <QueryClientProvider client={queryClient}>
      <LogProvider>
        <DebugProvider>
          {/* WRAP with ThemeProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </DebugProvider>
      </LogProvider>
    </QueryClientProvider>
  );
};

export default App;