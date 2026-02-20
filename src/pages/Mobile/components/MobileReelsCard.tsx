import React from "react";
import { Heart, Eye, Share2, MessageCircle } from "lucide-react";
import { formatViewerCount } from "@/pages/platform/data/mockData";

interface MobileReelsCardProps {
    clip: {
        id: string;
        title: string;
        streamer: string;
        category: string;
        views: number;
        duration: string;
        thumbnail: string;
        createdAt: string;
    };
}

export const MobileReelsCard: React.FC<MobileReelsCardProps> = ({ clip }) => {
    return (
        <div className="mobile-reel relative w-full h-[calc(100dvh-56px-44px)] snap-start snap-always shrink-0 bg-black">
            {/* Background image */}
            <img
                src={clip.thumbnail}
                alt={clip.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* Right-side action buttons (TikTok-style) */}
            <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
                <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">{formatViewerCount(clip.views)}</span>
                </button>

                <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">Chat</span>
                </button>

                <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">Share</span>
                </button>

                <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">{clip.duration}</span>
                </button>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-6 left-4 right-20 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                        <span className="text-white text-sm font-bold">{clip.streamer.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold leading-tight">{clip.streamer}</p>
                        <p className="text-white/60 text-[11px]">{clip.createdAt}</p>
                    </div>
                </div>
                <p className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1">
                    {clip.title}
                </p>
                <span className="inline-block px-2 py-0.5 bg-white/10 backdrop-blur-sm text-white/80 text-[10px] font-medium rounded-full">
                    {clip.category}
                </span>
            </div>
        </div>
    );
};
