import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Clapperboard, User, Radio } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { icon: Home, label: "Home", path: "/m" },
  { icon: Search, label: "Search", path: "/m/browse" },
  { icon: null, label: "Live", path: "/m/studio" }, // center CTA
  { icon: Clapperboard, label: "Clips", path: "/m/clips" },
  { icon: User, label: "Profile", path: "/m/profile/me" },
];

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/m") return location.pathname === "/m";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 bg-background/70 border-t border-border/20 safe-area-bottom">
      <div className="flex items-center justify-around h-[58px] max-w-lg mx-auto relative px-1">
        {TABS.map((tab) => {
          // Center "Go Live" button — navigates directly to studio
          if (tab.icon === null) {
            return (
              <button
                key="center-cta"
                onClick={() => navigate("/m/studio")}
                className="flex items-center justify-center -mt-4 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/25 active:scale-95 transition-transform">
                  <Radio
                    className="w-6 h-6 text-primary-foreground"
                    strokeWidth={2.5}
                  />
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
                "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all active:scale-95",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-6 h-6 transition-all",
                    active && "scale-105",
                  )}
                  strokeWidth={active ? 2.4 : 1.9}
                />
                {active && (
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
