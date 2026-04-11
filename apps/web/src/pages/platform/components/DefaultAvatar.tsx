import React from "react";
import { User } from "lucide-react";
import { cn } from "@caption-cam/core/lib/utils";

// 10 default profile avatars using DiceBear Avatars API
// Each uses a different style + seed for variety
export const DEFAULT_AVATARS = [
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna&backgroundColor=ffd5dc",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Max&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Coco&backgroundColor=d1f4d1",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Zara&backgroundColor=ffe4b5",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Robo1&backgroundColor=b6e3f4",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Robo2&backgroundColor=c0aede",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Happy&backgroundColor=ffd5dc",
  "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Cool&backgroundColor=d1f4d1",
  "https://api.dicebear.com/9.x/lorelei/svg?seed=Star&backgroundColor=ffe4b5",
];

/** Pick a deterministic default avatar based on a string (name/uid) */
export function getDefaultAvatar(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_AVATARS[Math.abs(hash) % DEFAULT_AVATARS.length];
}

interface DefaultAvatarProps {
  /** If avatar_url is provided and non-empty, render it. Otherwise use default. */
  avatarUrl?: string;
  name?: string;
  uid?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-20 h-20",
};

export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ avatarUrl, name, uid, size = "md", className }) => {
  // If the user has a custom avatar, show it
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Avatar"}
        className={cn("rounded-full object-cover bg-muted", sizeClasses[size], className)}
      />
    );
  }

  // Otherwise, pick one of the 10 defaults based on uid or name
  const seed = uid || name || "default";
  const defaultUrl = getDefaultAvatar(seed);

  return (
    <img
      src={defaultUrl}
      alt={name || "Avatar"}
      className={cn("rounded-full object-cover bg-muted", sizeClasses[size], className)}
    />
  );
};
