import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Film, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const TABS = [
    { icon: Home, label: "Home", path: "/m" },
    { icon: Compass, label: "Browse", path: "/m/browse" },
    { icon: null, label: "Live", path: "/m/live" },
    { icon: Film, label: "Clips", path: "/m/clips" },
    { icon: User, label: "Profile", path: "/m/profile/me" },
];

export const MobileBottomNav: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === "/m") return location.pathname === "/m";
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/10 safe-area-bottom">
                <div className="flex items-center justify-around h-14 max-w-lg mx-auto relative">
                    {TABS.map((tab) => {
                        if (tab.icon === null) {
                            return (
                                <Link
                                    key="center-cta"
                                    to={tab.path}
                                    className="flex items-center justify-center -mt-5"
                                >
                                    <div className="relative w-14 h-14 rounded-full border border-white/70 bg-black/30 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.45)] active:scale-95 transition-transform">
                                        <div className="absolute inset-[5px] rounded-full border border-white/80" />
                                        <div className={cn(
                                            "absolute inset-[12px] rounded-full transition-colors",
                                            isActive(tab.path) ? "bg-[#ff2d55]" : "bg-white"
                                        )} />
                                    </div>
                                </Link>
                            );
                        }

                        const active = isActive(tab.path);
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.path}
                                to={tab.path}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all active:scale-90",
                                    active ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <div className="relative">
                                    <Icon className={cn("w-[22px] h-[22px] transition-all", active && "scale-110")} strokeWidth={active ? 2.5 : 1.8} />
                                    {active && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                    )}
                                </div>
                                <span className={cn("text-[10px] font-medium leading-none", active && "font-bold")}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
};
