import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, LogOut, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
}

const ProfileSheet = ({ open, onClose }: ProfileSheetProps) => {
  const { user, profile, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (!open || !user) return null;

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      onClose();
    } finally {
      setSigningOut(false);
    }
  };

  const displayName =
    profile?.display_name || profile?.username || user.displayName || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || user.photoURL;
  const email = user.email || "";

  // Drag-to-dismiss handler
  const handleDragEnd = (
    _: any,
    info: { offset: { y: number }; velocity: { y: number } }
  ) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-foreground/40" />
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 inset-x-0 glass-strong rounded-t-[2rem] shadow-elevated p-5 pb-8 safe-bottom"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div className="mx-auto h-1 w-10 rounded-full bg-foreground/20 mb-5 cursor-grab active:cursor-grabbing" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl">Profile</h2>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Avatar + info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-foreground/10 border border-foreground/15 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-7 w-7 text-foreground/50" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-base truncate">
                  {displayName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {email}
                </div>
                {profile?.bio && (
                  <div className="text-xs text-foreground/60 mt-1 line-clamp-2">
                    {profile.bio}
                  </div>
                )}
              </div>
            </div>

            {/* Account info card */}
            <div className="rounded-2xl bg-foreground/5 border border-foreground/10 p-4 mb-4">
              <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/50 mb-2">
                Account
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Username</span>
                  <span className="font-medium text-foreground">
                    {profile?.username || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/70">Member since</span>
                  <span className="font-medium text-foreground">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          undefined,
                          { month: "short", year: "numeric" }
                        )
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform disabled:opacity-60"
            >
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileSheet;
