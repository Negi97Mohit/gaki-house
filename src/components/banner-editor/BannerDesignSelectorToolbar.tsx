import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Sparkles, X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BannerDesign } from "@/types/banner";
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  const staticDesigns = socialBannersData.designs as SocialBannerDesign[];
  const animatedDesigns = animatedBannersData.designs as AnimatedBannerDesign[];

  const currentDesigns = activeTab === "static" ? staticDesigns : animatedDesigns;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Add listener with a small delay to avoid immediate closing
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Stop all events from bubbling to prevent HybridDraggable interference
  const stopEvents = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Handle design selection - don't close
  const handleSelectDesign = (design: BannerDesign, e: React.MouseEvent) => {
    stopEvents(e);
    onSelectDesign(design);
    // Don't call onClose - keep window open
  };

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
      ref={toolbarRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={toolbarStyle}
      className="pointer-events-auto banner-toolbar-btn"
      onClick={stopEvents}
      onPointerDown={stopEvents}
      onMouseDown={stopEvents}
    >
      <div className="bg-background border border-accent flex flex-col w-[360px] max-w-[90vw] shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-accent">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Change Design
          </span>
          <button
            onClick={(e) => {
              stopEvents(e);
              onClose();
            }}
            onPointerDown={stopEvents}
            onMouseDown={stopEvents}
            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-accent transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-accent">
          <button
            onClick={(e) => {
              stopEvents(e);
              setActiveTab("static");
            }}
            onPointerDown={stopEvents}
            onMouseDown={stopEvents}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
              activeTab === "static"
                ? "bg-accent text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
            )}
          >
            <Palette className="w-3 h-3" />
            Static
          </button>
          <button
            onClick={(e) => {
              stopEvents(e);
              setActiveTab("animated");
            }}
            onPointerDown={stopEvents}
            onMouseDown={stopEvents}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
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
        <ScrollArea className="h-36">
          <div className="grid grid-cols-4 gap-2 p-2">
            {currentDesigns.map((design) => {
              const isSelected = design.id === currentDesignId;
              // Get the preview gradient/color
              const previewBg = design.preview || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
              
              return (
                <button
                  key={design.id}
                  onClick={(e) => handleSelectDesign(design, e)}
                  onPointerDown={stopEvents}
                  onMouseDown={stopEvents}
                  className={cn(
                    "aspect-[2/1] rounded overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer relative group",
                    isSelected
                      ? "border-accent ring-2 ring-accent ring-offset-1 ring-offset-background"
                      : "border-border/50 hover:border-accent/50"
                  )}
                  title={design.name}
                >
                  {/* Preview background */}
                  <div
                    className="absolute inset-0"
                    style={{ 
                      background: previewBg,
                      backgroundSize: "cover"
                    }}
                  />
                  {/* Hover overlay with name */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[8px] text-white font-medium text-center px-1 leading-tight">
                      {design.name}
                    </span>
                  </div>
                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                      <span className="text-background text-[8px]">✓</span>
                    </div>
                  )}
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
