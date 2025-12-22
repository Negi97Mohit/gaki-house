import React from "react";
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
import { Plus, Trash2 } from "lucide-react";
import {
    SocialBannerData,
    SocialLink,
    SocialPlatform,
    PLATFORM_INFO,
} from "@/types/socialBanner";
import { cn } from "@/lib/utils";
import { getPlatformIcon } from "@/components/icons/SocialIcons";

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

interface SocialLinkListProps {
    links: SocialLink[];
    onChange: (links: SocialLink[]) => void;
}

export const SocialLinkList: React.FC<SocialLinkListProps> = ({
    links,
    onChange,
}) => {
    const handleAddLink = () => {
        const usedPlatforms = new Set(links.map((l) => l.platform));
        const availablePlatform = ALL_PLATFORMS.find((p) => !usedPlatforms.has(p));
        if (availablePlatform) {
            onChange([
                ...links,
                { platform: availablePlatform, url: "", username: "" },
            ]);
        }
    };

    const handleRemoveLink = (index: number) => {
        onChange(links.filter((_, i) => i !== index));
    };

    const handleLinkChange = (
        index: number,
        field: keyof SocialLink,
        value: string
    ) => {
        onChange(
            links.map((link, i) =>
                i === index ? { ...link, [field]: value } : link
            )
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Social Links</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLink}
                    disabled={links.length >= ALL_PLATFORMS.length}
                    className="h-8 text-xs"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Link
                </Button>
            </div>

            <div className="space-y-3">
                {links.map((link, index) => (
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
                                            links.some((l) => l.platform === platform)
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

                {links.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border/40 rounded-lg">
                        No social links added yet.
                        <br />
                        Click "Add Link" to get started.
                    </div>
                )}
            </div>
        </div>
    );
};
