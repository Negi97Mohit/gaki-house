import React from "react";
import { User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const AVATAR_COLORS = [
  "bg-primary/80",
  "bg-destructive/70",
  "bg-blue-500/80",
  "bg-emerald-500/80",
  "bg-purple-500/80",
  "bg-orange-500/80",
  "bg-pink-500/80",
  "bg-teal-500/80",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface DefaultAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-xl",
};

export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ name, size = "md", className }) => {
  if (!name) {
    return (
      <div className={cn("rounded-full bg-muted flex items-center justify-center", sizeClasses[size], className)}>
        <User className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  const colorClass = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold text-white select-none", colorClass, sizeClasses[size], className)}>
      {initials}
    </div>
  );
};
