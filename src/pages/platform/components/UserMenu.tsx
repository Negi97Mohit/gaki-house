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
      <button
        onClick={() => openAuthModal("login")}
        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
      >
        Sign In
      </button>
    );
  }

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full hover:ring-2 hover:ring-primary/30 transition-all duration-200 overflow-hidden"
      >
        <DefaultAvatar avatarUrl={avatarUrl} name={displayName} uid={user.uid} size="sm" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-56 bg-card/95 backdrop-blur-xl border border-border/20 rounded-xl shadow-2xl shadow-black/10 z-[100] overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border/10">
            <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground/60 truncate">{user.email}</p>
          </div>

          <div className="py-1.5 px-1.5">
            <Link
              to={`/platform/profile/${profile?.username || "me"}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-all duration-150"
            >
              <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              My Channel
            </Link>
            <Link
              to="/platform/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-all duration-150"
            >
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              Creator Dashboard
            </Link>
            <Link
              to="/platform/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-all duration-150"
            >
              <Settings className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              Settings
            </Link>
          </div>

          <div className="border-t border-border/10 py-1.5 px-1.5">
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all duration-150"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.8} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
