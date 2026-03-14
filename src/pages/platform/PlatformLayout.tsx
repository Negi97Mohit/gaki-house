import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PlatformTopNav } from "./components/PlatformTopNav";
import { PlatformSidebar } from "./components/PlatformSidebar";
import { PlatformMobileNav } from "./components/PlatformMobileNav";
import { AuthModal } from "./components/AuthModal";

export const PlatformLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.pathname === "/platform" || location.pathname === "/platform/") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      <PlatformTopNav />
      <div className="flex flex-1 overflow-hidden">
        <PlatformSidebar />
        <main className="flex-1 overflow-y-auto pb-14 md:pb-0">
          <Outlet />
        </main>
      </div>
      <PlatformMobileNav />
      <AuthModal />

      {/* Animated Back Button */}
      <button
        onClick={handleBack}
        type="button"
        className="fixed bottom-4 right-4 z-40 hidden md:flex bg-muted rounded-xl h-10 w-10 lg:w-36 items-center justify-center text-sm font-medium group border border-border/40 overflow-hidden"
        aria-label="Go back"
      >
        <div className="bg-primary rounded-lg h-8 w-8 lg:w-8 flex items-center justify-center absolute left-1 top-1 lg:group-hover:w-[calc(100%-8px)] duration-500 transition-all" />
        <div className="relative z-20 flex items-center gap-2 pointer-events-none">
          <ArrowLeft className="w-4 h-4 text-primary-foreground shrink-0" />
          <span className="hidden lg:inline text-foreground group-hover:text-primary-foreground transition-colors duration-300">Go Back</span>
        </div>
      </button>
    </div>
  );
};
