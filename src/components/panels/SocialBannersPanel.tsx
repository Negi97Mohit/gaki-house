// src/components/panels/SocialBannersPanel.tsx
import React, { useState, useEffect, Suspense } from "react";
import { BadgeCheck, Edit3, Plus, Check, Sparkles, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SocialBannerEditor } from "@/components/SocialBannerEditor";
import { SocialBannerRenderer } from "@/components/SocialBannerRenderer";
import { AnimatedBannerRenderer } from "@/components/animated-banners";
import {
    SocialBannerData,
    SocialBannerDesign,
    DEFAULT_BANNER_DATA,
} from "@/types/socialBanner";
import { ANIMATED_BANNER_DESIGNS, AnimatedBannerDesign } from "@/types/animatedBanner";
import socialBannersData from "@/data/socialBanners.json";

const LOCAL_STORAGE_KEY = "social-banner-user-data";

interface SocialBannersPanelProps {
    onAddBanner: (design: SocialBannerDesign, data: SocialBannerData) => void;
    onAddAnimatedBanner?: (design: AnimatedBannerDesign, data: SocialBannerData) => void;
}

export const SocialBannersPanel: React.FC<SocialBannersPanelProps> = ({
    onAddBanner,
    onAddAnimatedBanner,
}) => {
    const [userData, setUserData] = useState<SocialBannerData>(DEFAULT_BANNER_DATA);
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
        if (userData.name === DEFAULT_BANNER_DATA.name && userData.links.length === 0) {
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
        // For animated banners, create a design that will be recognized as animated
        const compatibleDesign: SocialBannerDesign & { isAnimatedBanner?: boolean; animatedBannerId?: string } = {
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
            // Mark as animated banner for special rendering
            isAnimatedBanner: true,
            animatedBannerId: design.id,
        };
        onAddBanner(compatibleDesign as SocialBannerDesign, userData);
        setRecentlyAdded(design.id);
        setTimeout(() => setRecentlyAdded(null), 1500);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                    <h3 className="text-base font-semibold tracking-wide">
                        Social Banners
                    </h3>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditorOpen(true)}
                    className="text-xs gap-1.5"
                >
                    <Edit3 className="w-3.5 h-3.5" />
                    {hasUserInfo ? "Edit Info" : "Add Your Info"}
                </Button>
            </div>

            {/* User Info Summary */}
            {hasUserInfo && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-primary">{userData.name}</span>
                        {userData.tagline && (
                            <span className="text-muted-foreground text-xs">
                                • {userData.tagline}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                        {userData.links.slice(0, 5).map((link, i) => (
                            <span
                                key={i}
                                className="px-2 py-0.5 text-[10px] rounded-full bg-background/50 text-muted-foreground capitalize"
                            >
                                {link.platform}
                            </span>
                        ))}
                        {userData.links.length > 5 && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-background/50 text-muted-foreground">
                                +{userData.links.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Banner Type Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "static" | "animated")}>
                <TabsList className="w-full grid grid-cols-2 mb-3">
                    <TabsTrigger value="static" className="gap-1.5 text-xs">
                        <Layers className="w-3.5 h-3.5" />
                        Static
                    </TabsTrigger>
                    <TabsTrigger value="animated" className="gap-1.5 text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        Animated
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="static" className="mt-0">
                    <p className="text-xs text-muted-foreground/70 mb-3">
                        Click any design to add it to your canvas
                    </p>
                    <ScrollArea className="h-[calc(70vh-300px)]">
                        <div className="grid grid-cols-1 gap-3 pr-2">
                            {designs.map((design) => (
                                <button
                                    key={design.id}
                                    onClick={() => handleSelectDesign(design)}
                                    className={cn(
                                        "relative group rounded-xl overflow-hidden transition-all duration-300",
                                        "border hover:shadow-xl hover:scale-[1.02]",
                                        recentlyAdded === design.id
                                            ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] ring-2 ring-green-500/30"
                                            : "border-border/40 hover:border-primary/60"
                                    )}
                                >
                                    {/* Banner Preview - Full width, proper aspect ratio */}
                                    <div
                                        className="relative w-full aspect-[4/1] flex items-center justify-center overflow-hidden"
                                        style={{ background: design.preview }}
                                    >
                                        <div className="w-full px-4">
                                            <SocialBannerRenderer
                                                design={design}
                                                data={hasUserInfo ? userData : {
                                                    name: "Your Name",
                                                    tagline: "Creator • Streamer",
                                                    links: [
                                                        { platform: "github", url: "#" },
                                                        { platform: "x", url: "#" },
                                                        { platform: "youtube", url: "#" },
                                                    ],
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Info Footer - Compact */}
                                    <div className="px-3 py-2 bg-background/95 backdrop-blur-sm border-t border-border/20 flex items-center justify-between">
                                        <div className="text-left min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {design.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {design.description}
                                            </p>
                                        </div>
                                        <div
                                            className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-2",
                                                recentlyAdded === design.id
                                                    ? "bg-green-500 text-white"
                                                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                            )}
                                        >
                                            {recentlyAdded === design.id ? (
                                                <Check className="w-3.5 h-3.5" />
                                            ) : (
                                                <Plus className="w-3.5 h-3.5" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="animated" className="mt-0">
                    <p className="text-xs text-muted-foreground/70 mb-3">
                        Animated banners with particles, shaders & effects
                    </p>
                    <ScrollArea className="h-[calc(70vh-300px)]">
                        <div className="grid grid-cols-1 gap-3 pr-2">
                            {ANIMATED_BANNER_DESIGNS.map((design) => (
                                <button
                                    key={design.id}
                                    onClick={() => handleSelectAnimatedBanner(design)}
                                    className={cn(
                                        "relative group rounded-xl overflow-hidden transition-all duration-300",
                                        "border hover:shadow-xl hover:scale-[1.02]",
                                        recentlyAdded === design.id
                                            ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] ring-2 ring-green-500/30"
                                            : "border-border/40 hover:border-primary/60"
                                    )}
                                >
                                    {/* Animated Preview - Larger and clearer */}
                                    <div className="relative w-full aspect-[4/1] overflow-hidden">
                                        <Suspense fallback={
                                            <div 
                                                className="absolute inset-0" 
                                                style={{ background: design.preview }}
                                            />
                                        }>
                                            <AnimatedBannerRenderer design={design} />
                                        </Suspense>
                                        
                                        {/* Technology badges - Top left */}
                                        <div className="absolute top-1.5 left-1.5 flex gap-1">
                                            {design.technologiesUsed.slice(0, 2).map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="px-1.5 py-0.5 text-[8px] font-medium rounded bg-black/70 text-white/90 backdrop-blur-sm"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Info Footer - Compact */}
                                    <div className="px-3 py-2 bg-background/95 backdrop-blur-sm border-t border-border/20">
                                        <div className="flex items-center justify-between">
                                            <div className="text-left min-w-0 flex-1">
                                                <p className="text-sm font-medium text-foreground flex items-center gap-1.5 truncate">
                                                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                                                    <span className="truncate">{design.name}</span>
                                                </p>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {design.description}
                                                </p>
                                            </div>
                                            <div
                                                className={cn(
                                                    "w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-2",
                                                    recentlyAdded === design.id
                                                        ? "bg-green-500 text-white"
                                                        : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                                )}
                                            >
                                                {recentlyAdded === design.id ? (
                                                    <Check className="w-3.5 h-3.5" />
                                                ) : (
                                                    <Plus className="w-3.5 h-3.5" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Use cases - Smaller */}
                                        <div className="flex gap-1 mt-1.5 flex-wrap">
                                            {design.recommendedUseCases.slice(0, 3).map((useCase) => (
                                                <span
                                                    key={useCase}
                                                    className="px-1.5 py-0.5 text-[8px] rounded-full bg-primary/10 text-primary"
                                                >
                                                    {useCase}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            {/* Editor Modal */}
            <SocialBannerEditor
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);

                    // If a design was selected (which triggered the popup), add it now
                    // even if the user didn't save new info (using default/current info)
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
