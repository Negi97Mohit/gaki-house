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
  const hideSidebar = platformLayout === "theater";

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <PlatformTopNav />
      <div className="flex flex-1 overflow-hidden">
        {!hideSidebar && <PlatformSidebar />}
        <main className={cn("flex-1 overflow-y-auto pb-14 md:pb-0", hideSidebar && "max-w-full")}>
          <Outlet />
        </main>
      </div>
      <PlatformMobileNav />
      <AuthModal />
    </div>
  );
};
