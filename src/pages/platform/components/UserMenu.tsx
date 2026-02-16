import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DefaultAvatar } from "./DefaultAvatar";

export const UserMenu: React.FC = () => {
  const { user, profile, signOut, openAuthModal } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openAuthModal("login")}
          className="px-3 py-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          Log In
        </button>
        <button
          onClick={() => openAuthModal("signup")}
          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:opacity-90 transition-opacity"
        >
          Sign Up
        </button>
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden"
      >
        <DefaultAvatar avatarUrl={avatarUrl} name={displayName} uid={user.uid} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border/40 rounded-lg shadow-xl z-[100] overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border/20">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              to={`/platform/profile/${profile?.username || "me"}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4" />
              My Channel
            </Link>
            <Link
              to="/platform/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Creator Dashboard
            </Link>
            <Link
              to="/platform/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          <div className="border-t border-border/20 py-1">
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
