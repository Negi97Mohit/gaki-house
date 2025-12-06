// src/types/socialBanner.ts

import React from "react";

// Social platform types
export type SocialPlatform =
    | "github"
    | "instagram"
    | "linkedin"
    | "kick"
    | "twitch"
    | "facebook"
    | "x"
    | "youtube"
    | "discord"
    | "tiktok"
    | "website";

// User's social link data
export interface SocialLink {
    platform: SocialPlatform;
    url: string;
    username?: string; // Display name for the link
}

// User info for banners
export interface SocialBannerData {
    name: string;
    tagline?: string;
    links: SocialLink[];
    avatarUrl?: string;
}

// Banner design template
export interface SocialBannerDesign {
    id: string;
    name: string;
    description: string;
    preview: string; // CSS gradient or color for preview thumbnail
    layout: "horizontal" | "vertical" | "compact" | "card";
    theme: "dark" | "light" | "gradient" | "glassmorphism" | "neon" | "retro";
    showAvatar: boolean;
    showTagline: boolean;
    maxLinks: number;
    styles: {
        container: React.CSSProperties;
        name: React.CSSProperties;
        tagline?: React.CSSProperties;
        linksContainer: React.CSSProperties;
        link: React.CSSProperties;
        icon: React.CSSProperties;
    };
}

// Default empty banner data
export const DEFAULT_BANNER_DATA: SocialBannerData = {
    name: "Your Name",
    tagline: "Creator • Streamer",
    links: [],
};

// Platform display info
export const PLATFORM_INFO: Record<
    SocialPlatform,
    { label: string; placeholder: string }
> = {
    github: { label: "GitHub", placeholder: "github.com/username" },
    instagram: { label: "Instagram", placeholder: "instagram.com/username" },
    linkedin: { label: "LinkedIn", placeholder: "linkedin.com/in/username" },
    kick: { label: "Kick", placeholder: "kick.com/username" },
    twitch: { label: "Twitch", placeholder: "twitch.tv/username" },
    facebook: { label: "Facebook", placeholder: "facebook.com/username" },
    x: { label: "X (Twitter)", placeholder: "x.com/username" },
    youtube: { label: "YouTube", placeholder: "youtube.com/@username" },
    discord: { label: "Discord", placeholder: "discord.gg/invite" },
    tiktok: { label: "TikTok", placeholder: "tiktok.com/@username" },
    website: { label: "Website", placeholder: "yourwebsite.com" },
};
