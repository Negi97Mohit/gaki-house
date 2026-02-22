import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Film, User, Radio } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { icon: Home, label: "Home", path: "/m" },
  { icon: Compass, label: "Browse", path: "/m/browse" },
  { icon: null, label: "Live", path: "/m/studio" }, // center CTA
  { icon: Film, label: "Clips", path: "/m/clips" },
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
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/10 safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto relative">
        {TABS.map((tab) => {
          // Center "Go Live" button — navigates directly to studio
          if (tab.icon === null) {
            return (
              <button
                key="center-cta"
                onClick={() => navigate("/m/studio")}
                className="flex items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform hover:shadow-primary/50">
                  <Radio className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
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
  );
};
