// src/components/SocialBannerEditor.tsx
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Plus,
    Trash2,
    User,
    Github,
    Instagram,
    Linkedin,
    Facebook,
    Youtube,
    Globe,
    Save,
    Camera,
    X,
} from "lucide-react";
import {
    SocialBannerData,
    SocialLink,
    SocialPlatform,
    PLATFORM_INFO,
    DEFAULT_BANNER_DATA,
} from "@/types/socialBanner";
import { cn } from "@/lib/utils";

// Custom icons for platforms
const TwitchIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
);

const KickIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M1.333 0v24h5.334v-8.889L12.89 24h7.777l-7.556-10.667L20 0h-8l-5.333 8.444V0z" />
    </svg>
);

const XIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
);

const DiscordIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
);

// Platform icon mapping for the editor
const getPlatformIcon = (platform: SocialPlatform): React.ReactNode => {
    const icons: Record<SocialPlatform, React.ReactNode> = {
        github: <Github className="w-4 h-4" />,
        instagram: <Instagram className="w-4 h-4" />,
        linkedin: <Linkedin className="w-4 h-4" />,
        facebook: <Facebook className="w-4 h-4" />,
        youtube: <Youtube className="w-4 h-4" />,
        website: <Globe className="w-4 h-4" />,
        discord: <DiscordIcon />,
        twitch: <TwitchIcon />,
        kick: <KickIcon />,
        x: <XIcon />,
        tiktok: <TikTokIcon />,
    };
    return icons[platform] || <Globe className="w-4 h-4" />;
};

const ALL_PLATFORMS: SocialPlatform[] = [
    "github",
    "instagram",
    "linkedin",
    "x",
    "youtube",
    "twitch",
    "kick",
    "discord",
    "tiktok",
    "facebook",
    "website",
];

const LOCAL_STORAGE_KEY = "social-banner-user-data";

interface SocialBannerEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SocialBannerData) => void;
    initialData?: SocialBannerData;
}

export const SocialBannerEditor: React.FC<SocialBannerEditorProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [data, setData] = useState<SocialBannerData>(
        initialData || DEFAULT_BANNER_DATA
    );

    // Load from localStorage on mount
    useEffect(() => {
        if (!initialData) {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                try {
                    setData(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse saved banner data:", e);
                }
            }
        }
    }, [initialData]);

    const handleAddLink = () => {
        const usedPlatforms = new Set(data.links.map((l) => l.platform));
        const availablePlatform = ALL_PLATFORMS.find((p) => !usedPlatforms.has(p));
        if (availablePlatform) {
            setData((prev) => ({
                ...prev,
                links: [
                    ...prev.links,
                    { platform: availablePlatform, url: "", username: "" },
                ],
            }));
        }
    };

    const handleRemoveLink = (index: number) => {
        setData((prev) => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index),
        }));
    };

    const handleLinkChange = (
        index: number,
        field: keyof SocialLink,
        value: string
    ) => {
        setData((prev) => ({
            ...prev,
            links: prev.links.map((link, i) =>
                i === index ? { ...link, [field]: value } : link
            ),
        }));
    };

    const handleSave = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        onSave(data);
        onClose();
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setData((prev) => ({ ...prev, avatarUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setData((prev) => ({ ...prev, avatarUrl: undefined }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-border/50"
                style={{ zIndex: 9999 }}
            >
                <form onSubmit={handleFormSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <User className="w-5 h-5 text-primary" />
                            Edit Your Info
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
                        <div className="space-y-6 py-4">
                            {/* Avatar Upload */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Profile Picture{" "}
                                    <span className="text-muted-foreground text-xs">
                                        (optional)
                                    </span>
                                </Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div
                                            className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center overflow-hidden",
                                                "border-2 border-dashed border-border/50",
                                                data.avatarUrl ? "border-solid border-primary/50" : ""
                                            )}
                                            style={{
                                                background: data.avatarUrl
                                                    ? `url(${data.avatarUrl}) center/cover`
                                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                            }}
                                        >
                                            {!data.avatarUrl && (
                                                <User className="w-6 h-6 text-white/70" />
                                            )}
                                        </div>
                                        {data.avatarUrl && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveAvatar}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/80"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            id="avatar-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                            className="gap-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            {data.avatarUrl ? "Change Photo" : "Upload Photo"}
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Square image recommended
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Name Field */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Display Name
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData((prev) => ({ ...prev, name: e.target.value }))
                                    }
                                    placeholder="Your Name"
                                    className="bg-background/50"
                                />
                            </div>

                            {/* Tagline Field */}
                            <div className="space-y-2">
                                <Label htmlFor="tagline" className="text-sm font-medium">
                                    Tagline{" "}
                                    <span className="text-muted-foreground text-xs">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="tagline"
                                    value={data.tagline || ""}
                                    onChange={(e) =>
                                        setData((prev) => ({ ...prev, tagline: e.target.value }))
                                    }
                                    placeholder="Creator • Streamer • Developer"
                                    className="bg-background/50"
                                />
                            </div>

                            {/* Social Links */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Social Links</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddLink}
                                        disabled={data.links.length >= ALL_PLATFORMS.length}
                                        className="h-8 text-xs"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Link
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {data.links.map((link, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-center gap-2 p-3 rounded-lg",
                                                "bg-background/30 border border-border/30",
                                                "hover:border-border/50 transition-colors"
                                            )}
                                        >
                                            {/* Platform Icon */}
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                {getPlatformIcon(link.platform)}
                                            </div>

                                            {/* Platform Selector */}
                                            <Select
                                                value={link.platform}
                                                onValueChange={(value: SocialPlatform) =>
                                                    handleLinkChange(index, "platform", value)
                                                }
                                            >
                                                <SelectTrigger className="w-[120px] h-9 bg-background/50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ALL_PLATFORMS.map((platform) => (
                                                        <SelectItem
                                                            key={platform}
                                                            value={platform}
                                                            disabled={
                                                                platform !== link.platform &&
                                                                data.links.some((l) => l.platform === platform)
                                                            }
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {getPlatformIcon(platform)}
                                                                <span>{PLATFORM_INFO[platform].label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {/* URL Input */}
                                            <Input
                                                value={link.url}
                                                onChange={(e) =>
                                                    handleLinkChange(index, "url", e.target.value)
                                                }
                                                placeholder={PLATFORM_INFO[link.platform].placeholder}
                                                className="flex-1 h-9 bg-background/50 text-sm"
                                            />

                                            {/* Remove Button */}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveLink(index)}
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {data.links.length === 0 && (
                                        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border/40 rounded-lg">
                                            No social links added yet.
                                            <br />
                                            Click "Add Link" to get started.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="gap-2">
                            <Save className="w-4 h-4" />
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
