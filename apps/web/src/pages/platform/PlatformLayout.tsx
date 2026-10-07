import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PlatformTopNav } from "./components/PlatformTopNav";
import { PlatformSidebar } from "./components/PlatformSidebar";
import { PlatformMobileNav } from "./components/PlatformMobileNav";
import { AuthModal } from "./components/AuthModal";
import { useThemeStore } from "@/features/theme";
import { PipProvider } from "./context/PipContext";
import { PipMiniPlayer } from "./components/PipMiniPlayer";

export const PlatformLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const platformLayout = useThemeStore((s) => s.platformLayout);
  
  // Default Netflix layout is full width edge-to-edge
  const isNetflix = platformLayout === "netflix" || platformLayout === "default" || platformLayout === "cinematic";

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 20);
  };

  return (
    <PipProvider>
      <div className="h-screen w-full flex flex-col bg-zinc-950 text-foreground overflow-hidden relative">
        {/* Floating Netflix Header */}
        <PlatformTopNav isScrolled={isScrolled} />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar only rendered when not in cinematic/netflix full-width mode */}
          {!isNetflix && (
            <PlatformSidebar forceCollapsed={false} />
          )}

          {/* Main scrollable viewport */}
          <main
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pb-14 md:pb-0 scrollbar-none"
          >
            <Outlet />
          </main>
        </div>

        <PlatformMobileNav />
        <AuthModal />
        <PipMiniPlayer />
      </div>
    </PipProvider>
  );
};
