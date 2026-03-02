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
        <div
            className="mobile-reel relative w-full h-[calc(100dvh-68px-env(safe-area-inset-bottom,0px))] snap-start snap-always shrink-0 bg-black"
            role="article"
            aria-label={`Clip: ${clip.title} by ${clip.streamer}`}
        >
            {/* Background image */}
            <img
                src={clip.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" aria-hidden="true" />

            {/* Right-side action buttons (TikTok-style) */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
                <button
                    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform min-w-[48px]"
                    aria-label={`Like — ${formatViewerCount(clip.views)} views`}
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Heart className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">{formatViewerCount(clip.views)}</span>
                </button>

                <button
                    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform min-w-[48px]"
                    aria-label="Comment"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <MessageCircle className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">Chat</span>
                </button>

                <button
                    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform min-w-[48px]"
                    aria-label="Share clip"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Share2 className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">Share</span>
                </button>

                <button
                    className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform min-w-[48px]"
                    aria-label={`Duration: ${clip.duration}`}
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Eye className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-white text-[10px] font-semibold">{clip.duration}</span>
                </button>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-8 left-4 right-20 z-10">
                <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/15">
                        <span className="text-white text-sm font-bold">{clip.streamer.charAt(0)}</span>
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold leading-tight">{clip.streamer}</p>
                        <p className="text-white/60 text-[11px]">{clip.createdAt}</p>
                    </div>
                </div>
                <p className="text-white text-[14px] font-semibold leading-snug line-clamp-2 mb-2">
                    {clip.title}
                </p>
                <span className="inline-block px-2.5 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-[10px] font-medium rounded-full">
                    {clip.category}
                </span>
            </div>
        </div>
    );
};
