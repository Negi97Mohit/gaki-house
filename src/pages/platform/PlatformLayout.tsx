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

      {/* Floating Back Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/30",
          "flex items-center justify-center",
          "hover:bg-primary/90 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
        aria-label="Go to main page"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>
    </div>
  );
};
