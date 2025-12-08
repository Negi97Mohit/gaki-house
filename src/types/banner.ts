import React from "react";
import { SocialBannerDesign, SocialBannerData } from "./socialBanner";
import { AnimatedBannerDesign } from "./animatedBanner";

// Re-export specific types for convenience
export type { SocialPlatform, SocialLink, SocialBannerData } from "./socialBanner";
export type { AnimatedBannerDesign } from "./animatedBanner";
export type { SocialBannerDesign } from "./socialBanner";

// Shared Banner Content Data (Unified)
export interface BannerContentData extends SocialBannerData {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
}

// Banner Element State (Unified)
export interface BannerElementState {
    id: string;
    type: "avatar" | "name" | "tagline" | "socialLinks";
    visible: boolean;
    position: { x: number; y: number };
    style: {
        fontSize: number;
        fontFamily: string;
        color: string;
        fontWeight: string;
        // ... potentially other specialized style props
    };
}

// Union type for all banner designs
export type BannerDesign = SocialBannerDesign | AnimatedBannerDesign;

// Helper to check if a design is animated
export const isAnimatedBanner = (design: BannerDesign): design is AnimatedBannerDesign => {
    return "motionSystem" in design;
};

// Helper to check if a design is static (social)
export const isStaticBanner = (design: BannerDesign): design is SocialBannerDesign => {
    return "styles" in design && !("motionSystem" in design);
};
