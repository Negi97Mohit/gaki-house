import React from "react";
import { cn } from "@/shared/lib/utils";

interface MobileCategoryPillProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export const MobileCategoryPill: React.FC<MobileCategoryPillProps> = ({ label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95",
                active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
            )}
        >
            {label}
        </button>
    );
};
