import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { PlatformTopNav } from "./components/PlatformTopNav";
import { PlatformSidebar } from "./components/PlatformSidebar";
import { PlatformMobileNav } from "./components/PlatformMobileNav";
import { AuthModal } from "./components/AuthModal";
import { cn } from "@/shared/lib/utils";

export const PlatformLayout: React.FC = () => {
  const navigate = useNavigate();

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

      {/* Back Button in sidebar area */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className={cn(
          "fixed bottom-6 left-6 z-40 hidden md:flex",
          "h-10 px-4 rounded-xl gap-2",
          "bg-muted text-muted-foreground",
          "border border-border/40",
          "items-center justify-center",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring/50"
        )}
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </motion.button>
    </div>
  );
};
