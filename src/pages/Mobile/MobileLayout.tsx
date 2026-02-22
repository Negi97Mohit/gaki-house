import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MobileTopBar } from "./components/MobileTopBar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { AuthModal } from "@/pages/platform/components/AuthModal";

export const MobileLayout: React.FC = () => {
    const location = useLocation();
    const isStudioPage = location.pathname === "/m/studio";

    return (
        <div className="mobile-shell h-[100dvh] w-full flex flex-col bg-background text-foreground overflow-hidden">
            {!isStudioPage && <MobileTopBar />}
            <main className={`flex-1 overflow-x-hidden scroll-smooth ${isStudioPage ? 'pb-0' : 'overflow-y-auto pb-[72px]'}`}>
                <Outlet />
            </main>
            {!isStudioPage && <MobileBottomNav />}
            <AuthModal />
        </div>
    );
};
