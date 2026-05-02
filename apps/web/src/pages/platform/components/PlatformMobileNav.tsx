import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Heart, User } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

const ITEMS = [
  { icon: Home, label: "Home", path: "/platform" },
  { icon: Compass, label: "Browse", path: "/platform/browse" },
  { icon: Heart, label: "Following", path: "/platform/following" },
  { icon: User, label: "Profile", path: "/platform/profile/me" },
];

export const PlatformMobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/10 flex items-center justify-around px-2 py-2">
      {ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-200",
              active
                ? "text-primary bg-primary/8"
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
