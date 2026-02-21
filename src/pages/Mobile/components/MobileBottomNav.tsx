import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Film, User, Plus, Video, Radio } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Drawer } from "vaul";

const TABS = [
    { icon: Home, label: "Home", path: "/m" },
    { icon: Compass, label: "Browse", path: "/m/browse" },
    { icon: null, label: "Live", path: "/" }, // center CTA
    { icon: Film, label: "Clips", path: "/m/clips" },
    { icon: User, label: "Profile", path: "/m/profile/me" },
];

export const MobileBottomNav: React.FC = () => {
    const location = useLocation();
    const [isActionDrawerOpen, setActionDrawerOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === "/m") return location.pathname === "/m";
        return location.pathname.startsWith(path);
    };

    const handleActionClick = (action: string) => {
        console.debug(`[MobileBottomNav] Central CTA action clicked: ${action}`);
        setActionDrawerOpen(false);
    };

    return (
        <>
            <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/10 safe-area-bottom">
                <div className="flex items-center justify-around h-14 max-w-lg mx-auto relative">
                    {TABS.map((tab, i) => {
                        // Center "Go Live" button
                        if (tab.icon === null) {
                            return (
                                <button
                                    key="center-cta"
                                    onClick={() => {
                                        console.debug("[MobileBottomNav] Central CTA opened");
                                        setActionDrawerOpen(true);
                                    }}
                                    className="flex items-center justify-center -mt-5"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform hover:shadow-primary/50">
                                        <Plus className={cn("w-6 h-6 text-primary-foreground transition-transform duration-300", isActionDrawerOpen && "rotate-45")} strokeWidth={2.5} />
                                    </div>
                                </button>
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

            <Drawer.Root open={isActionDrawerOpen} onOpenChange={setActionDrawerOpen}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />
                    <Drawer.Content className="bg-background flex flex-col rounded-t-[2.5rem] mt-24 fixed bottom-0 left-0 right-0 z-50 border border-border/20 mx-auto w-full max-w-lg">
                        <div className="p-4 bg-background rounded-t-[2.5rem] flex-1">
                            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
                            <div className="max-w-md mx-auto">
                                <Drawer.Title className="font-bold text-2xl text-center mb-2">Create Content</Drawer.Title>
                                <p className="text-muted-foreground text-center text-sm mb-8">What would you like to do?</p>

                                <div className="flex gap-4 p-4 mb-4">
                                    <Link
                                        to="/m/studio?mode=stream"
                                        onClick={() => handleActionClick("stream")}
                                        className="flex-1 group flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all active:scale-95"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Radio className="w-8 h-8 text-primary" strokeWidth={2} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-foreground">Multi-Stream</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Stream to everywhere</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/m/studio?mode=record"
                                        onClick={() => handleActionClick("record")}
                                        className="flex-1 group flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-secondary/50 border border-border hover:bg-secondary/80 transition-all active:scale-95"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <Video className="w-8 h-8 text-foreground" strokeWidth={2} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-foreground">Record</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Capture local video</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </>
    );
};
