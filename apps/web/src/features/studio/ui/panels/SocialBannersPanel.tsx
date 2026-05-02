import React, { useState, useEffect, Suspense } from "react";
import {
  Edit3,
  Check,
  Sparkles,
  Layers,
  User,
} from "lucide-react";
import { Button } from "@gaki/ui/button";
import { ScrollArea } from "@gaki/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gaki/ui/tabs";
import { cn } from "@gaki/core/lib/utils";
import { SocialBannerEditor } from "@/features/banners/ui/SocialBannerEditor";
import {
  SocialBannerRenderer,
  getPlatformIcon,
} from "@/features/banners/ui/SocialBannerRenderer";
import { AnimatedBannerRenderer } from "@/features/banners/ui/animated-banners";
import {
  SocialBannerData,
  SocialBannerDesign,
  DEFAULT_BANNER_DATA,
} from "@gaki/core/types/socialBanner";
import { AnimatedBannerDesign } from "@gaki/core/types/animatedBanner";

import { useSocialBanners } from "@/features/banners/hooks/useSocialBanners";

type BannerDesign = SocialBannerDesign | AnimatedBannerDesign;

const LOCAL_STORAGE_KEY = "social-banner-user-data";

interface SocialBannersPanelProps {
  onAddBanner: (design: SocialBannerDesign, data: SocialBannerData) => void;
  onAddAnimatedBanner?: (
    design: AnimatedBannerDesign,
    data: SocialBannerData
  ) => void;
}

