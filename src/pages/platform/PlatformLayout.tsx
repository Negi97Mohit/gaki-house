import React from "react";
import { Outlet } from "react-router-dom";
import { PlatformTopNav } from "./components/PlatformTopNav";
import { PlatformSidebar } from "./components/PlatformSidebar";
import { PlatformMobileNav } from "./components/PlatformMobileNav";
import { AuthModal } from "./components/AuthModal";
import { useThemeStore } from "@/features/theme";
import { cn } from "@/shared/lib/utils";

export const PlatformLayout: React.FC = () => {
  const platformLayout = useThemeStore((s) => s.platformLayout);
  const forceCollapsed = platformLayout === "theater" || platformLayout === "cinematic" || platformLayout === "feed";

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <PlatformTopNav />
      <div className="flex flex-1 overflow-hidden">
        <PlatformSidebar forceCollapsed={forceCollapsed} />
        <main className="flex-1 overflow-y-auto pb-14 md:pb-0">
          <Outlet />
        </main>
      </div>
      <PlatformMobileNav />
      <AuthModal />
    </div>
  );
};
