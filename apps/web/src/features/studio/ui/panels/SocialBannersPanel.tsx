import React, { useState, useEffect, Suspense } from "react";
import {
  Edit3,
  Check,
  Sparkles,
  Layers,
  User,
} from "lucide-react";
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

  const { socialBanners: designs, animatedBanners: ANIMATED_BANNER_DESIGNS } = useSocialBanners();

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
    if (onAddAnimatedBanner) {
      onAddAnimatedBanner(design, userData);
    } else {
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
    <div className="space-y-3.5 w-full antialiased">
      {/* Profile Card */}
      <div className="rounded-2xl p-3.5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-sm flex items-center justify-between">
        {hasUserInfo ? (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[12px] font-semibold text-white truncate block">
                {userData.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {userData.links.slice(0, 4).map((link, i) => {
                  const Icon = getPlatformIcon(link.platform);
                  return <Icon key={i} className="w-3 h-3 text-zinc-400" />;
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-white">Creator Profile</span>
              <p className="text-[9px] text-zinc-400">Configure your streamer name & socials</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsEditorOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-primary/50 text-white transition-all duration-150 shrink-0 shadow-sm"
        >
          <Edit3 className="w-3 h-3 text-primary" />
          <span>{hasUserInfo ? "Edit Info" : "Setup Profile"}</span>
        </button>
      </div>

      {/* Tabs: Static vs Animated Banners with Underline */}
      <div className="flex items-center gap-1.5 pb-1">
        <button
          onClick={() => setActiveTab("static")}
          className={cn(
            "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-150 border",
            activeTab === "static"
              ? "border-primary bg-primary/10 text-white ring-1 ring-primary/40 shadow-sm font-semibold"
              : "border-white/10 text-zinc-300 hover:text-white bg-white/[0.02]"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Static Banners</span>
          {activeTab === "static" && (
            <span className="absolute -bottom-px left-3 right-3 h-[2px] bg-primary rounded-full shadow-[0_0_6px_var(--primary)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("animated")}
          className={cn(
            "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all duration-150 border",
            activeTab === "animated"
              ? "border-primary bg-primary/10 text-white ring-1 ring-primary/40 shadow-sm font-semibold"
              : "border-white/10 text-zinc-300 hover:text-white bg-white/[0.02]"
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Animated Lower Thirds</span>
          {activeTab === "animated" && (
            <span className="absolute -bottom-px left-3 right-3 h-[2px] bg-primary rounded-full shadow-[0_0_6px_var(--primary)]" />
          )}
        </button>
      </div>

      {/* Banners List */}
      {activeTab === "static" && (
        <div className="space-y-3">
          {designs.map((design) => (
            <button
              key={design.id}
              onClick={() => handleSelectDesign(design)}
              className={cn(
                "group relative w-full rounded-2xl overflow-hidden text-left transition-all duration-150 border",
                "bg-white/[0.03] border-white/10 hover:border-primary/60 shadow-sm",
                recentlyAdded === design.id && "border-green-500 ring-2 ring-green-500/50"
              )}
            >
              <div className="relative w-full h-24 bg-black/40 flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: design.preview }}
                >
                  <div
                    style={{
                      width: "600px",
                      transform: "scale(0.5)",
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

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1 rounded-full shadow-md">
                    Insert Banner
                  </div>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between border-t border-white/[0.06] bg-white/[0.01]">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">
                    {design.name}
                  </p>
                  <p className="text-[9px] text-zinc-400 truncate mt-0.5">
                    {design.description}
                  </p>
                </div>
                {recentlyAdded === design.id && (
                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 ml-2">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === "animated" && (
        <div className="space-y-3">
          {ANIMATED_BANNER_DESIGNS.map((design) => (
            <button
              key={design.id}
              onClick={() => handleSelectAnimatedBanner(design as AnimatedBannerDesign)}
              className={cn(
                "group relative w-full rounded-2xl overflow-hidden text-left transition-all duration-150 border",
                "bg-white/[0.03] border-white/10 hover:border-primary/60 shadow-sm",
                recentlyAdded === design.id && "border-green-500 ring-2 ring-green-500/50"
              )}
            >
              <div className="relative w-full h-24 overflow-hidden bg-black/50">
                <Suspense
                  fallback={<div className="absolute inset-0 bg-white/[0.05] animate-pulse" />}
                >
                  <AnimatedBannerRenderer
                    design={design as AnimatedBannerDesign}
                    containerSize={{ width: 360, height: 96 }}
                  />
                </Suspense>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1 rounded-full shadow-md">
                    Insert Animated
                  </div>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between border-t border-white/[0.06] bg-white/[0.01]">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary shrink-0" />
                    <p className="text-[11px] font-semibold text-white truncate">
                      {design.name}
                    </p>
                  </div>
                  <p className="text-[9px] text-zinc-400 truncate mt-0.5">
                    {design.description}
                  </p>
                </div>
                {recentlyAdded === design.id && (
                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 ml-2">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

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
