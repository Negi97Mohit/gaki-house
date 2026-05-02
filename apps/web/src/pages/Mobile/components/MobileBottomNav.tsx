import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Clapperboard, User, Radio } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

const TABS = [
  { icon: Home, label: "Home", path: "/m" },
  { icon: Search, label: "Explore", path: "/m/browse" },
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
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 mobile-glass border-t border-border/10 mobile-safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-[64px] max-w-lg mx-auto relative px-1">
        {TABS.map((tab) => {
          // Center "Go Live" button — navigates directly to studio
          if (tab.icon === null) {
            return (
              <button
                key="center-cta"
                onClick={() => navigate("/m/studio")}
                className="flex flex-col items-center justify-center -mt-5 cursor-pointer min-w-[48px]"
                aria-label="Go Live — Open Studio"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-all relative overflow-hidden">
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-live-pulse" aria-hidden="true" />
                  <Radio
                    className="w-6 h-6 text-primary-foreground relative z-10"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-[10px] font-bold text-primary mt-1">Live</span>
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
                "flex flex-col items-center justify-center min-w-[48px] min-h-[48px] rounded-xl transition-all active:scale-90",
                active ? "text-primary" : "text-muted-foreground",
              )}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-all",
                    active && "scale-110",
                  )}
                  strokeWidth={active ? 2.4 : 1.8}
                  aria-hidden="true"
                />
                {active && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" aria-hidden="true" />
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-0.5 font-medium transition-all",
                active ? "font-bold text-primary" : "text-muted-foreground/80"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
