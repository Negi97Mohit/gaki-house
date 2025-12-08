import React, { useState, useEffect, Suspense } from "react";
import {
  BadgeCheck,
  Edit3,
  Plus,
  Check,
  Sparkles,
  Layers,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SocialBannerEditor } from "@/components/SocialBannerEditor";
import {
  SocialBannerRenderer,
  getPlatformIcon,
} from "@/components/SocialBannerRenderer";
import { AnimatedBannerRenderer } from "@/components/animated-banners";
import {
  SocialBannerData,
  SocialBannerDesign,
  DEFAULT_BANNER_DATA,
} from "@/types/socialBanner";

import animatedBannersData from "@/data/animatedBanners.json";

const ANIMATED_BANNER_DESIGNS = animatedBannersData.designs;

import { AnimatedBannerDesign } from "@/types/animatedBanner";
import socialBannersData from "@/data/socialBanners.json";

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

  const designs = socialBannersData.designs as SocialBannerDesign[];

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
    const compatibleDesign: SocialBannerDesign & {
      isAnimatedBanner?: boolean;
      animatedBannerId?: string;
    } = {
      id: design.id,
      name: design.name,
      description: design.description,
      preview: design.preview,
      layout: design.layout === "frame" ? "horizontal" : design.layout,
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
      isAnimatedBanner: true,
      animatedBannerId: design.id,
    };
    onAddBanner(compatibleDesign as SocialBannerDesign, userData);
    setRecentlyAdded(design.id);
    setTimeout(() => setRecentlyAdded(null), 1500);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header & User Info Combined */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold tracking-wide">
              Social Banners
            </h3>
          </div>
          {!hasUserInfo && (
            <Button
              size="sm"
              variant="default"
              onClick={() => setIsEditorOpen(true)}
              className="h-7 text-xs px-3"
            >
              Setup Profile
            </Button>
          )}
        </div>

        {/* Compact User Info Card */}
        {hasUserInfo && (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/50 group hover:border-primary/20 transition-colors">
            <div className="flex-1 min-w-0 mr-2">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="font-medium text-sm truncate">
                  {userData.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-hidden pl-7">
                {userData.links.slice(0, 6).map((link, i) => {
                  const Icon = getPlatformIcon(link.platform);
                  return (
                    <div
                      key={i}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={link.platform}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditorOpen(true)}
              className="h-7 w-7 text-muted-foreground hover:text-primary opacity-60 group-hover:opacity-100 transition-all"
              title="Edit Info"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Banner Type Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "static" | "animated")}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="w-full grid grid-cols-2 mb-3 shrink-0">
          <TabsTrigger value="static" className="gap-1.5 text-xs">
            <Layers className="w-3.5 h-3.5" />
            Static Designs
          </TabsTrigger>
          <TabsTrigger value="animated" className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Animated (Pro)
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 relative">
          <TabsContent value="static" className="absolute inset-0 mt-0">
            <ScrollArea className="h-full pr-3">
              <div className="grid grid-cols-1 gap-4 pb-4">
                {designs.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => handleSelectDesign(design)}
                    className={cn(
                      "relative group rounded-xl overflow-hidden transition-all duration-300 w-full text-left",
                      "border bg-card hover:shadow-lg hover:border-primary/50",
                      recentlyAdded === design.id
                        ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        : "border-border/40"
                    )}
                  >
                    {/* Banner Preview - Increased Height & Centered Scaling */}
                    <div className="relative w-full h-32 bg-secondary/20 flex items-center justify-center overflow-hidden">
                      {/* We create a container that's wider than the view to simulate a 'desktop' banner look, then scale it down */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: design.preview }}
                      >
                        <div
                          style={{
                            width: "600px",
                            transform: "scale(0.6)",
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
                                      { platform: "twitter", url: "#" },
                                      { platform: "instagram", url: "#" },
                                      { platform: "youtube", url: "#" },
                                    ],
                                  }
                            }
                          />
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-background/90 backdrop-blur text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          Click to Add
                        </div>
                      </div>
                    </div>

                    {/* Info Footer */}
                    <div className="px-3 py-2.5 flex items-center justify-between border-t border-border/10 bg-muted/20">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {design.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {design.description}
                        </p>
                      </div>
                      {recentlyAdded === design.id && (
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 ml-2 animate-in zoom-in">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="animated" className="absolute inset-0 mt-0">
            <ScrollArea className="h-full pr-3">
              <div className="grid grid-cols-1 gap-4 pb-4">
                {ANIMATED_BANNER_DESIGNS.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => handleSelectAnimatedBanner(design)}
                    className={cn(
                      "relative group rounded-xl overflow-hidden transition-all duration-300 w-full text-left",
                      "border bg-card hover:shadow-lg hover:border-primary/50",
                      recentlyAdded === design.id
                        ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        : "border-border/40"
                    )}
                  >
                    <div className="relative w-full h-36 overflow-hidden bg-black">
                      <Suspense
                        fallback={
                          <div className="absolute inset-0 bg-secondary/20 animate-pulse" />
                        }
                      >
                        <AnimatedBannerRenderer
                          design={design}
                          containerSize={{ width: 400, height: 144 }}
                        />
                      </Suspense>

                      {/* Tech Badges */}
                      <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[80%]">
                        {design.technologiesUsed.slice(0, 2).map((tech) => (
                          <span
                            key={tech}
                            className="px-1.5 py-0.5 text-[8px] font-medium rounded-md bg-black/60 text-white/90 backdrop-blur-sm border border-white/10"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-background/90 backdrop-blur text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          Click to Add
                        </div>
                      </div>
                    </div>

                    <div className="px-3 py-2.5 flex items-center justify-between border-t border-border/10 bg-muted/20">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                          <p className="text-sm font-medium text-foreground truncate">
                            {design.name}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {design.description}
                        </p>
                      </div>
                      {recentlyAdded === design.id && (
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 ml-2 animate-in zoom-in">
                          <Check className="w-3.5 h-3.5" />
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
