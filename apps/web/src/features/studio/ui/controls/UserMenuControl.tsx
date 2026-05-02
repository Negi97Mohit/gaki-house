// Single responsibility: user authentication popover — signed-in avatar menu or sign-in button.
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@gaki/ui/popover";
import { DefaultAvatar } from "@/pages/platform/components/DefaultAvatar";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";

interface UserMenuControlProps {
  isSignedIn?: boolean;
  userAvatarUrl?: string;
  userDisplayName?: string;
  userUid?: string;
  userUsername?: string;
  portalContainer?: HTMLElement | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const UserMenuControl: React.FC<UserMenuControlProps> = ({
  isSignedIn,
  userAvatarUrl,
  userDisplayName,
  userUid,
  userUsername,
  portalContainer,
  onOpenAuth,
  onSignOut,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    console.log("[UserMenuControl] mounted");
  }, []);

  if (isSignedIn) {
    return (
      <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
        <PopoverTrigger asChild>
          <button
            className="rounded-full hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden h-7 w-7 flex items-center justify-center outline-none"
            data-floating-trigger
          >
            <DefaultAvatar
              avatarUrl={userAvatarUrl}
              name={userDisplayName}
              uid={userUid}
              size="sm"
              className="w-7 h-7"
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={24}
          container={portalContainer || undefined}
          className="w-56 p-0 bg-card/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
          style={{ zIndex: 100 }}
        >
          <div className="px-4 py-3 border-b border-border/20">
            <p className="text-sm font-semibold text-foreground truncate">{userDisplayName || "User"}</p>
            {userUsername && <p className="text-xs text-muted-foreground truncate">@{userUsername}</p>}
          </div>

          <div className="py-1">
            <Link
              to={`/platform/profile/${userUsername || "me"}`}
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4" />
              My Channel
            </Link>
            <Link
              to="/platform"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Creator Dashboard
            </Link>
            <Link
              to="/platform/settings"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>

          <div className="border-t border-border/20 py-1">
            <button
              onClick={() => { onSignOut?.(); setIsUserMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <ShortcutTooltip label="Sign In / Sign Up">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 text-primary hover:text-primary transition-all duration-200"
        onClick={onOpenAuth}
        data-floating-trigger
      >
        <LogIn className="w-3.5 h-3.5" />
      </Button>
    </ShortcutTooltip>
  );
};
