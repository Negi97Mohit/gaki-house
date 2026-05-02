import React from "react";
import { Button } from "@gaki/ui/button";
import { Input } from "@gaki/ui/input";
import { Label } from "@gaki/ui/label";
import { User, Camera, X } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

interface SocialProfileFormProps {
    name: string;
    tagline?: string;
    avatarUrl?: string;
    onChange: (field: string, value: any) => void;
}

export const SocialProfileForm: React.FC<SocialProfileFormProps> = ({
    name,
    tagline,
    avatarUrl,
    onChange,
}) => {
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onChange("avatarUrl", event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        onChange("avatarUrl", undefined);
    };

    return (
        <>
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
                                avatarUrl ? "border-solid border-primary/50" : ""
                            )}
                            style={{
                                background: avatarUrl
                                    ? `url(${avatarUrl}) center/cover`
                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            }}
                        >
                            {!avatarUrl && (
                                <User className="w-6 h-6 text-white/70" />
                            )}
                        </div>
                        {avatarUrl && (
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
                            {avatarUrl ? "Change Photo" : "Upload Photo"}
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
                    value={name}
                    onChange={(e) => onChange("name", e.target.value)}
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
                    value={tagline || ""}
                    onChange={(e) => onChange("tagline", e.target.value)}
                    placeholder="Creator • Streamer • Developer"
                    className="bg-background/50"
                />
            </div>
        </>
    );
};
