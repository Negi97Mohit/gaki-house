import React from "react";
import { cn } from "@/shared/lib/utils";

interface MobileCategoryPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const MobileCategoryPill: React.FC<MobileCategoryPillProps> = ({
  label,
  active,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all active:scale-95",
        active
          ? "bg-foreground text-background"
          : "bg-muted/50 text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
};