export const SocialBannersPanel: React.FC<SocialBannersPanelProps> = ({
  onAddBanner,
  onAddAnimatedBanner,
}) => {
  const [userData, setUserData] =
    useState<SocialBannerData>(DEFAULT_BANNER_DATA);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"static" | "animated">("static");

  const { socialBanners: designs, animatedBanners: ANIMATED_BANNER_DESIGNS, loading } = useSocialBanners();

  // Load user data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setUserData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved banner data:", e);
      }
    }
  }, []);

  const handleSaveUserData = (data: SocialBannerData) => {
    setUserData(data);
  };

  const handleSelectDesign = (design: SocialBannerDesign) => {
    // Check if user has set up their info
    if (
      userData.name === DEFAULT_BANNER_DATA.name &&
      userData.links.length === 0
    ) {
      setIsEditorOpen(true);
      setSelectedDesignId(design.id);
      return;
    }

    onAddBanner(design, userData);
    setRecentlyAdded(design.id);
    setTimeout(() => setRecentlyAdded(null), 1500);
  };

  // If user just saved their data and had a design selected, add it
  useEffect(() => {
    if (selectedDesignId && userData.name !== DEFAULT_BANNER_DATA.name) {
      const design = designs.find((d) => d.id === selectedDesignId);
      if (design) {
        onAddBanner(design, userData);
        setRecentlyAdded(design.id);
        setTimeout(() => setRecentlyAdded(null), 1500);
      }
      setSelectedDesignId(null);
    }
  }, [userData, selectedDesignId, designs, onAddBanner]);

  const hasUserInfo =
    userData.name !== DEFAULT_BANNER_DATA.name || userData.links.length > 0;

  const handleSelectAnimatedBanner = (design: AnimatedBannerDesign) => {
    // Use the dedicated animated banner handler if available
    if (onAddAnimatedBanner) {
      onAddAnimatedBanner(design, userData);
    } else {
      // Fallback: create a static-compatible design for legacy support
      const layoutMap: Record<string, "horizontal" | "vertical" | "compact" | "card"> = {
        frame: "horizontal",
        horizontal: "horizontal",
        vertical: "vertical",
        compact: "compact",
        card: "card",
      };
      const compatibleDesign: SocialBannerDesign = {
        id: design.id,
        name: design.name,
        description: design.description,
        preview: design.preview,
        layout: layoutMap[design.layout] || "horizontal",
        theme: "gradient",
        styles: {
          container: { background: design.preview },
          name: { color: "#ffffff", fontWeight: "bold" },
          tagline: { color: "rgba(255,255,255,0.8)" },
          linksContainer: { display: "flex", gap: "8px" },
          link: { color: design.particleSettings?.color || "#a855f7" },
          icon: { width: "20px", height: "20px" },
        },
        showAvatar: design.showAvatar,
        showTagline: design.showTagline,
        maxLinks: design.maxLinks,
      };
      onAddBanner(compatibleDesign, userData);
    }
    setRecentlyAdded(design.id);
    setTimeout(() => setRecentlyAdded(null), 1500);
  };

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Compact User Info */}
      {hasUserInfo ? (
        <div className="flex items-center justify-between p-2 border-b border-border/10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <span className="text-[10px] font-medium truncate">{userData.name}</span>
            <div className="flex gap-1">
              {userData.links.slice(0, 4).map((link, i) => {
                const Icon = getPlatformIcon(link.platform);
                return <Icon key={i} className="w-2.5 h-2.5 text-muted-foreground" />;
              })}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditorOpen(true)}
            className="h-5 w-5 text-muted-foreground/50 hover:text-foreground"
          >
            <Edit3 className="w-2.5 h-2.5" />
          </Button>
        </div>
      ) : (
        <div className="p-2 border-b border-border/10">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditorOpen(true)}
            className="w-full h-7 text-[9px]"
          >
            Setup Profile
          </Button>
        </div>
      )}

      {/* Banner Type Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "static" | "animated")}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex gap-1 p-2 border-b border-border/10">
          <button
            onClick={() => setActiveTab("static")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all",
              activeTab === "static"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <Layers className="w-3 h-3" />
            Static
          </button>
          <button
            onClick={() => setActiveTab("animated")}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all",
              activeTab === "animated"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
            )}
          >
            <Sparkles className="w-3 h-3" />
            Animated
          </button>
        </div>

        <div className="flex-1 min-h-0 relative">
          <TabsContent value="static" className="absolute inset-0 mt-0">
            <ScrollArea className="h-full pr-2 sharp-scrollbar">
              <div className="grid grid-cols-1 gap-2 pb-4">
                {designs.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => handleSelectDesign(design)}
                    className={cn(
                      "relative group overflow-hidden transition-all duration-150 w-full text-left",
                      "border bg-card hover:border-primary",
                      recentlyAdded === design.id
                        ? "border-green-500"
                        : "border-border"
                    )}
                  >
                    {/* Banner Preview */}
                    <div className="relative w-full h-28 bg-secondary/20 flex items-center justify-center overflow-hidden">
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: design.preview }}
                      >
                        <div
                          style={{
                            width: "600px",
                            transform: "scale(0.55)",
                            transformOrigin: "center",
                          }}
                        >
                          <SocialBannerRenderer
                            design={design}
                            data={
                              hasUserInfo
                                ? userData
                                : {
                                  name: "Preview Name",
                                  tagline: "Your Tagline Here",
                                  links: [
                                    { platform: "x", url: "#" },
                                    { platform: "instagram", url: "#" },
                                    { platform: "youtube", url: "#" },
                                  ],
                                }
                            }
                          />
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground text-[10px] font-mono font-medium px-3 py-1.5 tracking-wide">
                          CLICK TO ADD
                        </div>
                      </div>
                    </div>

                    {/* Info Footer */}
                    <div className="px-3 py-2 flex items-center justify-between border-t border-border bg-card">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-foreground truncate tracking-wide">
                          {design.name.toUpperCase()}
                        </p>
                        <p className="text-[9px] text-muted-foreground truncate">
                          {design.description}
                        </p>
                      </div>
                      {recentlyAdded === design.id && (
                        <div className="w-5 h-5 bg-green-500 text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="animated" className="absolute inset-0 mt-0">
            <ScrollArea className="h-full pr-2 sharp-scrollbar">
              <div className="grid grid-cols-1 gap-2 pb-4">
                {ANIMATED_BANNER_DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => handleSelectAnimatedBanner(design as AnimatedBannerDesign)}
                    className={cn(
                      "relative group overflow-hidden transition-all duration-150 w-full text-left",
                      "border bg-card hover:border-primary",
                      recentlyAdded === design.id
                        ? "border-green-500"
                        : "border-border"
                    )}
                  >
                    <div className="relative w-full h-32 overflow-hidden bg-black">
                      <Suspense
                        fallback={
                          <div className="absolute inset-0 bg-secondary/20 animate-pulse" />
                        }
                      >
                        <AnimatedBannerRenderer
                          design={design as AnimatedBannerDesign}
                          containerSize={{ width: 400, height: 128 }}
                        />
                      </Suspense>

                      {/* Tech Badges */}
                      <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[80%]">
                        {(design as AnimatedBannerDesign).technologiesUsed?.slice(0, 2).map((tech) => (
                          <span
                            key={tech}
                            className="px-1.5 py-0.5 text-[8px] font-mono font-medium bg-background/80 text-foreground border border-border"
                          >
                            {tech.toUpperCase()}
                          </span>
                        ))}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground text-[10px] font-mono font-medium px-3 py-1.5 tracking-wide">
                          CLICK TO ADD
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-2 flex items-center justify-between border-t border-border bg-card">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-primary shrink-0" />
                          <p className="text-[10px] font-medium text-foreground truncate tracking-wide">
                            {design.name.toUpperCase()}
                          </p>
                        </div>
                        <p className="text-[9px] text-muted-foreground truncate">
                          {design.description}
                        </p>
                      </div>
                      {recentlyAdded === design.id && (
                        <div className="w-5 h-5 bg-green-500 text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Editor Modal */}
      <SocialBannerEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          if (selectedDesignId) {
            const design = designs.find((d) => d.id === selectedDesignId);
            if (design) {
              onAddBanner(design, userData);
              setRecentlyAdded(design.id);
              setTimeout(() => setRecentlyAdded(null), 1500);
            }
            setSelectedDesignId(null);
          }
        }}
        onSave={handleSaveUserData}
        initialData={userData}
      />
    </div>
  );
};
