import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Heart, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const ITEMS = [
  { icon: Home, label: "Home", path: "/platform" },
  { icon: Compass, label: "Browse", path: "/platform/browse" },
  { icon: Heart, label: "Following", path: "/platform/following" },
  { icon: User, label: "Profile", path: "/platform/profile/me" },
];

export const PlatformMobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/30 flex items-center justify-around px-2 py-1.5">
      {ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
