import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { StreamChannel } from "../data/mockData";

interface StreamPlayerProps {
    channel: StreamChannel;
    className?: string;
    playing?: boolean;
    muted?: boolean;
    volume?: number;
    onPlay?: () => void;
    onPause?: () => void;
    onError?: (e: any) => void;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
    channel,
    className,
    playing = true,
    muted = true,
    volume = 0.5,
    onPlay,
    onPause,
    onError,
}) => {
    const playerRef = useRef<ReactPlayer>(null);
    const [hasError, setHasError] = useState(false);

    // Reset error state when channel changes
    useEffect(() => {
        setHasError(false);
    }, [channel.id]);

    if (!channel.streamUrl && !channel.username) {
        return <div className="w-full h-full bg-black flex items-center justify-center text-white">No Stream URL</div>;
    }

    // Handle Kick via Iframe (Generic ReactPlayer doesn't support Kick live natively yet)
    if (channel.platform === "kick") {
        const slug = channel.username; // Kick uses username as slug
        return (
            <iframe
                src={`https://player.kick.com/${slug}?autoplay=${playing}&muted=${muted}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Handle Twitch & YouTube via ReactPlayer
    // Note: Twitch needs parent domain for embedding in production
    const isTwitch = channel.platform === "twitch";
    const twitchConfig = isTwitch ? {
        options: {
            parent: [window.location.hostname, "localhost"]
        }
    } : undefined;

    // Render ReactPlayer for supported platforms
    return (
        <ReactPlayer
            ref={playerRef}
            url={channel.streamUrl}
            width="100%"
            height="100%"
            playing={playing}
            muted={muted}
            volume={volume}
            controls={false} // Custom controls overlays used in parent
            config={{
                twitch: twitchConfig,
                youtube: {
                    playerVars: { showinfo: 1, controls: 0 }
                }
            }}
            onPlay={onPlay}
            onPause={onPause}
            onError={(e) => {
                console.error("StreamPlayer Error:", e);
                setHasError(true);
                if (onError) onError(e);
            }}
            style={{ position: "absolute", top: 0, left: 0 }}
        />
    );
};
