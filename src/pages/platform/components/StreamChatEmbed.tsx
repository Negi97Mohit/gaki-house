import React from "react";
import { PlatformType } from "../data/mockData";

interface StreamChatEmbedProps {
    platform: PlatformType;
    channelId?: string; // For YouTube (videoId) or others
    username: string;   // For Twitch/Kick (slug)
    className?: string;
}

export const StreamChatEmbed: React.FC<StreamChatEmbedProps> = ({
    platform,
    channelId,
    username,
    className
}) => {
    const hostname = window.location.hostname;

    if (platform === "twitch") {
        return (
            <iframe
                src={`https://www.twitch.tv/embed/${username}/chat?parent=${hostname}&parent=localhost&darkpopout`}
                height="100%"
                width="100%"
                className={className}
                style={{ border: "none" }}
            />
        );
    }

    if (platform === "kick") {
        return (
            <iframe
                src={`https://kick.com/${username}/chat`}
                height="100%"
                width="100%"
                className={className}
                style={{ border: "none" }}
            />
        );
    }

    if (platform === "youtube") {
        // YouTube chat requires the video ID, not the channel ID
        if (!channelId) return <div className="p-4 text-center text-muted-foreground">Chat unavailable</div>;
        return (
            <iframe
                src={`https://www.youtube.com/live_chat?v=${channelId}&embed_domain=${hostname}`}
                height="100%"
                width="100%"
                className={className}
                style={{ border: "none" }}
            />
        );
    }

    return (
        <div className={`flex items-center justify-center h-full bg-card text-muted-foreground ${className}`}>
            <p>Chat not supported for {platform}</p>
        </div>
    );
};
