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
        className="fixed bottom-6 right-6 z-40 hidden md:block bg-muted text-muted-foreground w-48 rounded-2xl h-14 relative text-sm font-semibold group border border-border/40"
        aria-label="Go back"
      >
        <div className="bg-primary rounded-xl h-12 w-1/4 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[184px] z-10 duration-500 transition-all">
          <ArrowLeft className="w-5 h-5 text-primary-foreground" />
        </div>
        <p className="translate-x-2 text-foreground">Go Back</p>
      </button>
    </div>
  );
};
