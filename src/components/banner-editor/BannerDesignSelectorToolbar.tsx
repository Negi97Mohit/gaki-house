import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BannerDesign, isAnimatedBanner } from "@/types/banner";
import { SocialBannerDesign } from "@/types/socialBanner";
import { AnimatedBannerDesign } from "@/types/animatedBanner";

import socialBannersData from "@/data/socialBanners.json";
import animatedBannersData from "@/data/animatedBanners.json";

interface BannerDesignSelectorToolbarProps {
  currentDesignId: string;
  onSelectDesign: (design: BannerDesign) => void;
  onClose: () => void;
  position: { x: number; y: number };
  containerSize: { width: number; height: number };
}

export const BannerDesignSelectorToolbar: React.FC<BannerDesignSelectorToolbarProps> = ({
  currentDesignId,
  onSelectDesign,
  onClose,
  position,
  containerSize,
}) => {
  const [activeTab, setActiveTab] = useState<"static" | "animated">("static");
  
  const staticDesigns = socialBannersData.designs as SocialBannerDesign[];
  const animatedDesigns = animatedBannersData.designs as AnimatedBannerDesign[];

  const currentDesigns = activeTab === "static" ? staticDesigns : animatedDesigns;

  // Position the toolbar above the banner
  const toolbarStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "100%",
    marginBottom: "8px",
    zIndex: 9999,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={toolbarStyle}
      className="pointer-events-auto"
    >
      <div className="bg-background border border-accent flex flex-col w-[360px] max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-accent">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Change Design
          </span>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-accent">
          <button
            onClick={() => setActiveTab("static")}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors",
              activeTab === "static"
                ? "bg-accent text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            <Palette className="w-3 h-3" />
            Static
          </button>
          <button
            onClick={() => setActiveTab("animated")}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors",
              activeTab === "animated"
                ? "bg-accent text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Animated
          </button>
        </div>

        {/* Designs Grid */}
        <ScrollArea className="h-32">
          <div className="grid grid-cols-4 gap-1 p-2">
            {currentDesigns.map((design) => {
              const isSelected = design.id === currentDesignId;
              return (
                <button
                  key={design.id}
                  onClick={() => onSelectDesign(design)}
                  className={cn(
                    "aspect-[2/1] rounded-sm overflow-hidden border-2 transition-all hover:scale-105",
                    isSelected
                      ? "border-accent ring-1 ring-accent"
                      : "border-transparent hover:border-accent/50"
                  )}
                  title={design.name}
                >
                  <div
                    className="w-full h-full"
                    style={{ background: design.preview }}
                  />
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        {/* Selected Design Name */}
        <div className="px-3 py-1.5 border-t border-accent/30 text-center">
          <span className="text-[10px] text-muted-foreground font-mono">
            {currentDesigns.find(d => d.id === currentDesignId)?.name || "Select a design"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
