import React from "react";
import { cn } from "@caption-cam/core/lib/utils";

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
        "px-4 py-2.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 min-h-[44px]",
        active
          ? "bg-foreground text-background shadow-sm"
          : "bg-muted/50 text-muted-foreground hover:bg-muted",
      )}
      role="tab"
      aria-selected={active}
      aria-label={`Category: ${label}`}
    >
      {label}
    </button>
  );
};
