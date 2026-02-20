import React from "react";
import { Outlet } from "react-router-dom";
import { MobileTopBar } from "./components/MobileTopBar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { AuthModal } from "@/pages/platform/components/AuthModal";

export const MobileLayout: React.FC = () => {
    return (
        <div className="mobile-shell h-[100dvh] w-full flex flex-col bg-background text-foreground overflow-hidden">
            <MobileTopBar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[72px] scroll-smooth">
                <Outlet />
            </main>
            <MobileBottomNav />
            <AuthModal />
        </div>
    );
};
