import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MobileTopBar } from "./components/MobileTopBar";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { AuthModal } from "@/pages/platform/components/AuthModal";

export const MobileLayout: React.FC = () => {
    const location = useLocation();
    const isStudioPage = location.pathname === "/m/studio";

    return (
        <div
            className="mobile-shell h-[100dvh] w-full flex flex-col bg-background text-foreground overflow-hidden"
            style={{ overscrollBehavior: 'none' }}
            role="application"
            aria-label="GAKI Mobile Studio"
        >
            {!isStudioPage && <MobileTopBar />}
            <main
                className={`flex-1 overflow-x-hidden scroll-smooth ${isStudioPage
                        ? 'pb-0 overflow-hidden'
                        : 'overflow-y-auto pb-[calc(68px+env(safe-area-inset-bottom,0px))]'
                    }`}
                role="main"
                aria-label="Main content"
            >
                <Outlet />
            </main>
            {!isStudioPage && <MobileBottomNav />}
            <AuthModal />
        </div>
    );
};
