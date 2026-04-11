import React from "react";
import { cn } from "@caption-cam/core/lib/utils";

export type BadgeType = "mod" | "vip" | "sub" | "verified" | "owner";

const BADGE_CONFIG: Record<BadgeType, { label: string; color: string; icon: string }> = {
  owner: { label: "Owner", color: "bg-destructive text-destructive-foreground", icon: "👑" },
  mod: { label: "Moderator", color: "bg-emerald-500/20 text-emerald-400", icon: "⚔️" },
  vip: { label: "VIP", color: "bg-pink-500/20 text-pink-400", icon: "💎" },
  sub: { label: "Subscriber", color: "bg-primary/20 text-primary", icon: "⭐" },
  verified: { label: "Verified", color: "bg-blue-500/20 text-blue-400", icon: "✓" },
};

interface ChatBadgeProps {
  type: BadgeType;
  className?: string;
}

export const ChatBadge: React.FC<ChatBadgeProps> = ({ type, className }) => {
  const config = BADGE_CONFIG[type];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold shrink-0",
        config.color,
        className
      )}
      title={config.label}
    >
      {config.icon}
    </span>
  );
};
