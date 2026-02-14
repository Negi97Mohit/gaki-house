import React from "react";
import { Outlet } from "react-router-dom";
import { PlatformTopNav } from "./components/PlatformTopNav";
import { PlatformSidebar } from "./components/PlatformSidebar";

export const PlatformLayout: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <PlatformTopNav />
      <div className="flex flex-1 overflow-hidden">
        <PlatformSidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
